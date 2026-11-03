import { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { Copy, FileText, Users, Wifi, WifiOff } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useRecoilState } from "recoil";
import { socketAtom } from "../atoms/socketAtom";
import { userAtom } from "../atoms/userAtom";
import { connectedUsersAtom } from "../atoms/connectedUsersAtom";
import { ChatWindow, type ChatMessage } from "../components/ChatWindow";
import { UserList } from "../components/UsersList";

const YJS_SERVER_URL =
    import.meta.env.VITE_YJS_SERVER_URL || "ws://localhost:5001";

export const DocumentEditor = () => {
    const { roomId = "" } = useParams();
    const navigate = useNavigate();
    const [socket] = useRecoilState<WebSocket | null>(socketAtom);
    const [user] = useRecoilState(userAtom);
    const [users, setUsers] = useRecoilState<any[]>(connectedUsersAtom);

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [copied, setCopied] = useState(false);
    const [docTitle, setDocTitle] = useState("Untitled Document");
    const [editingTitle, setEditingTitle] = useState(false);

    // Yjs refs for document CRDT
    const ydocRef = useRef<Y.Doc | null>(null);
    const providerRef = useRef<WebsocketProvider | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    // Track whether we're applying a remote update to avoid feedback loops
    const isRemoteUpdate = useRef(false);

    // ── Yjs setup ──────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!roomId) return;

        const ydoc = new Y.Doc();
        const ytext = ydoc.getText("document");
        const ymeta = ydoc.getMap("meta");

        const provider = new WebsocketProvider(YJS_SERVER_URL, roomId, ydoc);
        ydocRef.current = ydoc;
        providerRef.current = provider;

        // Hydrate textarea when remote state arrives
        const onSync = (isSynced: boolean) => {
            if (isSynced && textareaRef.current) {
                isRemoteUpdate.current = true;
                textareaRef.current.value = ytext.toString();
                isRemoteUpdate.current = false;
                const savedTitle = ymeta.get("title") as string | undefined;
                if (savedTitle) setDocTitle(savedTitle);
            }
        };
        provider.on("sync", onSync);

        // Reflect any remote text changes into the textarea
        const onTextChange = () => {
            if (textareaRef.current && !isRemoteUpdate.current) {
                // Check if the change came from a remote peer by comparing
                const remoteContent = ytext.toString();
                if (textareaRef.current.value !== remoteContent) {
                    isRemoteUpdate.current = true;
                    const selStart = textareaRef.current.selectionStart;
                    const selEnd = textareaRef.current.selectionEnd;
                    textareaRef.current.value = remoteContent;
                    // Restore cursor position as best we can
                    textareaRef.current.selectionStart = selStart;
                    textareaRef.current.selectionEnd = selEnd;
                    isRemoteUpdate.current = false;
                }
            }
        };
        ytext.observe(onTextChange);

        // Reflect remote title changes
        const onMetaChange = () => {
            const t = ymeta.get("title") as string | undefined;
            if (t) setDocTitle(t);
        };
        ymeta.observe(onMetaChange);

        return () => {
            provider.off("sync", onSync);
            ytext.unobserve(onTextChange);
            ymeta.unobserve(onMetaChange);
            provider.destroy();
            ydoc.destroy();
        };
    }, [roomId]);

    // ── WebSocket (presence + chat) ────────────────────────────────────────────
    useEffect(() => {
        if (!socket) { navigate("/start"); return; }

        const handleMessage = (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === "users") setUsers(data.users || []);
                if (data.type === "chat_message")
                    setMessages(prev => [
                        ...prev,
                        { ...data, id: `${data.senderId}-${data.timestamp}` },
                    ]);
            } catch { /* ignore malformed messages */ }
        };

        socket.addEventListener("message", handleMessage);
        socket.send(JSON.stringify({ type: "requestToGetUsers", roomId }));
        return () => socket.removeEventListener("message", handleMessage);
    }, [navigate, roomId, setUsers, socket]);

    // ── Handlers ───────────────────────────────────────────────────────────────
    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (isRemoteUpdate.current || !ydocRef.current) return;
        const ydoc = ydocRef.current;
        const ytext = ydoc.getText("document");
        const newValue = e.target.value;

        // Replace entire Yjs text content with local value
        // Using a transaction so it's treated as a single atomic op
        ydoc.transact(() => {
            ytext.delete(0, ytext.length);
            ytext.insert(0, newValue);
        });
    };

    const handleTitleChange = (newTitle: string) => {
        setDocTitle(newTitle);
        if (ydocRef.current) {
            const ymeta = ydocRef.current.getMap("meta");
            ymeta.set("title", newTitle);
        }
    };

    const copyRoom = async () => {
        await navigator.clipboard.writeText(roomId);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
    };

    const sendChat = (text: string, imageUrl?: string) => {
        const timestamp = Date.now();
        
        // 1. Instantly display the message on the sender's own screen
        setMessages(prev => [
            ...prev,
            {
                id: `${user.id}-${timestamp}`,
                text,
                imageUrl,
                senderId: user.id || "",
                senderName: user.name || "You",
                timestamp,
            }
        ]);

        // 2. Send the message to the server so everyone else can see it
        if (socket?.readyState === WebSocket.OPEN) {
            socket.send(
                JSON.stringify({
                    type: "chat_message",
                    text,
                    imageUrl,
                    senderName: user.name,
                    timestamp,
                    roomId,
                })
            );
        }
    };

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <main className="min-h-screen bg-[#080c16] p-3 text-slate-100 sm:p-5">
            {/* Header */}
            <header className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#111a2b] px-4 py-3">
                <div className="flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600">
                        <FileText size={16} />
                    </span>
                    {editingTitle ? (
                        <input
                            autoFocus
                            value={docTitle}
                            onChange={e => handleTitleChange(e.target.value)}
                            onBlur={() => setEditingTitle(false)}
                            onKeyDown={e => { if (e.key === "Enter") setEditingTitle(false); }}
                            className="rounded-md border border-cyan-300/30 bg-[#0a1020] px-2 py-1 text-sm font-bold text-white outline-none focus:border-cyan-300/60"
                        />
                    ) : (
                        <button
                            onClick={() => setEditingTitle(true)}
                            className="text-sm font-bold text-white hover:text-cyan-300 transition-colors"
                            title="Click to rename"
                        >
                            {docTitle}
                        </button>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        {socket?.readyState === WebSocket.OPEN
                            ? <><Wifi size={12} className="text-emerald-400" /> Connected</>
                            : <><WifiOff size={12} className="text-rose-400" /> Disconnected</>}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={copyRoom}
                        className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs hover:bg-white/10 transition-colors"
                    >
                        <Copy size={14} /> {copied ? "Copied!" : "Copy room"}
                    </button>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Users size={14} /> {users.length}
                    </span>
                </div>
            </header>

            {/* Main layout */}
            <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_300px]">
                {/* Document editor panel */}
                <section className="min-w-0 overflow-hidden rounded-xl border border-white/10 bg-[#0d1423]">
                    {/* Toolbar */}
                    <div className="flex items-center gap-2 border-b border-white/10 bg-[#111a2b] px-4 py-3">
                        <span className="text-xs text-slate-500">Shared document · changes sync in real time</span>
                        <span className="ml-auto rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-bold text-emerald-300">LIVE</span>
                    </div>

                    {/* The collaborative textarea */}
                    <textarea
                        ref={textareaRef}
                        onChange={handleTextareaChange}
                        placeholder="Start writing… your collaborators will see every change instantly."
                        className="h-[calc(100vh-14rem)] min-h-[480px] w-full resize-none bg-[#0d1423] px-6 py-5 text-sm leading-7 text-slate-200 outline-none placeholder:text-slate-600"
                        spellCheck
                    />
                </section>

                {/* Right sidebar */}
                <aside className="flex min-h-[520px] flex-col gap-3">
                    {/* Presence panel */}
                    <UserList
                        users={users}
                        roomId={roomId}
                        localUserId={user.id}
                        localUserName={user.name}
                    />
                    {/* Chat panel */}
                    <div className="flex min-h-[380px] flex-1 flex-col overflow-hidden rounded-xl border border-white/10">
                        <ChatWindow
                            messages={messages}
                            localUserId={user.id}
                            onSendMessage={sendChat}
                        />
                    </div>
                </aside>
            </div>
        </main>
    );
};
