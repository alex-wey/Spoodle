#!/usr/bin/env python3
"""
Test Reducto API - Try multiple endpoint URLs
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import httpx

load_dotenv()

REDUCTO_API_KEY = os.getenv("REDUCTO_API_KEY")

# Try these common endpoint patterns
POSSIBLE_ENDPOINTS = [
    "https://api.reducto.ai/v1/parse",
    "https://api.reducto.ai/parse",
    "https://reducto.ai/api/v1/parse",
    "https://api.reducto.com/v1/parse",
]

def test_endpoint(url, pdf_path):
    """Test a specific endpoint"""
    print(f"\n🔍 Testing: {url}")
    
    try:
        with httpx.Client(timeout=10.0) as client:
            headers = {"Authorization": f"Bearer {REDUCTO_API_KEY}"}
            files = {"file": (Path(pdf_path).name, open(pdf_path, "rb"), "application/pdf")}
            
            response = client.post(url, headers=headers, files=files)
            
            if response.status_code == 200:
                print(f"✅ SUCCESS! This is the correct endpoint: {url}")
                return True, url
            else:
                print(f"   ❌ Status {response.status_code}: {response.text[:100]}")
                return False, None
    except Exception as e:
        print(f"   ❌ Error: {str(e)[:100]}")
        return False, None

def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/test_reducto_v2.py data/raw/sample.pdf")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    
    print("="*60)
    print("🔍 FINDING CORRECT REDUCTO API ENDPOINT")
    print("="*60)
    
    for endpoint in POSSIBLE_ENDPOINTS:
        success, url = test_endpoint(endpoint, pdf_path)
        if success:
            print(f"\n✅ Found working endpoint: {url}")
            print("\n💡 Update your script with this URL!")
            return
    
    print("\n❌ None of the common endpoints worked.")
    print("\n📋 Please check your Reducto dashboard for the correct API endpoint:")
    print("   1. Go to https://reducto.ai/dashboard")
    print("   2. Look for API Documentation or Settings")
    print("   3. Find the correct API endpoint URL")

if __name__ == "__main__":
    main()
