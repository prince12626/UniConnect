import { createContext, useContext, useEffect, useState } from "react";
import { socket } from "../socket/index";
import type { ReactNode } from "react";

export interface ChatMessage {
    tempId: string;
    message: string;
    roomId: string;
    userId: string;
    name?: string;
    time: Date;
}

interface MessageContextType {
    messages: ChatMessage[];
    sendMessage: (text: string) => void;
}

const MessageContext = createContext<MessageContextType | null>(null);

export const MessageProvider = ({
    roomId,
    user,
    children,
}: {
    roomId: string;
    user: string;
    children: ReactNode;
}) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    // join / leave room
    // join / leave room
    useEffect(() => {
        if (!roomId || !user) return;

        return () => {
            socket.emit("room:leave", { roomId, userId: user });
            setMessages([]);
        };
    }, [roomId, user]);

    // receive messages
    useEffect(() => {
        socket.on("message:receive", (msg: ChatMessage) => {
            setMessages((prev) => [...prev, msg]);
        });

        return () => {
            socket.off("message:receive");
        };
    }, []);

    // send
    const sendMessage = (text: string) => {
        if (!text.trim()) return;

        const msg: ChatMessage = {
            tempId: crypto.randomUUID(),
            roomId,
            userId: user,
            message: text,
            time: new Date(),
        };

        // optimistic UI (only once)
        setMessages((prev) => [...prev, msg]);

        socket.emit("message:send", msg);
    };

    return (
        <MessageContext.Provider value={{ messages, sendMessage }}>
            {children}
        </MessageContext.Provider>
    );
};

// hook
export const useMessages = () => {
    const ctx = useContext(MessageContext);
    if (!ctx) {
        throw new Error("useMessages must be used inside MessageProvider");
    }
    return ctx;
};
