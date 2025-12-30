require('dotenv').config();

console.log('Checking for OpenAI-related environment variables...');
const keysToCheck = ['OPENAI_API_KEY', 'AIML_API_KEY', 'GEMINI_API_KEY'];

keysToCheck.forEach(key => {
    if (process.env[key]) {
        console.log(`${key} is SET (Length: ${process.env[key].length})`);
    } else {
        console.log(`${key} is MISSING`);
    }
});
