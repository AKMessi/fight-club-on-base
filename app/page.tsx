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
import { LiveLeaderboard } from "@/components/LiveLeaderboard";
import { BattleArena } from "@/components/BattleArena";
import type { BotConfig } from "@/lib/engine";

// UPDATED: Use environment variable
const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0xd007D58E03F66162A5AFAeF16A4ca8E5BBE658c6") as `0x${string}`;
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

const CONTRACT_ABI = [
  {
    inputs: [
      { name: "riskLevel", type: "uint8" },
      { name: "tradeFrequency", type: "uint8" },
      { name: "assetFocus", type: "uint8" }
    ],
    name: "enterArena",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  }
] as const;

export default function DashboardPage() {
  type GameState = "CONFIG" | "WAITING" | "BATTLE" | "RESULT";

  const { isConnected, address } = useAccount();
  const [gameState, setGameState] = useState<GameState>("CONFIG");
  const [currentConfig, setCurrentConfig] = useState<BotConfig>({
    riskLevel: 50,
    tradeFrequency: 40,
    assetFocus: "Memecoin"
  });
  const [battleInfo, setBattleInfo] = useState<any>(null);

  const {
    data: hash,
    writeContract,
    isPending: isWriteLoading,
    error: writeError
  } = useWriteContract();
  
  const {
    isPending: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError
  } = useWaitForTransactionReceipt({
    hash
  });

  // Fetch current battle info
  useEffect(() => {
    const fetchBattleInfo = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/battle/current`);
        const data = await response.json();
        setBattleInfo(data);
      } catch (error) {
        console.error('Failed to fetch battle info:', error);
      }
    };

    fetchBattleInfo();
    const interval = setInterval(fetchBattleInfo, 10000); // Update every 10s

    return () => clearInterval(interval);
  }, []);

  // Move to waiting state after payment confirms
  useEffect(() => {
    if (isConfirmed) {
      setGameState("WAITING");
    }
  }, [isConfirmed]);

  const handleDeploy = (config: BotConfig) => {
    if (!isConnected) {
      alert("Please connect your wallet first!");
      return;
    }

    setCurrentConfig(config);

    // Map asset focus to uint8
    const assetFocusMap = {
      'BlueChip': 0,
      'Layer2': 1,
      'Memecoin': 2,
    };

    // Call smart contract with config
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "enterArena",
      args: [
        config.riskLevel,
        config.tradeFrequency,
        assetFocusMap[config.assetFocus]
      ],
      value: parseEther("0.001")
    });
  };

  const handleReset = () => setGameState("CONFIG");

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
            Configure AI agents, drop into Base, and battle for the prize pool.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start">
          <ConnectButton />
        </div>
      </header>

      {/* Battle Info Banner */}
      {battleInfo && (
        <div className="glass-panel p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs uppercase tracking-wide text-cyber-muted">Current Battle #{battleInfo.battleId}</p>
              <p className="text-lg font-bold text-cyber-neon">{battleInfo.players.length} / 100 Players</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-cyber-muted">Prize Pool</p>
              <p className="text-lg font-bold text-cyber-accent">{battleInfo.prizePool} ETH</p>
            </div>
          </div>
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <LiveLeaderboard />
        
        <div className="space-y-3">
          <div className="rounded-full border border-cyber-neon/30 bg-cyber-neon/5 px-3 py-1 text-xs uppercase tracking-[0.25em] text-cyber-muted">
            {gameState === "CONFIG"
              ? isProcessing ? "PROCESSING PAYMENT..." : "CONFIGURE AGENT"
              : gameState === "WAITING"
                ? "WAITING FOR BATTLE START"
                : gameState === "BATTLE"
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
              <p className="text-xl font-bold text-cyber-accent">JOINING BATTLE...</p>
              <p className="mt-2 text-xs text-cyber-muted">
                Waiting for block confirmation
              </p>
            </div>
          )}

          {gameState === "WAITING" && (
            <div className="glass-panel p-6 text-center">
              <div className="animate-pulse">
                <p className="text-xl font-bold text-cyber-neon">✅ JOINED!</p>
                <p className="mt-2 text-sm text-cyber-muted">
                  Waiting for {100 - (battleInfo?.players.length || 0)} more players...
                </p>
                <p className="mt-4 text-xs text-cyber-muted">
                  Battle starts automatically when 100 players join, or admin can start manually.
                </p>
              </div>
              <button 
                onClick={handleReset}
                className="mt-6 text-sm text-cyber-accent hover:text-cyber-neon"
              >
                Configure Another Agent
              </button>
            </div>
          )}

          {gameState === "BATTLE" && battleInfo && (
            <BattleArena
              battleId={battleInfo.battleId}
              config={currentConfig}
              onComplete={() => setGameState("RESULT")}
            />
          )}
        </div>
      </section>
    </div>
  );
}