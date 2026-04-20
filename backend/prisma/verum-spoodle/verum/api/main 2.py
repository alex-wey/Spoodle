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
    top_k: Optional[int] = 5


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
        retrieved_chunks = retriever.retrieve(query, top_k=request.top_k)
        
        if not retrieved_chunks:
            return AskResponse(
                success=True,
                data={
                    "content": "I couldn't find relevant information in the veterinary literature database to answer this question. Please try rephrasing your question or contact your veterinarian for guidance.",
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
        sources = []
        seen_identifiers = set()
        
        for i, chunk in enumerate(retrieved_chunks):
            # Use chunk_id or index as unique identifier if pmc_id is null
            pmc_id = chunk.get("pmc_id")
            chunk_id = chunk.get("chunk_id", f"chunk_{i}")
            identifier = pmc_id if pmc_id else chunk_id
            
            if identifier not in seen_identifiers:
                seen_identifiers.add(identifier)
                
                # Extract citation info
                citation = chunk.get("citation", "")
                journal = chunk.get("journal", "Unknown Journal")
                pmid = chunk.get("pmid", "")
                
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
                        title = f"Study {pmid}"
                    else:
                        title = f"{journal} Research"
                
                sources.append(Source(
                    journal=journal,
                    title=title[:100] if len(title) > 100 else title,
                    year=year,
                    url=f"https://www.ncbi.nlm.nih.gov/pmc/articles/{pmc_id}/" if pmc_id else f"https://pubmed.ncbi.nlm.nih.gov/{pmid.replace('PMID:', '')}/" if pmid else "#",
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
        cursor.execute("SELECT COUNT(DISTINCT pmc_id) FROM document_chunks")
        total_papers = cursor.fetchone()[0]
        
        # Get journals
        cursor.execute("SELECT COUNT(DISTINCT journal) FROM document_chunks")
        total_journals = cursor.fetchone()[0]
        
        return {
            "total_chunks": total_chunks,
            "total_papers": total_papers,
            "total_journals": total_journals,
            "status": "operational"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stats: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
