import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { gsap } from "gsap";
import ScreenShare from "../components/ShareScreen";
import Canvas from "../components/Canvas";
import { Maximize } from "lucide-react";
import { useMessages } from "../context/MessageContext";
import { onUserJoined } from "../socket/room.events";
import toast from "react-hot-toast";
import axios from "axios";
import { screenshareAsk, screenshareResponse } from "../socket/message.events";

const RoomContent: React.FC = () => {
    const { id } = useParams();
    const { sendMessage, messages } = useMessages();
    const userId = JSON.parse(localStorage.getItem("user") || "{}")?.id;
    const [input, setInput] = useState("");
    const [activeTab, setActiveTab] = useState<"screen" | "canvas">("canvas");
    const containerRef = useRef<HTMLDivElement>(null);

    const getRoom = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_APIURL}/api/rooms/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            console.log(response)
        } catch (error) {
            console.error("GET ROOM ERROR:", error);
        }
    };

    useEffect(() => {
        if (containerRef.current) {
            gsap.from(containerRef.current, {
                opacity: 0,
                y: -20,
                duration: 0.8,
            });
        }
        getRoom();
    }, []);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        sendMessage(input);
        setInput("");
    };

    onUserJoined((data: any) => {
        toast.success(`${data.user.name} joined the room`);
    });

    const handleScreenShare = () => {
        screenshareAsk(`${id}`);
    };

    handleScreenShare();
    screenshareResponse()

    return (
        <div className="flex h-screen bg-black text-white">
            {/* Sidebar */}
            <div className="w-1/4 bg-black border-r border-border p-4 flex flex-col gap-4">
                <div className="flex-1 overflow-y-auto">
                    {messages.map((msg) => (
                        <div
                            key={msg.tempId}
                            className="mb-2 p-2 bg-black border-border border rounded-sm"
                        >
                            <strong>
                                {msg.userId === userId ? "You" : msg.name}:{" "}
                            </strong>
                            {msg.message}
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Type message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-1 p-2 rounded-sm bg-black border border-border focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    <button
                        onClick={handleSend}
                        type="submit"
                        className="bg-accent px-4 rounded-sm hover:bg-accent/80 transition"
                    >
                        Send
                    </button>
                </form>
            </div>

            {/* Main area */}
            <div className="flex-1 flex flex-col">
                {/* Top bar */}
                <div className="h-16 bg-black border-b border-white flex items-center justify-between px-6">
                    <div className="flex gap-4 items-center">
                        <Link
                            to="/"
                            className="bg-red-600 rounded py-1 px-4 outline-none"
                        >
                            Exit
                        </Link>
                        <div className="font-semibold text-lg">Room: {id}</div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex border border-white rounded-sm overflow-hidden w-64">
                            <button
                                onClick={() => setActiveTab("screen")}
                                className={`flex-1 p-2 text-center font-semibold transition ${
                                    activeTab === "screen"
                                        ? "bg-white text-black"
                                        : "bg-black text-white hover:bg-gray-800"
                                }`}
                            >
                                Screen Share
                            </button>
                            <button
                                onClick={() => setActiveTab("canvas")}
                                className={`flex-1 p-2 text-center font-semibold transition ${
                                    activeTab === "canvas"
                                        ? "bg-white text-black"
                                        : "bg-black text-white hover:bg-gray-800"
                                }`}
                            >
                                Canvas
                            </button>
                        </div>

                        <button
                            onClick={() => {
                                if (!document.fullscreenElement) {
                                    document.documentElement
                                        .requestFullscreen()
                                        .catch(() => {});
                                } else {
                                    document.exitFullscreen();
                                }
                            }}
                        >
                            <Maximize size={30} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div ref={containerRef} className="flex-1 flex overflow-y-auto">
                    {activeTab === "screen" ? (
                        <ScreenShare roomId={`${id}`} />
                    ) : (
                        <div className="flex-1 rounded-sm flex items-center justify-center text-white text-xl">
                            <Canvas />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoomContent;
