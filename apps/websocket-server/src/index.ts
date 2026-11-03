import http from "http";
import { WebSocketServer } from "ws";
import requestRouter from "./routers/router";
import dotenv from "dotenv";
const { str10_36 } = require("hyperdyperid/lib/str10_36");
const { setupWSConnection } = require("y-websocket/bin/utils");

dotenv.config();

const server = http.createServer();
const wss = new WebSocketServer({ server });

const rooms: any = {};

function generateRoomId() {
    return str10_36();
}

// Helper to broadcast to a room locally (No Redis needed!)
function broadcast(roomId: string, message: any, excludeUserId: string | null = null) {
    const room = rooms[roomId];
    if (!room) return;
    const msgString = JSON.stringify(message);
    room.forEach((user: any) => {
        if (user.userId !== excludeUserId) {
            try {
                user.ws.send(msgString);
            } catch (e) {
                console.error("Failed to send message to user", user.userId);
            }
        }
    });
}

function sendDirect(roomId: string, targetUserId: string, message: any) {
    const room = rooms[roomId];
    if (!room) return;
    const target = room.find((u: any) => u.userId === targetUserId);
    if (target) {
        try {
            target.ws.send(JSON.stringify(message));
        } catch (e) {
            console.error("Failed to send direct message to", targetUserId);
        }
    }
}

wss.on("connection", (ws, req) => {
    try {
        console.log("Connection Established");
        const queryParams = new URLSearchParams(req.url?.split("?")[1]);
        let roomId = queryParams.get("roomId");
        const userId = queryParams.get("id");
        const name = queryParams.get("name");

        if (!roomId || roomId === "" || !rooms[roomId]) {
            if (!roomId) roomId = generateRoomId();
            rooms[roomId] = [];
            ws.send(JSON.stringify({ isNewRoom: true, type: "roomId", roomId, message: `Created new room` }));
        } else {
            ws.send(JSON.stringify({ isNewRoom: false, type: "roomId", roomId, message: `Joined room` }));
        }

        if (!rooms[roomId]) rooms[roomId] = [];
        rooms[roomId].push({ userId, ws, name });

        // Broadcast updated users
        const allUsers = rooms[roomId].map((u: any) => ({ id: u.userId, name: u.name }));
        broadcast(roomId, { type: "users", users: allUsers });

        ws.on("message", (message) => {
            let data;
            try {
                data = JSON.parse(message.toString());
            } catch {
                return;
            }

            const handler = requestRouter[data.type];
            if (handler) {
                handler(data, { userId, roomId: roomId!, rooms, broadcast, sendDirect });
            }
        });

        ws.on("close", () => {
            if (!rooms[roomId!]) return;
            rooms[roomId!] = rooms[roomId!].filter((user: any) => user.userId !== userId);

            const allUsers = rooms[roomId!].map((u: any) => ({ id: u.userId, name: u.name }));
            broadcast(roomId!, { type: "users", users: allUsers });

            if (rooms[roomId!].length === 0) {
                delete rooms[roomId!];
            }
        });
    } catch (err) {
        ws.close();
    }
});

const WS_PORT = Number(process.env.PORT) || 5000;
server.listen(WS_PORT, "0.0.0.0", () => {
    console.log(`WebSocket server started on port ${WS_PORT}`);
});

const yjsServer = http.createServer();
const yjsWss = new WebSocketServer({ server: yjsServer });
yjsWss.on("connection", setupWSConnection);
yjsServer.listen(5001, "0.0.0.0", () => {
    console.log("Yjs WebSocket server started on port 5001");
});
