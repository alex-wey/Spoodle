#!/usr/bin/env python3
"""
Sync chunks from local database to Railway database
"""
import psycopg2
import sys

# Database connections
LOCAL_DB = "dbname=verum_rag"
RAILWAY_DB = "postgresql://postgres:MOnbcPBxdIfrvyeUrgKlsLpVYvorNrja@interchange.proxy.rlwy.net:59994/railway"

def sync_databases():
    print("🔄 Syncing local database to Railway...")
    
    # Connect to both databases
    conn_local = psycopg2.connect(LOCAL_DB)
    conn_railway = psycopg2.connect(RAILWAY_DB)
    
    cur_local = conn_local.cursor()
    cur_railway = conn_railway.cursor()
    
    # Get all chunk_ids from Railway
    print("📊 Getting existing chunks from Railway...")
    cur_railway.execute("SELECT chunk_id FROM document_chunks")
    existing_chunks = {row[0] for row in cur_railway.fetchall()}
    print(f"   Railway has {len(existing_chunks)} chunks")
    
    # Get all chunks from local
    print("📊 Getting all chunks from local database...")
    cur_local.execute("""
        SELECT chunk_id, pmc_id, citation, pmid, journal, pdf_path, 
               chunk_index, text, token_count, embedding
        FROM document_chunks
    """)
    local_chunks = cur_local.fetchall()
    print(f"   Local has {len(local_chunks)} chunks")
    
    # Filter to only new chunks
    chunks_to_insert = []
    for chunk in local_chunks:
        if chunk[0] not in existing_chunks:
            chunks_to_insert.append(chunk)
    
    print(f"\n✅ Found {len(chunks_to_insert)} new chunks to upload")
    
    if len(chunks_to_insert) == 0:
        print("✅ No new chunks to upload. Databases are in sync!")
        return
    
    # Insert new chunks
    print(f"\n📤 Uploading {len(chunks_to_insert)} chunks to Railway...")
    inserted = 0
    failed = 0
    
    for i, chunk in enumerate(chunks_to_insert):
        try:
            cur_railway.execute("""
                INSERT INTO document_chunks 
                (chunk_id, pmc_id, citation, pmid, journal, pdf_path, chunk_index, text, token_count, embedding)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, chunk)
            inserted += 1
            
            if (i + 1) % 100 == 0:
                conn_railway.commit()
                print(f"   Progress: {i + 1}/{len(chunks_to_insert)} chunks uploaded")
        except Exception as e:
            failed += 1
            if failed < 5:  # Only show first few errors
                print(f"   ⚠️  Error inserting chunk {chunk[0]}: {e}")
    
    # Final commit
    conn_railway.commit()
    
    # Verify
    cur_railway.execute("SELECT COUNT(*) FROM document_chunks")
    final_count = cur_railway.fetchone()[0]
    
    print(f"\n✅ Upload complete!")
    print(f"   Inserted: {inserted} chunks")
    print(f"   Failed: {failed} chunks")
    print(f"   Railway now has: {final_count} total chunks")
    
    # Close connections
    cur_local.close()
    cur_railway.close()
    conn_local.close()
    conn_railway.close()

if __name__ == "__main__":
    try:
        sync_databases()
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
