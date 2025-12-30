const { OpenAI } = require("openai");
require("dotenv").config();

async function testAIML() {
    console.log("🚀 Testing AIMLAPI Connection...");

    const apiKey = process.env.AIML_API_KEY;
    if (!apiKey) {
        console.error("❌ ERROR: AIML_API_KEY is missing in .env file.");
        return;
    }
    if (apiKey === 'your_key_here') {
        console.error("❌ ERROR: You haven't replaced 'your_key_here' with your actual API key in backend/.env!");
        return;
    }

    console.log(`🔑 Key found: ${apiKey.substring(0, 5)}...`);

    const openai = new OpenAI({
        apiKey: apiKey,
        baseURL: "https://api.aimlapi.com/v1",
    });

    try {
        console.log("📡 Sending request to gpt-4o...");
        const chatCompletion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "user", content: "Hello! Are you working?" }
            ],
            temperature: 0.7,
            max_tokens: 50,
        });

        console.log("✅ SUCCESS!");
        console.log("🤖 Response:", chatCompletion.choices[0].message.content);
    } catch (error) {
        console.error("❌ FAILURE:", error.message);
        if (error.response) {
            console.error("Details:", error.response.data);
        }
    }
}

testAIML();
