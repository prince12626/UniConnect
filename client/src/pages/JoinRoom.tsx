import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const JoinRoomPage: React.FC = () => {
    const [roomId, setRoomId] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate()

    const handleJoin = async () => {
        setLoading(true);
        setError("");

        try {
            navigate(`/rooms/${roomId}?roomPass=${password}`);
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-black text-white">
            <div className="w-full max-w-md p-8 border border-slate-700 bg-[#111827] backdrop-blur-sm">
                <h2 className="text-3xl font-bold text-center mb-6">
                    Join Room
                </h2>

                {error && (
                    <div className="mb-4 text-red-500 text-center">{error}</div>
                )}

                <div className="flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Room ID"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        className="p-3 rounded border border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-accent"
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="p-3 rounded border border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-accent"
                    />

                    <button
                        onClick={handleJoin}
                        disabled={loading || !roomId.trim()}
                        className="bg-accent py-3 rounded font-semibold hover:bg-accent/80 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Joining..." : "Join Room"}
                    </button>
                </div>

                <p className="mt-6 text-center text-sm text-gray-400">
                    Enter the room ID and password to join the room.
                </p>
            </div>
        </div>
    );
};

export default JoinRoomPage;
