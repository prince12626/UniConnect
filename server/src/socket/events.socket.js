import mongoose from "mongoose";
import { getUserById } from "../utils/user.js";
import Room from "../models/room.model.js";
import { userSocketMap } from "./index.socket.js";

const findAdminInRoom = async (roomId) => {
    try {
        const room = await Room.findById(roomId);
        if (!room) {
            return socket.emit("room:error", {
                message: "Room not found",
            });
        }
        const admin = room.members.find((m) => m.role === "admin");
        return admin;
    } catch (error) {
        console.error("🔥 findAdminInRoom failed", error);
        return null;
    }
};

export const registerSocketEvents = (socket) => {
    socket.on(
        "room:join",
        async ({ roomId, userId, role = "member", password }) => {
            try {
                /* ---------- 1. Validate IDs ---------- */
                if (
                    !mongoose.Types.ObjectId.isValid(roomId) ||
                    !mongoose.Types.ObjectId.isValid(userId)
                ) {
                    return socket.emit("room:error", {
                        message: "Invalid room or user",
                    });
                }

                /* ---------- 2. Prevent duplicate socket join ---------- */
                if (socket.rooms.has(roomId)) {
                    return;
                }

                /* ---------- 3. Fetch user ---------- */
                const user = await getUserById(userId);
                if (!user) {
                    return socket.emit("room:error", {
                        message: "User not found",
                    });
                }

                if (!user.isVerified) {
                    return socket.emit("room:error", {
                        message: "User not verified",
                    });
                }

                /* ---------- 4. Fetch room ---------- */
                const room = await Room.findById(roomId);
                if (!room) {
                    return socket.emit("room:error", {
                        message: "Room not found",
                    });
                }

                /* ---------- 5. Password check ---------- */
                if (room.password && room.password !== password) {
                    return socket.emit("room:error", {
                        message: "Incorrect room password",
                    });
                }

                /* ---------- 6. Join socket room (ONLY ONCE) ---------- */
                socket.join(roomId);
                console.log(`🟢 Socket ${socket.id} joined room ${roomId}`);

                /* ---------- 7. Add member to DB (idempotent) ---------- */
                const alreadyMember = room.members.some(
                    (m) => m.userId?.toString() === userId.toString()
                );

                if (!alreadyMember) {
                    room.members.push({
                        userId,
                        role: role === "admin" ? "admin" : "member",
                    });
                    await room.save();
                }

                /* ---------- 8. Notify others ---------- */
                socket.to(roomId).emit("user:joined", {
                    user: {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                    },
                    role,
                });

                /* ---------- 9. Acknowledge self ---------- */
                socket.emit("room:joined", {
                    roomId,
                    role,
                });
            } catch (err) {
                console.error("🔥 room:join failed", err);
                socket.emit("room:error", {
                    message: "Internal server error",
                });
            }
        }
    );
    socket.on("screen:offer", ({ roomId, offer }) => {
        socket.to(roomId).emit("screen:offer", { offer });
    });
    socket.on("screen:answer", ({ roomId, answer }) => {
        socket.to(roomId).emit("screen:answer", { answer });
    });
    socket.on("screen:ice", ({ roomId, candidate }) => {
        socket.to(roomId).emit("screen:ice", { candidate });
    });
    socket.on("screen:stop", ({ roomId }) => {
        socket.to(roomId).emit("screen:stop");
    });
    socket.on("message:send", async ({ roomId, userId, message, tempId }) => {
        if (!roomId || !userId || !message) return;

        const user = await getUserById(userId);
        if (!user) return;

        const payload = {
            tempId,
            message,
            userId: user._id,
            name: user.name,
            time: new Date(),
        };

        // ❗ sender ko exclude
        socket.to(roomId).emit("message:receive", payload);
    });
    socket.on("canvas:update", async ({ roomId, snapshot }) => {
        if (!roomId || !snapshot) return;

        // Broadcast to others
        socket.to(roomId).emit("canvas:update", { snapshot });

        const room = await Room.findById(roomId);
        if (!room) return;

        room.canvas = snapshot;
        await room.save();
    });
    socket.on("room:leave", ({ roomId }) => {
        socket.leave(roomId);
        console.log(`🔴 ${socket.id} left room ${roomId}`);
    });
    socket.on("screenshare:ask", async ({ roomId }) => {
        const admin = await findAdminInRoom(roomId);
        if (!admin) return;
        console.log(admin);
        const socketSet = userSocketMap.get(userId);

        if (!socketSet) {
            console.log("User offline");
            return;
        }

        console.log(socketSet);
        socket.to(admin.userId).emit("screenshare:ask", { roomId });
    });
    socket.on("screenshare:response", async ({ roomId, response }) => {
        socket.to(roomId).emit("screenshare:response", { response });
    });
};