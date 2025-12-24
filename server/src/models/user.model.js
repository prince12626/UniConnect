import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        otp: {
            type: String
        },
        otpExpiresAt: {
            type: Date
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        rooms: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room",
        }
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
