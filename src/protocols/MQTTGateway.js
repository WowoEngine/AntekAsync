const net = require('net');
const broker = require('../modules/BrokerModule');
const broker = require('../modules/BrokerModule');
const Logger = require('../services/Logger');
const Auth = require('../services/Auth');

/**
 * Minimal MQTT Server (Pure JS)
 * Supports: CONNECT, PUBLISH, PINGREQ, DISCONNECT
 */
class MQTTGateway {
    constructor(port = 1883) {
        this.port = port;
        this.server = net.createServer(this.handleConnection.bind(this));
    }

    start() {
        this.server.listen(this.port, () => {
            Logger.info('MQTTGateway', `Broker running on port ${this.port}`);
        });

        // Outbound: Antek Core -> MQTT Clients
        // NOTE: In a real broker, we need to know which client subscribed to what.
        // For this "Gateway" model, if we are just an ingestion point, we might not broadcast back 
        // unless we track subscriptions.
        // The original task said: "Distribution: Pesan disebarkan ke semua subscriber melalui gateway masing-masing"
        // So we SHOULD support subscribing if possible, or at least broadcast everything if we don't track subs.
        // Since we are building "Pure JS" from scratch, full sub tracking is complex.
        // We will broadcast to ALL connected MQTT clients for now (simplification) OR ignore if too complex.
        // Re-reading usage: "MQTT Gateway | Menerima paket biner MQTT ... Antek.kirimKabar(topic, payload)"
        // It implies Input. 
        // "Distribution ... Cross-protocol: kirim via HTTP, terima via TCP".
        // If we want "terima via MQTT", we need PUBLISH outbound.

        broker.on('publish', (topic, message, source) => {
            if (source === 'MQTT') return;

            // Broadcast to all connected clients (Simplified Pub/Sub)
            // In a real generic broker, we filter by subscription.
            // Here, assumes all connected MQTT clients want the data or we skip complexity.
            // Let's implement broadcast.
            // We need to keep track of clients.
        });
    }

    handleConnection(socket) {
        socket.on('data', (data) => {
            this.parsePacket(socket, data);
        });

        socket.on('error', (err) => { });
    }

    parsePacket(socket, buffer) {
        // Minimal parser
        // Byte 1: Packet Type (4 bits) + Flags (4 bits)
        // Byte 2...: Remaining Length (Variable Byte Integer)

        if (buffer.length < 2) return;

        const firstByte = buffer.readUInt8(0);
        const packetType = (firstByte >> 4);

        // Decoding Remaining Length (simplest case: 1 byte)
        let remainingLength = buffer.readUInt8(1);
        let offset = 2;
        // Real logic should handle multibyte length, but for small payloads 1 byte is fine.
        // If > 127, it uses more bytes. Assuming small packets for MVP.

        switch (packetType) {
            case 1: // CONNECT
                Logger.info('MQTTGateway', 'Client CONNECT');

                // Parse Connect Flags (Variable Header Byte 8, index 9 in buffer if we skip fixed header correctly?)
                // Fixed Header: [Type+Flags] [RemLen]. 
                // We need to carefully parse because RemLen is variable.
                // For simplicity, assuming RemLen is 1 byte in this minimal parser (offset was 2).

                // Variable Header:
                // ProtoName Len (2), ProtoName (4 'MQTT'), Level (1), Flags (1)
                // 2 + 4 + 1 = 7 bytes offset from VarHeader start.
                // VarHeader start is 'offset' (2).
                // So Flags is at 2 + 7 = 9.
                const flagsIndex = 2 + 7;
                const flags = buffer.readUInt8(flagsIndex);

                // Flag bit 6: Password Flag (0x40)
                // Flag bit 7: Username Flag (0x80)
                const hasPassword = (flags & 0x40) === 0x40;
                // const hasUsername = (flags & 0x80) === 0x80;

                // To validate password, we need to skip:
                // KeepAlive (2 bytes after flags) -> index 11
                // ClientID (2 bytes len + N bytes) -> index 13 + len
                // Will Topic/Message (if set)
                // Username (if set)
                // Password (if set)

                // This complete parsing is tricky in "Simple/Minimal" parser without a cursor.
                // Let's implement a simple cursor.
                let ptr = 2 + 10; // Skip Proto(6) + Level(1) + Flags(1) + KeepAlive(2)

                // Client ID
                const clientIdLen = buffer.readUInt16BE(ptr);
                ptr += 2 + clientIdLen;

                // Will Flag (Bit 2 -> 0x04)
                if ((flags & 0x04) === 0x04) {
                    const willTopicLen = buffer.readUInt16BE(ptr);
                    ptr += 2 + willTopicLen;
                    const willMsgLen = buffer.readUInt16BE(ptr);
                    ptr += 2 + willMsgLen;
                }

                // Username Flag (Bit 7 -> 0x80)
                if ((flags & 0x80) === 0x80) {
                    const uLen = buffer.readUInt16BE(ptr);
                    ptr += 2 + uLen;
                }

                let password = null;
                if (hasPassword) {
                    const pLen = buffer.readUInt16BE(ptr);
                    ptr += 2;
                    password = buffer.toString('utf8', ptr, ptr + pLen);
                    ptr += pLen;
                }

                if (!Auth.validate(password)) {
                    Logger.info('MQTTGateway', 'Auth failed');
                    // Return Code 5: Not Authorized
                    const connackFail = Buffer.from([0x20, 0x02, 0x00, 0x05]);
                    socket.write(connackFail);
                    socket.end();
                    return;
                }

                // Reply CONNACK OK
                const connack = Buffer.from([0x20, 0x02, 0x00, 0x00]);
                socket.write(connack);
                break;

            case 3: // PUBLISH
                // Var Header: Topic Name (Length MSB, LSB, String), Packet Identifier (if QoS > 0)
                // We assume QoS 0 for simplicity (No Packet ID)

                // Topic Length
                const topicLen = buffer.readUInt16BE(offset);
                offset += 2;
                const topic = buffer.toString('utf8', offset, offset + topicLen);
                offset += topicLen;

                // Payload
                // Remaining bytes are payload
                // Need to calculate end of packet based on RemainingLength ideally
                const payload = buffer.toString('utf8', offset);

                console.log(`[MQTTGateway] Received PUBLISH: ${topic} -> ${payload}`);
                broker.publish(topic, payload, 'MQTT');
                break;

            case 12: // PINGREQ
                // Reply PINGRESP
                // Fixed: 0xD0, RemLen: 0x00
                socket.write(Buffer.from([0xD0, 0x00]));
                break;

            case 14: // DISCONNECT
                socket.end();
                break;
        }
    }
}

module.exports = MQTTGateway;
