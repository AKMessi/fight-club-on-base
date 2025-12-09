"use client";

import { useEffect, useState } from "react";
import { Trophy, Users, TrendingUp, TrendingDown, Zap, Clock, DollarSign } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

type LeaderboardEntry = {
  address: string;
  pnl: number;
  tradeCount: number;
  config?: {
    riskLevel: number;
    tradeFrequency: number;
    assetFocus: string;
  };
  positions?: any[];
};

type BattleInfo = {
  battleId: number;
  playerCount: number;
  prizePool: string;
  startTime: number;
  endTime: number;
  isActive: boolean;
  isFinalized: boolean;
  winner: string;
};

export function LiveLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [battleInfo, setBattleInfo] = useState<BattleInfo | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  // Fetch battle info periodically
  useEffect(() => {
    const fetchBattleInfo = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/battle/current`);
        const data = await response.json();
        setBattleInfo(data);

        // Calculate time remaining if battle is active
        if (data.startTime > 0 && data.endTime > 0 && !data.isFinalized) {
          const remaining = data.endTime - Math.floor(Date.now() / 1000);
          setTimeRemaining(Math.max(0, remaining));
        }

        // If battle is active, fetch leaderboard
        if (data.startTime > 0 && !data.isFinalized) {
          fetchLeaderboard(data.battleId);
        }
      } catch (err) {
        console.error('Failed to fetch battle info:', err);
      }
    };

    fetchBattleInfo();
    const interval = setInterval(fetchBattleInfo, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    let ws: WebSocket | null = null;

    const connectWebSocket = () => {
      try {
        const wsUrl = BACKEND_URL.replace('http', 'ws');
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          setIsConnected(true);
          console.log('✅ WebSocket connected to leaderboard');
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'LEADERBOARD_UPDATE') {
              setLeaderboard(data.leaderboard);
              setLastUpdate(Date.now());
            }

            if (data.type === 'PLAYER_JOINED' && battleInfo) {
              // Update player count
              setBattleInfo({
                ...battleInfo,
                playerCount: battleInfo.playerCount + 1,
              });
            }

            if (data.type === 'BATTLE_STARTED') {
              // Refetch battle info
              fetch(`${BACKEND_URL}/api/battle/current`)
                .then(res => res.json())
                .then(setBattleInfo);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setIsConnected(false);
        };

        ws.onclose = () => {
          setIsConnected(false);
          console.log('❌ WebSocket disconnected, reconnecting in 5s...');
          setTimeout(connectWebSocket, 5000); // Reconnect after 5 seconds
        };
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        setTimeout(connectWebSocket, 5000);
      }
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [battleInfo]);

  const fetchLeaderboard = async (battleId: number) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/battle/${battleId}/leaderboard`);
      const data = await response.json();
      setLeaderboard(data.leaderboard || []);
      setLastUpdate(Date.now());
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatPnL = (pnl: number) => {
    const sign = pnl >= 0 ? '+' : '';
    return `${sign}${pnl.toFixed(2)}%`;
  };

  const getPnLColor = (pnl: number) => {
    if (pnl > 15) return 'text-green-400';
    if (pnl > 5) return 'text-green-300';
    if (pnl > 0) return 'text-cyan-300';
    if (pnl > -5) return 'text-yellow-300';
    if (pnl > -15) return 'text-orange-300';
    return 'text-red-400';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeSinceUpdate = () => {
    const seconds = Math.floor((Date.now() - lastUpdate) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const mins = Math.floor(seconds / 60);
    return `${mins}m ago`;
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-5 w-5 text-yellow-400" />;
    if (index === 1) return <Trophy className="h-5 w-5 text-gray-300" />;
    if (index === 2) return <Trophy className="h-5 w-5 text-orange-400" />;
    return <span className="text-cyber-muted">{index + 1}</span>;
  };

  const getBorderStyle = (index: number) => {
    if (index === 0) return 'border-yellow-400/60 bg-yellow-400/10 shadow-[0_0_15px_rgba(250,204,21,0.3)]';
    if (index === 1) return 'border-gray-300/60 bg-gray-300/10 shadow-[0_0_10px_rgba(209,213,219,0.2)]';
    if (index === 2) return 'border-orange-400/60 bg-orange-400/10 shadow-[0_0_10px_rgba(251,146,60,0.2)]';
    return 'border-cyber-neon/20 bg-black/20 hover:border-cyber-neon/40';
  };

  return (
    <section className="glass-panel p-6 space-y-4">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-cyber-accent" />
          <h2 className="text-lg font-semibold uppercase tracking-widest">
            Live Leaderboard
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
          <span className="text-xs text-cyber-muted uppercase">
            {isConnected ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>
      </header>

      {/* Battle Status Banner */}
      {battleInfo && (
        <div className="glass-panel bg-cyber-panel/50 p-4 space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs uppercase tracking-wider text-cyber-muted">
                Battle #{battleInfo.battleId}
              </p>
              <p className="text-lg font-bold text-cyber-neon">
                {battleInfo.playerCount} / 100 Players
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wider text-cyber-muted">
                Prize Pool
              </p>
              <p className="text-lg font-bold text-cyber-accent flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                {parseFloat(battleInfo.prizePool).toFixed(4)} ETH
              </p>
            </div>
          </div>

          {/* Battle Timer */}
          {battleInfo.startTime > 0 && !battleInfo.isFinalized && (
            <div className="flex items-center justify-center gap-2 p-3 rounded-lg border border-cyber-accent/30 bg-cyber-accent/5">
              <Clock className="h-4 w-4 text-cyber-accent" />
              <span className="text-sm uppercase tracking-wider text-cyber-muted">
                Time Remaining:
              </span>
              <span className="text-xl font-mono font-bold text-cyber-accent">
                {formatTime(timeRemaining)}
              </span>
            </div>
          )}

          {/* Waiting for players */}
          {battleInfo.startTime === 0 && (
            <div className="flex items-center justify-center gap-2 p-3 rounded-lg border border-yellow-400/30 bg-yellow-400/5">
              <Zap className="h-4 w-4 text-yellow-400 animate-pulse" />
              <span className="text-sm text-yellow-400">
                Waiting for {100 - battleInfo.playerCount} more players to start...
              </span>
            </div>
          )}

          {/* Battle Finalized */}
          {battleInfo.isFinalized && (
            <div className="flex items-center justify-center gap-2 p-3 rounded-lg border border-green-400/30 bg-green-400/5">
              <Trophy className="h-5 w-5 text-green-400" />
              <span className="text-sm text-green-400">
                Battle Complete! Winner: {formatAddress(battleInfo.winner)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Leaderboard Table */}
      {leaderboard.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-cyber-neon/10 border border-cyber-neon/30">
              <Users className="h-8 w-8 text-cyber-neon" />
            </div>
          </div>
          <div>
            <p className="text-lg font-semibold text-cyber-neon">No Active Battle</p>
            <p className="text-sm text-cyber-muted mt-2">
              {battleInfo && battleInfo.playerCount > 0
                ? `${battleInfo.playerCount} players waiting... Battle starts at 100 players or manually.`
                : 'Be the first to join and start trading!'}
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Leaderboard Entries */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.address}
                className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-300 ${getBorderStyle(index)}`}
              >
                {/* Left: Rank & Player Info */}
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-cyber-neon/50 bg-cyber-panel font-bold">
                    {getRankIcon(index)}
                  </div>
                  <div>
                    <p className="font-mono text-sm font-semibold text-cyber-neon">
                      {formatAddress(entry.address)}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs text-cyber-muted">
                        {entry.tradeCount} trades
                      </p>
                      {entry.config && (
                        <>
                          <span className="text-cyber-muted/50">•</span>
                          <p className="text-xs text-cyber-accent">
                            {entry.config.assetFocus}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: P&L */}
                <div className="text-right">
                  <p className={`text-xl font-bold font-mono ${getPnLColor(entry.pnl)}`}>
                    {formatPnL(entry.pnl)}
                  </p>
                  <div className="flex items-center gap-1 justify-end mt-1">
                    {entry.pnl >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-400" />
                    )}
                    {entry.positions && entry.positions.length > 0 && (
                      <span className="text-xs text-cyber-muted ml-1">
                        {entry.positions.length} open
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer - Last Update */}
          <div className="text-xs text-cyber-muted text-center pt-3 border-t border-cyber-muted/20 flex items-center justify-center gap-2">
            <div className={`h-1.5 w-1.5 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            <span>
              {isConnected ? `Live updates • Last: ${getTimeSinceUpdate()}` : 'Reconnecting...'}
            </span>
          </div>
        </>
      )}

      {/* Info Footer */}
      {battleInfo && battleInfo.startTime > 0 && !battleInfo.isFinalized && (
        <div className="glass-panel bg-cyber-accent/5 p-3 border border-cyber-accent/30">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Zap className="h-3 w-3 text-cyber-accent" />
              <span className="text-cyber-muted">Trading updates every 30s</span>
            </div>
            <span className="text-cyber-accent font-semibold">
              Winner takes {(parseFloat(battleInfo.prizePool) * 0.95).toFixed(4)} ETH
            </span>
          </div>
        </div>
      )}
    </section>
  );
}