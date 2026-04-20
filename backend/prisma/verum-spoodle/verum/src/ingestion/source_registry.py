"""
Source Registry
Tracks and manages document sources, ensuring quality and preventing duplicates
"""

from typing import Dict, List, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class SourceRegistry:
    """
    Registry for tracking document sources and their metadata
    """
    
    def __init__(self):
        """Initialize source registry"""
        self.sources: Dict[str, Dict] = {}
    
    def register_source(
        self,
        source_id: str,
        source_type: str,
        metadata: Dict
    ) -> bool:
        """
        Register a new document source
        
        Args:
            source_id: Unique identifier (DOI, URL, file hash, etc.)
            source_type: Type of source (journal, manual, guideline, etc.)
            metadata: Additional source metadata
            
        Returns:
            True if registered successfully, False if duplicate
        """
        if source_id in self.sources:
            logger.warning(f"Source {source_id} already registered")
            return False
        
        self.sources[source_id] = {
            "source_id": source_id,
            "source_type": source_type,
            "metadata": metadata,
            "registered_at": datetime.now().isoformat(),
            "status": "active"
        }
        
        logger.info(f"Registered source: {source_id}")
        return True
    
    def is_registered(self, source_id: str) -> bool:
        """Check if source is already registered"""
        return source_id in self.sources
    
    def get_source(self, source_id: str) -> Optional[Dict]:
        """Get source information"""
        return self.sources.get(source_id)
    
    def list_sources(self, source_type: Optional[str] = None) -> List[Dict]:
        """List all registered sources, optionally filtered by type"""
        if source_type:
            return [
                s for s in self.sources.values()
                if s["source_type"] == source_type
            ]
        return list(self.sources.values())
