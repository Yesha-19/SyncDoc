# DocSync

> **DocSync** is a lightning-fast, real-time collaborative document editor. Think of it as a lightweight Google Docs built for instant collaboration, featuring a clean interface, live user presence tracking, and integrated real-time chat.

---

## 🧐 What exactly does DocSync do?

DocSync provides a frictionless collaborative workspace where multiple users can create and edit documents simultaneously.

1. **Instant Workspaces:** Create a room without requiring an account or login.
2. **Share & Write:** Get a unique Room Code and share it with collaborators.
3. **Real-Time Synchronization:** Everyone can edit the same document simultaneously.
4. **Integrated Communication:** Chat with collaborators alongside the document editor.

DocSync uses CRDTs (Conflict-free Replicated Data Types) to handle concurrent edits and maintain document consistency.

---

## ✨ Key Features

- ⚡ **Real-Time Editing:** Multiple users can edit the same document simultaneously without locking.
- 👥 **Live Presence Tracking:** See who is currently online in your room.
- 💬 **Integrated Group Chat:** Communicate through a built-in chat with image attachments.
- 🔗 **Easy Room Sharing:** Invite collaborators using a randomly generated room code.
- 🧠 **Conflict-Free Synchronization:** Powered by Yjs and CRDTs to handle concurrent edits.
- 🎨 **Modern UI:** Responsive dark-mode interface built with Tailwind CSS and Framer Motion.

---

## 🏗️ Architecture

DocSync is organized into two main applications:

1. **Frontend (`apps/frontend`)**: A React application built with Vite that provides the editor, chat, and presence interface.
2. **Backend (`apps/websocket-server`)**: A Node.js backend running two WebSocket servers:
   - **Port 5000:** Handles room management, user presence, and real-time chat.
   - **Port 5001:** Runs the Yjs WebSocket server (`y-websocket`) for collaborative document synchronization.

### Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Recoil, Framer Motion
- **Backend:** Node.js, WebSockets (`ws`), `y-websocket`
- **Collaboration Engine:** Yjs (CRDT)

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Yesha-19/SyncDoc.git
   cd SyncDoc
   ```

2. Install dependencies from the project root:

   ```bash
   npm install
   ```

3. Configure environment variables.

   **Frontend (`apps/frontend/.env.local`):**

   ```env
   VITE_WEBSOCKET_SERVER_URL=ws://localhost:5000
   VITE_YJS_SERVER_URL=ws://localhost:5001
   ```

   **Backend (`apps/websocket-server/.env`):**

   ```env
   PORT=5000
   ```

### Running Locally

Open two terminal windows.

**Terminal 1 – Start the Backend:**

```bash
cd apps/websocket-server
npm run dev
```

**Terminal 2 – Start the Frontend:**

```bash
cd apps/frontend
npm run dev
```

### Try It Out!

Open your browser at:

http://localhost:5173

Open a second browser tab or window, join the same room, and test real-time collaboration.

---

## 📌 Future Improvements

- Document persistence and version history.
- User authentication and access control.
- Improved collaboration and sharing features.
