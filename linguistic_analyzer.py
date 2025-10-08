"""Main application for linguistic analysis tool."""

import click
import logging
from typing import Dict, List, Any, Optional
from pathlib import Path

from web_scraper import WebScraper
from language_detector import LanguageDetector
from ai_analyzer import AIAnalyzer
from report_generator import ReportGenerator
from config import DEFAULT_BASELINE_LANGUAGE, SUPPORTED_LANGUAGES

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class LinguisticAnalyzer:
    """Main class for linguistic analysis operations."""
    
    def __init__(self):
        self.web_scraper = WebScraper()
        self.language_detector = LanguageDetector()
        self.ai_analyzer = AIAnalyzer()
        self.report_generator = ReportGenerator()
    
    def analyze_url(self, url: str, analyze_terminology: bool = True) -> Dict[str, Any]:
        """
        Analyze a single URL for linguistic quality.
        
        Args:
            url: URL to analyze
            analyze_terminology: Whether to perform terminology analysis
            
        Returns:
            Dictionary containing analysis results
        """
        logger.info(f"Starting analysis of URL: {url}")
        
        try:
            # Extract content from URL
            content_data = self.web_scraper.extract_text_content(url)
            logger.info(f"Extracted content: {content_data['content_length']} characters")
            
            # Detect language
            detected_lang, confidence = self.language_detector.detect_language(content_data['content'])
            logger.info(f"Detected language: {detected_lang} (confidence: {confidence:.2f})")
            
            # Prepare results
            results = {
                'url': url,
                'content_length': content_data['content_length'],
                'title': content_data['title'],
                'description': content_data['description'],
                'html_lang': content_data['html_lang'],
                'languages': {
                    detected_lang: {
                        'language_name': self.language_detector.get_language_name(detected_lang),
                        'confidence': confidence,
                        'content': content_data['content']
                    }
                },
                'quality_scores': {},
                'linguistic_analysis': {},
                'terminology_analysis': {}
            }
            
            # Perform linguistic analysis
            if self.language_detector.is_supported_language(detected_lang):
                logger.info("Performing AI-powered linguistic analysis...")
                linguistic_analysis = self.ai_analyzer.analyze_linguistic_quality(
                    content_data['content'], 
                    detected_lang
                )
                results['linguistic_analysis'] = linguistic_analysis
                results['quality_scores'][detected_lang] = {
                    'score': linguistic_analysis.get('quality_score', 0),
                    'confidence': linguistic_analysis.get('confidence', 0)
                }
            else:
                logger.warning(f"Language {detected_lang} not supported for AI analysis")
                results['linguistic_analysis'] = {
                    'errors': [{'type': 'unsupported_language', 'message': f'Language {detected_lang} not supported'}],
                    'suggestions': [],
                    'quality_score': 0,
                    'confidence': 0
                }
            
            # Perform terminology analysis if requested
            if analyze_terminology and len(results['languages']) > 1:
                logger.info("Performing terminology consistency analysis...")
                terminology_analysis = self.ai_analyzer.check_terminology_consistency(
                    {lang: data['content'] for lang, data in results['languages'].items()}
                )
                results['terminology_analysis'] = terminology_analysis
            
            logger.info("Analysis completed successfully")
            return results
            
        except Exception as e:
            logger.error(f"Analysis failed: {e}")
            return {
                'url': url,
                'error': str(e),
                'linguistic_analysis': {
                    'errors': [{'type': 'analysis_error', 'message': str(e)}],
                    'suggestions': [],
                    'quality_score': 0,
                    'confidence': 0
                }
            }
    
    def analyze_multilingual_site(self, base_url: str, language_links: List[Dict[str, str]] = None) -> Dict[str, Any]:
        """
        Analyze a multilingual website by comparing different language versions.
        
        Args:
            base_url: Base URL of the website
            language_links: Optional list of language-specific links
            
        Returns:
            Dictionary containing comprehensive analysis results
        """
        logger.info(f"Starting multilingual analysis of: {base_url}")
        
        # Start with the base URL
        base_results = self.analyze_url(base_url)
        
        if 'error' in base_results:
            return base_results
        
        # Find language links if not provided
        if not language_links:
            try:
                response = self.web_scraper.session.get(base_url)
                language_links = self.web_scraper.find_language_links(base_url, response.text)
                logger.info(f"Found {len(language_links)} potential language links")
            except Exception as e:
                logger.warning(f"Could not find language links: {e}")
                language_links = []
        
        # Analyze additional language versions
        additional_languages = {}
        for link in language_links[:5]:  # Limit to 5 additional languages
            try:
                lang_results = self.analyze_url(link['url'])
                if 'error' not in lang_results and 'languages' in lang_results:
                    for lang, data in lang_results['languages'].items():
                        if lang not in base_results['languages']:
                            additional_languages[lang] = data
            except Exception as e:
                logger.warning(f"Failed to analyze {link['url']}: {e}")
        
        # Merge results
        base_results['languages'].update(additional_languages)
        
        # Perform cross-language terminology analysis
        if len(base_results['languages']) > 1:
            logger.info("Performing cross-language terminology analysis...")
            texts = {lang: data['content'] for lang, data in base_results['languages'].items()}
            terminology_analysis = self.ai_analyzer.check_terminology_consistency(texts)
            base_results['terminology_analysis'] = terminology_analysis
        
        # Calculate overall quality scores
        for lang, data in base_results['languages'].items():
            if lang in base_results['quality_scores']:
                continue
            
            if self.language_detector.is_supported_language(lang):
                linguistic_analysis = self.ai_analyzer.analyze_linguistic_quality(
                    data['content'], lang
                )
                base_results['quality_scores'][lang] = {
                    'score': linguistic_analysis.get('quality_score', 0),
                    'confidence': linguistic_analysis.get('confidence', 0)
                }
        
        logger.info("Multilingual analysis completed successfully")
        return base_results


@click.command()
@click.argument('url')
@click.option('--output', '-o', help='Output file for JSON report')
@click.option('--no-terminology', is_flag=True, help='Skip terminology analysis')
@click.option('--multilingual', is_flag=True, help='Analyze multiple language versions')
@click.option('--verbose', '-v', is_flag=True, help='Enable verbose logging')
def analyze(url: str, output: str = None, no_terminology: bool = False, multilingual: bool = False, verbose: bool = False):
    """
    Analyze linguistic quality of a webpage.
    
    URL: The URL to analyze
    """
    if verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    analyzer = LinguisticAnalyzer()
    
    try:
        if multilingual:
            results = analyzer.analyze_multilingual_site(url)
        else:
            results = analyzer.analyze_url(url, analyze_terminology=not no_terminology)
        
        # Generate console report
        analyzer.report_generator.generate_console_report(results)
        
        # Generate JSON report if requested
        if output:
            json_report = analyzer.report_generator.generate_json_report(results, output)
            click.echo(f"\nJSON report saved to: {output}")
        
    except Exception as e:
        logger.error(f"Analysis failed: {e}")
        click.echo(f"Error: {e}", err=True)
        raise click.Abort()


@click.group()
def cli():
    """AI-powered linguistic analysis tool for web content."""
    pass


cli.add_command(analyze)

if __name__ == '__main__':
    cli()
