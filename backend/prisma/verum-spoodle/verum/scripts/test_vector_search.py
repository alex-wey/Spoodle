#!/usr/bin/env python3
import os
import sys
import psycopg2
from pathlib import Path
import logging
from dotenv import load_dotenv
from openai import OpenAI

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

sys.path.append(str(Path(__file__).parent.parent))

def test_vector_search(query: str):
    """Test vector similarity search with a sample veterinary query."""
    
    load_dotenv()
    
    logging.info("================================================================================")
    logging.info("🔍 TESTING VECTOR SIMILARITY SEARCH")
    logging.info("================================================================================")
    logging.info("")
    logging.info(f"📝 Query: \"{query}\"")
    logging.info("")
    
    # Step 1: Generate embedding for the query
    logging.info("🧠 Generating query embedding...")
    api_key = os.getenv("OPENAI_API_KEY")
    client = OpenAI(api_key=api_key)
    
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=query
    )
    query_embedding = response.data[0].embedding
    logging.info(f"   ✅ Generated embedding with {len(query_embedding)} dimensions")
    logging.info("")
    
    # Step 2: Connect to database
    logging.info("🔌 Connecting to database...")
    conn = psycopg2.connect(
        dbname="verum_rag",
        user=os.environ.get('USER'),
        host='localhost',
        port=5432
    )
    cursor = conn.cursor()
    logging.info("   ✅ Connected")
    logging.info("")
    
    # Step 3: Perform vector similarity search
    logging.info("🔎 Searching for top 5 similar chunks...")
    cursor.execute("""
        SELECT 
            chunk_id,
            journal,
            SUBSTRING(text, 1, 200) as text_preview,
            token_count,
            1 - (embedding <=> %s::vector) as similarity
        FROM document_chunks
        ORDER BY embedding <=> %s::vector
        LIMIT 5
    """, (query_embedding, query_embedding))
    
    results = cursor.fetchall()
    logging.info("")
    
    # Step 4: Display results
    logging.info("================================================================================")
    logging.info("📊 SEARCH RESULTS")
    logging.info("================================================================================")
    logging.info("")
    
    for i, (chunk_id, journal, text_preview, token_count, similarity) in enumerate(results, 1):
        logging.info(f"🏆 Result #{i}")
        logging.info(f"   Similarity: {similarity:.4f}")
        logging.info(f"   Chunk ID: {chunk_id}")
        logging.info(f"   Journal: {journal}")
        logging.info(f"   Token count: {token_count}")
        logging.info(f"   Text preview: {text_preview}...")
        logging.info("")
    
    cursor.close()
    conn.close()
    
    logging.info("✅ VECTOR SEARCH TEST COMPLETE!")
    logging.info("")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Test vector similarity search on pgvector.")
    parser.add_argument("--query", type=str, 
                        default="What are the symptoms of canine parvovirus?",
                        help="Test query for vector search")
    args = parser.parse_args()
    test_vector_search(args.query)
