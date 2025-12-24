import { io } from "socket.io-client";
import toast from "react-hot-toast";

export const socket = io(import.meta.env.VITE_SOCKETURL, {
    autoConnect: false,
    query: {
        userId: JSON.parse(localStorage.getItem("user") || "{}")?.id,
    },
});

if (!socket.hasListeners("room:error")) {
    socket.on("room:error", (error) => {
        toast.error(error.message || "Something went wrong");
        setTimeout(() => {
            window.location.href = "/";
        }, 1500);
    });
}