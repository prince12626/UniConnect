import {socket} from "./index";

export const joinRoom = (roomId: string, userId: string, role: string, password: string) => {
    socket.emit("room:join", { roomId, userId, role, password });
};

export const leaveRoom = (roomId: string, userId: string) => {
    socket.emit("room:leave", { roomId, userId });
};

export const onUserJoined = (callback: (data: any) => void) => {
    socket.on("user:joined", callback);
};
