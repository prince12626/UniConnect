import { useEffect, useState } from "react";
import RoomCard from "../components/RoomCard";
import type { Room } from "../types/room";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const RoomsPage = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const navigate = useNavigate();
    const handleJoin = (roomId: string, password: string) => {
        navigate(`/rooms/${roomId}?roomPass=${password}`);
    };

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_APIURL}/api/rooms/all`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem(
                                "token"
                            )}`,
                        },
                    }
                );
                console.log(response.data.rooms)
                const data = response.data;
                setRooms(data.rooms);
            } catch (error) {
                console.error("Error fetching rooms:", error);
            }
        };

        fetchRooms();
    }, []);

    return (
        <div className="min-h-screen mt-20 bg-black text-white p-6">
            <h1 className="text-2xl font-semibold mb-6">Rooms</h1>

            {rooms?.length === 0 ? (
                <p className="text-zinc-500">No rooms available</p>
            ) : (
                <div
                    className="grid gap-6
                        grid-cols-1
                        sm:grid-cols-2
                        lg:grid-cols-3"
                >
                    {rooms?.map((room) => (
                        <RoomCard
                            key={room._id}
                            room={room}
                            onJoin={(id, password) => handleJoin(id, password)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default RoomsPage;
