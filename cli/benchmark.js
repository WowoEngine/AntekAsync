const http = require('http');
const AntekClient = require('../src/client/AntekClient');

const mode = process.argv[2] || 'http';
const count = parseInt(process.argv[3]) || 1000;
const concurrency = 50; // Parallel requests
let completed = 0;
const startTime = Date.now();
const topic = 'bench_test';

console.log(`[BENCH] Mode: ${mode.toUpperCase()} | Count: ${count} | Topic: ${topic}`);

if (mode === 'http') {
    runHttp();
} else if (mode === 'tcp') {
    runTcp();
} else {
    console.error('Invalid mode. Use "http" or "tcp"');
    process.exit(1);
}

function runHttp() {
    let active = 0;
    let i = 0;

    function next() {
        if (i >= count) return;
        if (active >= concurrency) return;

        active++;
        const currentId = i++;

        const req = http.request({
            hostname: '127.0.0.1',
            port: 3000,
            path: `/publish?topic=${topic}`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            agent: false
        }, (res) => {
            res.resume();
            res.on('end', () => {
                completed++;
                active--;
                checkDone();
                next();
            });
        });

        req.on('error', (e) => console.error(e.message));
        req.write(JSON.stringify({ payload: `Message ${currentId}` }));
        req.end();

        next();
    }

    // Start initial batch
    for (let j = 0; j < concurrency; j++) next();
}

function runTcp() {
    // For TCP, we can open one connection and blast, or multiple.
    // Broker is async. Let's use one client for throughput testing to minimize connect overhead.
    // Or simulate real clients? Let's use 1 client to test Pub throughput.

    const client = new AntekClient();
    client.connect('antekasync://127.0.0.1:4000'); // No auth for bench or assume default

    client.on('connected', () => {
        // We don't get ACKs for PUB in current protocol (fire and forget), 
        // effectively measuring write speed + network buffer.
        // To measure true throughput, we should maybe subscribe and wait for echo?
        // But for Pub benchmark, let's just write.

        // However, Node.js net.write returns false if buffer is full.
        // We should respect drain.

        let i = 0;
        function write() {
            let ok = true;
            while (i < count && ok) {
                // PUB|topic|msg
                ok = client.socket.write(`PUB|${topic}|Message ${i}\n`);
                i++;
                if (i === count) {
                    // Since we don't have ACK, we assume "sent" = done for fire-and-forget
                    // But we should wait for drain to be sure it left user space
                    if (ok) {
                        checkDone();
                    } else {
                        client.socket.once('drain', checkDone);
                    }
                }
            }
            if (i < count && !ok) {
                client.socket.once('drain', write);
            }
        }
        write();
    });

    client.on('error', (e) => {
        console.error('TCP Error', e);
        process.exit(1);
    });
}

function checkDone() {
    // For TCP checkDone might be called once at end.
    // For HTTP it's called per request.
    if (mode === 'http') {
        if (completed === count) finish();
    } else {
        finish(); // TCP finishes when loop done and drained
    }
}

function finish() {
    const duration = Date.now() - startTime;
    const ops = (count / (duration / 1000)).toFixed(2);
    const avg = (duration / count).toFixed(3);

    console.log(`[BENCH] Finished ${count} requests in ${duration}ms`);
    console.log(`[BENCH] Rate: ${ops} ops/sec`);
    console.log(`[BENCH] Avg Latency: ${avg} ms`);
    process.exit(0);
}
