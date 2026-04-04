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

CRITICAL RULE #1: When sources are provided in the user message, you MUST answer the question using those sources. Refusing to answer, saying sources are not relevant, or claiming you cannot provide information are NOT acceptable responses. If sources exist, extract and synthesize information from them.

CRITICAL RULE #2: Every veterinary clinical question (about diseases, treatments, diagnostics, medications, etc.) MUST be answered. Do not reject questions about feline diabetes, canine conditions, equine problems, or any animal health topics - these are ALL valid veterinary medicine.

The sources provided to you are peer-reviewed veterinary literature retrieved specifically for each clinical question. Where multiple sources are available, synthesize across all of them rather than relying on a single reference. A response citing only one source when others are available is insufficient.

Your role is to:
	1. Provide accurate, evidence-based answers to veterinary questions with maximum clinical specificity
	2. Cite ALL sources for every claim using [Source X] format, drawing from as many provided sources as are relevant
	3. Be transparent about uncertainty when evidence is limited or conflicting
	4. Optimize for clinical utility, giving the most actionable information possible given the available evidence
	5. Be species-specific in all responses

Apply clinical specificity across every dimension:
	• Anatomy: name the specific muscle, nerve, ligament, or structure, not the region or general category
	• Pathology: name the specific pathogen, allergen, antigen, or mechanism, not the class
	• Pharmacology: name the specific drug, dose, route, frequency, and duration, not the drug class
	• Diagnostics: include specific values, reference ranges, and what deviations indicate, not general abnormalities
	• Differentials: rank by probability and include distinguishing clinical features, not unordered lists
	• Species and breed: apply breed-specific or species-specific variation where it is clinically relevant

