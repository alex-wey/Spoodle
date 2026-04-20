import os
from typing import List, Dict, Any, Optional
from openai import OpenAI
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class AnswerGenerator:
    """
    Generates veterinary answers using retrieved context and an LLM.
    """
    
    def __init__(self, api_key: str, model: str = "gpt-4o-mini", 
                 temperature: float = 0.1, max_tokens: int = 1000):
        """
        Initialize the answer generator.
        
        Args:
            api_key: OpenAI API key
            model: LLM model to use (gpt-4o-mini, gpt-4o, gpt-4)
            temperature: Lower = more factual, Higher = more creative
            max_tokens: Maximum length of generated response
        """
        self.client = OpenAI(api_key=api_key)
        self.model = model
        self.temperature = temperature
        self.max_tokens = max_tokens
        logging.info(f"AnswerGenerator initialized with model: {model}")
    
    def format_context(self, retrieved_chunks: List[Dict[str, Any]]) -> str:
        """
        Format retrieved chunks into context for the LLM.
        
        Args:
            retrieved_chunks: List of retrieved document chunks with metadata
            
        Returns:
            Formatted context string
        """
        context_parts = []
        
        for i, chunk in enumerate(retrieved_chunks, 1):
            context_parts.append(f"[Source {i}]")
            context_parts.append(f"Journal: {chunk['journal']}")
            context_parts.append(f"PMC ID: {chunk['pmc_id']}")
            context_parts.append(f"Relevance: {chunk['similarity']:.2%}")
            context_parts.append(f"Content: {chunk['text']}")
            context_parts.append("")  # Blank line between sources
        
        return "\n".join(context_parts)
    
    def create_system_prompt(self) -> str:
        """
        Create the system prompt for the veterinary AI assistant.
        
        Returns:
            System prompt string
        """
        return """You are Verum, an AI-powered veterinary medical assistant specializing in evidence-based veterinary medicine.

Your role is to:
1. Provide accurate, evidence-based answers to veterinary questions
2. Cite ALL sources for every claim you make using [Source X] format
3. Be clear about uncertainty when evidence is limited
4. Prioritize pet safety and recommend veterinary consultation for serious issues
5. Use clear, professional language appropriate for both veterinarians and pet owners

Guidelines:
- ALWAYS cite sources for factual claims using [Source X] format
- If the provided sources don't contain relevant information, say so clearly
- For medical emergencies or serious conditions, recommend immediate veterinary care
- Be species-specific when relevant (dogs, cats, exotic pets)
- Include safety warnings for medications or treatments when appropriate
- If dosing information is mentioned, include weight-based details if available

Format your response using proper markdown with headings and lists:

### Direct Answer
[Concise direct answer to the question in paragraph form]

### Supporting Evidence
Use numbered lists for detailed points, with citations:
1. **Item name**: Description with evidence [Source 1]
2. **Item name**: Description with evidence [Source 2]

### Recommendations or Next Steps
Use bullet points for actionable items:
- First recommendation
- Second recommendation

### Safety Warnings
Use bullet points for safety information:
- Important warning or consideration
- Additional safety information

IMPORTANT: Use proper markdown list syntax with hyphens (-) or numbers (1., 2., 3.) for all lists."""
    
    def generate_answer(self, query: str, retrieved_chunks: List[Dict[str, Any]], 
                       include_citations: bool = True) -> Dict[str, Any]:
        """
        Generate an answer using the LLM with retrieved context.
        
        Args:
            query: User's veterinary question
            retrieved_chunks: Retrieved document chunks from vector search
            include_citations: Whether to include citation information
            
        Returns:
            Dictionary containing answer, sources, and metadata
        """
        if not retrieved_chunks:
            return {
                "answer": "I don't have enough relevant information in my knowledge base to answer this question accurately. Please consult with a veterinarian for professional advice.",
                "sources": [],
                "query": query,
                "model": self.model,
                "error": "No relevant sources found"
            }
        
        # Format context
        context = self.format_context(retrieved_chunks)
        
        # Create user prompt
        user_prompt = f"""Question: {query}

Based on the following veterinary literature sources, provide a comprehensive, evidence-based answer:

{context}

Remember to:
- Cite specific sources using [Source X] format
- Be clear about what the evidence does and doesn't support
- Recommend veterinary consultation for serious or uncertain cases"""
        
        # Generate response
        try:
            logging.info(f"🤖 Generating answer for: \"{query}\"")
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": self.create_system_prompt()},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=self.temperature,
                max_tokens=self.max_tokens
            )
            
            answer_text = response.choices[0].message.content
            
            # Prepare sources for citation
            sources = []
            if include_citations:
                for i, chunk in enumerate(retrieved_chunks, 1):
                    sources.append({
                        "source_number": i,
                        "journal": chunk['journal'],
                        "pmc_id": chunk['pmc_id'],
                        "pmid": chunk['pmid'],
                        "citation": chunk['citation'],
                        "similarity": chunk['similarity'],
                        "text_excerpt": chunk['text'][:300] + "..." if len(chunk['text']) > 300 else chunk['text']
                    })
            
            result = {
                "answer": answer_text,
                "sources": sources,
                "query": query,
                "model": self.model,
                "num_sources_used": len(retrieved_chunks),
                "tokens_used": response.usage.total_tokens,
                "finish_reason": response.choices[0].finish_reason
            }
            
            logging.info(f"✅ Answer generated ({response.usage.total_tokens} tokens)")
            return result
        
        except Exception as e:
            logging.error(f"❌ Failed to generate answer: {e}")
            return {
                "answer": "I encountered an error while generating the answer. Please try again.",
                "sources": [],
                "query": query,
                "model": self.model,
                "error": str(e)
            }
    
    def generate_with_confidence(self, query: str, retrieved_chunks: List[Dict[str, Any]], 
                                 confidence_threshold: float = 0.25) -> Dict[str, Any]:
        """
        Generate answer only if retrieval confidence is above threshold.
        
        Args:
            query: User's veterinary question
            retrieved_chunks: Retrieved document chunks
            confidence_threshold: Minimum similarity score to proceed
            
        Returns:
            Dictionary containing answer or confidence warning
        """
        if not retrieved_chunks:
            return self.generate_answer(query, retrieved_chunks)
        
        # Check if top result meets confidence threshold
        top_similarity = retrieved_chunks[0]['similarity']
        
        if top_similarity < confidence_threshold:
            logging.warning(f"⚠️ Low confidence: top similarity = {top_similarity:.2%}")
            return {
                "answer": f"I found some potentially relevant information, but my confidence is low (similarity: {top_similarity:.2%}). The available sources may not directly address your question. Please consult with a veterinarian for accurate information specific to your case.",
                "sources": [
                    {
                        "source_number": i,
                        "journal": chunk['journal'],
                        "pmc_id": chunk['pmc_id'],
                        "similarity": chunk['similarity']
                    }
                    for i, chunk in enumerate(retrieved_chunks, 1)
                ],
                "query": query,
                "model": self.model,
                "low_confidence": True,
                "top_similarity": top_similarity
            }
        
        return self.generate_answer(query, retrieved_chunks)
