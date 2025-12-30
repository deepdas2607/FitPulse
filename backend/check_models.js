const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function checkModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);

    const candidates = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-pro",
        "gemini-pro",
        "gemini-1.0-pro"
    ];

    console.log("🔍 Testing Model Availability...");

    for (const modelName of candidates) {
        console.log(`\n👉 Testing: ${modelName}`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Test.");
            const response = await result.response;
            console.log(`✅ SUCCESS! ${modelName} is working.`);
            return; // Exit on first success
        } catch (error) {
            console.log(`❌ Failed: ${error.message.split(' ')[0]}... (Error)`);
        }
    }
}

checkModels();
