#!/usr/bin/env python3
"""
Step 1: Download PDFs and Parse with Reducto
Just downloads + Reducto parsing, no embeddings or chunking yet
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

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')
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


def step1_download_file_list(output_dir: Path, papers_per_journal: int = 20):
    """Step 1: Download PMC list and filter for top journals"""
    logger.info("\n" + "="*80)
    logger.info("STEP 1: DOWNLOADING & FILTERING PMC FILE LIST")
    logger.info("="*80)
    
    logger.info("📥 Streaming PMC file list from NCBI...")
    
    response = requests.get(PMC_FILE_LIST_URL, stream=True, timeout=120)
    response.raise_for_status()
    
    journal_papers = {journal: [] for journal in TOP_JOURNALS}
    
    logger.info("🔍 Filtering for top 10 veterinary journals...")
    logger.info(f"   Looking for {papers_per_journal} papers from each journal...\n")
    
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
                logger.info(f"   ✓ {journal}: {len(journal_papers[journal])}/{papers_per_journal} papers")
                break
        
        # Check if we have enough papers
        if all(len(papers) >= papers_per_journal for papers in journal_papers.values()):
            logger.info("\n✅ Found all papers!")
            break
    
    # Save curated list
    output_dir.mkdir(parents=True, exist_ok=True)
    curated_file = output_dir / "curated_papers.json"
    with open(curated_file, 'w') as f:
        json.dump(journal_papers, f, indent=2)
    
    total_papers = sum(len(papers) for papers in journal_papers.values())
    
    logger.info("\n" + "="*80)
    logger.info(f"📊 SUMMARY: Found {total_papers} papers")
    logger.info("="*80)
    for journal, papers in journal_papers.items():
        logger.info(f"   {journal:30s}: {len(papers):2d} papers")
    logger.info("="*80)
    logger.info(f"💾 Saved to: {curated_file}\n")
    
    return journal_papers


def step2_download_pdfs(journal_papers: Dict, output_dir: Path):
    """Step 2: Download PDFs from PMC"""
    logger.info("\n" + "="*80)
    logger.info("STEP 2: DOWNLOADING PDFs FROM PMC")
    logger.info("="*80 + "\n")
    
    # Flatten to single list
    all_papers = []
    for journal, papers in journal_papers.items():
        for paper in papers:
            paper['journal'] = journal
            all_papers.append(paper)
    
    logger.info(f"📚 Total papers to download: {len(all_papers)}\n")
    
    downloaded_papers = []
    
    for i, paper in enumerate(all_papers, 1):
        pmc_id = paper['pmc_id']
        url = f"{PMC_BASE_URL}{paper['path']}"
        
        paper_dir = output_dir / "pdfs" / pmc_id
        paper_dir.mkdir(parents=True, exist_ok=True)
        
        # Check if already downloaded (search recursively)
        pdf_files = list(paper_dir.rglob("*.pdf"))
        if pdf_files:
            logger.info(f"[{i}/{len(all_papers)}] ✅ {pmc_id} - Already downloaded")
            paper['pdf_path'] = str(pdf_files[0])
            downloaded_papers.append(paper)
            continue
        
        try:
            logger.info(f"[{i}/{len(all_papers)}] ⬇️  {pmc_id} - Downloading...")
            
            response = requests.get(url, timeout=60)
            response.raise_for_status()
            
            # Save tar.gz
            tar_path = paper_dir / f"{pmc_id}.tar.gz"
            with open(tar_path, 'wb') as f:
                f.write(response.content)
            
            # Extract
            with tarfile.open(tar_path, 'r:gz') as tar:
                tar.extractall(paper_dir)
            
            tar_path.unlink()  # Remove tar.gz
            
            # Find PDF (search recursively in subdirectories)
            pdf_files = list(paper_dir.rglob("*.pdf"))
            if pdf_files:
                paper['pdf_path'] = str(pdf_files[0])
                downloaded_papers.append(paper)
                logger.info(f"[{i}/{len(all_papers)}] ✅ {pmc_id} - Downloaded: {pdf_files[0].name}")
            else:
                logger.warning(f"[{i}/{len(all_papers)}] ⚠️  {pmc_id} - No PDF found in archive")
            
        except Exception as e:
            logger.error(f"[{i}/{len(all_papers)}] ❌ {pmc_id} - Error: {e}")
        
        # Rate limiting - be nice to NCBI servers
        time.sleep(0.5)
    
    logger.info(f"\n{'='*80}")
    logger.info(f"📊 Downloaded: {len(downloaded_papers)}/{len(all_papers)} PDFs")
    logger.info("="*80 + "\n")
    
    # Save manifest
    manifest_file = output_dir / "downloaded_papers.json"
    with open(manifest_file, 'w') as f:
        json.dump(downloaded_papers, f, indent=2)
    
    logger.info(f"💾 Saved manifest to: {manifest_file}\n")
    
    return downloaded_papers


def step3_parse_with_reducto(downloaded_papers: List[Dict], output_dir: Path):
    """Step 3: Parse PDFs with Reducto"""
    logger.info("\n" + "="*80)
    logger.info("STEP 3: PARSING PDFs WITH REDUCTO")
    logger.info("="*80 + "\n")
    
    # Initialize Reducto
    api_key = os.getenv("REDUCTO_API_KEY")
    if not api_key:
        logger.error("❌ REDUCTO_API_KEY not found in .env file!")
        return []
    
    parser = ReductoParser(api_key=api_key)
    
    logger.info(f"📚 Total papers to parse: {len(downloaded_papers)}\n")
    
    parse_dir = output_dir / "parsed"
    parse_dir.mkdir(parents=True, exist_ok=True)
    
    results = []
    
    for i, paper in enumerate(downloaded_papers, 1):
        pmc_id = paper['pmc_id']
        pdf_path = Path(paper['pdf_path'])
        
        # Check if already parsed
        output_file = parse_dir / f"{pmc_id}.json"
        if output_file.exists():
            logger.info(f"[{i}/{len(downloaded_papers)}] ✅ {pmc_id} - Already parsed")
            results.append({
                'success': True,
                'pmc_id': pmc_id,
                'output_file': str(output_file)
            })
            continue
        
        try:
            logger.info(f"[{i}/{len(downloaded_papers)}] 🔍 {pmc_id} - Parsing with Reducto...")
            logger.info(f"    Citation: {paper['citation'][:80]}...")
            
            # Parse with Reducto
            parsed_data = parser.parse_pdf(str(pdf_path))
            
            if not parsed_data:
                logger.error(f"[{i}/{len(downloaded_papers)}] ❌ {pmc_id} - Parsing failed")
                results.append({'success': False, 'pmc_id': pmc_id, 'error': 'Parsing failed'})
                continue
            
            # Extract text to show stats
            text = parser.extract_text(parsed_data)
            
            # Convert Reducto response to dict if needed
            if hasattr(parsed_data, 'model_dump'):
                parsed_dict = parsed_data.model_dump()
            elif hasattr(parsed_data, 'dict'):
                parsed_dict = parsed_data.dict()
            else:
                parsed_dict = str(parsed_data)
            
            # Save parsed output
            with open(output_file, 'w') as f:
                json.dump({
                    'pmc_id': pmc_id,
                    'citation': paper['citation'],
                    'pmid': paper['pmid'],
                    'journal': paper['journal'],
                    'pdf_path': str(pdf_path),
                    'reducto_output': parsed_dict,
                    'extracted_text_length': len(text)
                }, f, indent=2)
            
            logger.info(f"[{i}/{len(downloaded_papers)}] ✅ {pmc_id} - Parsed successfully!")
            logger.info(f"    Extracted: {len(text):,} characters")
            logger.info(f"    Saved to: {output_file.name}\n")
            
            results.append({
                'success': True,
                'pmc_id': pmc_id,
                'text_length': len(text),
                'output_file': str(output_file)
            })
            
        except Exception as e:
            logger.error(f"[{i}/{len(downloaded_papers)}] ❌ {pmc_id} - Error: {e}\n")
            results.append({'success': False, 'pmc_id': pmc_id, 'error': str(e)})
        
        # Rate limiting for Reducto API
        time.sleep(2)
    
    logger.info(f"\n{'='*80}")
    logger.info("📊 FINAL SUMMARY")
    logger.info("="*80)
    
    successful = sum(1 for r in results if r.get('success'))
    failed = len(results) - successful
    
    logger.info(f"✅ Successfully parsed: {successful}/{len(results)} papers")
    logger.info(f"❌ Failed: {failed}")
    logger.info("="*80 + "\n")
    
    # Save results summary
    summary_file = output_dir / "parsing_summary.json"
    with open(summary_file, 'w') as f:
        json.dump({
            'total': len(results),
            'successful': successful,
            'failed': failed,
            'results': results
        }, f, indent=2)
    
    logger.info(f"💾 Summary saved to: {summary_file}\n")
    
    return results


def main(papers_per_journal: int = 20, output_dir: str = "data/curated"):
    """Run all 3 steps"""
    output_path = Path(output_dir)
    
    logger.info("\n" + "🚀 "*40)
    logger.info("VETERINARY PAPERS: DOWNLOAD & PARSE WITH REDUCTO")
    logger.info("🚀 "*40 + "\n")
    
    # Step 1: Download and filter file list
    journal_papers = step1_download_file_list(output_path, papers_per_journal)
    
    # Step 2: Download PDFs
    downloaded_papers = step2_download_pdfs(journal_papers, output_path)
    
    if not downloaded_papers:
        logger.error("❌ No papers downloaded. Exiting.")
        return
    
    # Step 3: Parse with Reducto
    results = step3_parse_with_reducto(downloaded_papers, output_path)
    
    logger.info("\n" + "🎉 "*40)
    logger.info("ALL STEPS COMPLETE!")
    logger.info("🎉 "*40 + "\n")
    
    logger.info("📁 Output directory: " + str(output_path))
    logger.info("   - curated_papers.json (selected papers)")
    logger.info("   - downloaded_papers.json (download manifest)")
    logger.info("   - pdfs/ (downloaded PDFs)")
    logger.info("   - parsed/ (Reducto parsed outputs)")
    logger.info("   - parsing_summary.json (results)\n")


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Download veterinary papers and parse with Reducto",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Process 20 papers per journal (200 total)
  python scripts/step1_download_and_parse.py
  
  # Process only 5 papers per journal (50 total)
  python scripts/step1_download_and_parse.py --papers-per-journal 5
  
  # Custom output directory
  python scripts/step1_download_and_parse.py --output data/my_papers
        """
    )
    
    parser.add_argument(
        "--papers-per-journal",
        type=int,
        default=20,
        help="Number of papers per journal (default: 20)"
    )
    
    parser.add_argument(
        "--output",
        default="data/curated",
        help="Output directory (default: data/curated)"
    )
    
    args = parser.parse_args()
    
    main(papers_per_journal=args.papers_per_journal, output_dir=args.output)
