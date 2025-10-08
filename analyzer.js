#!/usr/bin/env node

import { WebScraper } from "./web-scraper.js";
import { ReportGenerator } from "./report-generator.js";
import OpenAI from "openai";
import chalk from "chalk";
import dotenv from "dotenv";

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
      console.log("🔍 Analyzing translation quality...");
      console.log(
        `📊 Found ${scrapedContent.length} content pieces to analyze`,
      );

      // Find English baseline
      console.log("🔍 Looking for English baseline...");
      const englishContent = scrapedContent.find(
        (content) =>
          content.detectedLanguage === "en" ||
          content.htmlLang === "en" ||
          content.url.includes("/en/") ||
          content.url.includes("/english/"),
      );

      if (!englishContent) {
        console.warn(
          "⚠️ No English baseline found, using first content as baseline",
        );
        const baseline = scrapedContent[0];
        console.log(
          `📌 Using baseline: ${baseline.detectedLanguage} - ${baseline.url}`,
        );
        return await this.analyzeAgainstBaseline(baseline, scrapedContent);
      }

      console.log(
        `✅ Found English baseline: ${englishContent.url} (${englishContent.detectedLanguage})`,
      );
      return await this.analyzeAgainstBaseline(englishContent, scrapedContent);
    } catch (error) {
      console.error("❌ Error in translation analysis:", error.message);
      throw error;
    }
  }

  /**
   * Analyze all content against a baseline
   */
  async analyzeAgainstBaseline(baseline, allContent) {
    console.log(
      `📋 Starting analysis against baseline: ${baseline.detectedLanguage} (${baseline.wordCount} words)`,
    );

    const analysisResults = {
      baseline: {
        url: baseline.url,
        language: baseline.detectedLanguage,
        title: baseline.title,
        wordCount: baseline.wordCount,
      },
      comparisons: [],
      overallScore: 0,
      totalIssues: 0,
      criticalIssues: 0,
    };

    const contentToAnalyze = allContent.filter(
      (content) => content.url !== baseline.url,
    );
    console.log(
      `🔄 Analyzing ${contentToAnalyze.length} content pieces against baseline...`,
    );

    for (let i = 0; i < contentToAnalyze.length; i++) {
      const content = contentToAnalyze[i];
      console.log(
        `\n📝 Analyzing ${i + 1}/${contentToAnalyze.length}: ${content.detectedLanguage} - ${content.url}`,
      );
      console.log(`   Content length: ${content.wordCount} words`);

      const comparison = await this.compareContent(baseline, content);
      analysisResults.comparisons.push(comparison);
      analysisResults.totalIssues += comparison.issues.length;
      analysisResults.criticalIssues += comparison.issues.filter(
        (issue) => issue.severity === "critical",
      ).length;

      console.log(
        `   ✅ Analysis complete - Score: ${comparison.qualityScore}/100, Issues: ${comparison.issues.length}`,
      );
    }

    // Calculate overall score
    const totalComparisons = analysisResults.comparisons.length;
    if (totalComparisons > 0) {
      const totalScore = analysisResults.comparisons.reduce(
        (sum, comp) => sum + comp.qualityScore,
        0,
      );
      analysisResults.overallScore = Math.round(totalScore / totalComparisons);
      console.log(
        `\n📊 Overall analysis complete - Average score: ${analysisResults.overallScore}/100`,
      );
      console.log(
        `📈 Total issues found: ${analysisResults.totalIssues} (${analysisResults.criticalIssues} critical)`,
      );
    }

    return analysisResults;
  }

  /**
   * Compare two content pieces
   */
  async compareContent(baseline, target) {
    try {
      console.log(`   🤖 Sending request to OpenAI GPT-4...`);
      const prompt = this.buildComparisonPrompt(baseline, target);

      const startTime = Date.now();
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are an expert translation quality analyst. Analyze the provided content and identify translation issues, inconsistencies, and quality problems. Provide specific, actionable feedback.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 2000,
        temperature: 0.3,
      });

      const analysisTime = Date.now() - startTime;
      console.log(`   ⏱️ OpenAI response received in ${analysisTime}ms`);

      console.log(`   🔍 Parsing AI response...`);
      const analysis = JSON.parse(response.choices[0].message.content);

      console.log(
        `   📊 Analysis results: ${analysis.issues?.length || 0} issues found`,
      );

      return {
        targetUrl: target.url,
        targetLanguage: target.detectedLanguage,
        targetTitle: target.title,
        qualityScore: analysis.qualityScore || 0,
        issues: analysis.issues || [],
        suggestions: analysis.suggestions || [],
        terminologyIssues: analysis.terminologyIssues || [],
        brandConsistency: analysis.brandConsistency || [],
      };
    } catch (error) {
      console.error(`   ❌ Error comparing content: ${error.message}`);
      if (error.message.includes("JSON")) {
        console.log(`   🔧 Attempting to fix JSON parsing...`);
        // Try to extract JSON from response if it's wrapped in text
        try {
          const jsonMatch = error.message.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const analysis = JSON.parse(jsonMatch[0]);
            console.log(`   ✅ JSON parsing fixed`);
            return {
              targetUrl: target.url,
              targetLanguage: target.detectedLanguage,
              targetTitle: target.title,
              qualityScore: analysis.qualityScore || 0,
              issues: analysis.issues || [],
              suggestions: analysis.suggestions || [],
              terminologyIssues: analysis.terminologyIssues || [],
              brandConsistency: analysis.brandConsistency || [],
            };
          }
        } catch (fixError) {
          console.log(`   ❌ Could not fix JSON parsing`);
        }
      }

      return {
        targetUrl: target.url,
        targetLanguage: target.detectedLanguage,
        targetTitle: target.title,
        qualityScore: 0,
        issues: [
          {
            type: "analysis_error",
            severity: "critical",
            message: "Failed to analyze content",
            suggestion: "Check content accessibility",
          },
        ],
        suggestions: [],
        terminologyIssues: [],
        brandConsistency: [],
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
      console.log("🔍 Analyzing terminology consistency...");
      console.log(
        `📊 Analyzing ${scrapedContent.length} content pieces for terminology consistency`,
      );

      const prompt = `
Analyze terminology consistency across these web pages:

${scrapedContent
  .map(
    (content, index) => `
Page ${index + 1} (${content.detectedLanguage}):
URL: ${content.url}
Title: ${content.title}
Content: ${content.bodyText.substring(0, 1500)}...
`,
  )
  .join("\n")}

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

      console.log("🤖 Sending terminology analysis request to OpenAI...");
      const startTime = Date.now();

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are a terminology and brand consistency expert. Analyze the provided content for terminology and brand inconsistencies.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 2000,
        temperature: 0.3,
      });

      const analysisTime = Date.now() - startTime;
      console.log(`⏱️ Terminology analysis completed in ${analysisTime}ms`);

      console.log("🔍 Parsing terminology analysis results...");

      let result;
      try {
        result = JSON.parse(response.choices[0].message.content);
      } catch (parseError) {
        console.log(
          "🔧 JSON parsing failed, attempting to extract JSON from response...",
        );
        const responseText = response.choices[0].message.content;
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
          console.log("✅ JSON extraction successful");
        } else {
          throw new Error("Could not extract JSON from response");
        }
      }

      console.log(`📊 Terminology analysis results:`);
      console.log(
        `   - Inconsistent terms: ${result.inconsistentTerms?.length || 0}`,
      );
      console.log(
        `   - Brand inconsistencies: ${result.brandInconsistencies?.length || 0}`,
      );
      console.log(
        `   - Overall consistency score: ${result.overallConsistencyScore || 0}/100`,
      );

      return result;
    } catch (error) {
      console.error("❌ Error in terminology analysis:", error.message);
      console.log("🔧 Returning empty terminology analysis results");
      return {
        inconsistentTerms: [],
        brandInconsistencies: [],
        overallConsistencyScore: 0,
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
   * Use AI to discover language-specific URLs from a website
   */
  async discoverLanguageUrls(baseUrl) {
    try {
      console.log("🔍 Using AI to discover language-specific URLs...");

      // First, scrape the base URL to get initial content
      console.log(`📥 Scraping base URL: ${baseUrl}`);
      const baseContent = await this.scraper.scrapeUrl(baseUrl);

      if (!baseContent) {
        throw new Error("Could not scrape base URL");
      }

      console.log(`✅ Base content scraped (${baseContent.wordCount} words)`);

      // Use AI to analyze the content and discover language URLs
      console.log("🤖 Analyzing content with AI to find language URLs...");
      const prompt = `
      Enter the website and analyze the content to find all possible language-specific URLs for different language versions.

Base URL: ${baseUrl}
Title: ${baseContent.title}
Content: ${baseContent.bodyText.substring(0, 3000)}...

Look for:
1. Language switcher links
2. URL patterns with language codes (e.g., /en/, /de/, /fr/, ?lang=en, etc.)
3. Navigation menus with language options
4. Footer links to different language versions
5. Any other indicators of multilingual content
6. Language links may be also hidden in a region switcher menu, if thats the case then get languages from one region

Return a JSON response with this structure:
{
  "languageUrls": [
    {
      "language": "en",
      "languageName": "English", 
      "url": "https://example.com/en/",
      "confidence": "high"
    },
    {
      "language": "de",
      "languageName": "German",
      "url": "https://example.com/de/", 
      "confidence": "medium"
    }
  ],
  "discoveredPatterns": [
    "URL pattern: /{lang}/",
    "Query parameter: ?lang={code}"
  ],
  "totalLanguages": 5
}

Focus on finding actual working URLs, not just patterns. Confidence levels: high, medium, low.
`;

      const response = await this.analyzer.openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content:
              "You are an expert web analyst specializing in multilingual website structure. Analyze the provided content to discover language-specific URLs and patterns.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 1,
      });
      console.log(response.choices[0].message.content);
      const discovery = JSON.parse(response.choices[0].message.content);
      console.log(discovery);
      console.log(
        `🎯 AI discovered ${discovery.totalLanguages} potential language URLs`,
      );
      console.log(
        `📋 Patterns found: ${discovery.discoveredPatterns.join(", ")}`,
      );

      return discovery.languageUrls || [];
    } catch (error) {
      console.error("❌ Error discovering language URLs:", error.message);
      console.log("🔧 Falling back to manual language detection...");
      return [];
    }
  }

  /**
   * Generate a simple report for single language content
   */
  generateSingleLanguageReport(content) {
    const timestamp = new Date().toLocaleString();

    return `
${chalk.cyan("=".repeat(80))}
${chalk.cyan("📄 SINGLE LANGUAGE CONTENT ANALYSIS")}
${chalk.cyan("=".repeat(80))}

${chalk.cyan("📊 Content Summary:")}
• Generated: ${timestamp}
• URL: ${content.url}
• Language: ${content.detectedLanguage.toUpperCase()}
• Title: ${content.title}
• Word Count: ${content.wordCount}
• Scraped At: ${content.scrapedAt}

${chalk.yellow("⚠️ Translation Analysis Not Available:")}
This analysis only found one language version of the content. 
Translation quality analysis requires multiple language versions to compare.

${chalk.cyan("💡 To perform translation analysis:")}
• Try a different URL that has multiple language versions
• Look for websites with language switchers or multilingual content
• Manually provide language URLs if you know them

${chalk.green("✅ Content Successfully Analyzed:")}
The content was successfully scraped and analyzed, but no translation 
comparison could be performed due to insufficient language versions.

${chalk.cyan("=".repeat(80))}
${chalk.cyan("📄 Report generated by AI Translation Quality Analyzer")}
${chalk.cyan("=".repeat(80))}
`;
  }

  /**
   * Analyze a single URL or multiple language versions
   */
  async analyzeUrl(url) {
    try {
      console.log(chalk.cyan("🚀 Starting Translation Quality Analysis...\n"));

      console.log(
        chalk.yellow("🔍 Step 0: Discovering language-specific URLs..."),
      );
      const discoveryStartTime = Date.now();
      const languageUrls = await this.discoverLanguageUrls(url);
      const discoveryTime = Date.now() - discoveryStartTime;

      if (languageUrls.length > 0) {
        console.log(
          `✅ Discovered ${languageUrls.length} language URLs in ${discoveryTime}ms:`,
        );
        languageUrls.forEach((lang, index) => {
          console.log(
            `   ${index + 1}. ${lang.languageName} (${lang.language}) - ${lang.url} [${lang.confidence}]`,
          );
        });
      } else {
        console.log(
          "⚠️ No language URLs discovered, analyzing single URL only",
        );
      }

      console.log(chalk.yellow("\n📥 Step 1: Scraping web content..."));
      const scrapeStartTime = Date.now();

      let scrapedContent;
      if (languageUrls.length > 0) {
        const urlsToScrape = [url, ...languageUrls.map((lang) => lang.url)];
        console.log(`🌍 Scraping ${urlsToScrape.length} URLs...`);
        scrapedContent = await this.scraper.scrapeMultipleLanguages(
          url,
          urlsToScrape.slice(1),
        );
      } else {
        scrapedContent = await this.scraper.scrapeMultipleLanguages(url);
      }

      const scrapeTime = Date.now() - scrapeStartTime;

      if (scrapedContent.length === 0) {
        throw new Error("No content could be scraped from the provided URLs");
      }

      console.log(
        chalk.green(
          `✅ Successfully scraped ${scrapedContent.length} pages in ${scrapeTime}ms`,
        ),
      );
      scrapedContent.forEach((content, index) => {
        console.log(
          `   ${index + 1}. ${content.detectedLanguage.toUpperCase()} - ${content.url} (${content.wordCount} words)`,
        );
      });

      if (scrapedContent.length < 2) {
        console.log(
          chalk.yellow(
            "\n⚠️ Translation Analysis Skipped: Only one language found",
          ),
        );
        console.log(chalk.cyan("💡 Try a URL with multiple language versions"));

        const simpleReport = this.generateSingleLanguageReport(
          scrapedContent[0],
        );
        console.log("\n" + simpleReport);

        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const filename = `single-language-analysis-${timestamp}.txt`;
        await this.reportGenerator.saveReport(simpleReport, filename);

        console.log(chalk.green("\n🎉 Single language analysis completed!"));
        return {
          scrapedContent,
          report: simpleReport,
          analysisType: "single-language",
        };
      }

      console.log(
        chalk.yellow("\n🔍 Step 2: Analyzing translation quality..."),
      );
      const analysisStartTime = Date.now();
      const analysisResults =
        await this.analyzer.analyzeTranslationQuality(scrapedContent);
      const analysisTime = Date.now() - analysisStartTime;
      console.log(
        `⏱️ Translation quality analysis completed in ${analysisTime}ms`,
      );

      console.log(
        chalk.yellow("\n📚 Step 3: Analyzing terminology consistency..."),
      );
      const terminologyStartTime = Date.now();
      const terminologyResults =
        await this.analyzer.analyzeTerminologyConsistency(scrapedContent);
      const terminologyTime = Date.now() - terminologyStartTime;
      console.log(`⏱️ Terminology analysis completed in ${terminologyTime}ms`);

      console.log(
        chalk.yellow("\n📄 Step 4: Generating comprehensive report..."),
      );
      const reportStartTime = Date.now();
      const report = this.reportGenerator.generateReport(
        analysisResults,
        terminologyResults,
        scrapedContent,
      );
      const reportTime = Date.now() - reportStartTime;
      console.log(`⏱️ Report generation completed in ${reportTime}ms`);

      console.log("\n" + report);

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `translation-analysis-${timestamp}.txt`;
      await this.reportGenerator.saveReport(report, filename);

      const totalTime = Date.now() - scrapeStartTime;
      console.log(chalk.green(`\n🎉 Analysis completed successfully!`));
      console.log(chalk.cyan(`📊 Performance: ${totalTime}ms total`));

      return {
        analysisResults,
        terminologyResults,
        scrapedContent,
        report,
      };
    } catch (error) {
      console.error(chalk.red(`❌ Analysis failed: ${error.message}`));
      throw error;
    }
  }
}

async function main() {
  console.log(chalk.blue("🔧 Initializing Translation Quality Analyzer..."));
  const analyzer = new TranslationQualityAnalyzer();

  try {
    console.log("🔑 Checking OpenAI API key...");
    if (!process.env.OPENAI_API_KEY) {
      console.error(chalk.red("❌ OpenAI API key not found!"));
      process.exit(1);
    }

    const url = "https://www.bobcat.com/eu/en";
    console.log(`🎯 Starting analysis for: ${url}`);
    console.log(`⏰ Analysis started at: ${new Date().toLocaleString()}`);

    await analyzer.analyzeUrl(url);
    console.log(`⏰ Analysis completed at: ${new Date().toLocaleString()}`);
  } catch (error) {
    console.error(chalk.red(`❌ Error: ${error.message}`));
    process.exit(1);
  }
}

// Run if this file is executed directly
main();

export { TranslationQualityAnalyzer };
