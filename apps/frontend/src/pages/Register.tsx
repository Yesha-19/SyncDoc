// --- IMPORTS ---
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { userAtom } from '../atoms/userAtom';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { socketAtom } from '../atoms/socketAtom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FiArrowLeft, FiFileText, FiHash, FiUser, FiUsers, FiZap } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { GridPattern } from "../components/ui/aceternity/grid-pattern";

export const Register = () => {
    // --- LOCAL STATE ---
    const [name, setName] = useState<string>("");
    const [roomId, setRoomId] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    // --- GLOBAL STATE (RECOIL) ---
    const [socket, setSocket] = useRecoilState<WebSocket | null>(socketAtom);
    const [user, setUser] = useRecoilState(userAtom);

    // --- ROUTER HOOKS ---
    const params = useParams();
    const navigate = useNavigate();

    function generateId() {
        const id = Math.floor(Math.random() * 100000);
        return id.toString();
    }

    // --- CORE LOGIC: WEBSOCKET CONNECTION ---
    const initializeSocket = (overrideRoomId?: string) => {
        if (name == "") {
            alert("Please enter a name to continue");
            return;
        }

        setLoading(true);
        const currentUserId = user.id || generateId();
        const finalRoomId = overrideRoomId !== undefined ? overrideRoomId : roomId;

        if (!socket || socket.readyState === WebSocket.CLOSED) {
            const ws = new WebSocket(`${import.meta.env.VITE_WEBSOCKET_SERVER_URL}?roomId=${finalRoomId}&id=${currentUserId}&name=${name}`);
            setSocket(ws);

            ws.onopen = () => {
                console.log("Connected to WebSocket");
            }

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);

                if (data.type == "roomId") {
                    setRoomId(data.roomId);
                    setUser({
                        id: currentUserId,
                        name: name,
                        roomId: data.roomId
                    });
                    setLoading(false);
                    // Navigate into the document editor room
                    navigate("/doc/" + data.roomId);
                }
            };

            ws.onerror = (error) => {
                console.error("WebSocket Error:", error);
                alert("Failed to connect to the server. Please make sure the WebSocket server is running.");
                setLoading(false);
            };

            ws.onclose = () => {
                console.log("WebSocket connection closed from register page");
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }

    // --- BUTTON HANDLERS ---
    const handleNewRoom = () => {
        if (!loading) {
            setRoomId("");
            initializeSocket("");
        }
    }

    const handleJoinRoom = () => {
        if (roomId != "" && !loading) {
            initializeSocket(roomId);
        } else {
            alert("Please enter a valid room ID");
        }
    }

    // --- INITIALIZATION ---
    useEffect(() => {
        setRoomId(params.roomId || "");
    }, [])

    // --- UI RENDER ---
    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-[#080c16] py-6 text-slate-100 sm:py-10">
            <GridPattern />
            <div className="premium-grid pointer-events-none absolute inset-0 opacity-40" />
            <div className="pointer-events-none absolute left-[-9rem] top-[-11rem] h-[28rem] w-[28rem] rounded-full bg-cyan-500/15 blur-[120px]" />
            <div className="pointer-events-none absolute bottom-[-12rem] right-[-5rem] h-[30rem] w-[30rem] rounded-full bg-indigo-500/15 blur-[130px]" />

            <div className="relative z-10 mx-auto w-full max-w-5xl px-5 sm:px-8">
                <div className="mb-10 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-sm font-bold text-slate-300 transition hover:text-white"><FiArrowLeft /> Back to home</Link>
                    <div className="flex items-center gap-2 text-sm font-extrabold tracking-tight text-white"><span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600"><FiFileText /></span>DocSync</div>
                </div>
                <div className="grid items-center gap-10 lg:grid-cols-[.85fr_1fr]">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .45 }} className="hidden lg:block">
                        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-300"><FiZap size={23} /></div>
                        <p className="mb-4 text-xs font-bold tracking-[.16em] text-cyan-300">READY WHEN YOU ARE</p>
                        <h1 className="max-w-md text-5xl font-extrabold leading-[1.05] tracking-[-.05em] text-white">Join the flow.<br /><span className="text-slate-400">Make progress together.</span></h1>
                        <p className="mt-6 max-w-sm text-base leading-7 text-slate-400">Open a shared document space for your team in seconds. Your writing, conversations, and ideas stay side by side.</p>
                        <div className="mt-10 space-y-4 border-l border-white/10 pl-5 text-sm text-slate-400"><p className="flex items-center gap-3"><span className="h-2 w-2 rounded-full bg-cyan-300" />Live document collaboration</p><p className="flex items-center gap-3"><span className="h-2 w-2 rounded-full bg-indigo-300" />Real-time chat alongside your doc</p><p className="flex items-center gap-3"><span className="h-2 w-2 rounded-full bg-emerald-300" />Share a room with one code</p></div>
                    </motion.div>
                    <div className="w-full max-w-md justify-self-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="w-full"
                        >
                            <div className="mb-7 text-center lg:hidden">
                                <div className="mb-4 flex justify-center">
                                    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-950/40">
                                        <FiFileText className="h-7 w-7 text-white" />
                                    </div>
                                </div>
                                <h1 className="text-3xl font-extrabold tracking-tight text-white">Your shared workspace</h1>
                                <p className="mt-2 text-sm text-slate-400">Create a room or join your team.</p>
                            </div>

                            <div className="rounded-2xl border border-white/[.12] bg-[#111a2b]/90 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
                                <div className="mb-7 hidden lg:block"><h2 className="text-2xl font-extrabold tracking-tight text-white">Enter your workspace</h2><p className="mt-2 text-sm text-slate-400">Add your details to start collaborating.</p></div>
                                <div className="space-y-5">

                                    {/* Name Input */}
                                    <div>
                                        <label htmlFor="name" className="mb-2 block text-sm font-bold text-slate-200">Your name</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FiUser className="text-slate-500" />
                                            </div>
                                            <Input
                                                id="name"
                                                type="text"
                                                placeholder="e.g. Harshit Singh"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="h-12 rounded-xl border-white/10 bg-[#080e1b]/80 pl-10 text-white placeholder:text-slate-600 focus-visible:border-cyan-300/50 focus-visible:ring-cyan-300/20"
                                            />
                                        </div>
                                    </div>

                                    {/* Room ID Input */}
                                    <div>
                                        <div className="mb-2 flex items-center justify-between"><label htmlFor="roomId" className="block text-sm font-bold text-slate-200">Room code</label><span className="text-xs text-slate-500">Optional</span></div>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FiHash className="text-slate-500" />
                                            </div>
                                            <Input
                                                id="roomId"
                                                type="text"
                                                placeholder="Paste a shared room code"
                                                value={roomId}
                                                onChange={(e) => setRoomId(e.target.value)}
                                                className="h-12 rounded-xl border-white/10 bg-[#080e1b]/80 pl-10 text-white placeholder:text-slate-600 focus-visible:border-cyan-300/50 focus-visible:ring-cyan-300/20"
                                            />
                                        </div>
                                        <p className="mt-2 text-xs text-slate-500">Leave blank and we'll create a private room for you.</p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-3 pt-2">
                                        <Button
                                            className="h-12 w-full rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 font-extrabold text-slate-950 shadow-lg shadow-cyan-950/30 transition-all duration-200 hover:-translate-y-0.5 hover:from-cyan-300 hover:to-blue-400 flex items-center justify-center gap-2"
                                            disabled={loading || !name}
                                            onClick={handleNewRoom}
                                        >
                                            <FiFileText className="h-4 w-4" />
                                            {loading ? 'Connecting...' : 'Create new room'}
                                        </Button>

                                        <Button
                                            className="h-12 w-full rounded-xl border border-white/10 bg-white/[.055] font-bold text-white transition-all duration-200 hover:border-white/20 hover:bg-white/[.09] flex items-center justify-center gap-2"
                                            disabled={loading || !roomId || !name}
                                            onClick={handleJoinRoom}
                                        >
                                            <FiUsers className="h-4 w-4" />
                                            {loading ? 'Connecting...' : 'Join with room code'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
                <p className="mt-8 text-center text-xs text-slate-600">A focused room for shared documents and ideas.</p>
            </div>
        </div>
    );
};
