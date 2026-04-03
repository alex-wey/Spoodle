-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the main embeddings table
CREATE TABLE IF NOT EXISTS document_chunks (
    id SERIAL PRIMARY KEY,
    chunk_id VARCHAR(255) UNIQUE NOT NULL,
    pmc_id VARCHAR(50),
    citation TEXT,
    pmid VARCHAR(50),
    journal VARCHAR(255),
    pdf_path TEXT,
    chunk_index INTEGER,
    text TEXT NOT NULL,
    token_count INTEGER,
    embedding vector(1536),  -- OpenAI text-embedding-3-small dimensions
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for fast vector similarity search
CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx 
ON document_chunks 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create index for metadata filtering
CREATE INDEX IF NOT EXISTS document_chunks_pmc_id_idx ON document_chunks(pmc_id);
CREATE INDEX IF NOT EXISTS document_chunks_journal_idx ON document_chunks(journal);

-- Display table info
\d document_chunks
