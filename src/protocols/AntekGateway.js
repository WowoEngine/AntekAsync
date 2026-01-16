const net = require('net');
const broker = require('../modules/BrokerModule');
const broker = require('../modules/BrokerModule');
const Logger = require('../services/Logger');
const Auth = require('../services/Auth');

class AntekTCP {
    constructor(port = 4000) {
        this.port = port;
        this.server = net.createServer(this.handleConnection.bind(this));
    }

    start() {
        this.server.listen(this.port, () => {
            Logger.info('AntekTCP', `Listening on port ${this.port}`);
        });
    }

    handleConnection(socket) {
        Logger.info('AntekTCP', 'Client connected');

        socket.on('data', (data) => {
            const message = data.toString().trim();
            // Format: CMD|topic|payload
            // Example: PUB|suhu|30
            const parts = message.split('|');
            const cmd = parts[0];

            if (cmd === 'PUB' && parts.length >= 3) {
                const topic = parts[1];
                const payload = parts.slice(2).join('|'); // Join back in case payload contained |
                console.log(`[AntekTCP] Received PUB: ${topic} -> ${payload}`);
                broker.publish(topic, payload, 'TCP');
            } else if (cmd === 'SUB' && parts.length >= 2) {
                const topic = parts[1];
                console.log(`[AntekTCP] Client subscribing to: ${topic}`);
                // Wrapper to send data back to this specific socket
                const subscriber = (msg) => {
                    // Send back: MSG|topic|payload
                    if (!socket.destroyed) {
                        socket.write(`MSG|${topic}|${msg}\n`);
                    }
                };
                broker.subscribe(topic, subscriber);

                // Handle cleanup on disconnect
                socket.on('close', () => {
                    broker.unsubscribe(topic, subscriber);
                });
            } else {
                console.log('[AntekTCP] Unknown format:', message);
            }
        });

        socket.on('error', (err) => {
            console.error('[AntekTCP] Socket error:', err);
        });
    }
}

module.exports = AntekGateway;
