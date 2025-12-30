const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function checkQuota() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ No GEMINI_API_KEY found in .env");
        return;
    }

    console.log(`🔑 Testing API Key: ${apiKey.substring(0, 5)}...`);
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
        console.log("📡 Sending test request...");
        const start = Date.now();
        const result = await model.generateContent("Hello, are you working?");
        const response = await result.response;
        const text = response.text();
        const duration = Date.now() - start;

        console.log(`✅ Success! Response time: ${duration}ms`);
        console.log(`📝 Output: "${text.trim()}"`);
    } catch (error) {
        console.error("\n❌ API Request Failed!");
        console.error(`Error Name: ${error.name}`);
        console.error(`Error Message: ${error.message}`);

        if (error.response) {
            console.error("\n🔍 Detailed Response Error:");
            console.log(JSON.stringify(error.response, null, 2));
        }

        if (error.message.includes("429")) {
            console.log("\n⚠️ QUOTA EXCEEDED (429): You have hit the rate limit.");
            console.log("Common Limits for Free Tier (Gemini 1.5 Flash):");
            console.log("- 15 Requests Per Minute (RPM)");
            console.log("- 1,500 Requests Per Day (RPD)");
        }
    }
}

checkQuota();
