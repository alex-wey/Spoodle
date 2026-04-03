#!/bin/bash

# Start the Verum RAG API server
# This exposes your RAG system as an API for the frontend to use

echo "Starting Verum RAG API server on http://localhost:8000"
echo "Press Ctrl+C to stop"
echo ""

cd "$(dirname "$0")/.."
source venv/bin/activate
python3 api/main.py
