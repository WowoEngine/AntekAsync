const net = require('net');
const EventEmitter = require('events');

/**
 * AntekClient
 * Standard client for "antekasync://" protocol.
 * Handles URI parsing, connection, authentication, and buffering.
 */
class AntekClient extends EventEmitter {
    constructor() {
        super();
        this.socket = null;
        this.buffer = '';
        this.isAuthenticated = false;
        this.pendingSubs = [];
    }

    /**
     * Connect to an AntekAsync Broker
     * @param {string} uri - Format: antekasync://[key@]host:port
     */
    connect(uri) {
        // Parse URI
        // Regex: antekasync:\/\/(([^@]+)@)?([^:]+):(\d+)
        const match = uri.match(/antekasync:\/\/(([^@]+)@)?([^:]+):(\d+)/);

        if (!match) {
            this.emit('error', new Error('Invalid URI format. Expected: antekasync://[key@]host:port'));
            return;
        }

        const key = match[2]; // Capturing group 2 is key (if present)
        const host = match[3];
        const port = parseInt(match[4]);

        this.socket = new net.Socket();

        this.socket.connect(port, host, () => {
            this.emit('connected');
            if (key) {
                this.socket.write(`AUTH|${key}\n`);
            } else {
                // If no key, we assume auth is provided or not needed? 
                // Wait for potential challenge or just consider authenticated if server doesn't complain?
                // For now, assume good.
                this.isAuthenticated = true;
                this.flushPendingSubs();
            }
        });

        this.socket.on('data', (chunk) => {
            this.buffer += chunk.toString();

            let lineEnd;
            while ((lineEnd = this.buffer.indexOf('\n')) !== -1) {
                const line = this.buffer.substring(0, lineEnd).trim();
                this.buffer = this.buffer.substring(lineEnd + 1);

                if (line) this.handleLine(line);
            }
        });

        this.socket.on('close', () => this.emit('close'));
        this.socket.on('error', (err) => this.emit('error', err));
    }

    handleLine(line) {
        const parts = line.split('|');
        const cmd = parts[0];

        if (cmd === 'AUTH') {
            if (parts[1] === 'OK') {
                this.isAuthenticated = true;
                this.emit('authenticated');
                this.flushPendingSubs();
            } else {
                this.emit('error', new Error('Authentication failed'));
                this.socket.destroy();
            }
        } else if (cmd === 'MSG') {
            const topic = parts[1];
            const payload = parts.slice(2).join('|');
            this.emit('message', topic, payload);
        } else if (cmd === 'ERROR') {
            this.emit('error', new Error(`Server Error: ${parts[1]}`));
        }
    }

    subscribe(topic) {
        if (this.isAuthenticated) {
            this.socket.write(`SUB|${topic}\n`);
        } else {
            this.pendingSubs.push(topic);
        }
    }

    publish(topic, message) {
        if (this.isAuthenticated) {
            // Need PUB command in protocol if client wants to publish via TCP?
            // "AntekTCP ... Menerima raw string PUB|topic|pesan" - YES.
            this.socket.write(`PUB|${topic}|${message}\n`);
        } else {
            // Should queue? For now just warn or drop
            this.emit('error', new Error('Cannot publish: Not authenticated'));
        }
    }

    flushPendingSubs() {
        while (this.pendingSubs.length > 0) {
            const topic = this.pendingSubs.shift();
            this.socket.write(`SUB|${topic}\n`);
        }
    }
}

module.exports = AntekClient;
