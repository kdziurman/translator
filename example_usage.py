"""Example usage of the Linguistic Analyzer."""

import os
from linguistic_analyzer import LinguisticAnalyzer

def main():
    """Example of how to use the Linguistic Analyzer programmatically."""
    
    # Check if OpenAI API key is set
    if not os.getenv('OPENAI_API_KEY'):
        print("⚠️  OpenAI API key not found. Please set OPENAI_API_KEY environment variable.")
        print("   Example: export OPENAI_API_KEY='your-key-here'")
        return
    
    # Initialize the analyzer
    analyzer = LinguisticAnalyzer()
    
    # Example 1: Analyze a single URL
    print("🔍 Example 1: Analyzing a single URL")
    print("-" * 50)
    
    url = "https://www.bobcat.com/regions"
    results = analyzer.analyze_url(url)
    
    # Generate console report
    analyzer.report_generator.generate_console_report(results)
    
    # Example 2: Analyze with multilingual support
    print("\n🌍 Example 2: Multilingual analysis")
    print("-" * 50)
    
    multilingual_results = analyzer.analyze_multilingual_site(url)
    analyzer.report_generator.generate_console_report(multilingual_results)
    
    # Example 3: Save results to JSON
    print("\n💾 Example 3: Saving results to JSON")
    print("-" * 50)
    
    json_report = analyzer.report_generator.generate_json_report(
        results, 
        "analysis_report.json"
    )
    print(f"✅ Report saved to analysis_report.json")

if __name__ == "__main__":
    main()
