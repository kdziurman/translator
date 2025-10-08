"""Demo script showing how to use the Linguistic Analyzer."""

import os
import sys
from linguistic_analyzer import LinguisticAnalyzer

def main():
    """Demo the linguistic analyzer functionality."""
    print("Linguistic Analyzer Demo")
    print("=" * 50)
    
    # Check if OpenAI API key is set
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("WARNING: OpenAI API key not found.")
        print("To use AI analysis features, set your API key:")
        print("  $env:OPENAI_API_KEY='your-api-key-here'")
        print("\nFor now, we'll demonstrate basic functionality only.")
        print()
    
    # Initialize the analyzer
    try:
        analyzer = LinguisticAnalyzer()
        print("✓ Linguistic Analyzer initialized successfully")
    except Exception as e:
        print(f"✗ Failed to initialize analyzer: {e}")
        return
    
    # Demo 1: Basic web scraping and language detection
    print("\n1. Testing Web Scraping and Language Detection")
    print("-" * 50)
    
    test_url = "https://example.com"
    try:
        print(f"Analyzing: {test_url}")
        results = analyzer.analyze_url(test_url, analyze_terminology=False)
        
        if 'error' in results:
            print(f"Error: {results['error']}")
        else:
            print(f"✓ Successfully analyzed {results['content_length']} characters")
            for lang, data in results['languages'].items():
                print(f"  Language: {data['language_name']} (confidence: {data['confidence']:.2f})")
    except Exception as e:
        print(f"✗ Analysis failed: {e}")
    
    # Demo 2: Show available commands
    print("\n2. Available Commands")
    print("-" * 50)
    print("To analyze a single URL:")
    print("  python linguistic_analyzer.py analyze https://www.bobcat.com/regions")
    print()
    print("To analyze with multilingual support:")
    print("  python linguistic_analyzer.py analyze https://www.bobcat.com/regions --multilingual")
    print()
    print("To save results to a file:")
    print("  python linguistic_analyzer.py analyze https://www.bobcat.com/regions --output report.json")
    print()
    print("To skip terminology analysis:")
    print("  python linguistic_analyzer.py analyze https://www.bobcat.com/regions --no-terminology")
    
    # Demo 3: Show features
    print("\n3. Features")
    print("-" * 50)
    print("✓ Web content extraction")
    print("✓ Language detection")
    print("✓ AI-powered linguistic analysis (requires OpenAI API key)")
    print("✓ Translation quality assessment")
    print("✓ Terminology consistency checking")
    print("✓ Brand name verification")
    print("✓ Comprehensive reporting")
    print("✓ JSON export")
    
    print("\n" + "=" * 50)
    print("Demo completed! The tool is ready to use.")
    print("=" * 50)

if __name__ == "__main__":
    main()
