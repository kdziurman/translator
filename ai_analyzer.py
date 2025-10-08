"""AI-powered linguistic analysis engine."""

import openai
from typing import Dict, List, Optional, Any
import json
import logging
from config import OPENAI_API_KEY, MAX_TOKENS_PER_REQUEST, TEMPERATURE

logger = logging.getLogger(__name__)


class AIAnalyzer:
    """Handles AI-powered linguistic analysis using OpenAI."""
    
    def __init__(self):
        if not OPENAI_API_KEY:
            raise ValueError("OpenAI API key is required. Please set OPENAI_API_KEY environment variable.")
        
        openai.api_key = OPENAI_API_KEY
        self.client = openai.OpenAI(api_key=OPENAI_API_KEY)
    
    def analyze_linguistic_quality(self, text: str, language: str, baseline_text: str = None) -> Dict[str, Any]:
        """
        Analyze linguistic quality of text using AI.
        
        Args:
            text: Text to analyze
            language: Language of the text
            baseline_text: Baseline text for comparison (optional)
            
        Returns:
            Dictionary containing analysis results
        """
        try:
            prompt = self._build_analysis_prompt(text, language, baseline_text)
            
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert linguist and translation quality analyst. Provide detailed, actionable feedback on text quality."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=MAX_TOKENS_PER_REQUEST,
                temperature=TEMPERATURE
            )
            
            result = response.choices[0].message.content
            return self._parse_analysis_result(result)
            
        except Exception as e:
            logger.error(f"AI analysis failed: {e}")
            return {
                'errors': [{'type': 'analysis_error', 'message': str(e)}],
                'suggestions': [],
                'quality_score': 0,
                'confidence': 0
            }
    
    def check_terminology_consistency(self, texts: Dict[str, str], key_terms: List[str] = None) -> Dict[str, Any]:
        """
        Check terminology consistency across multiple language versions.
        
        Args:
            texts: Dictionary of language_code -> text_content
            key_terms: List of key terms to check for consistency
            
        Returns:
            Dictionary containing consistency analysis
        """
        try:
            prompt = self._build_terminology_prompt(texts, key_terms)
            
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert in terminology management and translation consistency. Analyze terminology usage across different language versions."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=MAX_TOKENS_PER_REQUEST,
                temperature=TEMPERATURE
            )
            
            result = response.choices[0].message.content
            return self._parse_terminology_result(result)
            
        except Exception as e:
            logger.error(f"Terminology analysis failed: {e}")
            return {
                'inconsistencies': [],
                'suggestions': [],
                'consistency_score': 0
            }
    
    def _build_analysis_prompt(self, text: str, language: str, baseline_text: str = None) -> str:
        """Build prompt for linguistic analysis."""
        prompt = f"""
Analyze the following text in {language} for linguistic quality issues:

TEXT TO ANALYZE:
{text[:2000]}  # Limit text length for API

"""
        
        if baseline_text:
            prompt += f"""
BASELINE TEXT (English):
{baseline_text[:1000]}

Compare the quality and accuracy of the translation against the baseline.
"""
        
        prompt += """
Please provide a detailed analysis including:

1. GRAMMATICAL ERRORS: List any grammatical mistakes with specific examples
2. TRANSLATION ISSUES: Identify awkward translations, mistranslations, or cultural inappropriateness
3. STYLE ISSUES: Point out style inconsistencies, tone problems, or readability issues
4. TERMINOLOGY: Check for inconsistent or incorrect use of technical terms
5. OVERALL QUALITY SCORE: Rate from 0-100 (100 being perfect)

Format your response as JSON with the following structure:
{
  "grammatical_errors": [{"text": "example", "correction": "suggestion", "severity": "high/medium/low"}],
  "translation_issues": [{"text": "example", "issue": "description", "suggestion": "improvement"}],
  "style_issues": [{"text": "example", "issue": "description", "suggestion": "improvement"}],
  "terminology_issues": [{"term": "example", "issue": "description", "suggestion": "correction"}],
  "quality_score": 85,
  "confidence": 0.9,
  "summary": "Brief summary of main issues found"
}
"""
        return prompt
    
    def _build_terminology_prompt(self, texts: Dict[str, str], key_terms: List[str] = None) -> str:
        """Build prompt for terminology consistency analysis."""
        prompt = "Analyze terminology consistency across these language versions:\n\n"
        
        for lang, text in texts.items():
            prompt += f"{lang.upper()} VERSION:\n{text[:1000]}\n\n"
        
        if key_terms:
            prompt += f"KEY TERMS TO CHECK: {', '.join(key_terms)}\n\n"
        
        prompt += """
Check for:
1. Inconsistent terminology usage across languages
2. Brand name variations or misspellings
3. Technical term inconsistencies
4. Cultural adaptation issues

Format your response as JSON:
{
  "inconsistencies": [{"term": "example", "languages": ["en", "es"], "issue": "description", "suggestion": "correction"}],
  "brand_issues": [{"brand": "example", "issue": "description", "suggestion": "correction"}],
  "consistency_score": 85,
  "suggestions": ["general improvement suggestions"]
}
"""
        return prompt
    
    def _parse_analysis_result(self, result: str) -> Dict[str, Any]:
        """Parse AI analysis result from JSON."""
        try:
            # Try to extract JSON from the response
            start_idx = result.find('{')
            end_idx = result.rfind('}') + 1
            
            if start_idx != -1 and end_idx != 0:
                json_str = result[start_idx:end_idx]
                return json.loads(json_str)
            else:
                # Fallback parsing if JSON not found
                return {
                    'errors': [{'type': 'parsing_error', 'message': 'Could not parse AI response'}],
                    'suggestions': [],
                    'quality_score': 0,
                    'confidence': 0
                }
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI response: {e}")
            return {
                'errors': [{'type': 'json_error', 'message': str(e)}],
                'suggestions': [],
                'quality_score': 0,
                'confidence': 0
            }
    
    def _parse_terminology_result(self, result: str) -> Dict[str, Any]:
        """Parse terminology analysis result from JSON."""
        try:
            start_idx = result.find('{')
            end_idx = result.rfind('}') + 1
            
            if start_idx != -1 and end_idx != 0:
                json_str = result[start_idx:end_idx]
                return json.loads(json_str)
            else:
                return {
                    'inconsistencies': [],
                    'suggestions': [],
                    'consistency_score': 0
                }
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse terminology response: {e}")
            return {
                'inconsistencies': [],
                'suggestions': [],
                'consistency_score': 0
            }
