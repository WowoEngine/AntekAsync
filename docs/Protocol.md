# AntekAsync Protocol Specification

**URI Scheme**: `antekasync://`

## URI Format
```
antekasync://[auth_key@]host:port
```
- **auth_key**: (Optional) The secret key for authentication.
- **host**: Hostname or IP of the Antek Gateway.
- **port**: TCP Port (Default: 4000).

## Connection Lifecycle
1.  **Connect**: Client opens TCP connection to `host:port`.
2.  **Auth (Optional)**:
    - If `auth_key` is provided, Client sends: `AUTH|auth_key\n`
    - Server responds: `AUTH|OK\n` or `AUTH|FAIL\n`.
3.  **Operation**:
    - **Publish**: `PUB|topic|payload\n`
    - **Subscribe**: `SUB|topic\n`
    - **Message**: Server sends `MSG|topic|payload\n` to subscribers.
4.  **Error**: Server sends `ERROR|CODE\n`.

## Wire Format
- **Delimiters**: `|` (Pipe) separates fields.
- **Terminator**: `\n` (Newline) separates messages.
- **Encoding**: UTF-8.

## Example
**Client connects:**
`antekasync://secret@127.0.0.1:4000`

**Handshake:**
`C -> S: AUTH|secret`
`S -> C: AUTH|OK`

**Subscribe:**
`C -> S: SUB|suhu`

**Message Received:**
`S -> C: MSG|suhu|30C`
