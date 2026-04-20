#!/usr/bin/env python3
"""
Focused Pipeline - Download and process first 20 papers from top 10 veterinary journals
"""
import os
import sys
import json
import time
import requests
import tarfile
from pathlib import Path
from typing import List, Dict
import logging
from dotenv import load_dotenv
from tqdm import tqdm

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from src.ingestion.pdf_parser import ReductoParser
from src.chunking.semantic_chunker import SemanticChunker
from src.embedding.embed_service import EmbedService

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

load_dotenv()

# Top 10 veterinary journals
TOP_JOURNALS = [
    "BMC Vet Res",
    "Front Vet Sci",
    "J Vet Intern Med",
    "Vet Res",
    "Vet Sci",
    "Acta Vet Scand",
    "Vet Med Sci",
    "Vet World",
    "Vet Med Int",
    "Ir Vet J"
]

PMC_BASE_URL = "https://ftp.ncbi.nlm.nih.gov/pub/pmc/"
PMC_FILE_LIST_URL = "https://ftp.ncbi.nlm.nih.gov/pub/pmc/oa_comm_use_file_list.txt"


class FocusedPipeline:
    def __init__(self, output_dir: str = "data/curated"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize components
        self.parser = ReductoParser(api_key=os.getenv("REDUCTO_API_KEY"))
        self.embed_service = EmbedService(api_key=os.getenv("OPENAI_API_KEY"))
        self.chunker = SemanticChunker(chunk_size=512, chunk_overlap=50)
        
    def download_and_filter_journal_papers(self, papers_per_journal: int = 20):
        """Download PMC file list and filter for top journals"""
        logger.info("📥 Downloading PMC file list...")
        
        response = requests.get(PMC_FILE_LIST_URL, stream=True)
        response.raise_for_status()
        
        journal_papers = {journal: [] for journal in TOP_JOURNALS}
        
        logger.info("🔍 Filtering for top 10 veterinary journals...")
        for line in response.iter_lines(decode_unicode=True):
            if not line.strip():
                continue
                
            parts = line.split('\t')
            if len(parts) < 5:
                continue
                
            citation = parts[1]
            
            # Check if this paper belongs to one of our top journals
            for journal in TOP_JOURNALS:
                if journal in citation and len(journal_papers[journal]) < papers_per_journal:
                    journal_papers[journal].append({
                        'path': parts[0],
                        'citation': citation,
                        'pmc_id': parts[2],
                        'pmid': parts[3] if len(parts) > 3 else '',
                        'license': parts[4] if len(parts) > 4 else ''
                    })
                    break
            
            # Check if we have enough papers
            if all(len(papers) >= papers_per_journal for papers in journal_papers.values()):
                break
        
        # Save curated list
        curated_file = self.output_dir / "curated_papers.json"
        with open(curated_file, 'w') as f:
            json.dump(journal_papers, f, indent=2)
        
        total_papers = sum(len(papers) for papers in journal_papers.values())
        logger.info(f"✅ Found {total_papers} papers across {len(TOP_JOURNALS)} journals")
        
        for journal, papers in journal_papers.items():
            logger.info(f"   {journal}: {len(papers)} papers")
        
        return journal_papers
    
    def download_pdf(self, paper: Dict) -> Path:
        """Download and extract a single PDF"""
        pmc_id = paper['pmc_id']
        url = f"{PMC_BASE_URL}{paper['path']}"
        
        paper_dir = self.output_dir / "pdfs" / pmc_id
        paper_dir.mkdir(parents=True, exist_ok=True)
        
        # Check if already downloaded
        pdf_files = list(paper_dir.glob("*.pdf"))
        if pdf_files:
            return pdf_files[0]
        
        try:
            # Download tar.gz
            response = requests.get(url, timeout=60)
            response.raise_for_status()
            
            tar_path = paper_dir / f"{pmc_id}.tar.gz"
            with open(tar_path, 'wb') as f:
                f.write(response.content)
            
            # Extract
            with tarfile.open(tar_path, 'r:gz') as tar:
                tar.extractall(paper_dir)
            
            tar_path.unlink()  # Remove tar.gz
            
            # Find PDF
            pdf_files = list(paper_dir.glob("*.pdf"))
            if pdf_files:
                return pdf_files[0]
            
        except Exception as e:
            logger.error(f"❌ Error downloading {pmc_id}: {e}")
        
        return None
    
    def process_paper(self, paper: Dict, pdf_path: Path) -> Dict:
        """Process a single paper through the pipeline"""
        pmc_id = paper['pmc_id']
        
        try:
            # Parse with Reducto
            logger.info(f"  🔍 Parsing with Reducto...")
            parsed_data = self.parser.parse_pdf(str(pdf_path))
            
            if not parsed_data:
                return {'success': False, 'error': 'Parsing failed', 'pmc_id': pmc_id}
            
            # Extract text
            text = self.parser.extract_text(parsed_data)
            
            # Chunk with metadata
            metadata = {
                'paper_id': pmc_id,
                'pmid': paper['pmid'],
                'journal': paper.get('journal', 'unknown'),
                'citation': paper['citation']
            }
            chunks = self.chunker.chunk_text(text, metadata)
            
            # Generate embeddings
            chunk_texts = [chunk['text'] for chunk in chunks]
            embeddings = self.embed_service.batch_embed(chunk_texts, batch_size=50)
            
            # Add embeddings to chunks
            for chunk, embedding in zip(chunks, embeddings):
                chunk['embedding'] = embedding
                chunk['chunk_id'] = f"{pmc_id}_chunk_{chunks.index(chunk)}"
            
            # Save results
            output_file = self.output_dir / "processed" / f"{pmc_id}.json"
            output_file.parent.mkdir(parents=True, exist_ok=True)
            
            with open(output_file, 'w') as f:
                # Save without embeddings (too large)
                chunks_to_save = [{k: v for k, v in c.items() if k != 'embedding'} for c in chunks]
                json.dump({
                    'pmc_id': pmc_id,
                    'citation': paper['citation'],
                    'num_chunks': len(chunks),
                    'chunks': chunks_to_save
                }, f, indent=2)
            
            logger.info(f"  ✅ Processed: {len(chunks)} chunks")
            
            return {
                'success': True,
                'pmc_id': pmc_id,
                'num_chunks': len(chunks),
                'output_file': str(output_file)
            }
            
        except Exception as e:
            logger.error(f"  ❌ Error: {e}")
            return {'success': False, 'error': str(e), 'pmc_id': pmc_id}
    
    def run(self, papers_per_journal: int = 20):
        """Run the complete pipeline"""
        logger.info("="*80)
        logger.info("🚀 FOCUSED VETERINARY RAG PIPELINE")
        logger.info("="*80)
        
        # Step 1: Get curated paper list
        journal_papers = self.download_and_filter_journal_papers(papers_per_journal)
        
        # Flatten to single list
        all_papers = []
        for journal, papers in journal_papers.items():
            for paper in papers:
                paper['journal'] = journal
                all_papers.append(paper)
        
        logger.info(f"\n📚 Total papers to process: {len(all_papers)}")
        
        # Step 2: Download PDFs
        logger.info("\n" + "="*80)
        logger.info("STEP 1: DOWNLOADING PDFs")
        logger.info("="*80 + "\n")
        
        downloaded_papers = []
        for paper in tqdm(all_papers, desc="Downloading PDFs"):
            pdf_path = self.download_pdf(paper)
            if pdf_path:
                paper['pdf_path'] = str(pdf_path)
                downloaded_papers.append(paper)
            time.sleep(0.5)  # Rate limiting
        
        logger.info(f"✅ Downloaded: {len(downloaded_papers)}/{len(all_papers)} PDFs")
        
        # Step 3: Process through pipeline
        logger.info("\n" + "="*80)
        logger.info("STEP 2: PROCESSING THROUGH PIPELINE")
        logger.info("="*80 + "\n")
        
        results = []
        for paper in tqdm(downloaded_papers, desc="Processing papers"):
            logger.info(f"\n📄 {paper['pmc_id']}: {paper['citation'][:80]}...")
            result = self.process_paper(paper, Path(paper['pdf_path']))
            results.append(result)
            time.sleep(1)  # API rate limiting
        
        # Save summary
        summary_file = self.output_dir / "processing_summary.json"
        with open(summary_file, 'w') as f:
            json.dump({
                'total_papers': len(all_papers),
                'downloaded': len(downloaded_papers),
                'processed': len([r for r in results if r.get('success')]),
                'failed': len([r for r in results if not r.get('success')]),
                'results': results
            }, f, indent=2)
        
        # Final summary
        successful = sum(1 for r in results if r.get('success'))
        total_chunks = sum(r.get('num_chunks', 0) for r in results if r.get('success'))
        
        logger.info("\n" + "="*80)
        logger.info("📊 FINAL SUMMARY")
        logger.info("="*80)
        logger.info(f"✅ Successfully processed: {successful}/{len(results)} papers")
        logger.info(f"📦 Total chunks created: {total_chunks}")
        logger.info(f"💾 Output directory: {self.output_dir}")
        logger.info(f"📝 Summary saved to: {summary_file}")
        logger.info("="*80 + "\n")


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Process top 10 veterinary journals")
    parser.add_argument("--papers-per-journal", type=int, default=20, help="Papers per journal (default: 20)")
    parser.add_argument("--output", default="data/curated", help="Output directory")
    
    args = parser.parse_args()
    
    pipeline = FocusedPipeline(output_dir=args.output)
    pipeline.run(papers_per_journal=args.papers_per_journal)
