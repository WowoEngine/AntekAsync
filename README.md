# Antek Async

**Multi-Protocol Async Messaging Core**

Antek Async is a centralized messaging system designed with a "Build once, connect everywhere" philosophy. It acts as a universal hub that translates and routes messages across different protocols (TCP, MQTT, HTTP).

## Architecture
**Centralized Core with Multi-Entry Gateways**
- **Core**: The "Brain" (BrokerModule) responsible for Pub/Sub logic and message routing.
- **Gateways**: "Entry Points" that translate specific protocols into internal messages.

### Supported Protocols
1.  **Antek TCP** (Port 4000): Custom raw TCP protocol (`PUB|topic|msg`, `SUB|topic`).
2.  **MQTT** (Port 1883): Standard IoT protocol (Minimal implementation for Connect/Publish).
3.  **HTTP** (Port 3000): REST API for publishing (`POST /publish`).

## Project Structure
```
/AntekAsync
  ├── /cli           # Command Line Tools (No dependencies)
  ├── /docs          # Documentation
  ├── /src
  │    ├── /modules  # Business Logic (Broker)
  │    ├── /protocols# Gateway Implementations (TCP, MQTT, HTTP)
  │    ├── /server   # Server Bootstrapper & Manager
  │    └── /services # Infrastructure (Logger, Config)
  └── index.js       # Entry Point
```

## "Pure Javascript"
This project is built using 0 external dependencies (`node_modules`). It uses Node.js native `net`, `http`, and `events` modules.

## Usage

### Start Server
```bash
node index.js
```

### CLI Tools
**Publish via HTTP**
```bash
node cli/pub_http.js topic_suhu "30C"
```

**Subscribe via TCP**
```bash
node cli/sub_tcp.js topic_suhu
```

**Publish via MQTT**
```bash
node cli/pub_mqtt.js topic_suhu "25C"
```
