#!/usr/bin/env python3
import os
import sys
import json
import numpy as np
import psycopg2
from pathlib import Path
from typing import List, Dict, Any
import logging
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def connect_to_db(database: str = "verum_rag") -> psycopg2.extensions.connection:
    """Connect to PostgreSQL database."""
    try:
        conn = psycopg2.connect(
            dbname=database,
            user=os.environ.get('USER'),  # Uses your macOS username
            host='localhost',
            port=5432
        )
        logging.info(f"✅ Connected to database: {database}")
        return conn
    except Exception as e:
        logging.error(f"❌ Failed to connect to database: {e}")
        sys.exit(1)

def load_embeddings_data(embeddings_dir: str = "data/training/embeddings") -> tuple:
    """Load embeddings and metadata from files."""
    embeddings_dir = Path(embeddings_dir)
    
    # Load embeddings array
    embeddings_file = embeddings_dir / "embeddings.npz"
    embeddings_data = np.load(embeddings_file)
    embeddings_array = embeddings_data['embeddings']
    
    # Load metadata
    metadata_file = embeddings_dir / "metadata.json"
    with open(metadata_file, 'r') as f:
        metadata_list = json.load(f)
    
    logging.info(f"📂 Loaded {len(embeddings_array)} embeddings")
    logging.info(f"📂 Loaded {len(metadata_list)} metadata entries")
    
    return embeddings_array, metadata_list

def insert_embeddings(conn: psycopg2.extensions.connection, 
                     embeddings: np.ndarray, 
                     metadata: List[Dict[str, Any]]):
    """Insert embeddings and metadata into PostgreSQL."""
    cursor = conn.cursor()
    
    inserted_count = 0
    failed_count = 0
    
    logging.info("💾 Inserting embeddings into database...")
    logging.info("")
    
    for i, (embedding, meta) in enumerate(zip(embeddings, metadata)):
        try:
            # Extract metadata fields
            chunk_id = meta.get('chunk_id', f'chunk_{i}')
            text = meta.get('text', '')
            token_count = meta.get('token_count', 0)
            
            # Extract nested metadata
            nested_meta = meta.get('metadata', {})
            pmc_id = nested_meta.get('pmc_id')
            citation = nested_meta.get('citation')
            pmid = nested_meta.get('pmid')
            journal = nested_meta.get('journal')
            pdf_path = nested_meta.get('pdf_path')
            chunk_index = nested_meta.get('chunk_index')
            
            # Convert numpy array to list for PostgreSQL
            embedding_list = embedding.tolist()
            
            # Insert into database
            cursor.execute("""
                INSERT INTO document_chunks 
                (chunk_id, pmc_id, citation, pmid, journal, pdf_path, chunk_index, text, token_count, embedding)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (chunk_id) DO NOTHING
            """, (chunk_id, pmc_id, citation, pmid, journal, pdf_path, chunk_index, text, token_count, embedding_list))
            
            inserted_count += 1
            
            if (i + 1) % 10 == 0:
                logging.info(f"   Progress: {i + 1}/{len(embeddings)} chunks inserted")
        
        except Exception as e:
            logging.error(f"❌ Failed to insert chunk {i}: {e}")
            failed_count += 1
    
    conn.commit()
    cursor.close()
    
    logging.info("")
    logging.info(f"✅ Successfully inserted: {inserted_count} chunks")
    if failed_count > 0:
        logging.info(f"⚠️  Failed to insert: {failed_count} chunks")
    
    return inserted_count, failed_count

def verify_insertion(conn: psycopg2.extensions.connection):
    """Verify that data was inserted correctly."""
    cursor = conn.cursor()
    
    # Count total rows
    cursor.execute("SELECT COUNT(*) FROM document_chunks")
    total_count = cursor.fetchone()[0]
    
    # Get sample row
    cursor.execute("SELECT chunk_id, pmc_id, journal, token_count FROM document_chunks LIMIT 1")
    sample = cursor.fetchone()
    
    logging.info("")
    logging.info("================================================================================")
    logging.info("📊 DATABASE VERIFICATION")
    logging.info("================================================================================")
    logging.info(f"   Total chunks in database: {total_count}")
    if sample:
        logging.info(f"   Sample chunk:")
        logging.info(f"      - Chunk ID: {sample[0]}")
        logging.info(f"      - PMC ID: {sample[1]}")
        logging.info(f"      - Journal: {sample[2]}")
        logging.info(f"      - Token count: {sample[3]}")
    
    cursor.close()

def main(embeddings_dir: str = "data/training/embeddings"):
    load_dotenv()
    
    logging.info("================================================================================")
    logging.info("STEP 4: LOAD EMBEDDINGS TO PGVECTOR")
    logging.info("================================================================================")
    logging.info("")
    
    # Load embeddings and metadata from files
    embeddings, metadata = load_embeddings_data(embeddings_dir)
    
    # Connect to database
    conn = connect_to_db()
    
    # Insert embeddings
    inserted, failed = insert_embeddings(conn, embeddings, metadata)
    
    # Verify insertion
    verify_insertion(conn)
    
    # Close connection
    conn.close()
    
    logging.info("")
    logging.info("✅ PGVECTOR LOADING COMPLETE!")
    logging.info("")
    logging.info("🔍 Next step: Test vector similarity search")
    logging.info("")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Load embeddings into pgvector database.")
    parser.add_argument("--embeddings-dir", type=str, default="data/training/embeddings",
                        help="Directory containing embeddings and metadata files.")
    args = parser.parse_args()
    main(embeddings_dir=args.embeddings_dir)
