import { useEffect, useRef, useState } from "react";
import { socket } from "../socket/index";
import { Monitor, X } from "lucide-react";

const ICE_SERVERS = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const ScreenShare = ({ roomId }: { roomId: string }) => {
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);

    const [isSharing, setIsSharing] = useState(false);
    const [isRemoteSharing, setIsRemoteSharing] = useState(false);

    const startScreenShare = async () => {
        const stream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
        });

        if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
        }

        const pc = new RTCPeerConnection(ICE_SERVERS);
        pcRef.current = pc;

        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        pc.onicecandidate = (e) => {
            if (e.candidate) {
                socket.emit("screen:ice", { roomId, candidate: e.candidate });
            }
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit("screen:offer", { roomId, offer });

        stream.getVideoTracks()[0].onended = stopScreenShare;
        setIsSharing(true);
    };

    const stopScreenShare = () => {
        pcRef.current?.close();
        pcRef.current = null;
        setIsSharing(false);

        if (localVideoRef.current?.srcObject) {
            (localVideoRef.current.srcObject as MediaStream)
                .getTracks()
                .forEach((t) => t.stop());
            localVideoRef.current.srcObject = null;
        }

        socket.emit("screen:stop", { roomId });
    };
    useEffect(() => {
        socket.on("screen:offer", async ({ offer }) => {
            const pc = new RTCPeerConnection(ICE_SERVERS);
            pcRef.current = pc;

            pc.ontrack = (e) => {
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = e.streams[0];
                    setIsRemoteSharing(true);
                }
            };

            pc.onicecandidate = (e) => {
                if (e.candidate) {
                    socket.emit("screen:ice", {
                        roomId,
                        candidate: e.candidate,
                    });
                }
            };

            await pc.setRemoteDescription(offer);
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            socket.emit("screen:answer", { roomId, answer });
        });

        socket.on("screen:answer", async ({ answer }) => {
            await pcRef.current?.setRemoteDescription(answer);
        });

        socket.on("screen:ice", async ({ candidate }) => {
            await pcRef.current?.addIceCandidate(candidate);
        });

        socket.on("screen:stop", () => {
            setIsRemoteSharing(false);
            if (remoteVideoRef.current?.srcObject) {
                (remoteVideoRef.current.srcObject as MediaStream)
                    .getTracks()
                    .forEach((t) => t.stop());
                remoteVideoRef.current.srcObject = null;
            }
        });

        return () => {
            socket.off("screen:offer");
            socket.off("screen:answer");
            socket.off("screen:ice");
            socket.off("screen:stop");
        };
    }, [roomId]);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-black/90 p-6 relative">
            {/* Header */}
            <div className="mb-4 text-center">
                <h2 className="text-2xl font-semibold text-white">
                    Screen Share
                </h2>
                <p className="text-sm text-gray-400">
                    Live screen sharing with room members
                </p>
            </div>

            {/* Video Container */}
            <div className="relative w-full max-w-5xl aspect-video bg-black rounded-xl overflow-hidden border border-white/40 shadow-2xl">
                {/* Remote Screen (Main View) */}
                <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain bg-black"
                />

                {/* Local Preview (Picture-in-Picture) */}
                {isSharing && (
                    <div className="absolute bottom-4 right-4 w-64 aspect-video rounded-lg overflow-hidden border border-white shadow-lg bg-black">
                        <video
                            ref={localVideoRef}
                            autoPlay
                            muted
                            playsInline
                            className="w-full h-full object-contain"
                        />
                        <span className="absolute top-1 left-1 text-xs bg-black/60 text-white px-2 py-0.5 rounded">
                            You
                        </span>
                    </div>
                )}

                {/* Empty State */}
                {!isRemoteSharing && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                        <Monitor size={64} className="mb-4 opacity-40" />
                        <p>No one is sharing their screen</p>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="mt-6 flex gap-4">
                {!isSharing ? (
                    <button
                        onClick={startScreenShare}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition active:scale-95"
                    >
                        <Monitor size={20} />
                        Start Sharing
                    </button>
                ) : (
                    <button
                        onClick={stopScreenShare}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition active:scale-95"
                    >
                        <X size={20} />
                        Stop Sharing
                    </button>
                )}
            </div>
        </div>
    );
};

export default ScreenShare;
