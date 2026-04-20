#!/usr/bin/env python3
"""
Bulk Ingestion Script - Process 100 papers per journal (1000 papers total)
This will significantly expand your veterinary literature database.
"""
import os
import sys
import subprocess
from pathlib import Path

def main():
    """Run bulk ingestion with high paper count"""
    
    print("=" * 80)
    print("🚀 BULK PAPER INGESTION")
    print("=" * 80)
    print()
    print("This will download and process:")
    print("  • 100 papers per journal")
    print("  • 10 top veterinary journals")
    print("  • ~1,000 papers total")
    print()
    print("⏱️  Estimated time: 4-6 hours")
    print("💾 Disk space needed: ~10 GB")
    print("🔑 Requires: OPENAI_API_KEY and REDUCTO_API_KEY")
    print()
    
    # Check environment variables
    if not os.getenv("OPENAI_API_KEY"):
        print("❌ ERROR: OPENAI_API_KEY not set!")
        print("   Set it in your .env file or environment")
        return 1
    
    if not os.getenv("REDUCTO_API_KEY"):
        print("❌ ERROR: REDUCTO_API_KEY not set!")
        print("   Set it in your .env file or environment")
        return 1
    
    response = input("Continue? (yes/no): ")
    if response.lower() not in ['yes', 'y']:
        print("Cancelled.")
        return 0
    
    print()
    print("=" * 80)
    print("STARTING INGESTION...")
    print("=" * 80)
    print()
    
    # Run focused_pipeline with 100 papers per journal
    script_dir = Path(__file__).parent
    pipeline_script = script_dir / "focused_pipeline.py"
    
    try:
        subprocess.run([
            sys.executable,
            str(pipeline_script),
            "--papers-per-journal", "100",
            "--output", "data/bulk_curated"
        ], check=True)
        
        print()
        print("=" * 80)
        print("✅ BULK INGESTION COMPLETE!")
        print("=" * 80)
        print()
        print("Next steps:")
        print("1. Check: data/bulk_curated/processing_summary.json")
        print("2. Load to database: python scripts/step4_load_to_pgvector.py")
        print("3. Export for Railway: python scripts/export_database.py")
        print()
        
    except subprocess.CalledProcessError as e:
        print()
        print("=" * 80)
        print(f"❌ INGESTION FAILED: {e}")
        print("=" * 80)
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
