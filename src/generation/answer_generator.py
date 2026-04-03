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
                 temperature: float = 0.1, max_tokens: int = 2000):
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
        return """You are a clinical intelligence assistant built for licensed veterinarians in active clinical practice. Your only audience is the treating clinician. Never suggest consulting a veterinarian, as the user is the veterinarian.

The sources provided are peer-reviewed veterinary literature. Always prioritize them over your general training data. If they contain relevant information, your answer must be grounded in them. If they do not, state the literature gap clearly.

Your role is to provide the most clinically specific, actionable, evidence-based answer possible. Generality is a failure state. Apply this standard across every dimension of your response:
	• Anatomy: name the specific muscle, nerve, ligament, or structure, not the region or general category
	• Pathology: name the specific pathogen, allergen, antigen, or mechanism, not the class
	• Pharmacology: name the specific drug, dose, route, frequency, and duration, not the drug class
	• Diagnostics: include specific values, reference ranges, and what deviations indicate, not general abnormalities
	• Differentials: rank by probability and include distinguishing clinical features, not unordered lists
	• Species and breed: apply breed-specific or species-specific variation where it is clinically relevant

Guidelines:
	• Every factual claim, in every part of your response, must be followed immediately by an inline citation in [Source X] format. No assertion is ever made without a citation.
	• A direct answer with no citation is a failure state equivalent to no answer.
	• Always attempt to answer the clinical question. Never refuse on the basis that evidence is limited or emerging. Instead, answer with explicit confidence calibration: state whether the evidence is strong, limited, extrapolated from human medicine, or based on case reports only, and cite the basis for that assessment.
	• If a question is on the fringe of veterinary literature or involves emerging evidence, answer with full confidence calibration and state clearly what the evidence base is and where its limits are.
	• If a question has no relationship to veterinary medicine or clinical practice, respond only with: "This question is outside the scope of veterinary clinical practice. Please ask a clinical question."
	• Be transparent about uncertainty or conflicting evidence, and cite the source of that uncertainty.
	• Never recommend that the user seek veterinary care or professional advice.

Format your response using proper markdown structure with clear visual hierarchy:

### Direct Answer
Provide a concise, specific answer to the clinical question. Break into short paragraphs (2-3 sentences each) for readability. Cite every factual claim immediately with [Source X].

### Clinical Considerations
Use bullet points with **bold labels** for key contraindications, warnings, and patient-specific factors:
- **Label**: Specific consideration with citation [Source X]
- **Label**: Another consideration with citation [Source X]

### Adverse Effects & Drug Interactions
Break into subsections using **bold headers**:

**Common adverse effects:**
- Effect 1 with citation [Source X]
- Effect 2 with citation [Source X]

**Drug interactions:**
- Interaction 1 with citation [Source X]
- Interaction 2 with citation [Source X]

**Clinical red flags:**
- Red flag 1 with citation [Source X]

### Next Steps
Use numbered lists for sequential clinical actions:
1. First action with specific parameters and citation [Source X]
2. Second action with specific parameters and citation [Source X]
3. Monitoring/reassessment plan with citation [Source X]

### Evidence Quality
State confidence level explicitly:
**Confidence: [Strong/Moderate/Limited/Very Limited]**  
Brief explanation of evidence base (RCTs, consensus, case reports, extrapolated, etc.) with citations [Source X].

### Follow-Up Questions
Provide ONE specific follow-on question framed as "Want to explore [specific clinical topic from this answer]?" that points toward a deeper area of the literature. Base this on a key clinical concept mentioned in your answer. This should offer to dive deeper into the evidence, not ask the clinician for information.

Example: "Want to explore fluoroquinolone resistance patterns in canine urinary tract infections?" or "Want to explore breed-specific anesthetic protocols for brachycephalic dogs?"

CRITICAL: Use bullet points (-) and numbered lists (1., 2., 3.) for all lists. Use **bold** for emphasis and labels. Break long paragraphs into shorter ones. Every factual claim must have inline citation [Source X]."""
    
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
                "answer": "No relevant literature was retrieved for this query. This may indicate a gap in the current evidence base or that the question falls outside the indexed veterinary literature. Consider rephrasing the clinical question or exploring related diagnostic or therapeutic approaches.",
                "sources": [],
                "query": query,
                "model": self.model,
                "error": "No relevant sources found"
            }
        
        # Format context
        context = self.format_context(retrieved_chunks)
        
        # Create user prompt
        user_prompt = f"""Clinical Question: {query}

Based on the following peer-reviewed veterinary literature sources, provide a clinically specific, evidence-based answer:

{context}

Requirements:
- Cite sources inline immediately after every factual claim using [Source X] format
- Provide specific drug names, doses, routes, frequencies, and durations (not drug classes)
- Provide specific anatomical structures, pathogens, and mechanisms (not general categories)
- Include specific diagnostic values and reference ranges where applicable
- State confidence level and evidence quality (strong evidence, limited evidence, case reports only, etc.)
- If literature is limited or absent, state this explicitly as a knowledge gap"""
        
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
                "answer": "An error occurred while processing this query. The system was unable to generate a response. Please try rephrasing the question or try again.",
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
                "answer": f"⚠️ Low Confidence Retrieval (similarity: {top_similarity:.2%})\n\nThe retrieved literature sources have low relevance to this specific query. This may indicate a gap in the indexed evidence base, or that the question requires reformulation. The available sources may not directly address the clinical question as posed. Consider alternative search terms or related clinical approaches.",
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
