"use client";

import { useState, useEffect } from "react";
import { Zap, TrendingUp, TrendingDown, RefreshCw, Trophy, AlertTriangle } from "lucide-react";
import type { BotConfig, BattleResult } from "@/lib/engine";
import { runBattleSimulation, mockOpponentConfig, getResult } from "@/lib/engine";

type BattleArenaProps = {
  config: BotConfig;
  onReset: () => void;
  onComplete: (result: BattleResult) => void;
};

const SIMULATION_DURATION = 3000; // 3 seconds for mock battle

export function BattleArena({ config, onReset, onComplete }: BattleArenaProps) {
  const [progress, setProgress] = useState(0); // 0 to 100
  const [status, setStatus] = useState<"RUNNING" | "CALCULATING" | "FINISHED">("RUNNING");
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [result, setResult] = useState<BattleResult | null>(null);

  useEffect(() => {
    if (status !== "RUNNING") return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setStatus("CALCULATING");
          return 100;
        }
        return prev + (100 / (SIMULATION_DURATION / 100)); // Increment every 100ms
      });
    }, 100);

    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    if (status === "CALCULATING") {
      // 1. Run deterministic simulation
      const pScore = runBattleSimulation(config);
      const oScore = runBattleSimulation(mockOpponentConfig);
      
      const finalResult = getResult(pScore, oScore);
      
      setPlayerScore(pScore);
      setOpponentScore(oScore);
      setResult(finalResult);
      setStatus("FINISHED");
      onComplete(finalResult);
    }
  }, [status, config, onComplete]);

  const getColorClass = (score: number) => {
    if (score > 80) return "text-green-400";
    if (score > 50) return "text-yellow-400";
    return "text-red-400";
  };
  
  const getIcon = (score: number) => {
    if (score > 80) return <TrendingUp className="h-4 w-4" />;
    if (score < 50) return <TrendingDown className="h-4 w-4" />;
    return <Zap className="h-4 w-4" />;
  };

  const renderResult = () => {
    if (!result) return null;

    let message = "";
    let style = "";
    let icon = null;

    if (result === "WIN") {
      message = "VICTORY! Your Agent Dominated the Market.";
      style = "bg-green-600/20 border-green-400/50 text-green-300";
      icon = <Trophy className="h-8 w-8" />;
    } else if (result === "LOSS") {
      message = "DEFEAT. Your Agent was Liquidated.";
      style = "bg-red-600/20 border-red-400/50 text-red-300";
      icon = <AlertTriangle className="h-8 w-8" />;
    } else {
      message = "DRAW. Agent performance was too close to call.";
      style = "bg-yellow-600/20 border-yellow-400/50 text-yellow-300";
      icon = <AlertTriangle className="h-8 w-8" />;
    }

    return (
      <div className={`mt-6 rounded-lg p-6 text-center ${style}`}>
        <div className="flex justify-center mb-3">{icon}</div>
        <h3 className="text-xl font-bold uppercase tracking-widest">{message}</h3>
        <p className="mt-4 text-sm text-cyber-muted">
          Your Agent Score: <span className={getColorClass(playerScore)}>{playerScore}</span> | Opponent Score: <span className={getColorClass(opponentScore)}>{opponentScore}</span>
        </p>
        <button 
            onClick={onReset}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-md border border-white/30 bg-white/10 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-white/20"
        >
            <RefreshCw className="h-4 w-4"/> Configure New Agent
        </button>
      </div>
    );
  };

  const renderRunning = () => (
    <>
      <div className="relative h-6 rounded-full bg-black/50 overflow-hidden shadow-inner-neon">
        <div 
            className="h-full rounded-full bg-cyber-neon transition-all duration-300" 
            style={{ width: `${progress}%` }}
        ></div>
        <div className="absolute inset-0 flex items-center justify-center text-xs font-mono text-black">
            SIMULATION IN PROGRESS...
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex justify-between items-center glass-panel p-4">
          <h4 className="text-lg font-semibold text-cyber-accent">YOUR AGENT</h4>
          <span className="text-sm uppercase text-cyber-muted">Risk: {config.riskLevel}%</span>
        </div>
        
        <div className="flex justify-between items-center glass-panel p-4">
          <h4 className="text-lg font-semibold text-red-500">MOCK OPPONENT</h4>
          <span className="text-sm uppercase text-cyber-muted">Risk: {mockOpponentConfig.riskLevel}%</span>
        </div>
      </div>
    </>
  );

  return (
    <div className="glass-panel p-6">
      <header className="flex items-center gap-2 mb-4">
        <Zap className="h-5 w-5 text-cyber-neon" />
        <h2 className="text-xl font-semibold uppercase tracking-widest">
          Battle Arena
        </h2>
      </header>
      
      {status === "FINISHED" ? renderResult() : renderRunning()}
    </div>
  );
}