"""
Embedding Service for Veterinary RAG System

Generates vector embeddings from text chunks using OpenAI or other embedding models.
Supports batch processing and caching for efficiency.
"""

import os
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import time
import openai
from dotenv import load_dotenv

load_dotenv()


@dataclass
class EmbeddingResult:
    """Result of embedding generation"""
    text: str
    embedding: List[float]
    model: str
    dimensions: int
    tokens_used: int


class EmbeddingService:
    """
    Service for generating embeddings from text
    """
    
    def __init__(
        self,
        model: str = "text-embedding-3-small",
        batch_size: int = 100,
        max_retries: int = 3
    ):
        """
        Initialize embedding service
        
        Args:
            model: OpenAI embedding model to use
            batch_size: Number of texts to embed in one API call
            max_retries: Maximum number of retry attempts
        """
        self.model = model
        self.batch_size = batch_size
        self.max_retries = max_retries
        
        # Initialize OpenAI client
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables")
        
        self.client = openai.OpenAI(api_key=api_key)
        
        # Model dimensions
        self.model_dimensions = {
            "text-embedding-3-small": 1536,
            "text-embedding-3-large": 3072,
            "text-embedding-ada-002": 1536
        }
        
        self.dimensions = self.model_dimensions.get(model, 1536)
        
        # Stats
        self.total_tokens_used = 0
        self.total_embeddings_generated = 0
    
    def embed_text(self, text: str) -> EmbeddingResult:
        """
        Generate embedding for a single text
        
        Args:
            text: Text to embed
            
        Returns:
            EmbeddingResult with vector and metadata
        """
        results = self.embed_batch([text])
        return results[0] if results else None
    
    def embed_batch(
        self,
        texts: List[str],
        show_progress: bool = False
    ) -> List[EmbeddingResult]:
        """
        Generate embeddings for multiple texts
        
        Args:
            texts: List of texts to embed
            show_progress: Whether to print progress
            
        Returns:
            List of EmbeddingResults
        """
        if not texts:
            return []
        
        results = []
        
        # Process in batches
        for i in range(0, len(texts), self.batch_size):
            batch = texts[i:i + self.batch_size]
            
            if show_progress:
                print(f"Embedding batch {i // self.batch_size + 1}/{(len(texts) + self.batch_size - 1) // self.batch_size}...")
            
            batch_results = self._embed_batch_with_retry(batch)
            results.extend(batch_results)
        
        return results
    
    def _embed_batch_with_retry(self, texts: List[str]) -> List[EmbeddingResult]:
        """Embed a batch with retry logic"""
        for attempt in range(self.max_retries):
            try:
                # Call OpenAI API
                response = self.client.embeddings.create(
                    model=self.model,
                    input=texts
                )
                
                # Extract results
                results = []
                for i, embedding_data in enumerate(response.data):
                    embedding = embedding_data.embedding
                    
                    result = EmbeddingResult(
                        text=texts[i],
                        embedding=embedding,
                        model=self.model,
                        dimensions=len(embedding),
                        tokens_used=response.usage.total_tokens // len(texts)  # Approximate per text
                    )
                    results.append(result)
                
                # Update stats
                self.total_tokens_used += response.usage.total_tokens
                self.total_embeddings_generated += len(texts)
                
                return results
                
            except openai.RateLimitError as e:
                wait_time = 2 ** attempt  # Exponential backoff
                print(f"Rate limit hit, waiting {wait_time}s before retry {attempt + 1}/{self.max_retries}")
                time.sleep(wait_time)
                
            except Exception as e:
                if attempt == self.max_retries - 1:
                    print(f"Error embedding batch after {self.max_retries} attempts: {e}")
                    # Return empty embeddings for failed texts
                    return [
                        EmbeddingResult(
                            text=text,
                            embedding=[0.0] * self.dimensions,
                            model=self.model,
                            dimensions=self.dimensions,
                            tokens_used=0
                        )
                        for text in texts
                    ]
                time.sleep(1)
        
        return []
    
    def get_stats(self) -> Dict[str, Any]:
        """Get embedding service statistics"""
        cost_per_1m_tokens = 0.02  # $0.02 per 1M tokens for text-embedding-3-small
        estimated_cost = (self.total_tokens_used / 1_000_000) * cost_per_1m_tokens
        
        return {
            "total_embeddings_generated": self.total_embeddings_generated,
            "total_tokens_used": self.total_tokens_used,
            "estimated_cost_usd": estimated_cost,
            "model": self.model,
            "dimensions": self.dimensions
        }
    
    def print_stats(self):
        """Print embedding statistics"""
        stats = self.get_stats()
        print("\n" + "="*60)
        print("📊 EMBEDDING SERVICE STATS")
        print("="*60)
        print(f"Model: {stats['model']}")
        print(f"Dimensions: {stats['dimensions']}")
        print(f"Embeddings generated: {stats['total_embeddings_generated']}")
        print(f"Tokens used: {stats['total_tokens_used']:,}")
        print(f"Estimated cost: ${stats['estimated_cost_usd']:.4f}")
        print("="*60)
