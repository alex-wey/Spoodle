import os
import psycopg2
from typing import List, Dict, Any, Optional
from openai import OpenAI
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class VectorRetriever:
    """
    Retrieves relevant document chunks from pgvector database using semantic similarity.
    """
    
    def __init__(self, api_key: str, database: str = "verum_rag", 
                 embedding_model: str = "text-embedding-3-small"):
        """
        Initialize the retriever.
        
        Args:
            api_key: OpenAI API key for generating query embeddings
            database: PostgreSQL database name
            embedding_model: OpenAI embedding model to use
        """
        self.client = OpenAI(api_key=api_key)
        self.embedding_model = embedding_model
        self.database = database
        self.conn = None
        logging.info(f"VectorRetriever initialized with model: {embedding_model}")
    
    def connect(self):
        """Connect to PostgreSQL database."""
        try:
            # Use DATABASE_URL if available (Railway/production), otherwise localhost (development)
            database_url = os.environ.get('DATABASE_URL')
            if database_url:
                self.conn = psycopg2.connect(database_url)
            else:
                self.conn = psycopg2.connect(
                    dbname=self.database,
                    user=os.environ.get('USER'),
                    host='localhost',
                    port=5432
                )
            logging.info(f"✅ Connected to database: {self.database}")
        except Exception as e:
            logging.error(f"❌ Failed to connect to database: {e}")
            raise
    
    def disconnect(self):
        """Close database connection."""
        if self.conn:
            self.conn.close()
            logging.info("Database connection closed")
    
    def embed_query(self, query: str) -> List[float]:
        """
        Generate embedding for a query string.
        
        Args:
            query: Query text to embed
            
        Returns:
            List of floats representing the query embedding
        """
        try:
            response = self.client.embeddings.create(
                model=self.embedding_model,
                input=query
            )
            return response.data[0].embedding
        except Exception as e:
            logging.error(f"❌ Failed to generate query embedding: {e}")
            raise
    
    def retrieve(self, query: str, top_k: int = 5, 
                 filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        Retrieve the most similar document chunks for a query.
        
        Args:
            query: Query string
            top_k: Number of top results to return
            filters: Optional metadata filters (e.g., {"journal": "BMC Vet Res"})
            
        Returns:
            List of dictionaries containing chunk data and similarity scores
        """
        if not self.conn:
            self.connect()
        
        # Generate query embedding
        logging.info(f"🔍 Retrieving results for: \"{query}\"")
        query_embedding = self.embed_query(query)
        
        # Build SQL query with optional filters
        sql = """
            SELECT 
                id,
                chunk_id,
                pmc_id,
                citation,
                pmid,
                journal,
                pdf_path,
                chunk_index,
                text,
                token_count,
                1 - (embedding <=> %s::vector) as similarity
            FROM document_chunks
        """
        
        params = [query_embedding]
        
        # Add filters if provided
        if filters:
            filter_conditions = []
            for key, value in filters.items():
                filter_conditions.append(f"{key} = %s")
                params.append(value)
            sql += " WHERE " + " AND ".join(filter_conditions)
        
        sql += " ORDER BY embedding <=> %s::vector LIMIT %s"
        params.extend([query_embedding, top_k])
        
        # Execute query
        cursor = self.conn.cursor()
        cursor.execute(sql, params)
        results = cursor.fetchall()
        cursor.close()
        
        # Format results
        formatted_results = []
        for row in results:
            formatted_results.append({
                "id": row[0],
                "chunk_id": row[1],
                "pmc_id": row[2],
                "citation": row[3],
                "pmid": row[4],
                "journal": row[5],
                "pdf_path": row[6],
                "chunk_index": row[7],
                "text": row[8],
                "token_count": row[9],
                "similarity": float(row[10])
            })
        
        logging.info(f"✅ Retrieved {len(formatted_results)} results")
        return formatted_results
    
    def retrieve_with_context(self, query: str, top_k: int = 5, 
                             context_window: int = 1) -> List[Dict[str, Any]]:
        """
        Retrieve chunks with surrounding context (previous/next chunks).
        Useful for getting more complete information.
        
        Args:
            query: Query string
            top_k: Number of top results to return
            context_window: Number of chunks before/after to include
            
        Returns:
            List of dictionaries with main chunk and context chunks
        """
        # First get the top chunks
        main_results = self.retrieve(query, top_k)
        
        if not main_results or context_window <= 0:
            return main_results
        
        cursor = self.conn.cursor()
        
        # For each result, get surrounding chunks
        for result in main_results:
            pmc_id = result['pmc_id']
            chunk_index = result['chunk_index']
            
            if pmc_id and chunk_index is not None:
                # Get previous and next chunks
                cursor.execute("""
                    SELECT chunk_id, text, chunk_index
                    FROM document_chunks
                    WHERE pmc_id = %s 
                    AND chunk_index >= %s 
                    AND chunk_index <= %s
                    ORDER BY chunk_index
                """, (pmc_id, chunk_index - context_window, chunk_index + context_window))
                
                context_chunks = cursor.fetchall()
                result['context'] = [
                    {"chunk_id": c[0], "text": c[1], "chunk_index": c[2]} 
                    for c in context_chunks
                ]
        
        cursor.close()
        return main_results
    
    def __enter__(self):
        """Context manager entry."""
        self.connect()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.disconnect()
