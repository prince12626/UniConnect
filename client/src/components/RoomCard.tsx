import type { Room } from "../types/room";

interface Props {
    room: Room;
    onJoin: (roomId: string, password: string) => void;
}

const RoomCard = ({ room, onJoin }: Props) => {
    const membersCount = room.members.length;

    return (
        <div
            className="border border-zinc-800 rounded-xl p-5 bg-black
                 hover:border-white transition"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold truncate">{room.name}</h3>
            </div>

            {/* Meta */}
            <div className="text-sm text-zinc-400 mt-2 space-y-1">
                <p>
                    👥 {membersCount} member{membersCount > 1 && "s"}
                </p>
                <p>🎥 Screen share: {room.screensharePermission}</p>
            </div>

            {/* Footer */}
            <button
                onClick={() => onJoin(room._id, `${room.password}`)}
                className="mt-4 w-full py-2 rounded-lg
                   bg-white text-black font-medium
                   hover:bg-zinc-200 transition"
            >
                Join Room
            </button>
        </div>
    );
};

export default RoomCard;
