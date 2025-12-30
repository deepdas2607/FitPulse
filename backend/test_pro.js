const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function testPro() {
    console.log("Testing gemini-pro...");
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hello");
        const response = await result.response;
        console.log("SUCCESS: " + response.text());
    } catch (e) {
        console.log("FAILURE: " + e.message);
        if (e.message.includes("429")) console.log("RATE_LIMIT");
        if (e.message.includes("not found")) console.log("NOT_FOUND");
    }
}
testPro();
