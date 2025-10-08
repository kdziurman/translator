"""Web scraping module for extracting text content from URLs."""

import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from typing import Dict, List, Optional
import logging
from config import REQUEST_TIMEOUT, USER_AGENT, MAX_CONTENT_LENGTH

logger = logging.getLogger(__name__)


class WebScraper:
    """Handles web scraping and content extraction."""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': USER_AGENT,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
        })
    
    def extract_text_content(self, url: str) -> Dict[str, str]:
        """
        Extract text content from a webpage.
        
        Args:
            url: The URL to scrape
            
        Returns:
            Dictionary containing extracted text and metadata
        """
        try:
            response = self.session.get(url, timeout=REQUEST_TIMEOUT)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Remove script and style elements
            for script in soup(["script", "style"]):
                script.decompose()
            
            # Extract text content
            text_content = soup.get_text()
            
            # Clean up whitespace
            lines = (line.strip() for line in text_content.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            text_content = ' '.join(chunk for chunk in chunks if chunk)
            
            # Limit content length
            if len(text_content) > MAX_CONTENT_LENGTH:
                text_content = text_content[:MAX_CONTENT_LENGTH]
                logger.warning(f"Content truncated to {MAX_CONTENT_LENGTH} characters")
            
            # Extract metadata
            title = soup.find('title')
            title_text = title.get_text().strip() if title else ""
            
            # Extract meta description
            meta_desc = soup.find('meta', attrs={'name': 'description'})
            description = meta_desc.get('content', '').strip() if meta_desc else ""
            
            # Extract language from HTML lang attribute
            html_lang = soup.find('html', attrs={'lang': True})
            detected_lang = html_lang.get('lang', '') if html_lang else ""
            
            return {
                'url': url,
                'title': title_text,
                'description': description,
                'content': text_content,
                'html_lang': detected_lang,
                'content_length': len(text_content)
            }
            
        except requests.RequestException as e:
            logger.error(f"Failed to fetch URL {url}: {e}")
            raise Exception(f"Failed to fetch webpage: {e}")
        except Exception as e:
            logger.error(f"Error processing URL {url}: {e}")
            raise Exception(f"Error processing webpage: {e}")
    
    def find_language_links(self, base_url: str, content: str) -> List[Dict[str, str]]:
        """
        Find language-specific links on a webpage.
        
        Args:
            base_url: The base URL of the page
            content: The HTML content of the page
            
        Returns:
            List of dictionaries containing language links and their languages
        """
        soup = BeautifulSoup(content, 'html.parser')
        language_links = []
        
        # Common patterns for language links
        language_patterns = [
            'lang-', 'language-', 'locale-', 'region-',
            'en/', 'es/', 'fr/', 'de/', 'it/', 'pt/',
            'english', 'spanish', 'french', 'german', 'italian'
        ]
        
        # Look for links that might indicate language versions
        links = soup.find_all('a', href=True)
        
        for link in links:
            href = link.get('href', '')
            text = link.get_text().strip().lower()
            
            # Check if link contains language indicators
            for pattern in language_patterns:
                if pattern in href.lower() or pattern in text:
                    full_url = urljoin(base_url, href)
                    language_links.append({
                        'url': full_url,
                        'text': text,
                        'href': href
                    })
                    break
        
        return language_links
