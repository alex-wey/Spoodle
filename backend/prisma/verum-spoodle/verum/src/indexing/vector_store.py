"""
Vector Store for Veterinary RAG System

Stores and retrieves document chunks using vector similarity search.
Supports PostgreSQL with pgvector extension.
"""

import os
import json
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import asdict
import psycopg2
from psycopg2.extensions import register_adapter, AsIs
from psycopg2.extras import execute_values
from dotenv import load_dotenv

load_dotenv()


# Adapter for numpy arrays to PostgreSQL
def adapt_list(lst):
    return AsIs(f"'{json.dumps(lst)}'::vector")


class VectorStore:
    """
    Vector database for storing and searching document chunks
    Uses PostgreSQL with pgvector extension
    """
    
    def __init__(self, connection_string: Optional[str] = None):
        """
        Initialize vector store
        
        Args:
            connection_string: PostgreSQL connection string
        """
        self.connection_string = connection_string or os.getenv("DATABASE_URL")
        
        if not self.connection_string:
            raise ValueError("DATABASE_URL not found in environment variables")
        
        self.conn = None
        self.dimensions = 1536  # OpenAI text-embedding-3-small default
        
    def connect(self):
        """Connect to PostgreSQL database"""
        if not self.conn or self.conn.closed:
            self.conn = psycopg2.connect(self.connection_string)
            print("✅ Connected to PostgreSQL")
    
    def disconnect(self):
        """Disconnect from database"""
        if self.conn and not self.conn.closed:
            self.conn.close()
            print("✅ Disconnected from PostgreSQL")
    
    def initialize_schema(self):
        """
        Create tables and indexes if they don't exist
        """
        self.connect()
        
        with self.conn.cursor() as cursor:
            # Enable pgvector extension
            cursor.execute("CREATE EXTENSION IF NOT EXISTS vector;")
            
            # Create documents table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS documents (
                    id TEXT PRIMARY KEY,
                    source_file TEXT NOT NULL,
                    title TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            
            # Create chunks table
            cursor.execute(f"""
                CREATE TABLE IF NOT EXISTS chunks (
                    id TEXT PRIMARY KEY,
                    document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
                    content TEXT NOT NULL,
                    embedding vector({self.dimensions}),
                    chunk_index INTEGER,
                    section_type TEXT,
                    page_number INTEGER,
                    priority INTEGER,
                    species TEXT[],
                    conditions TEXT[],
                    has_table BOOLEAN,
                    has_figure BOOLEAN,
                    block_types TEXT[],
                    metadata JSONB,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            
            # Create vector similarity index (IVFFlat for fast approximate search)
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS chunks_embedding_idx 
                ON chunks USING ivfflat (embedding vector_cosine_ops)
                WITH (lists = 100);
            """)
            
            # Create indexes for filtering
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS chunks_document_id_idx 
                ON chunks(document_id);
            """)
            
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS chunks_section_type_idx 
                ON chunks(section_type);
            """)
            
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS chunks_priority_idx 
                ON chunks(priority DESC);
            """)
            
            self.conn.commit()
            print("✅ Database schema initialized")
    
    def insert_document(
        self,
        document_id: str,
        source_file: str,
        title: Optional[str] = None
    ):
        """Insert a document record"""
        self.connect()
        
        with self.conn.cursor() as cursor:
            cursor.execute("""
                INSERT INTO documents (id, source_file, title)
                VALUES (%s, %s, %s)
                ON CONFLICT (id) DO UPDATE 
                SET source_file = EXCLUDED.source_file,
                    title = EXCLUDED.title;
            """, (document_id, source_file, title))
            
            self.conn.commit()
    
    def insert_chunks(self, chunks: List[Any]):
        """
        Insert multiple chunks in batch
        
        Args:
            chunks: List of Chunk objects from semantic_chunker
        """
        if not chunks:
            return
        
        self.connect()
        
        # Prepare data for insertion
        chunk_data = []
        for chunk in chunks:
            metadata = chunk.metadata
            
            chunk_data.append((
                metadata.chunk_id,
                metadata.document_id,
                chunk.content,
                chunk.embedding,  # List[float]
                metadata.chunk_index,
                metadata.section_type,
                metadata.page_number,
                metadata.priority,
                metadata.species,
                metadata.conditions,
                metadata.has_table,
                metadata.has_figure,
                metadata.block_types,
                json.dumps(asdict(metadata))
            ))
        
        with self.conn.cursor() as cursor:
            execute_values(
                cursor,
                """
                INSERT INTO chunks (
                    id, document_id, content, embedding, chunk_index,
                    section_type, page_number, priority, species, conditions,
                    has_table, has_figure, block_types, metadata
                ) VALUES %s
                ON CONFLICT (id) DO NOTHING;
                """,
                chunk_data
            )
            
            self.conn.commit()
        
        print(f"✅ Inserted {len(chunks)} chunks")
    
    def search_similar(
        self,
        query_embedding: List[float],
        top_k: int = 5,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Search for similar chunks using vector similarity
        
        Args:
            query_embedding: Query vector
            top_k: Number of results to return
            filters: Optional filters (species, section_type, etc.)
            
        Returns:
            List of similar chunks with similarity scores
        """
        self.connect()
        
        # Build query with optional filters
        where_clauses = []
        params = [query_embedding, top_k]
        param_idx = 3
        
        if filters:
            if "species" in filters:
                where_clauses.append(f"species && %s")
                params.insert(-1, filters["species"])
            
            if "section_type" in filters:
                where_clauses.append(f"section_type = %s")
                params.insert(-1, filters["section_type"])
            
            if "min_priority" in filters:
                where_clauses.append(f"priority >= %s")
                params.insert(-1, filters["min_priority"])
        
        where_clause = " AND " + " AND ".join(where_clauses) if where_clauses else ""
        
        query = f"""
            SELECT 
                id,
                document_id,
                content,
                section_type,
                page_number,
                priority,
                species,
                conditions,
                metadata,
                1 - (embedding <=> %s::vector) as similarity
            FROM chunks
            WHERE embedding IS NOT NULL {where_clause}
            ORDER BY embedding <=> %s::vector
            LIMIT %s;
        """
        
        with self.conn.cursor() as cursor:
            cursor.execute(query, params)
            results = cursor.fetchall()
        
        # Format results
        formatted_results = []
        for row in results:
            formatted_results.append({
                "chunk_id": row[0],
                "document_id": row[1],
                "content": row[2],
                "section_type": row[3],
                "page_number": row[4],
                "priority": row[5],
                "species": row[6],
                "conditions": row[7],
                "metadata": row[8],
                "similarity": float(row[9])
            })
        
        return formatted_results
    
    def get_document_chunks(self, document_id: str) -> List[Dict[str, Any]]:
        """Get all chunks for a specific document"""
        self.connect()
        
        with self.conn.cursor() as cursor:
            cursor.execute("""
                SELECT id, content, section_type, page_number, priority, metadata
                FROM chunks
                WHERE document_id = %s
                ORDER BY chunk_index;
            """, (document_id,))
            
            results = cursor.fetchall()
        
        return [
            {
                "chunk_id": row[0],
                "content": row[1],
                "section_type": row[2],
                "page_number": row[3],
                "priority": row[4],
                "metadata": row[5]
            }
            for row in results
        ]
    
    def delete_document(self, document_id: str):
        """Delete a document and all its chunks"""
        self.connect()
        
        with self.conn.cursor() as cursor:
            cursor.execute("DELETE FROM documents WHERE id = %s;", (document_id,))
            self.conn.commit()
        
        print(f"✅ Deleted document {document_id}")
    
    def get_stats(self) -> Dict[str, Any]:
        """Get database statistics"""
        self.connect()
        
        with self.conn.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) FROM documents;")
            num_documents = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM chunks;")
            num_chunks = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM chunks WHERE embedding IS NOT NULL;")
            num_embedded = cursor.fetchone()[0]
        
        return {
            "total_documents": num_documents,
            "total_chunks": num_chunks,
            "embedded_chunks": num_embedded,
            "pending_embeddings": num_chunks - num_embedded
        }
    
    def print_stats(self):
        """Print database statistics"""
        stats = self.get_stats()
        print("\n" + "="*60)
        print("📊 VECTOR STORE STATS")
        print("="*60)
        print(f"Total documents: {stats['total_documents']}")
        print(f"Total chunks: {stats['total_chunks']}")
        print(f"Embedded chunks: {stats['embedded_chunks']}")
        print(f"Pending embeddings: {stats['pending_embeddings']}")
        print("="*60)
