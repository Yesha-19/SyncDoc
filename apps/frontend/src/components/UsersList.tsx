import { Users } from "lucide-react";

interface User {
    id: string;
    name: string;
}

interface UserListProps {
    users: User[];
    roomId: string;
    localUserId?: string;
    localUserName?: string;
}

export const UserList = ({ users, roomId, localUserId, localUserName }: UserListProps) => {
    const generateUserColor = (name: string) => {
        const colors = [
            "bg-gradient-to-br from-purple-500 to-pink-500",
            "bg-gradient-to-br from-blue-500 to-cyan-500",
            "bg-gradient-to-br from-green-500 to-emerald-500",
            "bg-gradient-to-br from-orange-500 to-red-500",
            "bg-gradient-to-br from-indigo-500 to-purple-500",
            "bg-gradient-to-br from-yellow-500 to-orange-500",
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    const remoteUsers = users.filter(u => u.id !== localUserId && u.name !== localUserName);

    return (
        <div className="space-y-4">
            {/* Users Section */}
            <div className="rounded-2xl border border-white/[.1] bg-[#111a2b]/85 p-4 shadow-xl shadow-black/15 backdrop-blur-xl">
                <div className="flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-white">
                        Users ({users.length})
                    </h3>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">

                    {/* Local User First */}
                    {localUserName && (
                        <div className="flex items-center gap-3 p-3 bg-blue-900/40 rounded-lg border border-blue-500/30">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${generateUserColor(localUserName)} shadow-lg flex-shrink-0`}>
                                {localUserName.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-medium truncate">{localUserName} <span className="text-slate-400 font-normal">(You)</span></p>
                                <div className="flex items-center gap-1 mt-0.5">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                    <span className="text-xs text-green-400">Editing</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Remote Users */}
                    {remoteUsers.map((user) => (
                        <div key={user.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${generateUserColor(user.name)} shadow-lg flex-shrink-0`}>
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-medium truncate">{user.name}</p>
                                <div className="flex items-center gap-1 mt-0.5">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                    <span className="text-xs text-green-400">Active</span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {users.length === 0 && (
                        <div className="text-center py-8">
                            <Users className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                            <p className="text-gray-400 text-sm">No users connected</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Room Details Section */}
            <div className="rounded-2xl border border-white/[.1] bg-[#111a2b]/85 p-4 shadow-xl shadow-black/15 backdrop-blur-xl">
                <div className="mb-3 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-extrabold text-white">Room details</h3>
                        <p className="mt-0.5 text-[11px] text-slate-500">Use the header Copy room button to share.</p>
                    </div>
                    <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] font-bold text-emerald-300">LIVE</span>
                </div>
                <div className="rounded-xl border border-white/[.08] bg-[#080e1b]/85 p-3">
                    <code className="font-mono text-sm break-all text-cyan-200">
                        {roomId || "Loading..."}
                    </code>
                </div>
            </div>
        </div>
    );
};
