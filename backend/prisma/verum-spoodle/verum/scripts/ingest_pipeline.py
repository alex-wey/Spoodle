#!/usr/bin/env python3
"""
Complete Ingestion Pipeline for Veterinary RAG System

End-to-end pipeline: PDF → Parse (Reducto) → Chunk → Embed → Store

Usage:
    # Process single PDF
    python scripts/ingest_pipeline.py data/raw/sample.pdf
    
    # Process all PDFs in directory
    python scripts/ingest_pipeline.py data/raw/
    
    # Process with custom settings
    python scripts/ingest_pipeline.py data/raw/ --batch-size 50 --max-chunk-size 800
"""

import sys
import os
import json
import argparse
from pathlib import Path
from typing import List, Dict, Any
import time

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv
from reducto import Reducto

from src.chunking.semantic_chunker import SemanticChunker, Chunk
from src.embedding.embed_service import EmbeddingService
from src.indexing.vector_store import VectorStore

load_dotenv()


class IngestionPipeline:
    """
    Complete pipeline for ingesting veterinary PDFs into RAG system
    """
    
    def __init__(
        self,
        max_chunk_size: int = 1000,
        overlap: int = 200,
        embedding_model: str = "text-embedding-3-small",
        batch_size: int = 100
    ):
        """Initialize pipeline components"""
        print("="*60)
        print("🚀 INITIALIZING INGESTION PIPELINE")
        print("="*60)
        
        # Initialize Reducto client
        print("📄 Initializing Reducto PDF parser...")
        self.reducto_client = Reducto()
        
        # Initialize chunker
        print("✂️  Initializing semantic chunker...")
        self.chunker = SemanticChunker(
            max_chunk_size=max_chunk_size,
            overlap=overlap
        )
        
        # Initialize embedding service
        print("🧮 Initializing embedding service...")
        self.embedding_service = EmbeddingService(
            model=embedding_model,
            batch_size=batch_size
        )
        
        # Initialize vector store
        print("💾 Initializing vector store...")
        self.vector_store = VectorStore()
        
        # Ensure database schema exists
        self.vector_store.initialize_schema()
        
        print("✅ Pipeline initialized successfully!\n")
    
    def process_pdf(self, pdf_path: str) -> Dict[str, Any]:
        """
        Process a single PDF through the complete pipeline
        
        Args:
            pdf_path: Path to PDF file
            
        Returns:
            Processing results and statistics
        """
        pdf_file = Path(pdf_path)
        
        if not pdf_file.exists():
            raise FileNotFoundError(f"PDF not found: {pdf_path}")
        
        print("="*60)
        print(f"📄 PROCESSING: {pdf_file.name}")
        print("="*60)
        
        start_time = time.time()
        
        # Step 1: Parse PDF with Reducto
        print("\n[1/5] 📤 Uploading to Reducto...")
        upload = self.reducto_client.upload(file=pdf_file)
        print(f"      ✅ Uploaded: {upload.file_id}")
        
        print("\n[2/5] 🔍 Parsing PDF (this may take 10-30 seconds)...")
        parse_result = self.reducto_client.parse.run(input=upload)
        
        print(f"      ✅ Parsed {parse_result.usage.num_pages} pages")
        print(f"      ⏱️  Duration: {parse_result.duration:.1f}s")
        print(f"      💰 Credits used: {parse_result.usage.credits}")
        
        # Convert to dict for chunking
        reducto_output = {
            "job_id": parse_result.job_id,
            "chunks": [
                {
                    "content": chunk.content,
                    "blocks": [
                        {
                            "type": block.type,
                            "content": block.content,
                            "bbox": {
                                "page": block.bbox.page,
                                "left": block.bbox.left,
                                "top": block.bbox.top,
                                "width": block.bbox.width,
                                "height": block.bbox.height
                            }
                        }
                        for block in chunk.blocks
                    ]
                }
                for chunk in parse_result.result.chunks
            ] if hasattr(parse_result.result, 'chunks') else []
        }
        
        # Step 2: Chunk semantically
        print("\n[3/5] ✂️  Chunking document...")
        chunks = self.chunker.chunk_document(reducto_output, pdf_file.name)
        print(f"      ✅ Created {len(chunks)} semantic chunks")
        
        # Show chunk breakdown
        chunk_types = {}
        for chunk in chunks:
            chunk_types[chunk.metadata.section_type] = chunk_types.get(chunk.metadata.section_type, 0) + 1
        
        print(f"      📊 Chunk breakdown:")
        for section_type, count in sorted(chunk_types.items(), key=lambda x: x[1], reverse=True):
            print(f"         {section_type}: {count}")
        
        # Step 3: Generate embeddings
        print("\n[4/5] 🧮 Generating embeddings...")
        texts = [chunk.content for chunk in chunks]
        embedding_results = self.embedding_service.embed_batch(texts, show_progress=True)
        
        # Attach embeddings to chunks
        for chunk, embedding_result in zip(chunks, embedding_results):
            chunk.embedding = embedding_result.embedding
        
        print(f"      ✅ Generated {len(embedding_results)} embeddings")
        print(f"      💰 Tokens used: {sum(r.tokens_used for r in embedding_results):,}")
        
        # Step 4: Store in vector database
        print("\n[5/5] 💾 Storing in vector database...")
        
        # Extract document title (from first chunk if available)
        title = None
        title_chunks = [c for c in chunks if c.metadata.section_type == "title"]
        if title_chunks:
            title = title_chunks[0].content[:200]  # First 200 chars
        
        # Insert document record
        document_id = chunks[0].metadata.document_id if chunks else None
        if document_id:
            self.vector_store.insert_document(document_id, pdf_file.name, title)
            
            # Insert chunks
            self.vector_store.insert_chunks(chunks)
        
        total_time = time.time() - start_time
        
        print(f"\n✅ PROCESSING COMPLETE!")
        print(f"⏱️  Total time: {total_time:.1f}s")
        
        return {
            "file": pdf_file.name,
            "document_id": document_id,
            "pages": parse_result.usage.num_pages,
            "chunks_created": len(chunks),
            "processing_time": total_time,
            "reducto_credits": parse_result.usage.credits
        }
    
    def process_directory(self, directory_path: str) -> List[Dict[str, Any]]:
        """
        Process all PDFs in a directory
        
        Args:
            directory_path: Path to directory containing PDFs
            
        Returns:
            List of processing results
        """
        directory = Path(directory_path)
        
        if not directory.exists():
            raise FileNotFoundError(f"Directory not found: {directory_path}")
        
        # Find all PDFs
        pdf_files = list(directory.glob("*.pdf"))
        
        if not pdf_files:
            print(f"❌ No PDF files found in {directory_path}")
            return []
        
        print(f"\n📚 Found {len(pdf_files)} PDF files to process\n")
        
        results = []
        
        for i, pdf_file in enumerate(pdf_files, 1):
            print(f"\n{'='*60}")
            print(f"Processing {i}/{len(pdf_files)}")
            print(f"{'='*60}")
            
            try:
                result = self.process_pdf(str(pdf_file))
                results.append(result)
            except Exception as e:
                print(f"❌ Error processing {pdf_file.name}: {e}")
                results.append({
                    "file": pdf_file.name,
                    "error": str(e)
                })
        
        return results
    
    def print_summary(self, results: List[Dict[str, Any]]):
        """Print processing summary"""
        print("\n" + "="*60)
        print("📊 PROCESSING SUMMARY")
        print("="*60)
        
        total_files = len(results)
        successful = len([r for r in results if "error" not in r])
        failed = total_files - successful
        
        total_chunks = sum(r.get("chunks_created", 0) for r in results)
        total_pages = sum(r.get("pages", 0) for r in results)
        total_time = sum(r.get("processing_time", 0) for r in results)
        total_credits = sum(r.get("reducto_credits", 0) for r in results)
        
        print(f"\n📁 Files processed: {total_files}")
        print(f"   ✅ Successful: {successful}")
        print(f"   ❌ Failed: {failed}")
        print(f"\n📄 Total pages: {total_pages}")
        print(f"✂️  Total chunks: {total_chunks}")
        print(f"⏱️  Total time: {total_time:.1f}s")
        print(f"💰 Reducto credits: {total_credits}")
        
        print("\n" + "="*60)
        
        # Print embedding stats
        self.embedding_service.print_stats()
        
        # Print vector store stats
        self.vector_store.print_stats()
        
        print()


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description="Ingest veterinary PDFs into RAG system"
    )
    parser.add_argument(
        "path",
        help="Path to PDF file or directory"
    )
    parser.add_argument(
        "--max-chunk-size",
        type=int,
        default=1000,
        help="Maximum characters per chunk (default: 1000)"
    )
    parser.add_argument(
        "--overlap",
        type=int,
        default=200,
        help="Character overlap between chunks (default: 200)"
    )
    parser.add_argument(
        "--embedding-model",
        default="text-embedding-3-small",
        help="OpenAI embedding model (default: text-embedding-3-small)"
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=100,
        help="Embedding batch size (default: 100)"
    )
    
    args = parser.parse_args()
    
    # Initialize pipeline
    pipeline = IngestionPipeline(
        max_chunk_size=args.max_chunk_size,
        overlap=args.overlap,
        embedding_model=args.embedding_model,
        batch_size=args.batch_size
    )
    
    # Process
    path = Path(args.path)
    
    if path.is_file():
        results = [pipeline.process_pdf(str(path))]
    elif path.is_dir():
        results = pipeline.process_directory(str(path))
    else:
        print(f"❌ Invalid path: {args.path}")
        sys.exit(1)
    
    # Print summary
    pipeline.print_summary(results)
    
    print("\n✅ All done! Your documents are ready for queries.\n")


if __name__ == "__main__":
    main()
