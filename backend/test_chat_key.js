require('dotenv').config();
const { OpenAI } = require('openai');

async function testKey() {
    console.log('--- Testing API Key Connection ---');

    // 1. Logic from server.js
    let apiKey = process.env.OPENAI_API_KEY;
    let baseURL = undefined;

    if (!apiKey) {
        const fallbackKey = process.env.AIML_API_KEY;
        if (fallbackKey && fallbackKey.startsWith('sk-')) {
            console.log('Logic: Detected OpenAI key in AIML_API_KEY');
            apiKey = fallbackKey;
            baseURL = undefined;
        } else if (fallbackKey) {
            console.log('Logic: Using AIML_API_KEY as AIML');
            apiKey = fallbackKey;
            baseURL = "https://api.aimlapi.com/v1";
        }
    } else if (apiKey.startsWith('sk-')) {
        console.log('Logic: OPENAI_API_KEY set and starts with sk-');
        baseURL = undefined;
    }

    if (!apiKey) {
        console.error('❌ NO API KEY FOUND');
        return;
    }

    console.log(`Key Prefix: ${apiKey.substring(0, 7)}...`);
    console.log(`Base URL: ${baseURL || 'Default (OpenAI)'}`);

    const openai = new OpenAI({
        apiKey: apiKey,
        baseURL: baseURL,
    });

    try {
        console.log('Sending test request...');
        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: "Say hello" }],
            model: "gpt-4o",
        });
        console.log('✅ SUCCESS!');
        console.log('Response:', completion.choices[0].message.content);
    } catch (error) {
        console.error('❌ FAILED');
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Data:', error.response.data);
        }
    }
}

testKey();
