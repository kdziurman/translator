# AI Linguistic Analysis Tool

An AI-powered tool that analyzes web pages for linguistic errors, translation quality, and terminology consistency.

## Features

- **Web Content Analysis**: Extracts and analyzes text content from any URL
- **Translation Quality Assessment**: Compares different language versions against English baseline
- **Linguistic Error Detection**: Identifies grammatical errors, typos, and awkward phrasing
- **Terminology Consistency**: Flags inconsistent terminology and brand names across translations
- **Smart Suggestions**: Provides intelligent recommendations for improvements
- **Comprehensive Reports**: Generates detailed analysis reports with highlighted issues

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env and add your OpenAI API key
   ```

## Usage

```bash
python linguistic_analyzer.py analyze https://www.bobcat.com/regions
```

## Testing

The tool has been tested with the Bobcat website (https://www.bobcat.com/regions) which offers multiple language options for comprehensive analysis.
