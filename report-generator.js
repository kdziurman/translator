import chalk from 'chalk';

/**
 * Generate comprehensive reports for translation quality analysis
 */
export class ReportGenerator {
  constructor() {
    this.colors = {
      critical: chalk.red.bold,
      high: chalk.red,
      medium: chalk.yellow,
      low: chalk.blue,
      success: chalk.green,
      info: chalk.cyan,
      warning: chalk.magenta
    };
  }

  /**
   * Generate a comprehensive analysis report
   * @param {Object} analysisResults - Results from translation analysis
   * @param {Object} terminologyResults - Results from terminology analysis
   * @param {Array} scrapedContent - Original scraped content
   * @returns {string} - Formatted report
   */
  generateReport(analysisResults, terminologyResults, scrapedContent) {
    const report = [];
    
    // Header
    report.push(this.generateHeader(analysisResults, scrapedContent));
    
    // Executive Summary
    report.push(this.generateExecutiveSummary(analysisResults, terminologyResults));
    
    // Quality Analysis
    report.push(this.generateQualityAnalysis(analysisResults));
    
    // Terminology Analysis
    report.push(this.generateTerminologyAnalysis(terminologyResults));
    
    // Detailed Issues
    report.push(this.generateDetailedIssues(analysisResults));
    
    // Recommendations
    report.push(this.generateRecommendations(analysisResults, terminologyResults));
    
    // Footer
    report.push(this.generateFooter());
    
    return report.join('\n\n');
  }

  /**
   * Generate report header
   */
  generateHeader(analysisResults, scrapedContent) {
    const timestamp = new Date().toLocaleString();
    const totalPages = scrapedContent.length;
    
    return `
${this.colors.info('='.repeat(80))}
${this.colors.info('🌐 TRANSLATION QUALITY ANALYSIS REPORT')}
${this.colors.info('='.repeat(80))}

${this.colors.info('📊 Analysis Summary:')}
• Generated: ${timestamp}
• Pages Analyzed: ${totalPages}
• Baseline Language: ${analysisResults.baseline.language.toUpperCase()}
• Baseline URL: ${analysisResults.baseline.url}
• Overall Quality Score: ${this.getScoreColor(analysisResults.overallScore)}${analysisResults.overallScore}/100${chalk.reset}
• Total Issues Found: ${this.colors.warning(analysisResults.totalIssues)}
• Critical Issues: ${this.colors.critical(analysisResults.criticalIssues)}
`;
  }

  /**
   * Generate executive summary
   */
  generateExecutiveSummary(analysisResults, terminologyResults) {
    const score = analysisResults.overallScore;
    const criticalIssues = analysisResults.criticalIssues;
    const totalIssues = analysisResults.totalIssues;
    
    let summary = `${this.colors.info('📋 EXECUTIVE SUMMARY')}\n`;
    
    if (score >= 90) {
      summary += `${this.colors.success('✅ EXCELLENT')} - Translation quality is excellent with minimal issues.\n`;
    } else if (score >= 75) {
      summary += `${this.colors.info('✅ GOOD')} - Translation quality is good with some minor issues to address.\n`;
    } else if (score >= 60) {
      summary += `${this.colors.warning('⚠️ FAIR')} - Translation quality needs improvement. Several issues require attention.\n`;
    } else {
      summary += `${this.colors.critical('❌ POOR')} - Translation quality is poor. Significant issues require immediate attention.\n`;
    }
    
    summary += `\n${this.colors.info('Key Findings:')}\n`;
    summary += `• Quality Score: ${this.getScoreColor(score)}${score}/100${chalk.reset}\n`;
    summary += `• Total Issues: ${totalIssues}\n`;
    summary += `• Critical Issues: ${this.colors.critical(criticalIssues)}\n`;
    
    if (terminologyResults.overallConsistencyScore) {
      summary += `• Terminology Consistency: ${this.getScoreColor(terminologyResults.overallConsistencyScore)}${terminologyResults.overallConsistencyScore}/100${chalk.reset}\n`;
    }
    
    return summary;
  }

