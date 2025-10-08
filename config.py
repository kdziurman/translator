"""Configuration settings for the Linguistic Analysis Tool."""

import os
from dotenv import load_dotenv

load_dotenv()

# API Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Analysis Configuration
DEFAULT_BASELINE_LANGUAGE = "en"
SUPPORTED_LANGUAGES = ["en", "es", "fr", "de", "it", "pt", "nl", "pl", "cs", "sk", "hu", "ro", "bg", "hr", "sl", "et", "lv", "lt"]

# Web Scraping Configuration
REQUEST_TIMEOUT = 30
MAX_CONTENT_LENGTH = 100000  # Maximum characters to analyze
USER_AGENT = "Linguistic Analysis Tool 1.0"

# AI Analysis Configuration
MAX_TOKENS_PER_REQUEST = 4000
TEMPERATURE = 0.3  # Lower temperature for more consistent analysis
