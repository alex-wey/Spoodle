#!/usr/bin/env python3
"""
Step 3: Generate Embeddings
Converts chunked text into vector embeddings using OpenAI
"""

import json
import sys
import numpy as np
from pathlib import Path
from typing import List, Dict, Any
import logging
from dotenv import load_dotenv

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from src.embedding.openai_embedder import OpenAIEmbedder


# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)


def load_chunks(chunks_file: Path) -> List[Dict[str, Any]]:
    """Load chunks from JSON file."""
    with open(chunks_file, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_embeddings(
    chunks_with_embeddings: List[Dict[str, Any]],
    output_dir: Path
):
    """
    Save embeddings and metadata to files.
    
    Args:
        chunks_with_embeddings: List of chunks with embedding vectors
        output_dir: Directory to save files
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Separate embeddings and metadata
    embeddings = []
    metadata = []
    
    for chunk in chunks_with_embeddings:
        embeddings.append(chunk['embedding'])
        
        # Store metadata without embedding (to save space)
        meta = {k: v for k, v in chunk.items() if k != 'embedding'}
        metadata.append(meta)
    
    # Save embeddings as numpy array (efficient storage)
    embeddings_array = np.array(embeddings, dtype=np.float32)
    embeddings_file = output_dir / "embeddings.npz"
    np.savez_compressed(embeddings_file, embeddings=embeddings_array)
    
    logging.info(f"💾 Saved embeddings: {embeddings_file}")
    logging.info(f"   Shape: {embeddings_array.shape}")
    logging.info(f"   Size: {embeddings_file.stat().st_size / 1024:.1f} KB")
    
    # Save metadata as JSON
    metadata_file = output_dir / "metadata.json"
    with open(metadata_file, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)
    
    logging.info(f"💾 Saved metadata: {metadata_file}")
    
    # Save combined file (for easy loading)
    combined_file = output_dir / "chunks_with_embeddings.json"
    with open(combined_file, 'w', encoding='utf-8') as f:
        json.dump(chunks_with_embeddings, f, indent=2, ensure_ascii=False)
    
    logging.info(f"💾 Saved combined: {combined_file}")
    
    # Create index mapping (chunk_id -> array index)
    index_mapping = {
        chunk['chunk_id']: idx 
        for idx, chunk in enumerate(chunks_with_embeddings)
    }
    
    mapping_file = output_dir / "index_mapping.json"
    with open(mapping_file, 'w', encoding='utf-8') as f:
        json.dump(index_mapping, f, indent=2)
    
    logging.info(f"💾 Saved index mapping: {mapping_file}")


def generate_embeddings(
    chunks_file: Path,
    output_dir: Path,
    model: str = "text-embedding-3-small",
    batch_size: int = 100
):
    """
    Main function to generate embeddings.
    
    Args:
        chunks_file: Path to chunks JSON file
        output_dir: Directory to save embeddings
        model: OpenAI embedding model to use
        batch_size: Number of chunks to embed at once
    """
    
    logging.info("")
    logging.info("=" * 80)
    logging.info("STEP 3: GENERATE EMBEDDINGS")
    logging.info("=" * 80)
    logging.info("")
    
    # Load environment variables from .env file
    from pathlib import Path
    import os
    
    # Explicitly load .env from the project root
    env_path = Path(__file__).parent.parent / '.env'
    logging.info(f"📁 Loading .env from: {env_path}")
    
    if not env_path.exists():
        logging.error(f"❌ .env file not found at: {env_path}")
        return
    
    # Force reload .env
    load_dotenv(dotenv_path=env_path, override=True)
    
    # Get API key
    api_key = os.getenv('OPENAI_API_KEY')
    
    if not api_key:
        logging.error("❌ OPENAI_API_KEY not found in .env!")
        logging.error(f"   Please add your OpenAI API key to: {env_path}")
        return
    
    logging.info(f"🔑 API Key loaded: {api_key[:20]}...")
    logging.info(f"   Length: {len(api_key)} characters")
    logging.info("")
    
    # Load chunks
    logging.info(f"📂 Loading chunks from: {chunks_file.name}")
    chunks = load_chunks(chunks_file)
    logging.info(f"   Loaded {len(chunks)} chunks")
    
    # Calculate total tokens
    total_tokens = sum(chunk.get('token_count', 0) for chunk in chunks)
    logging.info(f"   Total tokens: {total_tokens:,}")
    logging.info("")
    
    # Initialize embedder with explicit API key
    embedder = OpenAIEmbedder(
        api_key=api_key,
        model=model,
        batch_size=batch_size
    )
    
    # Estimate cost
    estimated_cost = embedder.estimate_cost(total_tokens)
    logging.info(f"💰 Estimated cost: ${estimated_cost:.4f}")
    logging.info("")
    
    # Generate embeddings
    chunks_with_embeddings = embedder.embed_chunks(chunks)
    
    if not chunks_with_embeddings:
        logging.error("❌ No embeddings generated!")
        return
    
    # Save results
    logging.info("")
    logging.info("💾 Saving embeddings...")
    save_embeddings(chunks_with_embeddings, output_dir)
    
    # Summary
    logging.info("")
    logging.info("=" * 80)
    logging.info("📊 EMBEDDING SUMMARY")
    logging.info("=" * 80)
    logging.info(f"   Chunks embedded: {len(chunks_with_embeddings)}/{len(chunks)}")
    logging.info(f"   Model: {model}")
    logging.info(f"   Dimensions: {embedder.get_embedding_dimension()}")
    logging.info(f"   Total tokens: {total_tokens:,}")
    logging.info(f"   Estimated cost: ${estimated_cost:.4f}")
    logging.info("")
    
    logging.info("📁 Output files:")
    logging.info(f"   - Embeddings (numpy): {output_dir}/embeddings.npz")
    logging.info(f"   - Metadata: {output_dir}/metadata.json")
    logging.info(f"   - Combined: {output_dir}/chunks_with_embeddings.json")
    logging.info(f"   - Index mapping: {output_dir}/index_mapping.json")
    logging.info("")
    
    logging.info("✅ EMBEDDINGS COMPLETE!")
    logging.info("")


def main():
    """Main entry point."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Generate embeddings for chunked text")
    parser.add_argument("--input-file", type=str, 
                        default="data/training/chunks/all_chunks.json",
                        help="Path to chunks JSON file")
    parser.add_argument("--output-dir", type=str,
                        default="data/training/embeddings",
                        help="Output directory for embeddings")
    args = parser.parse_args()
    
    # Paths
    project_root = Path(__file__).parent.parent
    chunks_file = project_root / args.input_file
    output_dir = project_root / args.output_dir
    
    # Check if chunks file exists
    if not chunks_file.exists():
        logging.error(f"❌ Chunks file not found: {chunks_file}")
        logging.error("   Please run step2_chunk_papers.py first!")
        sys.exit(1)
    
    # Generate embeddings
    generate_embeddings(
        chunks_file=chunks_file,
        output_dir=output_dir,
        model="text-embedding-3-small",
        batch_size=100
    )


if __name__ == "__main__":
    main()
