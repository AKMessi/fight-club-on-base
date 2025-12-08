import { Flame, Shield, Users } from "lucide-react";
import Link from "next/link";

type Lobby = {
  id: string;
  name: string;
  status: "Open" | "In Progress" | "Locked";
  players: number;
  prizePool: string;
};

const mockLobbies: Lobby[] = [
  {
    id: "alpha",
    name: "Neon Alpha",
    status: "Open",
    players: 12,
    prizePool: "12.5 ETH"
  },
  {
    id: "degen",
    name: "Degen Dojo",
    status: "In Progress",
    players: 32,
    prizePool: "25,000 USDC"
  },
  {
    id: "ghost",
    name: "Ghost Protocol",
    status: "Locked",
    players: 64,
    prizePool: "88,888 BASE"
  }
];

const statusColors: Record<Lobby["status"], string> = {
  Open: "text-cyber-neon",
  "In Progress": "text-cyber-accent",
  Locked: "text-slate-400"
};

export function LobbyList() {
  return (
    <section className="glass-panel p-6 space-y-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-cyber-accent" />
          <h2 className="text-lg font-semibold uppercase tracking-widest">
            Active Lobbies
          </h2>
        </div>
        <Link
          href="#"
          className="text-sm uppercase tracking-wide text-cyber-accent hover:text-cyber-neon"
        >
          View Rules
        </Link>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {mockLobbies.map((lobby) => (
          <article
            key={lobby.id}
            className="glass-panel border border-cyber-neon/30 p-4 shadow-neon transition hover:-translate-y-1 hover:shadow-[0_0_24px_rgba(0,255,127,0.3)]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-cyber-accent" />
                <p className="text-sm uppercase tracking-wider text-cyber-muted">
                  {lobby.status}
                </p>
              </div>
              <span className={`text-xs font-semibold ${statusColors[lobby.status]}`}>
                {lobby.status === "Locked" ? "Invite Only" : "Live"}
              </span>
            </div>

            <h3 className="mt-3 text-xl font-semibold">{lobby.name}</h3>

            <div className="mt-4 flex items-center justify-between text-sm text-cyber-muted">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{lobby.players} bots</span>
              </div>
              <span className="font-semibold text-cyber-accent">
                {lobby.prizePool}
              </span>
            </div>

            <button className="mt-4 w-full rounded-md border border-cyber-neon/50 bg-cyber-panel py-2 text-sm font-semibold uppercase tracking-wide text-cyber-neon transition hover:bg-cyber-neon hover:text-black">
              Enter Arena
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

