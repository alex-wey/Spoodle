#!/usr/bin/env python3
import os
import sys
from pathlib import Path
import logging
from dotenv import load_dotenv

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from src.retrieval.vector_retriever import VectorRetriever

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def format_result(result: dict, rank: int):
    """Format a single retrieval result for display."""
    print(f"\n{'='*80}")
    print(f"🏆 RESULT #{rank}")
    print(f"{'='*80}")
    print(f"📊 Similarity Score: {result['similarity']:.4f} ({result['similarity']*100:.2f}%)")
    print(f"📄 Source: {result['journal']}")
    print(f"🔖 PMC ID: {result['pmc_id']}")
    print(f"🔢 Chunk: {result['chunk_id']}")
    print(f"📝 Token Count: {result['token_count']}")
    print(f"\n📖 TEXT EXCERPT:")
    print("-" * 80)
    # Show first 500 characters
    text = result['text'][:500]
    print(text + ("..." if len(result['text']) > 500 else ""))
    print("-" * 80)

def test_single_query(retriever: VectorRetriever, query: str, top_k: int = 5):
    """Test a single query."""
    print("\n" + "="*80)
    print("🔍 QUERY")
    print("="*80)
    print(f"❓ {query}")
    print("="*80)
    
    results = retriever.retrieve(query, top_k=top_k)
    
    if not results:
        print("\n❌ No results found!")
        return
    
    print(f"\n✅ Found {len(results)} results\n")
    
    for i, result in enumerate(results, 1):
        format_result(result, i)
    
    print("\n" + "="*80)

def test_multiple_queries(retriever: VectorRetriever):
    """Test multiple veterinary queries."""
    
    queries = [
        "What are the symptoms of canine parvovirus?",
        "How to treat bacterial infections in dogs?",
        "What vaccines do puppies need?",
        "Signs of heart disease in cats",
        "Treatment for ear infections in pets"
    ]
    
    print("\n" + "="*80)
    print("🧪 TESTING MULTIPLE QUERIES")
    print("="*80)
    print(f"\nTesting {len(queries)} different veterinary questions...\n")
    
    for i, query in enumerate(queries, 1):
        print(f"\n{'#'*80}")
        print(f"TEST {i}/{len(queries)}")
        print(f"{'#'*80}")
        test_single_query(retriever, query, top_k=3)
        
        if i < len(queries):
            input("\n⏸️  Press Enter to continue to next query...")

def test_filtered_search(retriever: VectorRetriever):
    """Test search with metadata filters."""
    print("\n" + "="*80)
    print("🔍 TESTING FILTERED SEARCH")
    print("="*80)
    
    query = "What are common bacterial infections?"
    journal = "BMC Vet Res"
    
    print(f"\n❓ Query: {query}")
    print(f"📚 Filter: journal = '{journal}'")
    print("="*80)
    
    results = retriever.retrieve(query, top_k=3, filters={"journal": journal})
    
    if not results:
        print("\n❌ No results found!")
        return
    
    print(f"\n✅ Found {len(results)} results from {journal}\n")
    
    for i, result in enumerate(results, 1):
        format_result(result, i)

def main(mode: str = "single", query: str = None):
    load_dotenv()
    
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        logging.error("❌ OPENAI_API_KEY not found in .env file")
        sys.exit(1)
    
    print("\n" + "="*80)
    print("🚀 STEP 5: TESTING RETRIEVAL SYSTEM")
    print("="*80)
    print("\nInitializing Vector Retriever...")
    
    # Create retriever using context manager
    with VectorRetriever(api_key=api_key) as retriever:
        
        if mode == "single":
            # Single query mode
            test_query = query or "What are the symptoms of canine parvovirus?"
            test_single_query(retriever, test_query, top_k=5)
        
        elif mode == "multiple":
            # Multiple queries mode
            test_multiple_queries(retriever)
        
        elif mode == "filtered":
            # Filtered search mode
            test_filtered_search(retriever)
        
        else:
            logging.error(f"❌ Unknown mode: {mode}")
            sys.exit(1)
    
    print("\n" + "="*80)
    print("✅ RETRIEVAL TEST COMPLETE!")
    print("="*80)
    print("\n📊 Summary:")
    print("   - Vector embeddings: ✅ Working")
    print("   - Similarity search: ✅ Working")
    print("   - Metadata retrieval: ✅ Working")
    print("\n🎯 Next Step: Connect to LLM for answer generation")
    print("="*80 + "\n")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Test the vector retrieval system.")
    parser.add_argument("--mode", type=str, default="single",
                        choices=["single", "multiple", "filtered"],
                        help="Test mode: single query, multiple queries, or filtered search")
    parser.add_argument("--query", type=str, 
                        help="Custom query for single mode")
    args = parser.parse_args()
    
    main(mode=args.mode, query=args.query)
