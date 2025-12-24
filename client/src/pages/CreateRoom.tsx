import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const CreateRoom = () => {
    const [roomName, setRoomName] = useState("");
    const [roomPassword, setRoomPassword] = useState("");
    const [screensharePermission, setScreensharePermission] = useState<
        "Admin Only" | "All Members" | "Ask for Permission"
    >("Admin Only");
    const [loading, setLoading] = useState(false);

    const handleCreateRoom = async () => {
        if (!roomName.trim()) {
            toast.error("Room name is required");
            return;
        }

        if (!roomPassword.trim()) {
            toast.error("Room password is required");
            return;
        }

        try {
            setLoading(true);

            const res = await axios.post(
                `${import.meta.env.VITE_APIURL}/api/rooms/create`,
                {
                    roomName,
                    roomPassword,
                    screensharePermission,
                    role: "admin",
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            );

            toast.success(res.data.message || "Room created successfully");

            // reset
            setRoomName("");
            setRoomPassword("");
            setScreensharePermission("Admin Only");
        } catch (err: any) {
            toast.error(
                err?.response?.data?.message || "Failed to create room"
            );
            console.error("CREATE ROOM ERROR:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen flex items-center justify-center">
            <div className="max-w-md mx-auto mt-10 p-6 bg-black text-white rounded-xl border border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Create Room</h2>

                <input
                    type="text"
                    placeholder="Room name"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    className="w-full mb-3 px-3 py-2 bg-transparent border border-gray-600 rounded"
                />

                <input
                    type="text"
                    placeholder="Room password"
                    value={roomPassword}
                    onChange={(e) => setRoomPassword(e.target.value)}
                    className="w-full mb-3 px-3 py-2 bg-transparent border border-gray-600 rounded"
                />

                <select
                    value={screensharePermission}
                    onChange={(e) =>
                        setScreensharePermission(
                            e.target.value as
                                | "Admin Only"
                                | "All Members"
                                | "Ask for Permission"
                        )
                    }
                    className="w-full mb-4 px-3 py-2 bg-black border border-gray-600 rounded"
                >
                    <option value="Admin Only">Admin Only</option>
                    <option value="All Members">All Members</option>
                    <option value="Ask for Permission">
                        Ask for Permission
                    </option>
                </select>

                <button
                    onClick={handleCreateRoom}
                    disabled={loading}
                    className="w-full py-2 bg-white text-black rounded hover:opacity-90 disabled:opacity-50"
                >
                    {loading ? "Creating..." : "Create Room"}
                </button>
            </div>
        </div>
    );
};

export default CreateRoom;
