// @/components/LobbyList.tsx
import { Users, Clock } from "lucide-react";

type LobbyEntryProps = {
    name: string;
    status: string;
    risk: number;
    isMock?: boolean;
};

const LobbyEntry = ({ name, status, risk, isMock }: LobbyEntryProps) => (
    <div className={`flex justify-between items-center p-3 rounded-lg border ${isMock ? 'border-red-500/30' : 'border-cyber-neon/30'} bg-black/40`}>
        <div className="flex flex-col">
            <span className="text-sm font-semibold">{name}</span>
            <span className={`text-xs uppercase ${isMock ? 'text-red-400' : 'text-cyber-accent'}`}>{status}</span>
        </div>
        <div className="text-xs uppercase text-cyber-muted">
            Risk: {risk}%
        </div>
    </div>
);

export function LobbyList() {
    // Mock data for production readiness
    const mockPlayers = [
        { name: "0xBaseWhale...5aF", status: "In Arena (Memecoin)", risk: 90 },
        { name: "0xC0deMaster...40B", status: "Waiting (BlueChip)", risk: 20 },
        { name: "0x8Ethernaut...09C", status: "In Arena (Layer2)", risk: 60 },
    ];
    
    return (
        <section className="glass-panel p-6 space-y-4">
            <header className="flex items-center gap-2">
                <Users className="h-5 w-5 text-cyber-neon" />
                <h2 className="text-xl font-semibold uppercase tracking-widest">
                    Live Lobby (Base Sepolia)
                </h2>
            </header>
            
            <div className="flex justify-between items-center text-xs uppercase tracking-wide text-cyber-muted py-2 border-b border-cyber-muted/30">
                <span>Total Agents: {mockPlayers.length + 1}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3"/> Avg Battle: 3m 45s</span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
                <LobbyEntry name="YOU" status="Configuring Loadout" risk={50} />
                <LobbyEntry name="MOCK OPPONENT" status="Locked In" risk={45} isMock={true} />
                {mockPlayers.map((p, index) => (
                    <LobbyEntry key={index} {...p} />
                ))}
            </div>
        </section>
    );
}