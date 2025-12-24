import { Server } from "socket.io";
import { httpServer } from "../app.js";

export const userSocketMap = new Map();

export const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
    const { userId } = socket.handshake.query;
    console.log(userId)
    if (!userId) {
        socket.disconnect();
        return;
    }

    console.log("🟢 connected:", userId, socket.id);

    if (!userSocketMap.has(userId)) {
        userSocketMap.set(userId, new Set());
    }
    userSocketMap.get(userId).add(socket.id);

    socket.on("disconnect", () => {
        console.log("🔴 disconnected:", userId, socket.id);

        const set = userSocketMap.get(userId);
        if (!set) return;

        set.delete(socket.id);
        if (set.size === 0) {
            userSocketMap.delete(userId);
        }
    });
});
