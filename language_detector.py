"""Language detection and translation utilities."""

from langdetect import detect, DetectorFactory
from googletrans import Translator
from typing import Dict, List, Optional, Tuple
import logging
from config import SUPPORTED_LANGUAGES, DEFAULT_BASELINE_LANGUAGE

# Set seed for consistent language detection
DetectorFactory.seed = 0

logger = logging.getLogger(__name__)


class LanguageDetector:
    """Handles language detection and translation operations."""
    
    def __init__(self):
        self.translator = Translator()
    
    def detect_language(self, text: str) -> Tuple[str, float]:
        """
        Detect the language of the given text.
        
        Args:
            text: Text to analyze
            
        Returns:
            Tuple of (language_code, confidence_score)
        """
        try:
            if not text or len(text.strip()) < 10:
                return "unknown", 0.0
            
            # Use langdetect for primary detection
            detected_lang = detect(text)
            
            # Calculate confidence based on text length and character diversity
            confidence = min(0.9, len(text) / 1000)  # Simple confidence calculation
            
            return detected_lang, confidence
            
        except Exception as e:
            logger.warning(f"Language detection failed: {e}")
            return "unknown", 0.0
    
    def translate_text(self, text: str, target_language: str, source_language: str = None) -> Dict[str, str]:
        """
        Translate text to target language.
        
        Args:
            text: Text to translate
            target_language: Target language code
            source_language: Source language code (auto-detect if None)
            
        Returns:
            Dictionary containing translation results
        """
        try:
            if not text or len(text.strip()) < 5:
                return {
                    'translated_text': text,
                    'source_language': source_language or 'unknown',
                    'confidence': 0.0,
                    'error': 'Text too short for translation'
                }
            
            # Detect source language if not provided
            if not source_language:
                source_language, _ = self.detect_language(text)
            
            # Translate text
            result = self.translator.translate(
                text, 
                dest=target_language, 
                src=source_language
            )
            
            return {
                'translated_text': result.text,
                'source_language': result.src,
                'confidence': getattr(result, 'confidence', 0.8),
                'error': None
            }
            
        except Exception as e:
            logger.error(f"Translation failed: {e}")
            return {
                'translated_text': text,
                'source_language': source_language or 'unknown',
                'confidence': 0.0,
                'error': str(e)
            }
    
    def get_language_name(self, language_code: str) -> str:
        """
        Get human-readable language name from code.
        
        Args:
            language_code: ISO language code
            
        Returns:
            Human-readable language name
        """
        language_names = {
            'en': 'English',
            'es': 'Spanish',
            'fr': 'French',
            'de': 'German',
            'it': 'Italian',
            'pt': 'Portuguese',
            'nl': 'Dutch',
            'pl': 'Polish',
            'cs': 'Czech',
            'sk': 'Slovak',
            'hu': 'Hungarian',
            'ro': 'Romanian',
            'bg': 'Bulgarian',
            'hr': 'Croatian',
            'sl': 'Slovenian',
            'et': 'Estonian',
            'lv': 'Latvian',
            'lt': 'Lithuanian'
        }
        return language_names.get(language_code, language_code.upper())
    
    def is_supported_language(self, language_code: str) -> bool:
        """
        Check if language is supported for analysis.
        
        Args:
            language_code: ISO language code
            
        Returns:
            True if language is supported
        """
        return language_code in SUPPORTED_LANGUAGES