  /**
   * Generate quality analysis section
   */
  generateQualityAnalysis(analysisResults) {
    let section = `${this.colors.info('🔍 QUALITY ANALYSIS BY LANGUAGE')}\n`;
    section += `${'='.repeat(50)}\n\n`;
    
    analysisResults.comparisons.forEach((comparison, index) => {
      const score = comparison.qualityScore;
      const issues = comparison.issues.length;
      const criticalIssues = comparison.issues.filter(issue => issue.severity === 'critical').length;
      
      section += `${this.colors.info(`${index + 1}. ${comparison.targetLanguage.toUpperCase()}`)}\n`;
      section += `   URL: ${comparison.targetUrl}\n`;
      section += `   Quality Score: ${this.getScoreColor(score)}${score}/100${chalk.reset}\n`;
      section += `   Issues: ${issues} (${this.colors.critical(criticalIssues)} critical)\n`;
      
      if (comparison.issues.length > 0) {
        section += `   ${this.colors.warning('Top Issues:')}\n`;
        comparison.issues.slice(0, 3).forEach(issue => {
          const severityColor = this.getSeverityColor(issue.severity);
          section += `   • ${severityColor}${issue.severity.toUpperCase()}${chalk.reset}: ${issue.message}\n`;
        });
      }
      
      section += '\n';
    });
    
    return section;
  }

  /**
   * Generate terminology analysis section
   */
  generateTerminologyAnalysis(terminologyResults) {
    let section = `${this.colors.info('📚 TERMINOLOGY & BRAND CONSISTENCY')}\n`;
    section += `${'='.repeat(50)}\n\n`;
    
    if (terminologyResults.overallConsistencyScore) {
      section += `Overall Consistency Score: ${this.getScoreColor(terminologyResults.overallConsistencyScore)}${terminologyResults.overallConsistencyScore}/100${chalk.reset}\n\n`;
    }
    
    if (terminologyResults.inconsistentTerms && terminologyResults.inconsistentTerms.length > 0) {
      section += `${this.colors.warning('Inconsistent Terminology:')}\n`;
      terminologyResults.inconsistentTerms.forEach((term, index) => {
        section += `${index + 1}. "${this.colors.high(term.term)}"\n`;
        section += `   Variations:\n`;
        term.variations.forEach(variation => {
          section += `   • ${variation.language}: "${variation.version}"\n`;
        });
        section += `   ${this.colors.success('Recommended:')} "${term.recommendedTerm}"\n\n`;
      });
    }
    
    if (terminologyResults.brandInconsistencies && terminologyResults.brandInconsistencies.length > 0) {
      section += `${this.colors.warning('Brand Inconsistencies:')}\n`;
      terminologyResults.brandInconsistencies.forEach((brand, index) => {
        section += `${index + 1}. ${this.colors.high(brand.brandElement)}\n`;
        section += `   Variations: ${brand.variations.join(', ')}\n`;
        section += `   ${this.colors.success('Recommended:')} "${brand.recommendedVersion}"\n\n`;
      });
    }
    
    if ((!terminologyResults.inconsistentTerms || terminologyResults.inconsistentTerms.length === 0) &&
        (!terminologyResults.brandInconsistencies || terminologyResults.brandInconsistencies.length === 0)) {
      section += `${this.colors.success('✅ No terminology or brand inconsistencies found!')}\n`;
    }
    
    return section;
  }

