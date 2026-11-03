# DocSync WebSocket Server

This directory contains the Node.js backend for **DocSync**.

It manages two distinct WebSocket servers:
1. **Port 5000**: Handles room creation, user presence broadcasting, and the real-time chat window.
2. **Port 5001**: A dedicated Yjs WebSocket server (`y-websocket`) responsible for the underlying CRDT logic that keeps the collaborative document perfectly synchronized across all connected users.

## Development

1. Ensure dependencies are installed (`npm install`).
2. Start the server:
   ```bash
   npm run dev
   ```

*(Note: The server uses an in-memory broadcast system and does not require Redis or any external database for local development).*
