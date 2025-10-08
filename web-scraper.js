import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Web scraper to extract text content from URLs
 */
export class WebScraper {
  constructor() {
    this.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
  }

  /**
   * Extract text content from a webpage
   * @param {string} url - The URL to scrape
   * @returns {Object} - Extracted content and metadata
   */
  async scrapeUrl(url) {
    try {
      console.log(`🔍 Scraping: ${url}`);
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
        },
        timeout: 30000,
        maxRedirects: 5
      });

      const $ = cheerio.load(response.data);
      
      // Remove script and style elements
      $('script, style, nav, footer, header').remove();
      
      // Extract main content
      const title = $('title').text().trim();
      const metaDescription = $('meta[name="description"]').attr('content') || '';
      
      // Get all text content
      const bodyText = $('body').text()
        .replace(/\s+/g, ' ')
        .trim();
      
      // Extract headings
      const headings = [];
      $('h1, h2, h3, h4, h5, h6').each((i, el) => {
        const text = $(el).text().trim();
        const level = el.tagName.toLowerCase();
        if (text) {
          headings.push({ level, text });
        }
      });
      
      // Extract links
      const links = [];
      $('a[href]').each((i, el) => {
        const href = $(el).attr('href');
        const text = $(el).text().trim();
        if (href && text && !href.startsWith('#') && !href.startsWith('javascript:')) {
          links.push({ href, text });
        }
      });
      
      // Extract paragraphs
      const paragraphs = [];
      $('p').each((i, el) => {
        const text = $(el).text().trim();
        if (text && text.length > 10) {
          paragraphs.push(text);
        }
      });
      
      // Detect language
      const htmlLang = $('html').attr('lang') || '';
      const detectedLanguage = this.detectLanguage(bodyText);
      
      return {
        url,
        title,
        metaDescription,
        bodyText,
        headings,
        links,
        paragraphs,
        htmlLang,
        detectedLanguage,
        wordCount: bodyText.split(/\s+/).length,
        scrapedAt: new Date().toISOString()
      };
      
    } catch (error) {
      console.error(`❌ Error scraping ${url}:`, error.message);
      throw new Error(`Failed to scrape URL: ${error.message}`);
    }
  }

  /**
   * Detect language from text content
   * @param {string} text - Text to analyze
   * @returns {string} - Detected language code
   */
  detectLanguage(text) {
    // Simple language detection based on common words
    const languageIndicators = {
      'en': ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'],
      'es': ['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se', 'no', 'te', 'lo'],
      'fr': ['le', 'de', 'et', 'à', 'un', 'il', 'être', 'et', 'en', 'avoir', 'que', 'pour'],
      'de': ['der', 'die', 'das', 'und', 'in', 'den', 'von', 'zu', 'dem', 'mit', 'sich', 'des'],
      'it': ['il', 'di', 'che', 'e', 'la', 'per', 'con', 'da', 'in', 'un', 'del', 'le'],
      'pt': ['o', 'de', 'e', 'do', 'da', 'em', 'um', 'para', 'com', 'não', 'uma', 'os'],
      'nl': ['de', 'het', 'en', 'van', 'in', 'op', 'te', 'voor', 'met', 'een', 'is', 'aan'],
      'pl': ['i', 'w', 'na', 'z', 'do', 'po', 'od', 'za', 'przy', 'dla', 'o', 'do'],
      'ru': ['и', 'в', 'не', 'на', 'я', 'быть', 'с', 'со', 'а', 'как', 'по', 'это'],
      'zh': ['的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一'],
      'ja': ['の', 'に', 'は', 'を', 'た', 'が', 'で', 'て', 'と', 'し', 'れ', 'さ']
    };

    const words = text.toLowerCase().split(/\s+/).slice(0, 1000);
    const scores = {};

    for (const [lang, indicators] of Object.entries(languageIndicators)) {
      scores[lang] = indicators.reduce((score, indicator) => {
        return score + words.filter(word => word === indicator).length;
      }, 0);
    }

    const detectedLang = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    return scores[detectedLang] > 0 ? detectedLang : 'unknown';
  }

  /**
   * Extract text from multiple language versions of a page
   * @param {string} baseUrl - Base URL to analyze
   * @param {Array} languagePaths - Array of language-specific paths
   * @returns {Array} - Array of scraped content for each language
   */
  async scrapeMultipleLanguages(baseUrl, languagePaths = []) {
    const results = [];
    
    // Always include the base URL
    try {
      const baseResult = await this.scrapeUrl(baseUrl);
      results.push(baseResult);
    } catch (error) {
      console.warn(`⚠️ Could not scrape base URL: ${error.message}`);
    }
    
    // Scrape language-specific versions
    for (const path of languagePaths) {
      try {
        const fullUrl = path.startsWith('http') ? path : `${baseUrl}${path}`;
        const result = await this.scrapeUrl(fullUrl);
        results.push(result);
      } catch (error) {
        console.warn(`⚠️ Could not scrape ${path}: ${error.message}`);
      }
    }
    
    return results;
  }
}
