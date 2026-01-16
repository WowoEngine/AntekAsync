const net = require('net');

const topic = process.argv[2];
const message = process.argv[3];

if (!topic || !message) {
    console.error('Usage: node cli/pub_mqtt.js <topic> <message>');
    process.exit(1);
}

const client = new net.Socket();

client.connect(1883, '127.0.0.1', () => {
    // 1. Send CONNECT
    // Protocol Name: MQTT (4 bytes)
    // Protocol Level: 4 (3.1.1)
    // Connect Flags: 0x02 (Clean Session)
    // Keep Alive: 60s (0x003C)
    // Client ID: 'CLI-PUB' (7 chars)

    // Fixed Header: 0x10 (CONNECT), RemLen
    // Var Header + Payload

    const varHeader = Buffer.from([
        0x00, 0x04, 0x4D, 0x51, 0x54, 0x54, // Protocol Name
        0x04, // Level
        0x02, // Flags
        0x00, 0x3C // Keep Alive
    ]);

    const clientId = Buffer.from('CLI-PUB');
    const clientIdLen = Buffer.alloc(2);
    clientIdLen.writeUInt16BE(clientId.length);

    const payload = Buffer.concat([clientIdLen, clientId]);
    const remLen = varHeader.length + payload.length;

    const fixedHeader = Buffer.from([0x10, remLen]);

    client.write(Buffer.concat([fixedHeader, varHeader, payload]));
});

client.on('data', (data) => {
    const type = (data[0] >> 4);

    if (type === 2) { // CONNACK
        console.log('[MQTT] Connected (CONNACK received)');

        // 2. Send PUBLISH
        // Fixed: 0x30 (PUBLISH QoS 0)
        // Var Header: Topic Name
        // Payload: Message

        const topicBuf = Buffer.from(topic);
        const topicLen = Buffer.alloc(2);
        topicLen.writeUInt16BE(topicBuf.length);

        const msgBuf = Buffer.from(message);

        const remLen = 2 + topicBuf.length + msgBuf.length;

        // Handle RemLen > 127 ?? For CLI simple tool, assume message is short
        if (remLen > 127) {
            console.error('[MQTT] Message too long for simple CLI implementation');
            process.exit(1);
        }

        const fixedHeader = Buffer.from([0x30, remLen]);

        client.write(Buffer.concat([fixedHeader, topicLen, topicBuf, msgBuf]));
        console.log(`[MQTT] Published to ${topic}: ${message}`);

        setTimeout(() => {
            console.log('[MQTT] Disconnecting...');
            // DISCONNECT (0xE0, 0x00)
            client.write(Buffer.from([0xE0, 0x00]));
            client.end();
            process.exit(0);
        }, 100);
    }
});

client.on('error', (err) => {
    console.error(`[MQTT] Error: ${err.message}`);
});
