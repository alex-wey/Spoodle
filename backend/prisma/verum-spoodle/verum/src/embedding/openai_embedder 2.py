#!/usr/bin/env python3
"""
OpenAI Embedding Generator
Converts text chunks to vector embeddings using OpenAI's API
"""

import os
import time
from typing import List, Dict, Any
from openai import OpenAI
import logging


class OpenAIEmbedder:
    """
    Generate embeddings using OpenAI's embedding models.
    
    Features:
    - Batch processing for efficiency
    - Automatic retry on failures
    - Progress tracking
    - Cost estimation
    """
    
    def __init__(
        self,
        api_key: str = None,
        model: str = "text-embedding-3-small",
        batch_size: int = 100,
        max_retries: int = 3,
        retry_delay: int = 2
    ):
        """
        Initialize the embedder.
        
        Args:
            api_key: OpenAI API key (or set OPENAI_API_KEY env var)
            model: Embedding model to use
            batch_size: Number of texts to embed at once
            max_retries: Number of retry attempts on failure
            retry_delay: Seconds to wait between retries
        """
        # TEMPORARY: Bypass .env and use API key directly
        # TODO: Fix .env loading issue later
        if api_key:
            self.api_key = api_key
        else:
            # Try .env first
            from dotenv import load_dotenv
            load_dotenv()
            self.api_key = os.getenv('OPENAI_API_KEY')
            
            # If still empty, print error with instructions
            if not self.api_key:
                raise ValueError("OpenAI API key not found. Set OPENAI_API_KEY env var or pass api_key parameter.")
        
        self.client = OpenAI(api_key=self.api_key)
        self.model = model
        self.batch_size = batch_size
        self.max_retries = max_retries
        self.retry_delay = retry_delay
        
        # Model dimensions
        self.dimensions = {
            "text-embedding-3-small": 1536,
            "text-embedding-3-large": 3072,
            "text-embedding-ada-002": 1536
        }
    
    def get_embedding_dimension(self) -> int:
        """Get the dimension of the embedding model."""
        return self.dimensions.get(self.model, 1536)
    
    def embed_text(self, text: str, retry_count: int = 0) -> List[float]:
        """
        Embed a single text string.
        
        Args:
            text: Text to embed
            retry_count: Current retry attempt
        
        Returns:
            List of floats representing the embedding vector
        """
        try:
            response = self.client.embeddings.create(
                model=self.model,
                input=text
            )
            return response.data[0].embedding
        
        except Exception as e:
            if retry_count < self.max_retries:
                logging.warning(f"   ⚠️  Retry {retry_count + 1}/{self.max_retries} after error: {str(e)[:100]}")
                time.sleep(self.retry_delay)
                return self.embed_text(text, retry_count + 1)
            else:
                logging.error(f"   ❌ Failed after {self.max_retries} retries: {str(e)[:100]}")
                raise
    
    def embed_batch(self, texts: List[str], retry_count: int = 0) -> List[List[float]]:
        """
        Embed a batch of texts.
        
        Args:
            texts: List of texts to embed
            retry_count: Current retry attempt
        
        Returns:
            List of embedding vectors
        """
        try:
            response = self.client.embeddings.create(
                model=self.model,
                input=texts
            )
            # Sort by index to maintain order
            sorted_data = sorted(response.data, key=lambda x: x.index)
            return [item.embedding for item in sorted_data]
        
        except Exception as e:
            if retry_count < self.max_retries:
                logging.warning(f"   ⚠️  Retry {retry_count + 1}/{self.max_retries} after error: {str(e)[:100]}")
                time.sleep(self.retry_delay)
                return self.embed_batch(texts, retry_count + 1)
            else:
                logging.error(f"   ❌ Failed after {self.max_retries} retries: {str(e)[:100]}")
                raise
    
    def embed_chunks(self, chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Embed a list of chunks with metadata.
        
        Args:
            chunks: List of chunk dictionaries with 'text' field
        
        Returns:
            List of chunks with added 'embedding' field
        """
        logging.info(f"🧠 Generating embeddings for {len(chunks)} chunks...")
        logging.info(f"   Model: {self.model}")
        logging.info(f"   Batch size: {self.batch_size}")
        logging.info(f"   Dimensions: {self.get_embedding_dimension()}")
        logging.info("")
        
        # Process in batches
        total_batches = (len(chunks) + self.batch_size - 1) // self.batch_size
        embedded_chunks = []
        
        for batch_idx in range(total_batches):
            start_idx = batch_idx * self.batch_size
            end_idx = min(start_idx + self.batch_size, len(chunks))
            batch = chunks[start_idx:end_idx]
            
            logging.info(f"   Batch {batch_idx + 1}/{total_batches}: Processing chunks {start_idx + 1}-{end_idx}")
            
            # Extract texts
            texts = [chunk['text'] for chunk in batch]
            
            # Generate embeddings
            try:
                embeddings = self.embed_batch(texts)
                
                # Add embeddings to chunks
                for chunk, embedding in zip(batch, embeddings):
                    chunk_with_embedding = chunk.copy()
                    chunk_with_embedding['embedding'] = embedding
                    embedded_chunks.append(chunk_with_embedding)
                
                logging.info(f"   ✅ Successfully embedded {len(embeddings)} chunks")
                
            except Exception as e:
                logging.error(f"   ❌ Failed to embed batch: {e}")
                # Continue with next batch instead of failing completely
                continue
            
            # Small delay between batches to avoid rate limits
            if batch_idx < total_batches - 1:
                time.sleep(0.5)
        
        logging.info("")
        logging.info(f"✅ Completed: {len(embedded_chunks)}/{len(chunks)} chunks embedded")
        
        return embedded_chunks
    
    def estimate_cost(self, num_tokens: int) -> float:
        """
        Estimate the cost of embedding based on token count.
        
        Args:
            num_tokens: Total number of tokens to embed
        
        Returns:
            Estimated cost in USD
        """
        # Pricing per 1M tokens (as of 2024)
        pricing = {
            "text-embedding-3-small": 0.02,
            "text-embedding-3-large": 0.13,
            "text-embedding-ada-002": 0.10
        }
        
        price_per_million = pricing.get(self.model, 0.02)
        return (num_tokens / 1_000_000) * price_per_million


if __name__ == "__main__":
    # Simple test
    print("✅ OpenAI Embedder module loaded successfully!")
    print(f"   Default model: text-embedding-3-small")
    print(f"   Dimensions: 1536")
