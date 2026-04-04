#!/usr/bin/env python3
"""
Quick diagnostic script to check database state and test retrieval
"""
import os
import sys
import psycopg2
from pathlib import Path
from dotenv import load_dotenv

sys.path.append(str(Path(__file__).parent.parent))

load_dotenv()

def check_database():
    """Check database connection and contents"""
    
    print("=" * 80)
    print("🔍 VERUM DATABASE DIAGNOSTIC")
    print("=" * 80)
    print()
    
    # Try to connect
    try:
        # Check for DATABASE_URL (production) or localhost (development)
        database_url = os.environ.get('DATABASE_URL')
        
        if database_url:
            print("🌐 Connecting to production database (DATABASE_URL)...")
            conn = psycopg2.connect(database_url)
        else:
            print("💻 Connecting to local database...")
            conn = psycopg2.connect(
                dbname="verum_rag",
                user=os.environ.get('USER'),
                host='localhost',
                port=5432
            )
        
        print("✅ Connected successfully!")
        print()
        
    except Exception as e:
        print(f"❌ Failed to connect to database: {e}")
        print()
        print("POSSIBLE FIXES:")
        print("1. Make sure PostgreSQL is running")
        print("2. Check DATABASE_URL environment variable")
        print("3. Verify database 'verum_rag' exists")
        return
    
    cursor = conn.cursor()
    
    # Check if table exists
    print("=" * 80)
    print("📊 DATABASE STATISTICS")
    print("=" * 80)
    print()
    
    try:
        # Get total chunks
        cursor.execute("SELECT COUNT(*) FROM document_chunks")
        total_chunks = cursor.fetchone()[0]
        print(f"📄 Total chunks: {total_chunks:,}")
        
        if total_chunks == 0:
            print()
            print("⚠️  DATABASE IS EMPTY!")
            print()
            print("SOLUTION: You need to ingest documents first:")
            print("  python scripts/ingest_pipeline.py")
            print()
            cursor.close()
            conn.close()
            return
        
        # Get unique papers
        cursor.execute("SELECT COUNT(DISTINCT pmc_id) FROM document_chunks WHERE pmc_id IS NOT NULL")
        total_papers = cursor.fetchone()[0]
        print(f"📚 Unique papers: {total_papers:,}")
        
        # Get unique journals
        cursor.execute("SELECT COUNT(DISTINCT journal) FROM document_chunks WHERE journal IS NOT NULL")
        total_journals = cursor.fetchone()[0]
        print(f"📰 Journals: {total_journals:,}")
        
        # Get sample journals
        cursor.execute("SELECT DISTINCT journal FROM document_chunks WHERE journal IS NOT NULL LIMIT 5")
        sample_journals = cursor.fetchall()
        print()
        print("Sample journals:")
        for j in sample_journals:
            print(f"  • {j[0]}")
        
        print()
        
        # Check if embeddings exist
        cursor.execute("SELECT COUNT(*) FROM document_chunks WHERE embedding IS NOT NULL")
        chunks_with_embeddings = cursor.fetchone()[0]
        print(f"🧠 Chunks with embeddings: {chunks_with_embeddings:,}")
        
        if chunks_with_embeddings == 0:
            print()
            print("⚠️  NO EMBEDDINGS FOUND!")
            print()
            print("SOLUTION: Generate embeddings:")
            print("  python scripts/step3_generate_embeddings.py")
            print()
        elif chunks_with_embeddings < total_chunks:
            print(f"   ⚠️  Warning: {total_chunks - chunks_with_embeddings} chunks missing embeddings")
        
        print()
        print("=" * 80)
        print("🔍 TESTING SEARCH")
        print("=" * 80)
        print()
        
        # Test a simple search
        test_query = "cancer"
        print(f"Testing search for: '{test_query}'")
        print()
        
        from src.retrieval.vector_retriever import VectorRetriever
        
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            print("❌ OPENAI_API_KEY not set!")
            return
        
        retriever = VectorRetriever(api_key=api_key)
        retriever.conn = conn
        
        results = retriever.retrieve(test_query, top_k=3)
        
        if not results:
            print("❌ No results found for 'cancer'")
            print()
            print("POSSIBLE ISSUES:")
            print("1. Database has no veterinary cancer papers")
            print("2. Embeddings are not properly generated")
            print("3. Wrong embedding model used")
        else:
            print(f"✅ Found {len(results)} results!")
            print()
            for i, r in enumerate(results, 1):
                print(f"Result {i}:")
                print(f"  Similarity: {r['similarity']:.4f}")
                print(f"  Journal: {r['journal']}")
                print(f"  PMID: {r.get('pmid', 'N/A')}")
                print(f"  Text: {r['text'][:150]}...")
                print()
        
    except Exception as e:
        print(f"❌ Error checking database: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        cursor.close()
        conn.close()
    
    print("=" * 80)
    print("✅ DIAGNOSTIC COMPLETE")
    print("=" * 80)

if __name__ == "__main__":
    check_database()
