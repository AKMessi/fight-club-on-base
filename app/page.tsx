"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";
import { BotConfig as BotConfigForm } from "@/components/BotConfig";
import { LobbyList } from "@/components/LobbyList";
import { BattleArena } from "@/components/BattleArena";
import type { BotConfig } from "@/lib/engine";

export default function DashboardPage() {
  type GameState = "CONFIG" | "FIGHT" | "RESULT";

  const [gameState, setGameState] = useState<GameState>("CONFIG");
  const [currentConfig, setCurrentConfig] = useState<BotConfig>({
    riskLevel: 50,
    tradeFrequency: 40,
    assetFocus: "Memecoin"
  });

  const handleDeploy = (config: BotConfig) => {
    setCurrentConfig(config);
    setGameState("FIGHT");
  };

  const handleReset = () => setGameState("CONFIG");
  const handleComplete = () => setGameState("RESULT");

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyber-muted">
            DeFi Battle Royale
          </p>
          <h1 className="text-3xl font-semibold uppercase tracking-[0.2em] text-cyber-neon md:text-4xl">
            Fight Club
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-cyber-muted">
            Configure AI agents, drop into Base, and let them battle in a live
            market sim. Tune your risk, frequency, and asset focus before you
            enter the arena.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start">
          <ConnectButton />
          <button className="rounded-md border border-cyber-neon/60 bg-cyber-neon/10 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-cyber-neon transition hover:bg-cyber-neon hover:text-black">
            Enter Arena
          </button>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <LobbyList />
        <div className="space-y-3">
          <div className="rounded-full border border-cyber-neon/30 bg-cyber-neon/5 px-3 py-1 text-xs uppercase tracking-[0.25em] text-cyber-muted">
            {gameState === "CONFIG"
              ? "Configure"
              : gameState === "FIGHT"
                ? "Deploying"
                : "Results"}
          </div>
          {gameState === "CONFIG" ? (
            <BotConfigForm onDeploy={handleDeploy} />
          ) : (
            <BattleArena
              config={currentConfig}
              onReset={handleReset}
              onComplete={handleComplete}
            />
          )}
        </div>
      </section>
    </div>
  );
}

