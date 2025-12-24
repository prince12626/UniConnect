import { useParams, useSearchParams } from "react-router-dom";
import { MessageProvider } from "../context/MessageContext";
import RoomContent from "../components/RoomContent";
import { joinRoom } from "../socket/room.events";
import { useEffect, useRef } from "react";

const RoomPage = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();

    const roomPass = searchParams.get("roomPass");
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const userId = user?.id;

    const hasJoinedRef = useRef(false);

    // ❌ NEVER redirect immediately
    if (!id || !userId) {
        return (
            <div className="h-screen w-screen flex items-center justify-center text-gray-500">
                Login or Create Account to use UniConnect.
            </div>
        );
    }

    // ✅ Just wait for roomPass
    if (!roomPass) {
        return (
            <div className="h-screen w-screen flex items-center justify-center text-gray-500">
                Joining room...
            </div>
        );
    }

    useEffect(() => {
        if (hasJoinedRef.current) return;
        joinRoom(id, userId, "member", roomPass);
        hasJoinedRef.current = true;
    }, [id, userId, roomPass]);

    return (
        <MessageProvider roomId={id} user={userId}>
            <RoomContent />
        </MessageProvider>
    );
};

export default RoomPage;
