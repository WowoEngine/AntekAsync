const net = require('net');
const http = require('http');

function runTests() {
    console.log('[TEST] Starting verification...');

    // 1. Setup TCP Subscriber
    const tcpClient = new net.Socket();
    tcpClient.connect(4000, '127.0.0.1', () => {
        console.log('[TEST] TCP Connected');
        tcpClient.write('SUB|test_topic\n');
    });

    tcpClient.on('data', (data) => {
        console.log(`[TEST] TCP Received: ${data.toString().trim()}`);
    });

    // 2. HTTP Publish after small delay
    setTimeout(() => {
        console.log('[TEST] Sending HTTP POST...');
        const req = http.request({
            hostname: '127.0.0.1',
            port: 3000,
            path: '/publish?topic=test_topic',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }, (res) => {
            res.on('data', d => console.log('[TEST] HTTP Response:', d.toString()));
        });
        req.write(JSON.stringify({ payload: 'Hello from HTTP' }));
        req.end();
    }, 1000);

    // 3. MQTT Publish after more delay
    setTimeout(() => {
        console.log('[TEST] Sending MQTT Publish...');
        const mqttClient = new net.Socket();
        mqttClient.connect(1883, '127.0.0.1', () => {
            // Send CONNECT
            // Fixed: 0x10, Rem: 12 ... 
            // ProtoName(6): 00 04 'M' 'Q' 'T' 'T'
            // Version(1): 04
            // Flags(1): 02 (Clean Session)
            // KeepAlive(2): 00 3C
            // ClientID(2+3): 00 03 'T' 'S' 'T'
            // Total RemLen = 6 + 1 + 1 + 2 + 5 = 15 (0x0F)
            const connectPacket = Buffer.from([
                0x10, 0x0F,
                0x00, 0x04, 0x4D, 0x51, 0x54, 0x54,
                0x04, 0x02, 0x00, 0x3C,
                0x00, 0x03, 0x54, 0x53, 0x54
            ]);
            mqttClient.write(connectPacket);

            // Wait for CONNACK? Assumed ok for test
            setTimeout(() => {
                // Send PUBLISH
                // Topic: test_topic
                // Payload: Hello from MQTT
                const topic = 'test_topic';
                const payload = 'Hello from MQTT';

                // Fixed: 0x30 (Pub, QoS 0)
                // RemLen: 2 + topicLen + payloadLen
                const topicLen = Buffer.byteLength(topic);
                const payloadLen = Buffer.byteLength(payload);
                const remLen = 2 + topicLen + payloadLen;

                const head = Buffer.from([0x30, remLen, 0x00, topicLen]); // 0x00, topicLen is MSB LSB
                const topicBuf = Buffer.from(topic);
                const payloadBuf = Buffer.from(payload);

                mqttClient.write(Buffer.concat([head, topicBuf, payloadBuf]));
                console.log('[TEST] MQTT Data sent');

                mqttClient.end();
            }, 500);
        });
    }, 2000);
}

runTests();
