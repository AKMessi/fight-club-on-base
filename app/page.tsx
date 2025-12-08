"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { BotConfig as BotConfigForm } from "@/components/BotConfig";
import { LobbyList } from "@/components/LobbyList";
import { BattleArena } from "@/components/BattleArena";
import type { BotConfig } from "@/lib/engine";

// 1. Add your deployed contract address here
const CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS_HERE"; 

// 2. Minimal ABI for enterArena
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

  // Web3 Hooks
  const { data: hash, writeContract, isLoading: isWriteLoading } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Watch for successful payment to start the game
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
    
    // Trigger the wallet transaction
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "enterArena",
      value: parseEther("0.001"), // Must match entryFee in solidity
    });
  };

  const handleReset = () => setGameState("CONFIG");
  const handleComplete = () => setGameState("RESULT");

  const isProcessing = isWriteLoading || isConfirming;

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
              ? isProcessing ? "PROCESSING TRANSACTION..." : "CONFIGURE AGENT"
              : gameState === "FIGHT"
                ? "BATTLE IN PROGRESS"
                : "RESULTS"}
          </div>
          
          {gameState === "CONFIG" && !isProcessing && (
            <BotConfigForm onDeploy={handleDeploy} />
          )}

          {isProcessing && (
             <div className="glass-panel p-8 text-center animate-pulse">
                <p className="text-cyber-accent">CONFIRMING ENTRY FEE...</p>
                <p className="text-xs text-cyber-muted mt-2">Waiting for block confirmation</p>
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