import Room from "../models/room.model.js";

// ---------------- CREATE ROOM ----------------
export const createRoom = async (req, res) => {
    try {
        const { roomName, roomPassword, screensharePermission, role } =
            req.body;
        const userId = req.user.id;

        if (!roomName) {
            return res
                .status(400)
                .json({ message: "Room Name is required", success: false });
        }

        const newRoom = await Room.create({
            name: roomName,
            password: roomPassword,
            createdBy: userId,
            members: [{ userId, role: role }],
            screensharePermission: screensharePermission || false,
        });

        return res.status(201).json({
            message: "Room created",
            success: true,
            room: newRoom,
        });
    } catch (error) {
        console.error("CREATE ROOM ERROR:", error);
        return res
            .status(500)
            .json({ message: "Failed to create room", success: false });
    }
};

// ---------------- DELETE ROOM ----------------
export const deleteRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.user.id;

        const room = await Room.findById(roomId);
        if (!room) {
            return res
                .status(404)
                .json({ message: "Room not found", success: false });
        }

        if (room.createdBy.toString() !== userId) {
            return res
                .status(403)
                .json({ message: "Only host can delete room", success: false });
        }

        await Room.findByIdAndDelete(roomId);

        return res.status(200).json({
            message: "Room deleted",
            success: true,
        });
    } catch (error) {
        console.error("DELETE ROOM ERROR:", error);
        return res.status(500).json({
            message: "Failed to delete room",
            success: false,
        });
    }
};


// ---------------- UPDATE ROOM ----------------
export const updateRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { roomName, roomPassword, screensharePermission } = req.body;
        const userId = req.user.id;

        const room = await Room.findById(roomId);
        if (!room)
            return res
                .status(404)
                .json({ message: "Room not found", success: false });

        if (room.createdBy.toString() !== userId) {
            return res
                .status(403)
                .json({ message: "Only host can update room", success: false });
        }

        if (roomName) room.roomName = roomName;
        if (screensharePermission !== undefined)
            room.screensharePermission = screensharePermission;

        await room.save();

        return res.status(200).json({
            message: "Room updated",
            success: true,
            room,
        });
    } catch (error) {
        console.error("UPDATE ROOM ERROR:", error);
        return res
            .status(500)
            .json({ message: "Failed to update room", success: false });
    }
};

export const getUserRooms = async (req, res) => {
    try {
        const userId = req.user.id;

        const rooms = await Room.find({ createdBy: userId }).sort({ createdAt: -1 })

        return res.status(200).json({
            message: "User rooms fetched",
            success: true,
            count: rooms.length,
            rooms,
        });
    } catch (error) {
        console.error("GET USER ROOMS ERROR:", error);
        return res.status(500).json({
            message: "Failed to get user rooms",
            success: false,
        });
    }
};

export const getRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.user.id;

        const room = await Room.findById(roomId);
        if (!room)
            return res
                .status(404)
                .json({ message: "Room not found", success: false });

        if (room.createdBy.toString() !== userId) {
            return res
                .status(403)
                .json({ message: "Only host can get room", success: false });
        }

        return res.status(200).json({
            message: "Room fetched",
            success: true,
            room,
        });
    } catch (error) {
        console.error("GET ROOM ERROR:", error);
        return res.status(500).json({
            message: "Failed to get room",
            success: false,
        });
    }
};