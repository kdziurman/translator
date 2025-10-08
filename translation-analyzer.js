#!/usr/bin/env node

import { WebScraper } from './web-scraper.js';
import { TranslationAnalyzer } from './translation-analyzer.js';
import { ReportGenerator } from './report-generator.js';
import chalk from 'chalk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

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
   * @param {string} url - URL to analyze
   * @param {Array} languagePaths - Optional language-specific paths
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
    const args = process.argv.slice(2);
    const url = args[0];
    
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
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { TranslationQualityAnalyzer };