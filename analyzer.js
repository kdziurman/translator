#!/usr/bin/env node

import { WebScraper } from './web-scraper.js';
import { ReportGenerator } from './report-generator.js';
import OpenAI from 'openai';
import chalk from 'chalk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * AI-powered translation quality analyzer
 */
class TranslationAnalyzer {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Analyze translation quality between different language versions
   */
  async analyzeTranslationQuality(scrapedContent) {
    try {
      console.log('🔍 Analyzing translation quality...');
      
      // Find English baseline
      const englishContent = scrapedContent.find(content => 
        content.detectedLanguage === 'en' || 
        content.htmlLang === 'en' ||
        content.url.includes('/en/') ||
        content.url.includes('/english/')
      );

      if (!englishContent) {
        console.warn('⚠️ No English baseline found, using first content as baseline');
        const baseline = scrapedContent[0];
        return await this.analyzeAgainstBaseline(baseline, scrapedContent);
      }

      return await this.analyzeAgainstBaseline(englishContent, scrapedContent);
      
    } catch (error) {
      console.error('❌ Error in translation analysis:', error.message);
      throw error;
    }
  }

  /**
   * Analyze all content against a baseline
   */
  async analyzeAgainstBaseline(baseline, allContent) {
    const analysisResults = {
      baseline: {
        url: baseline.url,
        language: baseline.detectedLanguage,
        title: baseline.title,
        wordCount: baseline.wordCount
      },
      comparisons: [],
      overallScore: 0,
      totalIssues: 0,
      criticalIssues: 0
    };

    for (const content of allContent) {
      if (content.url === baseline.url) continue;

      const comparison = await this.compareContent(baseline, content);
      analysisResults.comparisons.push(comparison);
      analysisResults.totalIssues += comparison.issues.length;
      analysisResults.criticalIssues += comparison.issues.filter(issue => issue.severity === 'critical').length;
    }

    // Calculate overall score
    const totalComparisons = analysisResults.comparisons.length;
    if (totalComparisons > 0) {
      const totalScore = analysisResults.comparisons.reduce((sum, comp) => sum + comp.qualityScore, 0);
      analysisResults.overallScore = Math.round(totalScore / totalComparisons);
    }

    return analysisResults;
  }

  /**
   * Compare two content pieces
   */
  async compareContent(baseline, target) {
    try {
      const prompt = this.buildComparisonPrompt(baseline, target);
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert translation quality analyst. Analyze the provided content and identify translation issues, inconsistencies, and quality problems. Provide specific, actionable feedback."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      });

      const analysis = JSON.parse(response.choices[0].message.content);
      
      return {
        targetUrl: target.url,
        targetLanguage: target.detectedLanguage,
        targetTitle: target.title,
        qualityScore: analysis.qualityScore || 0,
        issues: analysis.issues || [],
        suggestions: analysis.suggestions || [],
        terminologyIssues: analysis.terminologyIssues || [],
        brandConsistency: analysis.brandConsistency || []
      };
      
    } catch (error) {
      console.error(`❌ Error comparing content: ${error.message}`);
      return {
        targetUrl: target.url,
        targetLanguage: target.detectedLanguage,
        targetTitle: target.title,
        qualityScore: 0,
        issues: [{ type: 'analysis_error', severity: 'critical', message: 'Failed to analyze content', suggestion: 'Check content accessibility' }],
        suggestions: [],
        terminologyIssues: [],
        brandConsistency: []
      };
    }
  }

  /**
   * Build comparison prompt for OpenAI
   */
  buildComparisonPrompt(baseline, target) {
    return `
Analyze the translation quality between these two web pages:

BASELINE (${baseline.detectedLanguage}):
URL: ${baseline.url}
Title: ${baseline.title}
Content: ${baseline.bodyText.substring(0, 2000)}...

TARGET (${target.detectedLanguage}):
URL: ${target.url}
Title: ${target.title}
Content: ${target.bodyText.substring(0, 2000)}...

Please analyze and return a JSON response with the following structure:
{
  "qualityScore": 85,
  "issues": [
    {
      "type": "grammar_error",
      "severity": "medium",
      "message": "Specific issue description",
      "context": "Surrounding text",
      "suggestion": "How to fix it"
    }
  ],
  "suggestions": [
    "General improvement suggestions"
  ],
  "terminologyIssues": [
    {
      "term": "inconsistent term",
      "baseline": "correct term in baseline",
      "target": "incorrect term in target",
      "suggestion": "use consistent terminology"
    }
  ],
  "brandConsistency": [
    {
      "brandElement": "brand name or element",
      "issue": "description of inconsistency",
      "suggestion": "how to maintain consistency"
    }
  ]
}

Focus on:
1. Grammar and syntax errors
2. Translation accuracy and fluency
3. Terminology consistency
4. Brand name consistency
5. Cultural appropriateness
6. Missing or mistranslated content
7. Formatting and structure issues

Rate quality from 0-100 (100 = perfect translation).
`;
  }