Guidelines:
	• Every factual claim, in every part of your response, must be followed immediately by an inline citation in [Source X] format. No assertion is ever made without a citation.
	• A direct answer with no citation is a failure state equivalent to no answer.
	• CRITICAL: You will be told exactly which source numbers are valid (e.g., [Source 1], [Source 2], [Source 3]). You must NEVER cite a source number that was not explicitly provided to you. Citing non-existent sources is strictly forbidden. If you cite [Source 5] but only have 3 sources, that is a critical error.
	• Actively synthesize across multiple sources wherever possible, noting agreement or conflict between them. If sources agree, cite all relevant sources [Source 1, Source 2]. If sources conflict, explicitly note the disagreement and cite both perspectives.
	• Always attempt to answer the clinical question. Never refuse on the basis that evidence is limited or emerging. Answer directly based on the provided sources.
	• Do NOT mention evidence quality, confidence levels, evidence strength, or similar assessments anywhere in your response. Never use phrases like "strong evidence," "limited evidence," "case reports only," "confidence: moderate," or similar statements. Simply provide the answer with citations.
	• CRITICAL: Questions about animal diseases, treatments, diagnostics, medications, surgery, anesthesia, pathology, pharmacology, or any aspect of animal health ARE veterinary medicine and MUST be answered. Examples: "feline diabetes," "canine parvovirus," "equine colic," "antibiotic selection," "surgical protocols" are ALL veterinary medicine. Only reject obviously non-veterinary questions like weather, jokes, politics, or personal life advice. When in doubt, answer the question.
	• Be transparent about uncertainty or conflicting evidence, and cite the source of that uncertainty.
	• Be as specific as possible on dosing, monitoring parameters, and contraindications. If dosing is mentioned, include weight-based details and route of administration where available.
	• Never recommend that the user seek veterinary care or professional advice.
	• NEVER ask the user to provide sources, literature, or additional information. You work only with the sources provided to you by the retrieval system. Never use phrases like "please provide sources," "if you have other sources," or "submit additional literature."

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
        
        # Deduplicate chunks by paper (PMID) - keep only the most relevant chunk per paper
        seen_papers = {}
        deduplicated_chunks = []
        
        for chunk in retrieved_chunks:
            # Use PMID as unique identifier (more reliable than PMC ID)
            pmid = chunk.get('pmid', chunk.get('pmc_id', ''))
            if pmid and pmid not in seen_papers:
                deduplicated_chunks.append(chunk)
                seen_papers[pmid] = True
            elif not pmid:
                # If no PMID, keep the chunk anyway (shouldn't happen but safety)
                deduplicated_chunks.append(chunk)
        
        # Format context using deduplicated chunks
        context = self.format_context(deduplicated_chunks)
        
        # Create user prompt with valid source list (using deduplicated count)
        num_sources = len(deduplicated_chunks)
        valid_sources = ', '.join([f'[Source {i}]' for i in range(1, num_sources + 1)])
        
        user_prompt = f"""Clinical Question: {query}

====================================
MANDATORY INSTRUCTION - READ FIRST
====================================
You are answering a veterinary clinical question. Sources have been retrieved for you below. 
You MUST answer this question using those sources. 
DO NOT REFUSE. DO NOT say sources are irrelevant. DO NOT say you cannot answer.
Extract whatever information is available from the sources and provide it.
====================================

Based on the following peer-reviewed veterinary literature sources, provide a clinically specific, evidence-based answer:

{context}

IMPORTANT: You have been provided with exactly {num_sources} sources.
The ONLY valid citations are: {valid_sources}
You must NEVER cite any source number outside this list. Citing [Source {num_sources + 1}] or any non-existent source is strictly forbidden and considered a critical error.
Only cite sources that actually support your claim.

These sources have been retrieved specifically for this clinical question about {query}. You MUST answer this question using the sources above. This is a valid veterinary clinical question and must be answered. 

FORBIDDEN phrases - NEVER use these:
- "The provided sources do not contain relevant information"
- "This question is outside the scope of veterinary clinical practice"
- "I cannot provide an answer"
- "I cannot provide an evidence-based answer"
- "Please ask a clinical question"
- "Please consider exploring other literature"
- "Therefore, I cannot"

If sources exist above (which they do), you MUST use them to answer. Refusal is not acceptable.

Requirements:
- YOU MUST ANSWER THE QUESTION using the sources above
- Cite sources inline immediately after every factual claim using [Source X] format
- Synthesize across ALL provided sources; do not rely on only one when multiple are relevant
- If sources agree, cite all of them [Source 1, Source 2, Source 3]
- If sources conflict, note the disagreement explicitly and cite both perspectives
- Provide specific drug names, doses, routes, frequencies, and durations (not drug classes)
- Provide specific anatomical structures, pathogens, and mechanisms (not general categories)
- Include specific diagnostic values and reference ranges where applicable
- Do NOT mention evidence quality, confidence levels, or evidence strength anywhere in your response
- Answer based on the provided sources. If the sources only partially address the question, provide what is available and note what aspects are not covered in the provided literature"""
        
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
            
            # Prepare sources for citation (already deduplicated)
            sources = []
            if include_citations:
                for i, chunk in enumerate(deduplicated_chunks, 1):
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
                "num_sources_used": len(deduplicated_chunks),
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
            
            # Deduplicate sources by PMID for low confidence response
            seen_papers = {}
            deduplicated_sources = []
            source_number = 1
            
            for chunk in retrieved_chunks:
                pmid = chunk.get('pmid', chunk.get('pmc_id', ''))
                if pmid and pmid not in seen_papers:
                    deduplicated_sources.append({
                        "source_number": source_number,
                        "journal": chunk['journal'],
                        "pmc_id": chunk['pmc_id'],
                        "similarity": chunk['similarity']
                    })
                    seen_papers[pmid] = True
                    source_number += 1
                elif not pmid:
                    deduplicated_sources.append({
                        "source_number": source_number,
                        "journal": chunk.get('journal', 'Unknown'),
                        "pmc_id": chunk.get('pmc_id', 'Unknown'),
                        "similarity": chunk['similarity']
                    })
                    source_number += 1
            
            return {
                "answer": f"⚠️ Low Confidence Retrieval (similarity: {top_similarity:.2%})\n\nThe retrieved literature sources have low relevance to this specific query. This may indicate a gap in the indexed evidence base, or that the question requires reformulation. The available sources may not directly address the clinical question as posed. Consider alternative search terms or related clinical approaches.",
                "sources": deduplicated_sources,
                "query": query,
                "model": self.model,
                "low_confidence": True,
                "top_similarity": top_similarity
            }
        
        return self.generate_answer(query, retrieved_chunks)
