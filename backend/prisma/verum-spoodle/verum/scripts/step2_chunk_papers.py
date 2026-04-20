#!/usr/bin/env python3
"""
Step 2: Chunk Papers for RAG
Processes parsed papers and splits them into semantic chunks
"""

import json
import sys
from pathlib import Path
from typing import List, Dict, Any
import logging

# Add parent directory to path to import from src
sys.path.append(str(Path(__file__).parent.parent))

from src.chunking.semantic_chunker import SemanticChunker


# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)


def select_papers_for_testing(parsed_dir: Path, num_papers: int = 5) -> List[Path]:
    """
    Select N papers for testing.
    Picks the first N papers alphabetically.
    
    Args:
        parsed_dir: Directory containing parsed papers
        num_papers: Number of papers to select
    
    Returns:
        List of paths to selected papers
    """
    all_papers = sorted(parsed_dir.glob("*.json"))
    selected = all_papers[:num_papers]
    
    logging.info(f"📚 Selected {len(selected)} papers from {len(all_papers)} available")
    for paper in selected:
        logging.info(f"   - {paper.stem}")
    
    return selected


def chunk_papers(
    parsed_dir: Path,
    output_dir: Path,
    num_papers: int = 5,
    chunk_size: int = 512,
    chunk_overlap: int = 50,
    min_chunk_size: int = 100
):
    """
    Main function to chunk papers.
    
    Args:
        parsed_dir: Directory with parsed papers (Reducto JSON)
        output_dir: Directory to save chunks
        num_papers: Number of papers to process
        chunk_size: Target tokens per chunk
        chunk_overlap: Tokens to overlap
        min_chunk_size: Minimum chunk size
    """
    
    logging.info("")
    logging.info("=" * 80)
    logging.info("STEP 2: SEMANTIC CHUNKING")
    logging.info("=" * 80)
    logging.info("")
    
    # Create output directory
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Initialize chunker
    logging.info("🔧 Initializing chunker...")
    logging.info(f"   Chunk size: {chunk_size} tokens")
    logging.info(f"   Overlap: {chunk_overlap} tokens")
    logging.info(f"   Min chunk size: {min_chunk_size} tokens")
    
    chunker = SemanticChunker(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        min_chunk_size=min_chunk_size
    )
    
    # Select papers
    paper_files = select_papers_for_testing(parsed_dir, num_papers)
    
    if not paper_files:
        logging.error("❌ No papers found in parsed directory!")
        return
    
    logging.info("")
    logging.info(f"🔪 Starting chunking process...")
    logging.info("")
    
    # Process each paper
    all_chunks = []
    summary_stats = {
        'total_papers': len(paper_files),
        'total_chunks': 0,
        'papers': []
    }
    
    for idx, paper_file in enumerate(paper_files, 1):
        try:
            logging.info(f"[{idx}/{len(paper_files)}] 📄 Processing: {paper_file.stem}")
            
            # Chunk the paper
            chunks = chunker.chunk_paper_file(paper_file)
            
            # Save individual paper chunks
            output_file = output_dir / f"{paper_file.stem}_chunks.json"
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(chunks, f, indent=2, ensure_ascii=False)
            
            # Calculate stats
            total_tokens = sum(chunk['token_count'] for chunk in chunks)
            avg_tokens = total_tokens / len(chunks) if chunks else 0
            
            paper_stats = {
                'paper_id': paper_file.stem,
                'num_chunks': len(chunks),
                'total_tokens': total_tokens,
                'avg_tokens_per_chunk': round(avg_tokens, 1)
            }
            
            summary_stats['papers'].append(paper_stats)
            summary_stats['total_chunks'] += len(chunks)
            all_chunks.extend(chunks)
            
            logging.info(f"   ✅ Created {len(chunks)} chunks ({total_tokens} tokens)")
            logging.info(f"   💾 Saved to: {output_file.name}")
            logging.info("")
            
        except Exception as e:
            logging.error(f"   ❌ Error processing {paper_file.name}: {e}")
            logging.info("")
            continue
    
    # Save combined chunks file (useful for embeddings step)
    combined_file = output_dir / "all_chunks.json"
    with open(combined_file, 'w', encoding='utf-8') as f:
        json.dump(all_chunks, f, indent=2, ensure_ascii=False)
    
    logging.info(f"💾 Saved combined chunks to: {combined_file.name}")
    
    # Save summary statistics
    summary_file = output_dir / "chunking_summary.json"
    with open(summary_file, 'w', encoding='utf-8') as f:
        json.dump(summary_stats, f, indent=2)
    
    logging.info("")
    logging.info("=" * 80)
    logging.info("📊 CHUNKING SUMMARY")
    logging.info("=" * 80)
    logging.info(f"   Papers processed: {summary_stats['total_papers']}")
    logging.info(f"   Total chunks created: {summary_stats['total_chunks']}")
    logging.info(f"   Average chunks per paper: {summary_stats['total_chunks'] / summary_stats['total_papers']:.1f}")
    logging.info("")
    
    logging.info("📁 Output files:")
    logging.info(f"   - Individual chunk files: {output_dir}/*_chunks.json")
    logging.info(f"   - Combined chunks: {combined_file}")
    logging.info(f"   - Summary statistics: {summary_file}")
    logging.info("")
    
    logging.info("✅ CHUNKING COMPLETE!")
    logging.info("")


def main():
    """Main entry point."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Chunk parsed papers for RAG")
    parser.add_argument("--papers-to-process", type=int, default=999,
                        help="Number of papers to process (default: all)")
    parser.add_argument("--input-dir", type=str, default="data/training/parsed",
                        help="Input directory with parsed papers")
    parser.add_argument("--output-dir", type=str, default="data/training/chunks",
                        help="Output directory for chunks")
    args = parser.parse_args()
    
    # Paths
    project_root = Path(__file__).parent.parent
    parsed_dir = project_root / args.input_dir
    output_dir = project_root / args.output_dir
    
    # Check if parsed directory exists
    if not parsed_dir.exists():
        logging.error(f"❌ Parsed directory not found: {parsed_dir}")
        logging.error("   Please run step1_download_and_parse.py first!")
        sys.exit(1)
    
    # Run chunking
    chunk_papers(
        parsed_dir=parsed_dir,
        output_dir=output_dir,
        num_papers=args.papers_to_process,
        chunk_size=512,        # 512 tokens per chunk
        chunk_overlap=50,      # 50 token overlap
        min_chunk_size=100     # Minimum 100 tokens
    )


if __name__ == "__main__":
    main()
