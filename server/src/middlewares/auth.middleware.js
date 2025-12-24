import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const needToAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Unauthorized",
                success: false,
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id)

        if (!user) {
            return res.status(401).json({
                message: "Unauthorized",
                success: false,
            });
        }

        if (!user.isVerified) {
            return res.status(403).json({
                message: "Email not verified",
                success: false,
            });
        }

        req.user = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
        };

        next();
    } catch (error) {
        console.error("AUTHORIZED MIDDLEWARE ERROR:", error);
        return res.status(401).json({
            message: "Unauthorized",
            success: false,
        });
    }
};
