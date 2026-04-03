#!/usr/bin/env python3
"""
Semantic Chunker for Veterinary Papers
Splits parsed PDFs into semantic chunks for RAG retrieval
"""

import json
import re
from typing import List, Dict, Any
from pathlib import Path
import tiktoken


class SemanticChunker:
    """
    Chunks text into semantic pieces suitable for RAG retrieval.
    
    Features:
    - Respects sentence boundaries
    - Configurable chunk size and overlap
    - Token-based counting (accurate for LLMs)
    - Preserves metadata
    """
    
    def __init__(
        self,
        chunk_size: int = 512,
        chunk_overlap: int = 50,
        min_chunk_size: int = 100,
        encoding_name: str = "cl100k_base"  # Used by GPT-4, GPT-3.5, text-embedding-3
    ):
        """
        Initialize the chunker.
        
        Args:
            chunk_size: Target number of tokens per chunk
            chunk_overlap: Number of tokens to overlap between chunks
            min_chunk_size: Minimum tokens required for a valid chunk
            encoding_name: Tokenizer to use (cl100k_base for OpenAI models)
        """
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.min_chunk_size = min_chunk_size
        self.encoding = tiktoken.get_encoding(encoding_name)
    
    def count_tokens(self, text: str) -> int:
        """Count the number of tokens in a text string."""
        return len(self.encoding.encode(text))
    
    def split_into_sentences(self, text: str) -> List[str]:
        """
        Split text into sentences using regex.
        Handles common abbreviations and edge cases.
        """
        # Basic sentence splitting on . ! ? followed by space and capital letter
        # This is simple but works well for scientific papers
        sentences = re.split(r'(?<=[.!?])\s+(?=[A-Z])', text)
        return [s.strip() for s in sentences if s.strip()]
    
    def chunk_text(self, text: str, metadata: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Chunk a single text into semantic pieces.
        
        Args:
            text: The text to chunk
            metadata: Metadata to attach to each chunk (paper_id, journal, etc.)
        
        Returns:
            List of chunk dictionaries with text and metadata
        """
        sentences = self.split_into_sentences(text)
        chunks = []
        current_chunk = []
        current_tokens = 0
        
        for sentence in sentences:
            sentence_tokens = self.count_tokens(sentence)
            
            # If adding this sentence exceeds chunk_size, save current chunk
            if current_tokens + sentence_tokens > self.chunk_size and current_chunk:
                chunk_text = ' '.join(current_chunk)
                
                # Only save if meets minimum size
                if self.count_tokens(chunk_text) >= self.min_chunk_size:
                    chunks.append({
                        'text': chunk_text,
                        'token_count': self.count_tokens(chunk_text),
                        'metadata': metadata.copy()
                    })
                
                # Start new chunk with overlap
                # Keep last few sentences for context
                overlap_text = chunk_text
                overlap_tokens = self.count_tokens(overlap_text)
                
                # Find how many sentences to keep for overlap
                overlap_sentences = []
                overlap_token_count = 0
                for prev_sentence in reversed(current_chunk):
                    sentence_tokens = self.count_tokens(prev_sentence)
                    if overlap_token_count + sentence_tokens <= self.chunk_overlap:
                        overlap_sentences.insert(0, prev_sentence)
                        overlap_token_count += sentence_tokens
                    else:
                        break
                
                current_chunk = overlap_sentences + [sentence]
                current_tokens = self.count_tokens(' '.join(current_chunk))
            else:
                current_chunk.append(sentence)
                current_tokens += sentence_tokens
        
        # Add the last chunk
        if current_chunk:
            chunk_text = ' '.join(current_chunk)
            if self.count_tokens(chunk_text) >= self.min_chunk_size:
                chunks.append({
                    'text': chunk_text,
                    'token_count': self.count_tokens(chunk_text),
                    'metadata': metadata.copy()
                })
        
        return chunks
    
    def chunk_paper(self, paper_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Chunk a complete paper from Reducto parsed output.
        
        Args:
            paper_data: Dictionary containing parsed paper data
        
        Returns:
            List of chunks with metadata
        """
        # Extract text from Reducto format
        text = self.extract_text_from_reducto(paper_data)
        
        # Prepare metadata
        metadata = {
            'paper_id': paper_data.get('pmc_id', 'unknown'),
            'journal': paper_data.get('journal', 'unknown'),
            'citation': paper_data.get('citation', 'unknown'),
            'pmid': paper_data.get('pmid', 'unknown')
        }
        
        # Chunk the text
        chunks = self.chunk_text(text, metadata)
        
        # Add chunk indices
        for idx, chunk in enumerate(chunks):
            chunk['chunk_id'] = f"{metadata['paper_id']}_chunk_{idx}"
            chunk['chunk_index'] = idx
        
        return chunks
    
    def extract_text_from_reducto(self, paper_data: Dict[str, Any]) -> str:
        """
        Extract clean text from Reducto parsed output.
        
        Args:
            paper_data: Dictionary with Reducto output
        
        Returns:
            Concatenated text string
        """
        text_parts = []
        
        try:
            reducto_output = paper_data.get('reducto_output', {})
            result = reducto_output.get('result', {})
            chunks = result.get('chunks', [])
            
            for chunk in chunks:
                blocks = chunk.get('blocks', [])
                for block in blocks:
                    content = block.get('content', '')
                    if content and content.strip():
                        text_parts.append(content.strip())
            
        except Exception as e:
            print(f"Warning: Error extracting text - {e}")
        
        return ' '.join(text_parts)
    
    def chunk_paper_file(self, file_path: Path) -> List[Dict[str, Any]]:
        """
        Load and chunk a paper from a JSON file.
        
        Args:
            file_path: Path to the parsed paper JSON file
        
        Returns:
            List of chunks
        """
        with open(file_path, 'r', encoding='utf-8') as f:
            paper_data = json.load(f)
        
        return self.chunk_paper(paper_data)


if __name__ == "__main__":
    # Simple test
    print("✅ Semantic Chunker module loaded successfully!")
    print(f"   Default settings: {512} tokens/chunk, {50} token overlap")
