import { Tldraw, Editor, getSnapshot, loadSnapshot } from "tldraw";
import { useEffect, useRef, useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import "tldraw/tldraw.css";
import { socket } from "../socket";

function useThrottle<T extends (...args: any[]) => void>(
    fn: T,
    delay: number
): T {
    const last = useRef(0);
    return useCallback(
        (...args: any[]) => {
            const now = Date.now();
            if (now - last.current >= delay) {
                last.current = now;
                fn(...args);
            }
        },
        [fn, delay]
    ) as T;
}

export default function Canvas() {
    const { id: roomId } = useParams();
    const [editor, setEditor] = useState<Editor | null>(null);

    const isRemote = useRef(false);
    const pendingRemote = useRef<any | null>(null);

    const onMount = (ed: Editor) => {
        setEditor(ed);
    };

    /* ---------------- SNAPSHOT EMIT ---------------- */

    const emitSnapshot = useCallback(
        (snapshot: any) => {
            if (!roomId) return;
            socket.emit("canvas:update", { roomId, snapshot });
        },
        [roomId]
    );

    const throttledEmit = useThrottle(emitSnapshot, 60); // ~16fps

    useEffect(() => {
        if (!editor) return;

        const unsubscribe = editor.store.listen(
            (e) => {
                if (isRemote.current) return;
                if (e.source !== "user") return;

                const snapshot = getSnapshot(editor.store);

                // create filtered snapshot (NO mutation)
                const filteredSnapshot = Object.fromEntries(
                    Object.entries(snapshot).filter(([key]) => {
                        return (
                            !key.startsWith("camera") &&
                            !key.startsWith("instance") &&
                            !key.startsWith("pointer")
                        );
                    })
                );

                throttledEmit(filteredSnapshot);
            },
            { scope: "document" }
        );

        return () => {
            unsubscribe();
        };
    }, [editor, throttledEmit]);

    /* ---------------- REMOTE APPLY (SMOOTH) ---------------- */

    useEffect(() => {
        if (!editor) return;

        const apply = () => {
            if (!pendingRemote.current) return;

            isRemote.current = true;
            loadSnapshot(editor.store, pendingRemote.current);
            pendingRemote.current = null;

            requestAnimationFrame(() => {
                isRemote.current = false;
            });
        };

        const onRemote = ({ snapshot }: any) => {
            pendingRemote.current = snapshot;
            requestAnimationFrame(apply);
        };

        socket.on("canvas:update", onRemote);

        return () => {
            socket.off("canvas:update", onRemote);
        };
    }, [editor]);

    return (
        <div className="fixed inset-0 overflow-hidden">
            <Tldraw onMount={onMount} inferDarkMode />
        </div>
    );
}
