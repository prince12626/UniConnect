import { socket } from "./index";

export const sendMessage = (text: string, roomId: string, userId: string) => {
    const msg = {
        tempId: crypto.randomUUID(), // important
        roomId,
        message: text,
        userId,
        status: "sending",
        time: new Date(),
    };

    // 2. Send to server
    socket.emit("message:send", msg);
};

export const receiveMessage = () => {
    socket.on("message:receive", (message: any) => {
        console.log("🚀 message:receive", message);
    });
};

export const screenshareAsk = (roomId: string) => {
    socket.emit("screenshare:ask", { roomId });
};

export const screenshareResponse = () => {
    socket.on("screenshare:ask", (data) => {
        console.log(data)
    });
};