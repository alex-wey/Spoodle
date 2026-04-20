#!/usr/bin/env python3
"""
Export database contents to JSON for easy migration to Railway.
"""

import json
import psycopg2
import numpy as np
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def export_database():
    """Export all chunks from local database to JSON file."""
    
    # Connect to local database
    conn = psycopg2.connect(
        dbname="verum_rag",
        user="postgres",
        password="",
        host="localhost",
        port="5432"
    )
    
    cursor = conn.cursor()
    
    # Get all chunks
    logger.info("📊 Fetching all chunks from database...")
    cursor.execute("""
        SELECT 
            chunk_id,
            pmc_id,
            citation,
            pmid,
            journal,
            pdf_path,
            chunk_index,
            text,
            token_count,
            embedding::text
        FROM document_chunks
        ORDER BY id
    """)
    
    rows = cursor.fetchall()
    logger.info(f"✅ Found {len(rows)} chunks")
    
    # Prepare export data
    export_data = []
    for row in rows:
        chunk_id, pmc_id, citation, pmid, journal, pdf_path, chunk_index, text, token_count, embedding_text = row
        
        # Parse embedding from text representation
        embedding_text = embedding_text.strip('[]')
        embedding = [float(x) for x in embedding_text.split(',')]
        
        export_data.append({
            "chunk_id": chunk_id,
            "pmc_id": pmc_id,
            "citation": citation,
            "pmid": pmid,
            "journal": journal,
            "pdf_path": pdf_path,
            "chunk_index": chunk_index,
            "text": text,
            "token_count": token_count,
            "embedding": embedding
        })
    
    # Save to file
    output_file = Path("data/database_export.json")
    output_file.parent.mkdir(exist_ok=True)
    
    logger.info(f"💾 Saving to {output_file}...")
    with open(output_file, 'w') as f:
        json.dump(export_data, f)
    
    # Get file size
    size_mb = output_file.stat().st_size / (1024 * 1024)
    logger.info(f"✅ Export complete!")
    logger.info(f"   - File: {output_file}")
    logger.info(f"   - Size: {size_mb:.1f} MB")
    logger.info(f"   - Chunks: {len(export_data)}")
    
    cursor.close()
    conn.close()
    
    return output_file

if __name__ == "__main__":
    export_database()
