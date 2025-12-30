require('dotenv').config();
const { OpenAI } = require('openai');

async function testDirectOpenAI() {
    console.log('Testing Key against OFFICIAL OpenAI API (api.openai.com)...');

    // Grab the key that exists
    const apiKey = process.env.AIML_API_KEY || process.env.OPENAI_API_KEY;

    if (!apiKey) {
        console.error('No key found to test.');
        return;
    }

    console.log(`Using key prefix: ${apiKey.substring(0, 5)}...`);

    const openai = new OpenAI({
        apiKey: apiKey,
        // No baseURL means default https://api.openai.com/v1
    });

    try {
        await openai.chat.completions.create({
            messages: [{ role: "user", content: "Hi" }],
            model: "gpt-4o", // standard model
        });
        console.log('✅ SUCCESS against OpenAI Direct! (Unexpected)');
    } catch (error) {
        console.log('❌ FAILED against OpenAI Direct.');
        console.log('Error Status:', error.status);
        console.log('Error Code:', error.code);
        console.log('Error Message:', error.message);
    }
}

testDirectOpenAI();
