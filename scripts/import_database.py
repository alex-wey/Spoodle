#!/usr/bin/env python3
"""
Import database contents from JSON export (for Railway deployment).
"""

import json
import os
import psycopg2
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def import_database(json_file: str):
    """Import all chunks from JSON file to database."""
    
    # Get database URL from environment
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise ValueError("DATABASE_URL environment variable not set")
    
    logger.info(f"📊 Loading data from {json_file}...")
    with open(json_file, 'r') as f:
        chunks = json.load(f)
    
    logger.info(f"✅ Loaded {len(chunks)} chunks")
    
    # Connect to database
    logger.info("🔌 Connecting to database...")
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor()
    
    # Ensure table exists
    logger.info("📝 Creating table if not exists...")
    cursor.execute("""
        CREATE EXTENSION IF NOT EXISTS vector;
        
        CREATE TABLE IF NOT EXISTS document_chunks (
            id SERIAL PRIMARY KEY,
            chunk_id VARCHAR(255) UNIQUE NOT NULL,
            pmc_id VARCHAR(50),
            citation TEXT,
            pmid VARCHAR(50),
            journal VARCHAR(255),
            pdf_path TEXT,
            chunk_index INTEGER,
            text TEXT NOT NULL,
            token_count INTEGER,
            embedding vector(1536),
            created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    """)
    conn.commit()
    
    # Insert chunks
    logger.info("💾 Inserting chunks...")
    inserted = 0
    skipped = 0
    
    for i, chunk in enumerate(chunks):
        try:
            # Convert embedding list to pgvector format
            embedding_str = '[' + ','.join(map(str, chunk['embedding'])) + ']'
            
            cursor.execute("""
                INSERT INTO document_chunks 
                (chunk_id, pmc_id, citation, pmid, journal, pdf_path, chunk_index, text, token_count, embedding)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s::vector)
                ON CONFLICT (chunk_id) DO NOTHING
            """, (
                chunk['chunk_id'],
                chunk['pmc_id'],
                chunk['citation'],
                chunk['pmid'],
                chunk['journal'],
                chunk['pdf_path'],
                chunk['chunk_index'],
                chunk['text'],
                chunk['token_count'],
                embedding_str
            ))
            
            if cursor.rowcount > 0:
                inserted += 1
            else:
                skipped += 1
            
            if (i + 1) % 100 == 0:
                conn.commit()
                logger.info(f"   Progress: {i + 1}/{len(chunks)} chunks processed")
        
        except Exception as e:
            logger.error(f"❌ Error inserting chunk {chunk['chunk_id']}: {e}")
            continue
    
    conn.commit()
    
    # Create indexes
    logger.info("🔍 Creating indexes...")
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx 
        ON document_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
        
        CREATE INDEX IF NOT EXISTS document_chunks_pmc_id_idx ON document_chunks (pmc_id);
        CREATE INDEX IF NOT EXISTS document_chunks_journal_idx ON document_chunks (journal);
    """)
    conn.commit()
    
    # Verify
    cursor.execute("SELECT COUNT(*) FROM document_chunks")
    total = cursor.fetchone()[0]
    
    logger.info(f"\n✅ Import complete!")
    logger.info(f"   - Inserted: {inserted} new chunks")
    logger.info(f"   - Skipped: {skipped} duplicates")
    logger.info(f"   - Total in database: {total} chunks")
    
    cursor.close()
    conn.close()

if __name__ == "__main__":
    import sys
    json_file = sys.argv[1] if len(sys.argv) > 1 else "data/database_export.json"
    import_database(json_file)
