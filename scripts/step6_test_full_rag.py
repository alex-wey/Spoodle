#!/usr/bin/env python3
import os
import sys
from pathlib import Path
import logging
from dotenv import load_dotenv

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from src.retrieval.vector_retriever import VectorRetriever
from src.generation.answer_generator import AnswerGenerator

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def print_separator(char="=", length=80):
    """Print a separator line."""
    print(char * length)

def test_full_rag(query: str, top_k: int = 5, show_sources: bool = True):
    """
    Test the full RAG pipeline: Retrieval + Generation.
    
    Args:
        query: Veterinary question
        top_k: Number of chunks to retrieve
        show_sources: Whether to display source details
    """
    load_dotenv()
    
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        logging.error("❌ OPENAI_API_KEY not found in .env file")
        sys.exit(1)
    
    print("\n")
    print_separator()
    print("🚀 VERUM - VETERINARY RAG SYSTEM (FULL PIPELINE TEST)")
    print_separator()
    print("")
    
    # Step 1: Retrieve relevant chunks
    print("📍 STEP 1: RETRIEVAL")
    print_separator("-")
    print(f"❓ Query: {query}")
    print(f"🔍 Retrieving top {top_k} relevant chunks...")
    print("")
    
    with VectorRetriever(api_key=api_key) as retriever:
        retrieved_chunks = retriever.retrieve(query, top_k=top_k)
    
    if not retrieved_chunks:
        print("❌ No relevant chunks found!")
        return
    
    print(f"✅ Retrieved {len(retrieved_chunks)} chunks")
    print(f"📊 Top similarity: {retrieved_chunks[0]['similarity']:.2%}")
    print("")
    
    # Step 2: Generate answer
    print("📍 STEP 2: ANSWER GENERATION")
    print_separator("-")
    print("🤖 Generating evidence-based answer using GPT-4o-mini...")
    print("")
    
    generator = AnswerGenerator(
        api_key=api_key,
        model="gpt-4o-mini",
        temperature=0.1
    )
    
    result = generator.generate_with_confidence(query, retrieved_chunks)
    
    # Step 3: Display answer
    print_separator()
    print("💡 VERUM'S ANSWER")
    print_separator()
    print("")
    print(result['answer'])
    print("")
    
    # Step 4: Display sources (if requested)
    if show_sources and result.get('sources'):
        print_separator()
        print("📚 SOURCES & CITATIONS")
        print_separator()
        print("")
        
        for source in result['sources']:
            print(f"[Source {source['source_number']}]")
            print(f"   Journal: {source['journal']}")
            print(f"   PMC ID: {source['pmc_id']}")
            print(f"   PMID: {source['pmid']}")
            print(f"   Relevance: {source['similarity']:.2%}")
            if source.get('citation'):
                print(f"   Citation: {source['citation']}")
            print("")
    
    # Step 5: Display metadata
    print_separator()
    print("📊 METADATA")
    print_separator()
    print(f"   Model used: {result['model']}")
    print(f"   Sources retrieved: {result.get('num_sources_used', 0)}")
    print(f"   Tokens used: {result.get('tokens_used', 'N/A')}")
    if result.get('low_confidence'):
        print(f"   ⚠️  Low confidence warning: top similarity = {result['top_similarity']:.2%}")
    print("")
    
    print_separator()
    print("✅ FULL RAG PIPELINE TEST COMPLETE!")
    print_separator()
    print("")

def test_multiple_queries():
    """Test multiple queries interactively."""
    queries = [
        "What are the symptoms of canine parvovirus?",
        "How to treat bacterial infections in dogs?",
        "What vaccines do puppies need?",
        "What are signs of kidney disease in cats?",
        "How to manage arthritis pain in senior dogs?"
    ]
    
    print("\n")
    print_separator("=")
    print("🧪 TESTING MULTIPLE VETERINARY QUERIES")
    print_separator("=")
    print("")
    print(f"Testing {len(queries)} different questions...")
    print("")
    
    for i, query in enumerate(queries, 1):
        print(f"\n{'#'*80}")
        print(f"TEST {i}/{len(queries)}")
        print(f"{'#'*80}\n")
        
        test_full_rag(query, top_k=3, show_sources=False)
        
        if i < len(queries):
            input("\n⏸️  Press Enter to continue to next query...")

def interactive_mode():
    """Interactive Q&A mode."""
    load_dotenv()
    
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        logging.error("❌ OPENAI_API_KEY not found in .env file")
        sys.exit(1)
    
    print("\n")
    print_separator("=")
    print("🩺 VERUM - INTERACTIVE VETERINARY Q&A")
    print_separator("=")
    print("\nAsk veterinary questions and get evidence-based answers!")
    print("Type 'quit' or 'exit' to stop.\n")
    print_separator("-")
    
    retriever = VectorRetriever(api_key=api_key)
    retriever.connect()
    
    generator = AnswerGenerator(
        api_key=api_key,
        model="gpt-4o-mini",
        temperature=0.1
    )
    
    try:
        while True:
            print("\n❓ Your question: ", end="")
            query = input().strip()
            
            if query.lower() in ['quit', 'exit', 'q']:
                print("\n👋 Thanks for using Verum!\n")
                break
            
            if not query:
                continue
            
            print("")
            print_separator("-")
            print("🔍 Searching knowledge base...")
            
            retrieved_chunks = retriever.retrieve(query, top_k=5)
            
            if not retrieved_chunks:
                print("❌ No relevant information found.")
                continue
            
            print(f"✅ Found {len(retrieved_chunks)} relevant sources (top: {retrieved_chunks[0]['similarity']:.2%})")
            print("🤖 Generating answer...")
            print("")
            
            result = generator.generate_with_confidence(query, retrieved_chunks)
            
            print_separator("=")
            print("💡 ANSWER")
            print_separator("=")
            print("")
            print(result['answer'])
            print("")
            print_separator("-")
            print(f"📊 Used {result.get('num_sources_used', 0)} sources | {result.get('tokens_used', 0)} tokens")
    
    finally:
        retriever.disconnect()

def main(mode: str = "single", query: str = None):
    """Main function."""
    
    if mode == "single":
        test_query = query or "What are the symptoms of canine parvovirus?"
        test_full_rag(test_query, top_k=5, show_sources=True)
    
    elif mode == "multiple":
        test_multiple_queries()
    
    elif mode == "interactive":
        interactive_mode()
    
    else:
        logging.error(f"❌ Unknown mode: {mode}")
        sys.exit(1)

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Test the full RAG pipeline (Retrieval + Generation).")
    parser.add_argument("--mode", type=str, default="single",
                        choices=["single", "multiple", "interactive"],
                        help="Test mode: single query, multiple queries, or interactive Q&A")
    parser.add_argument("--query", type=str,
                        help="Custom query for single mode")
    args = parser.parse_args()
    
    main(mode=args.mode, query=args.query)
