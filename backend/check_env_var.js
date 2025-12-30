require('dotenv').config();

console.log('Checking environment variables...');
if (process.env.GEMINI_API_KEY) {
    console.log('GEMINI_API_KEY is set (Length: ' + process.env.GEMINI_API_KEY.length + ')');
} else {
    console.log('GEMINI_API_KEY is MISSING');
}
