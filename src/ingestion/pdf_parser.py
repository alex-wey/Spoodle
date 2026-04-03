"""
PDF Parser Module using Reducto AI
Handles extraction of text and structure from veterinary PDF documents
"""

from typing import Dict, Any
from pathlib import Path
import logging
from reducto import Reducto

logger = logging.getLogger(__name__)


class ReductoParser:
    """
    Wrapper around Reducto AI API for parsing veterinary PDFs
    """
    
    def __init__(self, api_key: str = None):
        """
        Initialize Reducto parser
        
        Args:
            api_key: Reducto API key (optional if set in environment)
        """
        self.client = Reducto(api_key=api_key) if api_key else Reducto()
    
    def parse_pdf(self, pdf_path: str) -> Dict[str, Any]:
        """
        Parse PDF using Reducto API
        
        Args:
            pdf_path: Path to PDF file
            
        Returns:
            Dictionary containing parsed data from Reducto API
        """
        pdf_file = Path(pdf_path)
        
        if not pdf_file.exists():
            logger.error(f"File not found: {pdf_path}")
            return None
        
        logger.info(f"Parsing PDF: {pdf_file.name} ({pdf_file.stat().st_size / 1024:.2f} KB)")
        
        try:
            # Step 1: Upload PDF
            logger.debug("Uploading PDF to Reducto...")
            upload = self.client.upload(file=pdf_file)
            
            # Step 2: Parse the uploaded document
            logger.debug("Parsing document...")
            result = self.client.parse.run(input=upload)
            
            logger.info("Successfully parsed with Reducto")
            return result
                    
        except Exception as e:
            logger.error(f"Error parsing PDF with Reducto: {e}")
            return None
    
    def extract_text(self, parsed_data: Dict[str, Any]) -> str:
        """
        Extract plain text from parsed Reducto output
        
        Args:
            parsed_data: Output from parse_pdf()
            
        Returns:
            Extracted text as string
        """
        if not parsed_data:
            return ""
        
        # Reducto SDK returns structured data
        text_parts = []
        
        # Try to extract chunks (common in Reducto output)
        if hasattr(parsed_data, 'chunks'):
            for chunk in parsed_data.chunks:
                if hasattr(chunk, 'content'):
                    text_parts.append(str(chunk.content))
                elif isinstance(chunk, str):
                    text_parts.append(chunk)
        
        # If parsed_data is a dict
        if isinstance(parsed_data, dict):
            if "text" in parsed_data:
                text_parts.append(parsed_data["text"])
            
            if "content" in parsed_data:
                text_parts.append(parsed_data["content"])
            
            if "chunks" in parsed_data:
                for chunk in parsed_data["chunks"]:
                    if isinstance(chunk, dict) and "text" in chunk:
                        text_parts.append(chunk["text"])
                    elif isinstance(chunk, str):
                        text_parts.append(chunk)
        
        # Try converting the whole object to string if nothing else works
        if not text_parts:
            text_parts.append(str(parsed_data))
        
        return "\n\n".join(text_parts)
    
    def extract_sections(self, parsed_data: Dict[str, Any]) -> list:
        """
        Extract document sections from Reducto output
        
        Args:
            parsed_data: Output from parse_pdf()
            
        Returns:
            List of sections with titles and content
        """
        if not parsed_data:
            return []
        
        sections = []
        
        # Try to extract sections from Reducto output
        if hasattr(parsed_data, 'sections'):
            return list(parsed_data.sections)
        
        if isinstance(parsed_data, dict) and "sections" in parsed_data:
            return parsed_data["sections"]
        
        return sections
