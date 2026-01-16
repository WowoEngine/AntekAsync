const http = require('http');
const broker = require('../modules/BrokerModule');
const url = require('url');
const Logger = require('../services/Logger');
const Auth = require('../services/Auth');

class HTTPGateway {
    constructor(port = 3000) {
        this.port = port;
        this.server = http.createServer(this.handleRequest.bind(this));
    }

    start() {
        this.server.listen(this.port, () => {
            Logger.info('HTTPGateway', `Server running on port ${this.port}`);
        });
    }

    handleRequest(req, res) {
        // Handle CORS if needed, but for now simple

        // Parse URL
        const parsedUrl = url.parse(req.url, true);

        // Only accept POST /publish
        if (req.method === 'POST' && parsedUrl.pathname === '/publish') {
            let body = '';

            req.on('data', chunk => {
                body += chunk.toString();
            });

            req.on('end', () => {
                let topic = parsedUrl.query.topic;
                let payload = body;

                // Simple JSON parsing attempt
                if (req.headers['content-type'] === 'application/json') {
                    try {
                        const jsonBody = JSON.parse(body);

                        // Strategy: 
                        // 1. If topic in query, use it. Payload is body (or json field if desired).
                        // 2. If topic in body, use it.
                        if (!topic && jsonBody.topic) {
                            topic = jsonBody.topic;
                        }

                        // Payload extraction
                        if (jsonBody.payload) {
                            payload = jsonBody.payload;
                        } else if (!jsonBody.topic) {
                            // If user sent just { "foo": "bar" } and topic is in query
                            payload = jsonBody;
                        } else {
                            // If user sent { "topic": "x", "val": 1 }, and no explicit payload field...
                            // We might just treat the whole object as payload or payload=undefined?
                            // Let's assume payload is required or we send the rest.
                            // For simplicity, if payload field exists use it, else use whole body if topic is in query. 
                            // If topic was extracted from body, but no payload field?
                            payload = jsonBody.payload || jsonBody;
                        }
                    } catch (e) {
                        // invalid json, treat as text
                    }
                }

                if (!topic) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Missing topic' }));
                    return;
                }

                console.log(`[HTTPGateway] Received HTTP POST: ${topic}`, payload);

                const data = (typeof payload === 'object') ? JSON.stringify(payload) : String(payload);
                broker.publish(topic, data, 'HTTP');

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'published', topic, data }));
            });
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
        }
    }
}

module.exports = HTTPGateway;
