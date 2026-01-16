# Antek Async Architecture

## Overview
Antek Async uses a "Hub and Spoke" model where the central **BrokerModule** receives messages from various **Protocols** and redistributes them to interested parties.

## Data Flow
1. **Ingestion**: A Gateway (e.g., MQTTGateway) receives a packet.
2. **Translation**: The Gateway parses the raw bytes/text into a logical `topic` and `payload`.
3. **Routing**: The Gateway calls `BrokerModule.publish(topic, payload, source)`.
4. **Distribution**: `BrokerModule` iterates over subscribers and triggers callbacks (which may write back to sockets).

## Gateway Standard
All Gateways must:
- Import `BrokerModule`.
- Log activities via `Logger`.
- Handle their own connection lifecycle.
- Not block the event loop.
