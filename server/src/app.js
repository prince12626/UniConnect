import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import authRoute from "./routes/auth.route.js";
import roomRoute from "./routes/rooms.route.js";

//Create app
const app = express();

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);

//Routes
app.use("/api/auth", authRoute);
app.use("/api/rooms", roomRoute);

export const httpServer = http.createServer(app);
