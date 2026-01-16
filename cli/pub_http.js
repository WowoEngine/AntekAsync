const http = require('http');

const topic = process.argv[2];
const message = process.argv[3];
const key = process.argv[4];

if (!topic || !message) {
    console.error('Usage: node cli/pub_http.js <topic> <message> [key]');
    process.exit(1);
}

const req = http.request({
    hostname: '127.0.0.1',
    port: 3000,
    path: `/publish?topic=${encodeURIComponent(topic)}`,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': key ? `Bearer ${key}` : undefined
    }
}, (res) => {
    let responseData = '';
    res.on('data', chunk => responseData += chunk);
    res.on('end', () => {
        console.log(`[HTTP] Status: ${res.statusCode}`);
        console.log(`[HTTP] Response: ${responseData}`);
    });
});

req.on('error', (e) => {
    console.error(`[HTTP] Error: ${e.message}`);
});

req.write(JSON.stringify({ payload: message }));
req.end();
