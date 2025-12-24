import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        password: { type: String, required: true },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        members: [
            {
                userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
                role: {
                    type: String,
                    enum: ["admin", "member"],
                    default: "member",
                },
                joinedAt: { type: Date, default: Date.now },
            },
        ],
        screensharePermission: { type: String, enum: ["Admin Only", "All Members", "Ask for Permission"], default: "Admin Only" },
    },
    { timestamps: true }
);

const Room = mongoose.model("Room", roomSchema);

export default Room;