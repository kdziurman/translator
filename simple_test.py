"""Simple test script for the linguistic analyzer."""

import os
import sys

def test_basic_functionality():
    """Test basic functionality without requiring API keys or external websites."""
    print("Testing Linguistic Analyzer - Basic Functionality")
    print("=" * 60)
    
    # Test language detector
    print("\n1. Testing Language Detector...")
    from language_detector import LanguageDetector
    detector = LanguageDetector()
    
    test_texts = [
        ("Hello, how are you today?", "English"),
        ("Hola, como estas hoy?", "Spanish"),
        ("Bonjour, comment allez-vous aujourd'hui?", "French"),
        ("Guten Tag, wie geht es Ihnen heute?", "German")
    ]
    
    for text, expected_lang in test_texts:
        detected_lang, confidence = detector.detect_language(text)
        lang_name = detector.get_language_name(detected_lang)
        print(f"   Text: '{text[:30]}...' -> {lang_name} ({confidence:.2f})")
    
    print("\n2. Testing Report Generator...")
    from report_generator import ReportGenerator
    report_gen = ReportGenerator()
    
    # Create a mock analysis result
    mock_results = {
        'url': 'https://example.com',
        'content_length': 1500,
        'languages': {
            'en': {
                'language_name': 'English',
                'confidence': 0.95,
                'content': 'This is a test content for analysis.'
            }
        },
        'quality_scores': {
            'en': {'score': 85, 'confidence': 0.9}
        },
        'linguistic_analysis': {
            'grammatical_errors': [
                {'text': 'incorrect grammar', 'correction': 'correct grammar', 'severity': 'medium'}
            ],
            'translation_issues': [
                {'text': 'awkward translation', 'issue': 'Unnatural phrasing', 'suggestion': 'More natural phrasing'}
            ],
            'quality_score': 85,
            'confidence': 0.9
        },
        'terminology_analysis': {
            'inconsistencies': [
                {'term': 'product', 'languages': ['en', 'es'], 'issue': 'Different translations', 'suggestion': 'Use consistent term'}
            ],
            'consistency_score': 80
        }
    }
    
    print("   Generating sample report...")
    report_gen.generate_console_report(mock_results)
    
    print("\n[SUCCESS] Basic functionality tests completed!")
    print("\nTo test with real AI analysis, you need to:")
    print("   1. Set your OpenAI API key: $env:OPENAI_API_KEY='your-key-here'")
    print("   2. Run: python linguistic_analyzer.py analyze https://www.bobcat.com/regions")

if __name__ == "__main__":
    test_basic_functionality()
