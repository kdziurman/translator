import OpenAI from "openai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function demonstrateOpenAI() {
  try {
    console.log("🚀 OpenAI SDK Demonstration\n");

    // Example 1: Simple text completion
    console.log("1. Text Completion Example:");
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: "Explain what artificial intelligence is in one sentence.",
        },
      ],
      max_tokens: 100,
    });

    console.log("Response:", completion.choices[0].message.content);
    console.log("");

    // Example 2: Translation (fitting for a translator project)
    console.log("2. Translation Example:");
    const translation = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content:
            "Translate the following text to Spanish: 'Hello, how are you today?'",
        },
      ],
      max_tokens: 50,
    });

    console.log("Translation:", translation.choices[0].message.content);
    console.log("");

    // Example 3: Creative writing
    console.log("3. Creative Writing Example:");
    const creative = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: "Write a short haiku about programming.",
        },
      ],
      max_tokens: 50,
    });

    console.log("Haiku:", creative.choices[0].message.content);
    console.log("");

    // Example 4: Code explanation
    console.log("4. Code Explanation Example:");
    const codeExplanation = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content:
            "Explain what this JavaScript code does: const result = array.map(x => x * 2).filter(x => x > 10);",
        },
      ],
      max_tokens: 100,
    });

    console.log(
      "Code Explanation:",
      codeExplanation.choices[0].message.content,
    );
    console.log("");

    console.log("✅ All demonstrations completed successfully!");
  } catch (error) {
    console.error("❌ Error occurred:", error.message);

    if (error.code === "invalid_api_key") {
      console.log("\n💡 Make sure to:");
      console.log("1. Create a .env file with your OpenAI API key");
      console.log("2. Add OPENAI_API_KEY=your_api_key_here to the .env file");
      console.log(
        "3. Get your API key from https://platform.openai.com/api-keys",
      );
    }
  }
}

// Run the demonstration
demonstrateOpenAI();
