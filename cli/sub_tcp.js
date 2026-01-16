const AntekClient = require('../src/client/AntekClient');

// Usage: node cli/sub_tcp.js <topic> [key] [host] [port]
// Or: node cli/sub_tcp.js <uri>

const arg1 = process.argv[2];
const arg2 = process.argv[3];
const arg3 = process.argv[4];
const arg4 = process.argv[5];

if (!arg1) {
    console.error('Usage: node cli/sub_tcp.js <topic> [key] [host] [port]');
    console.error('   OR: node cli/sub_tcp.js <uri>');
    process.exit(1);
}

let uri;
let topic;

if (arg1.startsWith('antekasync://')) {
    uri = arg1;
    // If URI is provided, we need to know what topic to subscribe to?
    // Protocol doesn't specify topic in URI?
    // Let's assume the user still needs to provide topic if not encoded in URI (which it isn't standardly)
    // Actually, let's keep it simple: First arg is ALWAYS topic, consistent with other tools.
    // If user wants to use URI, maybe we change the args?
    // Let's stick to the previous plan: topic is first.
}

// Re-evaluating args based on standard: node cli/sub_tcp.js <topic> [key] [host] [port]
topic = arg1;
const key = arg2;
const host = arg3 || '127.0.0.1';
const port = arg4 || 4000;

// Construct URI
uri = `antekasync://${key ? key + '@' : ''}${host}:${port}`;

console.log(`[CLI] Target: ${uri}`);

const client = new AntekClient();

client.on('connected', () => {
    console.log(`[TCP] Connected to ${host}:${port}`);
});

client.on('authenticated', () => {
    console.log(`[TCP] Authenticated.`);
});

client.on('message', (tpc, msg) => {
    console.log(`[TCP] Received [${tpc}]: ${msg}`);
});

client.on('error', (err) => {
    console.error(`[TCP] Error: ${err.message}`);
});

console.log(`[TCP] Connecting...`);
client.connect(uri);

// Subscribe immediately (Client handles buffering/queueing if not connected yet)
console.log(`[TCP] Subscribing to: ${topic}`);
client.subscribe(topic);
