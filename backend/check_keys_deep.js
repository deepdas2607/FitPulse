const fs = require('fs');
require('dotenv').config();

const status = {};
const keys = ['OPENAI_API_KEY', 'AIML_API_KEY', 'GEMINI_API_KEY'];

keys.forEach(key => {
    const val = process.env[key];
    if (val) {
        status[key] = {
            present: true,
            length: val.length,
            prefix: val.substring(0, 7)
        };
    } else {
        status[key] = { present: false };
    }
});

fs.writeFileSync('key_status.json', JSON.stringify(status, null, 2));
console.log('Status written to key_status.json');
