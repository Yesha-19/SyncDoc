# DocSync

> **DocSync** is a lightning-fast, real-time collaborative document editor. Think of it as a lightweight Google Docs built for instant collaboration, featuring a clean interface, live user presence tracking, and an integrated real-time chat. 

---

## 🧐 What exactly does DocSync do?

DocSync solves the problem of heavy, slow, or over-complicated document editors by providing a **frictionless collaborative workspace**. 

1. **Instant Workspaces:** You don't need to create an account, log in, or navigate complex permissions. You simply click "Create new room".
2. **Share & Write:** You are given a unique Room Code. Send this code to your friends or teammates.
3. **Perfect Synchronization:** As soon as they join, you can all type in the exact same document at the exact same time. If you type a word, it appears on their screen in milliseconds.
4. **Side-by-side Communication:** Instead of switching back and forth between Slack/Discord and your document, DocSync has a built-in group chat right next to the text editor.

DocSync guarantees that **everyone is always looking at the exact same text**, handling all the complicated math of merging concurrent edits in the background using CRDTs (Conflict-free Replicated Data Types).

---

## ✨ Key Features

- ⚡ **Frictionless Real-Time Editing:** Multiple users can write, edit, and delete text in the same document simultaneously without locking or freezing.
- 👥 **Live Presence Tracking:** A dedicated "Users" panel shows you exactly who is currently online and active in your room.
- 💬 **Integrated Group Chat:** Discuss ideas, drop image attachments, and communicate seamlessly in a chat window that sits right alongside your document.
- 🔗 **Zero-Setup Sharing:** No user accounts or passwords required. Just share a randomly generated room code to invite collaborators.
- 🧠 **Conflict-Free State (CRDT):** Powered by **Yjs**, DocSync mathematically resolves typing conflicts so the document never gets corrupted, even if two people type on the same line at the same time.
- 🎨 **Modern, Distraction-Free UI:** Built with Tailwind CSS and Framer Motion for a dark-mode, calming, and highly responsive user experience.

---

## 🏗️ Architecture

DocSync is a monorepo containing two main parts:

1. **Frontend (`apps/frontend`)**: A React application (built with Vite) that provides the user interface, the editor, the chat, and the presence UI.
2. **Backend (`apps/websocket-server`)**: A Node.js backend that runs two extremely fast WebSocket servers:
   - **Port 5000**: Handles routing for user presence, joining/leaving rooms, and real-time chat delivery using an efficient in-memory broadcast system.
   - **Port 5001**: A dedicated Yjs WebSocket server (`y-websocket`) specifically tuned to manage the CRDT document synchronization.

### Tech Stack
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Recoil, Framer Motion
- **Backend**: Node.js, WebSockets (`ws`), `y-websocket`
- **Collaboration Engine**: Yjs (CRDT)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)

### Installation

1. Clone the repository and install dependencies from the root directory:
   ```bash
   npm install
   ```

2. Configure Environment Variables:
   
   **Frontend** (`apps/frontend/.env.local`):
   ```env
   VITE_WEBSOCKET_SERVER_URL=ws://localhost:5000
   VITE_YJS_SERVER_URL=ws://localhost:5001
   ```

   **Backend** (`apps/websocket-server/.env`):
   ```env
   PORT=5000
   ```

### Running Locally

You will need two terminal windows to run both the backend and the frontend simultaneously.

**Terminal 1 (Start the Backend)**:
```bash
cd apps/websocket-server
npm run dev
```

**Terminal 2 (Start the Frontend)**:
```bash
cd apps/frontend
npm run dev
```

### Try it out!
Open your browser and navigate to `http://localhost:5173`. 
To see the real-time collaboration in action, open a second tab or window, join the same room, and start typing!
