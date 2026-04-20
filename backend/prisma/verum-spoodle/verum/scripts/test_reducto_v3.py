#!/usr/bin/env python3
"""
Test Reducto API - Try different request formats
"""

import os
import sys
import base64
from pathlib import Path
from dotenv import load_dotenv
import httpx
import json

load_dotenv()

REDUCTO_API_KEY = os.getenv("REDUCTO_API_KEY")
REDUCTO_API_URL = "https://reducto.ai/api/upload"


def test_format_1_multipart(pdf_path):
    """Test 1: Multipart form-data"""
    print("\n📤 Test 1: Multipart form-data")
    
    pdf_file = Path(pdf_path)
    
    try:
        with httpx.Client(timeout=60.0) as client:
            headers = {"Authorization": f"Bearer {REDUCTO_API_KEY}"}
            files = {"file": (pdf_file.name, open(pdf_path, "rb"), "application/pdf")}
            
            response = client.post(REDUCTO_API_URL, headers=headers, files=files)
            
            print(f"   Status: {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            
            if response.status_code == 200:
                return True, response.json()
    except Exception as e:
        print(f"   Error: {e}")
    
    return False, None


def test_format_2_base64_json(pdf_path):
    """Test 2: JSON with base64-encoded file"""
    print("\n📤 Test 2: JSON with base64-encoded file")
    
    try:
        # Read and encode PDF
        with open(pdf_path, "rb") as f:
            pdf_bytes = f.read()
            pdf_base64 = base64.b64encode(pdf_bytes).decode('utf-8')
        
        with httpx.Client(timeout=60.0) as client:
            headers = {
                "Authorization": f"Bearer {REDUCTO_API_KEY}",
                "Content-Type": "application/json"
            }
            
            data = {
                "file": pdf_base64,
                "filename": Path(pdf_path).name
            }
            
            response = client.post(REDUCTO_API_URL, headers=headers, json=data)
            
            print(f"   Status: {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            
            if response.status_code == 200:
                return True, response.json()
    except Exception as e:
        print(f"   Error: {e}")
    
    return False, None


def test_format_3_data_field(pdf_path):
    """Test 3: Multipart with 'data' field"""
    print("\n📤 Test 3: Multipart with 'data' field name")
    
    pdf_file = Path(pdf_path)
    
    try:
        with httpx.Client(timeout=60.0) as client:
            headers = {"Authorization": f"Bearer {REDUCTO_API_KEY}"}
            files = {"data": (pdf_file.name, open(pdf_path, "rb"), "application/pdf")}
            
            response = client.post(REDUCTO_API_URL, headers=headers, files=files)
            
            print(f"   Status: {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            
            if response.status_code == 200:
                return True, response.json()
    except Exception as e:
        print(f"   Error: {e}")
    
    return False, None


def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/test_reducto_v3.py data/raw/sample.pdf")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    
    print("="*60)
    print("🧪 TESTING DIFFERENT REDUCTO REQUEST FORMATS")
    print("="*60)
    
    # Try different formats
    tests = [
        test_format_1_multipart,
        test_format_2_base64_json,
        test_format_3_data_field,
    ]
    
    for test_func in tests:
        success, data = test_func(pdf_path)
        if success:
            print(f"\n✅ SUCCESS! This format works!")
            print(f"\n📄 Response preview:")
            print(json.dumps(data, indent=2)[:500])
            
            # Save full response
            with open("reducto_test_output.json", "w") as f:
                json.dump(data, f, indent=2)
            print(f"\n💾 Full response saved to: reducto_test_output.json")
            return
    
    print("\n❌ None of the formats worked.")
    print("\n💡 Please check Reducto documentation or dashboard:")
    print("   https://reducto.ai/dashboard")
    print("   Look for API examples or request format")


if __name__ == "__main__":
    main()