  /**
   * Analyze terminology consistency across multiple versions
   */
  async analyzeTerminologyConsistency(scrapedContent) {
    try {
      console.log('🔍 Analyzing terminology consistency...');
      
      const prompt = `
Analyze terminology consistency across these web pages:

${scrapedContent.map((content, index) => `
Page ${index + 1} (${content.detectedLanguage}):
URL: ${content.url}
Title: ${content.title}
Content: ${content.bodyText.substring(0, 1500)}...
`).join('\n')}

Return a JSON response with:
{
  "inconsistentTerms": [
    {
      "term": "term that varies",
      "variations": [
        {"language": "en", "version": "English version"},
        {"language": "es", "version": "Spanish version"}
      ],
      "recommendedTerm": "suggested consistent term"
    }
  ],
  "brandInconsistencies": [
    {
      "brandElement": "brand name or element",
      "variations": ["version1", "version2"],
      "recommendedVersion": "consistent version"
    }
  ],
  "overallConsistencyScore": 85
}
`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a terminology and brand consistency expert. Analyze the provided content for terminology and brand inconsistencies."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      });

      return JSON.parse(response.choices[0].message.content);
      
    } catch (error) {
      console.error('❌ Error in terminology analysis:', error.message);
      return {
        inconsistentTerms: [],
        brandInconsistencies: [],
        overallConsistencyScore: 0
      };
    }
  }
}

/**
 * Main translation quality analysis tool
 */
class TranslationQualityAnalyzer {
  constructor() {
    this.scraper = new WebScraper();
    this.analyzer = new TranslationAnalyzer();
    this.reportGenerator = new ReportGenerator();
  }

  /**
   * Analyze a single URL or multiple language versions
   */
  async analyzeUrl(url, languagePaths = []) {
    try {
      console.log(chalk.cyan('🚀 Starting Translation Quality Analysis...\n'));
      
      // Step 1: Scrape content
      console.log(chalk.yellow('📥 Step 1: Scraping web content...'));
      const scrapedContent = await this.scraper.scrapeMultipleLanguages(url, languagePaths);
      
      if (scrapedContent.length === 0) {
        throw new Error('No content could be scraped from the provided URLs');
      }
      
      console.log(chalk.green(`✅ Successfully scraped ${scrapedContent.length} pages`));
      scrapedContent.forEach((content, index) => {
        console.log(`   ${index + 1}. ${content.detectedLanguage.toUpperCase()} - ${content.url} (${content.wordCount} words)`);
      });
      
      // Step 2: Analyze translation quality
      console.log(chalk.yellow('\n🔍 Step 2: Analyzing translation quality...'));
      const analysisResults = await this.analyzer.analyzeTranslationQuality(scrapedContent);
      
      // Step 3: Analyze terminology consistency
      console.log(chalk.yellow('\n📚 Step 3: Analyzing terminology consistency...'));
      const terminologyResults = await this.analyzer.analyzeTerminologyConsistency(scrapedContent);
      
      // Step 4: Generate report
      console.log(chalk.yellow('\n📄 Step 4: Generating comprehensive report...'));
      const report = this.reportGenerator.generateReport(analysisResults, terminologyResults, scrapedContent);
      
      // Display report
      console.log('\n' + report);
      
      // Save report to file
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `translation-analysis-${timestamp}.txt`;
      await this.reportGenerator.saveReport(report, filename);
      
      console.log(chalk.green('\n🎉 Analysis completed successfully!'));
      
      return {
        analysisResults,
        terminologyResults,
        scrapedContent,
        report
      };
      
    } catch (error) {
      console.error(chalk.red(`❌ Analysis failed: ${error.message}`));
      throw error;
    }
  }

  /**
   * Analyze Bobcat website with EU languages
   */
  async analyzeBobcatSite() {
    const baseUrl = 'https://www.bobcat.com/regions';
    const languagePaths = [
      '/regions?lang=en',      // English
      '/regions?lang=de',      // German
      '/regions?lang=fr',      // French
      '/regions?lang=es',      // Spanish
      '/regions?lang=it',      // Italian
      '/regions?lang=nl',      // Dutch
      '/regions?lang=pl',      // Polish
      '/regions?lang=pt',      // Portuguese
      '/regions?lang=sv',      // Swedish
      '/regions?lang=da',      // Danish
      '/regions?lang=no',      // Norwegian
      '/regions?lang=fi',      // Finnish
    ];
    
    console.log(chalk.cyan('🌍 Analyzing Bobcat website with EU languages...\n'));
    return await this.analyzeUrl(baseUrl, languagePaths);
  }
}

// Main execution
async function main() {
  const analyzer = new TranslationQualityAnalyzer();
  
  try {
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error(chalk.red('❌ OpenAI API key not found!'));
      console.log(chalk.yellow('Please set your OPENAI_API_KEY in the .env file'));
      console.log(chalk.yellow('Get your API key from: https://platform.openai.com/api-keys'));
      process.exit(1);
    }
    
    // Get URL from command line arguments or use default
    const url = 'https://www.bobcat.com/regions';
    
    if (url) {
      console.log(chalk.cyan(`🔗 Analyzing URL: ${url}`));
      await analyzer.analyzeUrl(url);
    } else {
      console.log(chalk.cyan('🌍 No URL provided, analyzing Bobcat website with EU languages...'));
      await analyzer.analyzeBobcatSite();
    }
    
  } catch (error) {
    console.error(chalk.red(`❌ Error: ${error.message}`));
    process.exit(1);
  }
}

// Run if this file is executed directly
main();

export { TranslationQualityAnalyzer };
