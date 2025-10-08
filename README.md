# AI Translation Quality Analyzer

An advanced AI-powered tool for analyzing translation quality across multiple language versions of websites. Detects linguistic errors, translation inconsistencies, terminology issues, and brand name inconsistencies using OpenAI's GPT models.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure your OpenAI API key:**
   - Copy `env.example` to `.env`
   - Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
   - Add your API key to the `.env` file:
     ```
     OPENAI_API_KEY=your_actual_api_key_here
     ```

## Usage

### Analyze a specific URL:
```bash
npm run analyze https://example.com
# or
node translation-analyzer.js https://example.com
```

### Analyze Bobcat website with EU languages:
```bash
npm run test-bobcat
# or
node translation-analyzer.js
```

### Run the basic demo:
```bash
npm start
# or
npm run demo
```

## Features

### 🔍 Translation Quality Analysis
- **Grammar & Syntax Detection** - Identifies grammatical errors and syntax issues
- **Translation Accuracy** - Compares translations against baseline (English)
- **Fluency Assessment** - Evaluates naturalness and readability
- **Cultural Appropriateness** - Checks for cultural context issues

### 📚 Terminology & Brand Consistency
- **Terminology Analysis** - Detects inconsistent technical terms
- **Brand Name Consistency** - Ensures consistent brand representation
- **Style Guide Compliance** - Identifies deviations from established guidelines

### 📊 Comprehensive Reporting
- **Quality Scoring** - 0-100 quality scores for each language
- **Issue Categorization** - Critical, high, medium, low severity levels
- **Actionable Suggestions** - Specific recommendations for improvement
- **Visual Reports** - Color-coded console output and saved text reports

## Project Structure

```
translator/
├── package.json              # Project dependencies and scripts
├── demo.js                   # Basic OpenAI SDK demonstration
├── translation-analyzer.js   # Main analysis tool (CLI)
├── web-scraper.js           # Web scraping functionality
├── translation-analyzer.js   # AI-powered translation analysis
├── report-generator.js      # Report generation and formatting
├── env.example              # Environment variables template
└── README.md                # This file
```

## Requirements

- Node.js (version 14 or higher)
- OpenAI API key
- Internet connection

## Example Output

The tool generates comprehensive reports like this:

```
🌐 TRANSLATION QUALITY ANALYSIS REPORT
================================================================================

📊 Analysis Summary:
• Generated: 12/7/2023, 2:30:45 PM
• Pages Analyzed: 5
• Baseline Language: EN
• Overall Quality Score: 78/100
• Total Issues Found: 12
• Critical Issues: 2

📋 EXECUTIVE SUMMARY
✅ GOOD - Translation quality is good with some minor issues to address.

Key Findings:
• Quality Score: 78/100
• Total Issues: 12
• Critical Issues: 2
• Terminology Consistency: 85/100
```

## Testing the Tool

The tool is specifically designed to test on the Bobcat website with EU languages:

```bash
npm run test-bobcat
```

This will analyze:
- English (baseline)
- German, French, Spanish, Italian
- Dutch, Polish, Portuguese
- Swedish, Danish, Norwegian, Finnish

## Next Steps

Extend this tool by:

- Adding support for more languages
- Implementing custom terminology dictionaries
- Creating web-based dashboard
- Adding automated testing workflows
- Integrating with translation management systems