  /**
   * Generate detailed issues section
   */
  generateDetailedIssues(analysisResults) {
    let section = `${this.colors.info('🐛 DETAILED ISSUES BREAKDOWN')}\n`;
    section += `${'='.repeat(50)}\n\n`;
    
    let issueCount = 1;
    
    analysisResults.comparisons.forEach(comparison => {
      if (comparison.issues.length > 0) {
        section += `${this.colors.info(`${comparison.targetLanguage.toUpperCase()} Issues:`)}\n`;
        
        comparison.issues.forEach(issue => {
          const severityColor = this.getSeverityColor(issue.severity);
          section += `${issueCount}. ${severityColor}[${issue.severity.toUpperCase()}]${chalk.reset} ${issue.type}\n`;
          section += `   ${this.colors.warning('Issue:')} ${issue.message}\n`;
          if (issue.context) {
            section += `   ${this.colors.info('Context:')} "${issue.context}"\n`;
          }
          if (issue.suggestion) {
            section += `   ${this.colors.success('Suggestion:')} ${issue.suggestion}\n`;
          }
          section += '\n';
          issueCount++;
        });
      }
    });
    
    if (issueCount === 1) {
      section += `${this.colors.success('✅ No detailed issues found!')}\n`;
    }
    
    return section;
  }

  /**
   * Generate recommendations section
   */
  generateRecommendations(analysisResults, terminologyResults) {
    let section = `${this.colors.info('💡 RECOMMENDATIONS')}\n`;
    section += `${'='.repeat(50)}\n\n`;
    
    const recommendations = [];
    
    // Quality-based recommendations
    if (analysisResults.overallScore < 70) {
      recommendations.push(`${this.colors.critical('🔴 URGENT:')} Overall translation quality is below acceptable standards. Consider professional review.`);
    } else if (analysisResults.overallScore < 85) {
      recommendations.push(`${this.colors.warning('🟡 IMPROVE:')} Translation quality needs improvement. Focus on the most critical issues first.`);
    }
    
    // Critical issues recommendations
    if (analysisResults.criticalIssues > 0) {
      recommendations.push(`${this.colors.critical('🔴 CRITICAL:')} Address ${analysisResults.criticalIssues} critical issues immediately.`);
    }
    
    // Terminology recommendations
    if (terminologyResults.inconsistentTerms && terminologyResults.inconsistentTerms.length > 0) {
      recommendations.push(`${this.colors.warning('📚 TERMINOLOGY:')} Create a style guide to ensure consistent terminology across all languages.`);
    }
    
    // Brand consistency recommendations
    if (terminologyResults.brandInconsistencies && terminologyResults.brandInconsistencies.length > 0) {
      recommendations.push(`${this.colors.warning('🏷️ BRAND:')} Establish brand guidelines to maintain consistent brand representation across languages.`);
    }
    
    // General recommendations
    recommendations.push(`${this.colors.info('📋 GENERAL:')} Implement regular quality checks for all translated content.`);
    recommendations.push(`${this.colors.info('🔄 PROCESS:')} Consider using translation management tools for better consistency.`);
    
    recommendations.forEach((rec, index) => {
      section += `${index + 1}. ${rec}\n`;
    });
    
    return section;
  }

  /**
   * Generate report footer
   */
  generateFooter() {
    return `
${this.colors.info('='.repeat(80))}
${this.colors.info('📄 Report generated by AI Translation Quality Analyzer')}
${this.colors.info('='.repeat(80))}
`;
  }

  /**
   * Get color for score
   */
  getScoreColor(score) {
    if (score >= 90) return this.colors.success;
    if (score >= 75) return this.colors.info;
    if (score >= 60) return this.colors.warning;
    return this.colors.critical;
  }

  /**
   * Get color for severity
   */
  getSeverityColor(severity) {
    switch (severity) {
      case 'critical': return this.colors.critical;
      case 'high': return this.colors.high;
      case 'medium': return this.colors.medium;
      case 'low': return this.colors.low;
      default: return this.colors.info;
    }
  }

  /**
   * Save report to file
   * @param {string} report - Report content
   * @param {string} filename - Output filename
   */
  async saveReport(report, filename = 'translation-analysis-report.txt') {
    try {
      const fs = await import('fs/promises');
      await fs.writeFile(filename, report, 'utf8');
      console.log(`${this.colors.success('✅ Report saved to:')} ${filename}`);
    } catch (error) {
      console.error(`${this.colors.critical('❌ Error saving report:')} ${error.message}`);
    }
  }
}
