"""
Metadata Extractor
Extracts veterinary-specific metadata from documents (species, conditions, treatments, etc.)
"""

from typing import Dict, List, Any
import logging

logger = logging.getLogger(__name__)


class MetadataExtractor:
    """
    Extracts structured metadata from veterinary documents
    """
    
    # Veterinary taxonomy
    SPECIES = ["dog", "cat", "horse", "exotic", "bird", "reptile", "rabbit", "ferret"]
    CONDITIONS = ["parvovirus", "diabetes", "kidney disease", "cancer", "allergies"]
    
    def __init__(self):
        """Initialize metadata extractor"""
        pass
    
    def extract_metadata(self, text: str, source_info: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract structured metadata from document text
        
        Args:
            text: Document text
            source_info: Basic source information
            
        Returns:
            Dictionary of extracted metadata:
                - species: List of species mentioned
                - conditions: List of conditions/diseases
                - treatments: List of treatments discussed
                - age_groups: puppy, adult, senior, etc.
                - publication_date: When published
                - journal: Journal name
        """
        metadata = {
            **source_info,
            "species": self._extract_species(text),
            "conditions": self._extract_conditions(text),
            "treatments": [],
            "age_groups": [],
            "publication_date": None,
            "journal": None
        }
        
        return metadata
    
    def _extract_species(self, text: str) -> List[str]:
        """Extract mentioned species from text"""
        text_lower = text.lower()
        found_species = []
        
        for species in self.SPECIES:
            if species in text_lower:
                found_species.append(species)
        
        return found_species
    
    def _extract_conditions(self, text: str) -> List[str]:
        """Extract medical conditions from text"""
        text_lower = text.lower()
        found_conditions = []
        
        for condition in self.CONDITIONS:
            if condition in text_lower:
                found_conditions.append(condition)
        
        return found_conditions
