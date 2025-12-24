import mongoose from "mongoose";
import User from "../models/user.model.js";

export const getUserById = async (userId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            console.log("❌ Invalid ObjectId:", userId);
            return null;
        }

        const user = await User.findById(userId).select("-password");
        if (!user) {
            console.log("❌ User not found for ID:", userId);
            return null;
        }

        return user;
    } catch (err) {
        console.error("Error fetching user by ID:", err);
        return null;
    }
};
