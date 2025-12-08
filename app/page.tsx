"use client";

import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract
} from "wagmi";
import { parseEther } from "viem";
import { BotConfig as BotConfigForm } from "@/components/BotConfig";
import { LobbyList } from "@/components/LobbyList";
import { BattleArena } from "@/components/BattleArena";
import type { BotConfig } from "@/lib/engine";

// ---------------------------------------------------------
// 1. DEPLOYMENT INSTRUCTIONS:
//    - Deploy "FightClub.sol" using Remix IDE (Injected Provider)
//    - Copy the deployed address from Remix
//    - Paste it below inside the quotes
// ---------------------------------------------------------
const CONTRACT_ADDRESS = "0xd007D58E03F66162A5AFAeF16A4ca8E5BBE658c6";

const CONTRACT_ABI = [
  {
    inputs: [],
    name: "enterArena",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  }
] as const;

export default function DashboardPage() {
  type GameState = "CONFIG" | "FIGHT" | "RESULT";

  const { isConnected } = useAccount();
  const [gameState, setGameState] = useState<GameState>("CONFIG");
  const [currentConfig, setCurrentConfig] = useState<BotConfig>({
    riskLevel: 50,
    tradeFrequency: 40,
    assetFocus: "Memecoin"
  });

  // Web3 Hooks for Payment
  const {
    data: hash,
    writeContract,
    isLoading: isWriteLoading,
    error: writeError
  } = useWriteContract();
  
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError
  } = useWaitForTransactionReceipt({
    hash
  });

  // Start game after payment confirms
  useEffect(() => {
    if (isConfirmed) {
      setGameState("FIGHT");
    }
  }, [isConfirmed]);

  const handleDeploy = (config: BotConfig) => {
    if (!isConnected) {
      alert("Please connect your wallet first!");
      return;
    }

    setCurrentConfig(config);

    // Trigger the Payment (0.001 ETH)
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "enterArena",
      value: parseEther("0.001")
    });
  };

  const handleReset = () => setGameState("CONFIG");
  const handleComplete = () => setGameState("RESULT");

  const isProcessing = isWriteLoading || isConfirming;
  const txError = writeError || confirmError;

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
            market sim.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start">
          <ConnectButton />
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <LobbyList />
        <div className="space-y-3">
          <div className="rounded-full border border-cyber-neon/30 bg-cyber-neon/5 px-3 py-1 text-xs uppercase tracking-[0.25em] text-cyber-muted">
            {gameState === "CONFIG"
              ? isProcessing
                ? "PROCESSING PAYMENT..."
                : "CONFIGURE AGENT"
              : gameState === "FIGHT"
                ? "BATTLE IN PROGRESS"
                : "RESULTS"}
          </div>

          {txError && (
            <div className="glass-panel border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
              Transaction failed: {txError.message}
            </div>
          )}

          {gameState === "CONFIG" && !isProcessing && (
            <BotConfigForm onDeploy={handleDeploy} />
          )}

          {isProcessing && (
            <div className="glass-panel animate-pulse border border-cyber-accent/50 p-8 text-center">
              <p className="text-xl font-bold text-cyber-accent">CONFIRMING ENTRY...</p>
              <p className="mt-2 text-xs text-cyber-muted">
                Waiting for block confirmation
              </p>
            </div>
          )}

          {gameState === "FIGHT" && (
            <BattleArena
              config={currentConfig}
              onReset={handleReset}
              onComplete={handleComplete}
            />
          )}

          {gameState === "RESULT" && (
            <BattleArena
              config={currentConfig}
              onReset={handleReset}
              onComplete={() => {}}
            />
          )}
        </div>
      </section>
    </div>
  );
}