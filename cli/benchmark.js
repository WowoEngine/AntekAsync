const http = require('http');

const count = parseInt(process.argv[2]) || 100;
const topic = 'bench_test';

console.log(`[BENCH] Starting benchmark: ${count} requests to topic '${topic}'...`);

let completed = 0;
const startTime = Date.now();

function sendRequest(i) {
    const req = http.request({
        hostname: '127.0.0.1',
        port: 3000,
        path: `/publish?topic=${topic}`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        agent: false // Create new connection per request or keepAlive? Default node agent uses keepAlive.
        // Setting agent false creates new connection. Let's rely on globalAgent (keepAlive defaults depends on node ver)
        // Actually to stress test, maybe keepAlive is better or worse?
        // Let's use default agent.
    }, (res) => {
        res.resume(); // consume data
        res.on('end', () => {
            completed++;
            if (completed === count) {
                const duration = Date.now() - startTime;
                console.log(`[BENCH] Finished ${count} requests in ${duration}ms`);
                console.log(`[BENCH] Rate: ${(count / (duration / 1000)).toFixed(2)} req/sec`);
            }
        });
    });

    req.on('error', (e) => console.error(e.message));
    req.write(JSON.stringify({ payload: `Message ${i}` }));
    req.end();
}

for (let i = 0; i < count; i++) {
    sendRequest(i);
}
