# Translator - OpenAI SDK Demo

A quick JavaScript project demonstrating the OpenAI SDK with various examples including text completion, translation, creative writing, and code explanation.

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

Run the demonstration script:

```bash
npm start
# or
npm run demo
# or
node demo.js
```

## What the Demo Includes

The demonstration script (`demo.js`) showcases:

1. **Text Completion** - Basic AI text generation
2. **Translation** - Text translation between languages
3. **Creative Writing** - AI-generated creative content (haiku)
4. **Code Explanation** - AI explaining JavaScript code

## Project Structure

```
translator/
├── package.json          # Project dependencies and scripts
├── demo.js              # Main demonstration script
├── env.example          # Environment variables template
└── README.md            # This file
```

## Requirements

- Node.js (version 14 or higher)
- OpenAI API key
- Internet connection

## Next Steps

This is a basic setup to get you started. You can extend this project by:

- Adding more sophisticated translation features
- Implementing conversation flows
- Adding error handling and retry logic
- Creating a web interface
- Adding support for different AI models