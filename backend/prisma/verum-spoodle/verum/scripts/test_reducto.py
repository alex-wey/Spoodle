#!/usr/bin/env python3
"""
Test Reducto API - Parse a single PDF and inspect the output

Usage:
    python scripts/test_reducto.py path/to/sample.pdf
"""

import os
import sys
import json
from pathlib import Path
from dotenv import load_dotenv
import httpx

# Load environment variables
load_dotenv()

REDUCTO_API_KEY = os.getenv("REDUCTO_API_KEY")
REDUCTO_API_URL = "https://reducto.ai/api/upload"


def test_reducto_connection():
    """Test if Reducto API key is valid"""
    print("🔐 Testing Reducto API connection...")
    
    if not REDUCTO_API_KEY or REDUCTO_API_KEY == "your-reducto-key-here":
        print("❌ Reducto API key not configured in .env file")
        return False
    
    print(f"✅ API key found: {REDUCTO_API_KEY[:10]}...")
    return True


def parse_pdf_with_reducto(pdf_path: str):
    """
    Parse PDF using Reducto API
    
    Args:
        pdf_path: Path to PDF file
        
    Returns:
        Parsed document data from Reducto
    """
    pdf_file = Path(pdf_path)
    
    if not pdf_file.exists():
        print(f"❌ File not found: {pdf_path}")
        return None
    
    print(f"\n📄 Parsing PDF: {pdf_file.name}")
    print(f"   Size: {pdf_file.stat().st_size / 1024:.2f} KB")
    
    try:
        with httpx.Client(timeout=60.0) as client:
            # Prepare the request
            headers = {
                "Authorization": f"Bearer {REDUCTO_API_KEY}",
                "Content-Type": "application/pdf"
            }
            
            # Read PDF as binary
            pdf_content = pdf_file.read_bytes()
            
            print("\n🚀 Sending to Reducto API...")
            
            # Make the request - send PDF as binary in body
            response = client.post(
                REDUCTO_API_URL,
                headers=headers,
                content=pdf_content
            )
            
            # Check response
            if response.status_code == 200:
                print("✅ Successfully parsed!")
                return response.json()
            else:
                print(f"❌ Error {response.status_code}: {response.text}")
                return None
                
    except Exception as e:
        print(f"❌ Error: {e}")
        return None


def display_results(data):
    """Display parsed results in a readable format"""
    if not data:
        return
    
    print("\n" + "="*60)
    print("📊 PARSED DOCUMENT STRUCTURE")
    print("="*60)
    
    # Show the structure
    if isinstance(data, dict):
        print(f"\n🔑 Top-level keys: {list(data.keys())}")
        
        # Try to display common fields
        if "text" in data:
            text = data["text"]
            print(f"\n📝 Full Text Preview (first 500 chars):")
            print("-" * 60)
            print(text[:500] + "..." if len(text) > 500 else text)
        
        if "sections" in data:
            sections = data["sections"]
            print(f"\n📑 Sections Found: {len(sections)}")
            for i, section in enumerate(sections[:5]):  # Show first 5
                print(f"   {i+1}. {section.get('title', 'Untitled')}")
        
        if "tables" in data:
            tables = data["tables"]
            print(f"\n📊 Tables Found: {len(tables)}")
        
        if "metadata" in data:
            metadata = data["metadata"]
            print(f"\n📋 Metadata:")
            for key, value in metadata.items():
                print(f"   {key}: {value}")
    
    # Save full output
    output_file = "reducto_test_output.json"
    with open(output_file, "w") as f:
        json.dump(data, f, indent=2)
    
    print(f"\n💾 Full output saved to: {output_file}")
    print("\n✅ Test complete!")


def main():
    """Main test function"""
    print("="*60)
    print("🧪 REDUCTO API TEST")
    print("="*60)
    
    # Check connection
    if not test_reducto_connection():
        sys.exit(1)
    
    # Get PDF path from command line
    if len(sys.argv) < 2:
        print("\n❌ Usage: python scripts/test_reducto.py path/to/file.pdf")
        print("\n💡 Tip: Put a sample PDF in data/raw/ and run:")
        print("   python scripts/test_reducto.py data/raw/sample.pdf")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    
    # Parse the PDF
    result = parse_pdf_with_reducto(pdf_path)
    
    # Display results
    display_results(result)


if __name__ == "__main__":
    main()
