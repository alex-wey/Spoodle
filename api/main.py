"""
FastAPI server for Verum RAG system.
Exposes endpoints to query the veterinary research database.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import sys
from dotenv import load_dotenv

# Add parent directory to path to import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.retrieval.vector_retriever import VectorRetriever
from src.generation.answer_generator import AnswerGenerator

# Load environment variables
load_dotenv(override=True)

app = FastAPI(title="Verum RAG API", version="1.0.0")

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js dev server
        "http://localhost:3001",
        "http://localhost:8081",  # Expo dev server
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AskRequest(BaseModel):
    question: str
    petType: Optional[str] = "all"
    top_k: Optional[int] = 15  # Increased from 5 to get more diverse results


class Source(BaseModel):
    journal: str
    title: str
    year: int
    url: str
    pmc_id: Optional[str] = None


class AskResponse(BaseModel):
    success: bool
    data: dict
    message: str


# Initialize RAG components
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY not found in environment variables")

DATABASE_NAME = os.getenv("DB_NAME", "verum_rag")

# Initialize retriever and answer generator
retriever = VectorRetriever(
    api_key=OPENAI_API_KEY,
    database=DATABASE_NAME,
    embedding_model="text-embedding-3-small"
)
retriever.connect()
answer_generator = AnswerGenerator(api_key=OPENAI_API_KEY, model="gpt-4o-mini")


@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Verum RAG API is running", "status": "online", "endpoints": ["/health", "/api/ask", "/api/stats"]}


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Verum RAG API"}


@app.post("/api/ask", response_model=AskResponse)
async def ask_verum(request: AskRequest):
    """
    Ask a veterinary research question and get an evidence-based answer.
    
    Args:
        question: The veterinary question to answer
        petType: Optional species filter (dog, cat, horse, etc.)
        top_k: Number of relevant documents to retrieve (default: 5)
    
    Returns:
        AskResponse with content and sources
    """
    try:
        if not request.question or len(request.question.strip()) == 0:
            raise HTTPException(status_code=400, detail="Question is required")
        
        # Add species context to the query if specified
        query = request.question
        if request.petType and request.petType != "all":
            query = f"{request.question} (species: {request.petType})"
        
        # Step 1: Retrieve relevant chunks from vector database
        # Note: No minimum similarity threshold - we return top_k results regardless of score
        # With a small database, increasing top_k helps find more unique papers
        retrieved_chunks = retriever.retrieve(query, top_k=request.top_k)
        
        if not retrieved_chunks:
            return AskResponse(
                success=True,
                data={
                    "content": "No relevant veterinary literature was found for this query. This may indicate:\n\n1. The indexed literature doesn't cover this specific topic\n2. The question needs to be rephrased for better matching\n3. This is a knowledge gap in the current database\n\nTry rephrasing your question with more specific clinical terms (e.g., 'canine lymphoma', 'osteosarcoma in dogs', 'mast cell tumors').",
                    "sources": []
                },
                message="No relevant sources found"
            )
        
        # Step 2: Generate answer using LLM with retrieved context
        answer_data = answer_generator.generate_answer(
            query=request.question,
            retrieved_chunks=retrieved_chunks
        )
        
        # Extract the answer text (just the string, not the whole dict)
        if isinstance(answer_data, dict) and "answer" in answer_data:
            answer_text = answer_data["answer"]
        else:
            answer_text = str(answer_data)
        
        # Step 3: Format sources for frontend
        # Use the deduplicated sources from answer_generator instead of rebuilding from retrieved_chunks
        sources = []
        
        for source in answer_data.get("sources", []):
            # Extract info from the already-deduplicated source
            citation = source.get("citation", "")
            journal = source.get("journal", "Unknown Journal")
            pmid = source.get("pmid", "")
            pmc_id = source.get("pmc_id", "")
            
            # Try to extract title and year from citation if available
            # Citation format is typically: "Journal. YYYY Mon DD; Vol(Issue):Pages"
            title = "Research Paper"
            year = 2023
            
            if citation:
                # Extract year from citation
                parts = citation.split(";")
                if len(parts) > 0:
                    # First part usually has journal and date
                    date_part = parts[0].split(".")[-1].strip()
                    year_match = date_part.split()
                    if year_match and year_match[0].isdigit() and len(year_match[0]) == 4:
                        year = int(year_match[0])
                
                # Use PMID or journal as title if no better option
                if pmid:
                    title = f"Study PMID:{pmid}" if not pmid.startswith("PMID:") else f"Study {pmid}"
                else:
                    title = f"{journal} Research"
            
            # Build PubMed URL
            url = "#"
            if pmc_id:
                url = f"https://www.ncbi.nlm.nih.gov/pmc/articles/{pmc_id}/"
            elif pmid:
                clean_pmid = pmid.replace('PMID:', '').strip()
                url = f"https://pubmed.ncbi.nlm.nih.gov/{clean_pmid}/"
            
            sources.append(Source(
                journal=journal,
                title=title[:100] if len(title) > 100 else title,
                year=year,
                url=url,
                pmc_id=pmc_id
            ))
        
        return AskResponse(
            success=True,
            data={
                "content": answer_text,
                "sources": [s.dict() for s in sources]
            },
            message="Answer generated successfully"
        )
        
    except Exception as e:
        print(f"Error in ask_verum: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generating answer: {str(e)}"
        )


@app.get("/api/debug/test-retrieval")
async def test_retrieval(query: str = "cancer"):
    """Debug endpoint to test vector search retrieval"""
    try:
        # Test retrieval
        results = retriever.retrieve(query, top_k=3)
        
        return {
            "query": query,
            "num_results": len(results),
            "results": [
                {
                    "similarity": r.get("similarity"),
                    "journal": r.get("journal"),
                    "pmid": r.get("pmid"),
                    "text_preview": r.get("text", "")[:200]
                }
                for r in results
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error testing retrieval: {str(e)}")


@app.get("/api/stats")
async def get_stats():
    """Get statistics about the RAG database"""
    try:
        conn = retriever.conn
        cursor = conn.cursor()
        
        # Get total chunks
        cursor.execute("SELECT COUNT(*) FROM document_chunks")
        total_chunks = cursor.fetchone()[0]
        
        # Get unique papers
        cursor.execute("SELECT COUNT(DISTINCT pmc_id) FROM document_chunks WHERE pmc_id IS NOT NULL")
        total_papers = cursor.fetchone()[0]
        
        # Get journals
        cursor.execute("SELECT COUNT(DISTINCT journal) FROM document_chunks WHERE journal IS NOT NULL")
        total_journals = cursor.fetchone()[0]
        
        # Check embeddings
        cursor.execute("SELECT COUNT(*) FROM document_chunks WHERE embedding IS NOT NULL")
        chunks_with_embeddings = cursor.fetchone()[0]
        
        # Get sample journals
        cursor.execute("SELECT DISTINCT journal FROM document_chunks WHERE journal IS NOT NULL LIMIT 5")
        sample_journals = [row[0] for row in cursor.fetchall()]
        
        return {
            "total_chunks": total_chunks,
            "total_papers": total_papers,
            "total_journals": total_journals,
            "chunks_with_embeddings": chunks_with_embeddings,
            "embedding_coverage": f"{(chunks_with_embeddings/total_chunks*100) if total_chunks > 0 else 0:.1f}%",
            "sample_journals": sample_journals,
            "status": "operational" if total_chunks > 0 and chunks_with_embeddings > 0 else "empty_database"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stats: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
