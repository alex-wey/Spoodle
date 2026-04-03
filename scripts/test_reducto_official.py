#!/usr/bin/env python3
"""
Test Reducto API using the official SDK
Based on: https://docs.reducto.ai/api-quickstart
"""

import sys
import json
from pathlib import Path
from dotenv import load_dotenv
from reducto import Reducto

# Load environment variables
load_dotenv()


def parse_veterinary_pdf(pdf_path: str):
    """
    Parse a veterinary PDF using Reducto's official SDK
    
    Args:
        pdf_path: Path to the PDF file
    """
    pdf_file = Path(pdf_path)
    
    if not pdf_file.exists():
        print(f"❌ File not found: {pdf_path}")
        return None
    
    print("="*60)
    print("🧪 REDUCTO API TEST - OFFICIAL SDK")
    print("="*60)
    print(f"\n📄 File: {pdf_file.name}")
    print(f"   Size: {pdf_file.stat().st_size / 1024:.2f} KB")
    
    try:
        # Initialize Reducto client (reads REDUCTO_API_KEY from environment)
        print("\n🔐 Initializing Reducto client...")
        client = Reducto()
        
        # Step 1: Upload the PDF
        print("📤 Uploading PDF to Reducto...")
        upload = client.upload(file=pdf_file)
        print(f"✅ Uploaded: {upload}")
        
        # Step 2: Parse the uploaded document
        print("\n🚀 Parsing document (this may take 10-30 seconds)...")
        result = client.parse.run(input=upload)
        
        # Display results
        print("\n" + "="*60)
        print("✅ PARSING COMPLETE!")
        print("="*60)
        
        print(f"\n📊 Job Info:")
        print(f"   Job ID: {result.job_id}")
        print(f"   Duration: {result.duration:.2f}s")
        print(f"   Pages processed: {result.usage.num_pages}")
        print(f"   Credits used: {result.usage.credits}")
        
        # Check if we have chunks
        if hasattr(result.result, 'chunks') and result.result.chunks:
            print(f"\n📑 Chunks extracted: {len(result.result.chunks)}")
            
            # Show first chunk preview
            first_chunk = result.result.chunks[0]
            print(f"\n📝 First Chunk Preview (first 500 chars):")
            print("-" * 60)
            print(first_chunk.content[:500])
            if len(first_chunk.content) > 500:
                print("...")
            
            # Analyze blocks in chunks
            total_blocks = sum(len(chunk.blocks) for chunk in result.result.chunks)
            print(f"\n🧱 Total Blocks: {total_blocks}")
            
            # Count block types
            block_types = {}
            for chunk in result.result.chunks:
                for block in chunk.blocks:
                    block_types[block.type] = block_types.get(block.type, 0) + 1
            
            print(f"\n📊 Block Types Found:")
            for block_type, count in sorted(block_types.items(), key=lambda x: x[1], reverse=True):
                print(f"   {block_type}: {count}")
            
            # Show tables if any
            tables_found = 0
            for i, chunk in enumerate(result.result.chunks):
                for block in chunk.blocks:
                    if block.type == "Table":
                        tables_found += 1
                        print(f"\n📊 Table {tables_found} (Chunk {i+1}, Page {block.bbox.page}):")
                        print("-" * 60)
                        print(block.content[:300])
                        if len(block.content) > 300:
                            print("...")
            
            if tables_found == 0:
                print(f"\n📊 No tables found in document")
        
        # Save full response to JSON
        output_file = "reducto_output.json"
        result_dict = {
            "job_id": result.job_id,
            "duration": result.duration,
            "usage": {
                "num_pages": result.usage.num_pages,
                "credits": result.usage.credits
            },
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
                for chunk in result.result.chunks
            ] if hasattr(result.result, 'chunks') else []
        }
        
        with open(output_file, "w") as f:
            json.dump(result_dict, f, indent=2)
        
        print(f"\n💾 Full output saved to: {output_file}")
        
        # Studio link
        if hasattr(result, 'studio_link') and result.studio_link:
            print(f"\n🔗 View in Reducto Studio:")
            print(f"   {result.studio_link}")
        
        print("\n✅ Test complete!")
        return result
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return None


def main():
    if len(sys.argv) < 2:
        print("\n❌ Usage: python scripts/test_reducto_official.py path/to/file.pdf")
        print("\n💡 Example:")
        print("   python scripts/test_reducto_official.py data/raw/sample.pdf")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    parse_veterinary_pdf(pdf_path)


if __name__ == "__main__":
    main()
