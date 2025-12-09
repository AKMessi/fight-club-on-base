"use client";

import React, { useState, useEffect } from "react";
import { Zap, Clock, Trophy, AlertTriangle } from "lucide-react";
import type { BotConfig } from "@/lib/engine";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

type BattleInfo = {
  battleId: number;
  playerCount: number;
  prizePool: string;
  startTime: number;
  endTime: number;
  isActive: boolean;
  isFinalized: boolean;
  winner: string;
  winningPnL?: number;
};

export interface BattleArenaProps {
  battleId: number;
  config: BotConfig;
  onComplete: () => void;
}

export const BattleArena: React.FC<BattleArenaProps> = ({ battleId, config, onComplete }) => {
  const [battleInfo, setBattleInfo] = useState<BattleInfo | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    const fetchBattleInfo = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/battle/${battleId}`);
        const data = await response.json();
        setBattleInfo(data);

        if (data.endTime > 0) {
          const remaining = data.endTime - Math.floor(Date.now() / 1000);
          setTimeRemaining(Math.max(0, remaining));
        }
      } catch (error) {
        console.error('Failed to fetch battle info:', error);
      }
    };

    fetchBattleInfo();
    const interval = setInterval(fetchBattleInfo, 5000);

    return () => clearInterval(interval);
  }, [battleId]);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, onComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!battleInfo) {
    return (
      <div className="glass-panel p-6 text-center">
        <p className="text-cyber-muted">Loading battle...</p>
      </div>
    );
  }

  if (battleInfo.isFinalized) {
    // Note: We can't determine if current user is winner without their address
    // This is a placeholder - in production, you'd pass the user's address as a prop
    const hasWinner = battleInfo.winner && battleInfo.winner !== '0x0000000000000000000000000000000000000000';

    return (
      <div className="glass-panel p-6">
        <header className="flex items-center gap-2 mb-4">
          {hasWinner ? (
            <Trophy className="h-6 w-6 text-yellow-400" />
          ) : (
            <AlertTriangle className="h-6 w-6 text-red-400" />
          )}
          <h2 className="text-xl font-semibold uppercase tracking-widest">
            Battle Complete
          </h2>
        </header>

        <div className={`p-6 rounded-lg text-center ${
          hasWinner 
            ? 'bg-green-600/20 border-2 border-green-400/50' 
            : 'bg-red-600/20 border-2 border-red-400/50'
        }`}>
          <p className="text-2xl font-bold mb-2">
            {hasWinner ? '🏆 BATTLE FINISHED!' : '💀 BATTLE ENDED'}
          </p>
          {hasWinner && (
            <>
              <p className="text-sm text-cyber-muted">
                Winner: {battleInfo.winner.slice(0, 8)}...{battleInfo.winner.slice(-6)}
              </p>
              {battleInfo.winningPnL !== undefined && (
                <p className="text-sm text-cyber-muted mt-1">
                  Final P&L: {(battleInfo.winningPnL / 100).toFixed(2)}%
                </p>
              )}
            </>
          )}
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-cyber-muted">
            Check the leaderboard for final standings
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6">
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-cyber-neon animate-pulse" />
          <h2 className="text-xl font-semibold uppercase tracking-widest">
            Battle In Progress
          </h2>
        </div>
        <div className="flex items-center gap-2 text-cyber-accent">
          <Clock className="h-4 w-4" />
          <span className="font-mono text-lg font-bold">
            {formatTime(timeRemaining)}
          </span>
        </div>
      </header>

      <div className="space-y-4">
        <div className="glass-panel p-4 bg-cyber-neon/5">
          <p className="text-xs uppercase tracking-wide text-cyber-muted mb-2">
            Your Configuration
          </p>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <p className="text-cyber-muted text-xs">Risk</p>
              <p className="font-bold text-cyber-neon">{config.riskLevel}%</p>
            </div>
            <div>
              <p className="text-cyber-muted text-xs">Frequency</p>
              <p className="font-bold text-cyber-neon">{config.tradeFrequency}%</p>
            </div>
            <div>
              <p className="text-cyber-muted text-xs">Focus</p>
              <p className="font-bold text-cyber-accent">{config.assetFocus}</p>
            </div>
          </div>
        </div>

        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 text-cyber-accent animate-pulse">
            <div className="h-2 w-2 rounded-full bg-cyber-accent" />
            <p className="text-sm uppercase tracking-wider">
              Your agent is trading live...
            </p>
            <div className="h-2 w-2 rounded-full bg-cyber-accent" />
          </div>
          <p className="text-xs text-cyber-muted mt-2">
            Watch the leaderboard for real-time updates
          </p>
        </div>

        <div className="border-t border-cyber-muted/20 pt-4">
          <p className="text-xs text-cyber-muted text-center">
            Battle ends in {formatTime(timeRemaining)} or when all agents finish trading
          </p>
        </div>
      </div>
    </div>
  );
};