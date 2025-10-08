"""Report generation module for linguistic analysis results."""

from typing import Dict, List, Any, Optional
from datetime import datetime
import json
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.text import Text
from rich import print as rprint

console = Console()


class ReportGenerator:
    """Generates comprehensive analysis reports."""
    
    def __init__(self):
        self.console = console
    
    def generate_console_report(self, analysis_results: Dict[str, Any]) -> None:
        """
        Generate a console-based report.
        
        Args:
            analysis_results: Dictionary containing analysis results
        """
        self.console.print("\n" + "="*80)
        self.console.print("LINGUISTIC ANALYSIS REPORT", style="bold blue", justify="center")
        self.console.print("="*80)
        
        # Basic info
        self._print_basic_info(analysis_results)
        
        # Quality scores
        self._print_quality_scores(analysis_results)
        
        # Errors and issues
        self._print_errors_and_issues(analysis_results)
        
        # Terminology analysis
        if 'terminology_analysis' in analysis_results:
            self._print_terminology_analysis(analysis_results['terminology_analysis'])
        
        # Suggestions
        self._print_suggestions(analysis_results)
        
        # Summary
        self._print_summary(analysis_results)
    
    def generate_json_report(self, analysis_results: Dict[str, Any], output_file: str = None) -> str:
        """
        Generate a JSON report.
        
        Args:
            analysis_results: Dictionary containing analysis results
            output_file: Optional output file path
            
        Returns:
            JSON string of the report
        """
        report = {
            'timestamp': datetime.now().isoformat(),
            'analysis_results': analysis_results
        }
        
        json_report = json.dumps(report, indent=2, ensure_ascii=False)
        
        if output_file:
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(json_report)
        
        return json_report
    
    def _print_basic_info(self, results: Dict[str, Any]) -> None:
        """Print basic analysis information."""
        if 'url' in results:
            self.console.print(f"\nURL: {results['url']}")
        
        if 'languages' in results:
            lang_info = []
            for lang, data in results['languages'].items():
                lang_name = data.get('language_name', lang)
                confidence = data.get('confidence', 0)
                lang_info.append(f"{lang_name} ({confidence:.1%})")
            
            self.console.print(f"Languages: {', '.join(lang_info)}")
        
        if 'content_length' in results:
            self.console.print(f"Content Length: {results['content_length']:,} characters")
        
        if 'paragraph_count' in results:
            self.console.print(f"Paragraphs Analyzed: {results['paragraph_count']}")
    
    def _print_quality_scores(self, results: Dict[str, Any]) -> None:
        """Print quality scores."""
        if 'quality_scores' not in results:
            return
        
        table = Table(title="Quality Scores", show_header=True, header_style="bold magenta")
        table.add_column("Language", style="cyan")
        table.add_column("Score", justify="right")
        table.add_column("Confidence", justify="right")
        table.add_column("Status", justify="center")
        
        for lang, data in results['quality_scores'].items():
            score = data.get('score', 0)
            confidence = data.get('confidence', 0)
            
            if score >= 80:
                status = "[OK] Good"
                style = "green"
            elif score >= 60:
                status = "[WARN] Fair"
                style = "yellow"
            else:
                status = "[ERROR] Poor"
                style = "red"
            
            table.add_row(
                lang.upper(),
                f"{score}/100",
                f"{confidence:.1%}",
                status,
                style=style
            )
        
        self.console.print(table)
    
    def _print_errors_and_issues(self, results: Dict[str, Any]) -> None:
        """Print errors and issues found."""
        if 'linguistic_analysis' not in results:
            return
        
        analysis = results['linguistic_analysis']
        
        # Grammatical errors
        if 'grammatical_errors' in analysis and analysis['grammatical_errors']:
            self.console.print("\nGRAMMATICAL ERRORS:", style="bold red")
            for error in analysis['grammatical_errors']:
                self.console.print(f"  - {error.get('text', 'N/A')} -> {error.get('correction', 'N/A')}")
                if 'severity' in error:
                    severity_color = "red" if error['severity'] == 'high' else "yellow" if error['severity'] == 'medium' else "blue"
                    self.console.print(f"    Severity: {error['severity']}", style=severity_color)
        
        # Translation issues
        if 'translation_issues' in analysis and analysis['translation_issues']:
            self.console.print("\nTRANSLATION ISSUES:", style="bold yellow")
            for issue in analysis['translation_issues']:
                self.console.print(f"  - {issue.get('text', 'N/A')}")
                self.console.print(f"    Issue: {issue.get('issue', 'N/A')}")
                if 'suggestion' in issue:
                    self.console.print(f"    Suggestion: {issue['suggestion']}")
        
        # Style issues
        if 'style_issues' in analysis and analysis['style_issues']:
            self.console.print("\nSTYLE ISSUES:", style="bold purple")
            for issue in analysis['style_issues']:
                self.console.print(f"  - {issue.get('text', 'N/A')}")
                self.console.print(f"    Issue: {issue.get('issue', 'N/A')}")
                if 'suggestion' in issue:
                    self.console.print(f"    Suggestion: {issue['suggestion']}")
    
    def _print_terminology_analysis(self, terminology_analysis: Dict[str, Any]) -> None:
        """Print terminology analysis results."""
        self.console.print("\nTERMINOLOGY ANALYSIS:", style="bold green")
        
        if 'inconsistencies' in terminology_analysis and terminology_analysis['inconsistencies']:
            self.console.print("\nInconsistencies Found:")
            for inconsistency in terminology_analysis['inconsistencies']:
                self.console.print(f"  - Term: {inconsistency.get('term', 'N/A')}")
                self.console.print(f"    Languages: {', '.join(inconsistency.get('languages', []))}")
                self.console.print(f"    Issue: {inconsistency.get('issue', 'N/A')}")
                if 'suggestion' in inconsistency:
                    self.console.print(f"    Suggestion: {inconsistency['suggestion']}")
        
        if 'brand_issues' in terminology_analysis and terminology_analysis['brand_issues']:
            self.console.print("\nBrand Issues Found:")
            for brand_issue in terminology_analysis['brand_issues']:
                self.console.print(f"  - Brand: {brand_issue.get('brand', 'N/A')}")
                self.console.print(f"    Issue: {brand_issue.get('issue', 'N/A')}")
                if 'suggestion' in brand_issue:
                    self.console.print(f"    Suggestion: {brand_issue['suggestion']}")
    
    def _print_suggestions(self, results: Dict[str, Any]) -> None:
        """Print improvement suggestions."""
        suggestions = []
        
        # Collect suggestions from various sources
        if 'linguistic_analysis' in results and 'suggestions' in results['linguistic_analysis']:
            suggestions.extend(results['linguistic_analysis']['suggestions'])
        
        if 'terminology_analysis' in results and 'suggestions' in results['terminology_analysis']:
            suggestions.extend(results['terminology_analysis']['suggestions'])
        
        if suggestions:
            self.console.print("\nIMPROVEMENT SUGGESTIONS:", style="bold cyan")
            for i, suggestion in enumerate(suggestions, 1):
                self.console.print(f"  {i}. {suggestion}")
    
    def _print_summary(self, results: Dict[str, Any]) -> None:
        """Print analysis summary."""
        self.console.print("\n" + "="*80)
        self.console.print("ANALYSIS SUMMARY", style="bold blue", justify="center")
        self.console.print("="*80)
        
        # Count issues
        total_errors = 0
        if 'linguistic_analysis' in results:
            analysis = results['linguistic_analysis']
            total_errors += len(analysis.get('grammatical_errors', []))
            total_errors += len(analysis.get('translation_issues', []))
            total_errors += len(analysis.get('style_issues', []))
        
        total_inconsistencies = 0
        if 'terminology_analysis' in results:
            terminology = results['terminology_analysis']
            total_inconsistencies += len(terminology.get('inconsistencies', []))
            total_inconsistencies += len(terminology.get('brand_issues', []))
        
        self.console.print(f"Total Linguistic Issues: {total_errors}")
        self.console.print(f"Total Terminology Issues: {total_inconsistencies}")
        
        # Overall assessment
        if total_errors == 0 and total_inconsistencies == 0:
            self.console.print("\n[EXCELLENT] No significant issues found.", style="bold green")
        elif total_errors < 5 and total_inconsistencies < 3:
            self.console.print("\n[GOOD] Minor issues found that can be easily addressed.", style="bold yellow")
        else:
            self.console.print("\n[ATTENTION NEEDED] Multiple issues found that require review.", style="bold red")
        
        self.console.print("\n" + "="*80)
