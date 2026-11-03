# DocSync Frontend

This directory contains the React frontend for **DocSync**, a real-time collaborative document editor.

## Tech Stack
- **Framework**: React 18 with Vite
- **Language**: TypeScript
- **State Management**: Recoil
- **Styling**: Tailwind CSS, Framer Motion, Radix UI, Lucide Icons
- **Real-time Sync**: Yjs, `y-websocket`
- **Routing**: React Router DOM

## Development

1. Ensure your backend WebSocket server is running (from `apps/websocket-server`).
2. Create an `.env.local` file by copying `.env.example`:
   ```env
   VITE_WEBSOCKET_SERVER_URL=ws://localhost:5000
   VITE_YJS_SERVER_URL=ws://localhost:5001
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Key Components

- `src/pages/DocumentEditor.tsx`: The main workspace featuring the collaborative textarea, synced via Yjs CRDTs.
- `src/components/ChatWindow.tsx`: A real-time chat interface connected to the WebSocket server on port 5000.
- `src/components/UsersList.tsx`: A presence panel tracking online collaborators in the current room.
