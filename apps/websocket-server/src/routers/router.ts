import dotenv from "dotenv";
dotenv.config();

export type MessageTypes =
    | "requestToGetUsers"
    | "requestForAllData"
    | "users"
    | "chat_message";

interface MessageHandler {
    (
        data: any,
        context: {
            userId: string | null;
            roomId: string;
            rooms: any;
            broadcast: (roomId: string, message: any, excludeUserId?: string | null) => void;
            sendDirect: (roomId: string, targetUserId: string, message: any) => void;
        }
    ): void;
}

const requestRouter: Record<string, MessageHandler> = {
    requestToGetUsers: (data, { roomId, rooms, broadcast }) => {
        const allUsers = (rooms[roomId] || []).map((u: any) => ({ id: u.userId, name: u.name }));
        broadcast(roomId, { type: "users", users: allUsers });
    },

    requestForAllData: (data, { userId, roomId, rooms, sendDirect }) => {
        const otherUser = rooms[roomId]?.find((user: any) => user.userId !== userId);
        if (otherUser) {
            sendDirect(roomId, otherUser.userId, { type: "requestForAllData", userId });
        }
    },

    users: (data, { userId, roomId, broadcast }) => {
        broadcast(roomId, { type: "users", users: data.users }, userId);
    },

    chat_message: (data, { userId, roomId, broadcast }) => {
        broadcast(
            roomId,
            {
                type: "chat_message",
                text: data.text,
                imageUrl: data.imageUrl,
                senderId: userId,
                senderName: data.senderName,
                timestamp: data.timestamp,
            },
            userId
        );
    },
};

export default requestRouter;