import axios from "axios";
import * as cheerio from "cheerio";

/**
 * Web scraper to extract text content from URLs
 */
export class WebScraper {
  constructor() {
    this.userAgent =
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";
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
          "User-Agent": this.userAgent,
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          "Accept-Encoding": "gzip, deflate",
          Connection: "keep-alive",
        },
        timeout: 30000,
        maxRedirects: 5,
      });

      const $ = cheerio.load(response.data);

      // Remove script and style elements
      $("script, style, nav, footer, header").remove();

      // Extract main content
      const title = $("title").text().trim();
      const metaDescription =
        $('meta[name="description"]').attr("content") || "";

      // Get all text content
      const bodyText = $("body").text().replace(/\s+/g, " ").trim();

      // Extract headings
      const headings = [];
      $("h1, h2, h3, h4, h5, h6").each((i, el) => {
        const text = $(el).text().trim();
        const level = el.tagName.toLowerCase();
        if (text) {
          headings.push({ level, text });
        }
      });

      // Extract links
      const links = [];
      $("a[href]").each((i, el) => {
        const href = $(el).attr("href");
        const text = $(el).text().trim();
        if (
          href &&
          text &&
          !href.startsWith("#") &&
          !href.startsWith("javascript:")
        ) {
          links.push({ href, text });
        }
      });

      // Extract paragraphs
      const paragraphs = [];
      $("p").each((i, el) => {
        const text = $(el).text().trim();
        if (text && text.length > 10) {
          paragraphs.push(text);
        }
      });

      // Detect language from HTML lang attribute
      const htmlLang = $("html").attr("lang") || "";
      const detectedLanguage = htmlLang.split('-')[0] || 'unknown';

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
        scrapedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`❌ Error scraping ${url}:`, error.message);
      throw new Error(`Failed to scrape URL: ${error.message}`);
    }
  }


  /**
   * Extract text from multiple language versions of a page
   * @param {string} baseUrl - Base URL to analyze
   * @param {Array} languageUrls - Array of full language-specific URLs
   * @returns {Array} - Array of scraped content for each language
   */
  async scrapeMultipleLanguages(baseUrl, languageUrls = []) {
    const results = [];

    // Always include the base URL
    try {
      const baseResult = await this.scrapeUrl(baseUrl);
      results.push(baseResult);
      console.log(`✅ Base URL scraped successfully`);
    } catch (error) {
      console.warn(`⚠️ Could not scrape base URL: ${error.message}`);
    }

    // Scrape language-specific versions
    if (languageUrls.length > 0) {
      console.log(
        `🌍 Scraping ${languageUrls.length} language-specific URLs...`,
      );

      for (let i = 0; i < languageUrls.length; i++) {
        const langUrl = languageUrls[i];
        try {
          console.log(
            `📥 Scraping ${i + 1}/${languageUrls.length}: ${langUrl}`,
          );
          const result = await this.scrapeUrl(langUrl);
          results.push(result);
          console.log(`✅ Language URL scraped successfully`);
        } catch (error) {
          console.warn(`⚠️ Could not scrape ${langUrl}: ${error.message}`);
        }
      }
    }

    console.log(`📊 Total content scraped: ${results.length} pages`);
    return results;
  }
}
