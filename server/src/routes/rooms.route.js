import express from "express";
import {
    createRoom,
    getUserRooms,
    updateRoom,
    deleteRoom,
    getRoom,
} from "../controllers/room.controller.js";
import { needToAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/create", needToAuth, createRoom);
router.get("/all", needToAuth, getUserRooms);
router.put("/:roomId", needToAuth, updateRoom);
router.delete("/:roomId", needToAuth, deleteRoom);
router.get("/:roomId",needToAuth, getRoom);

export default router;
