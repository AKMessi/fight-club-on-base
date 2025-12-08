"use client";

import { useEffect, useRef, useState } from "react";
import { BotConfig, simulateBattle } from "@/lib/engine";
import { Play, RefreshCcw, TerminalSquare } from "lucide-react";

type BattleState = ReturnType<typeof simulateBattle> | null;

type Props = {
  config: BotConfig;
  onReset: () => void;
  onComplete?: () => void;
};

export function BattleArena({ config, onReset, onComplete }: Props) {
  const [result, setResult] = useState<BattleState>(null);
  const [displayLogs, setDisplayLogs] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const outcome = simulateBattle(config);
    setResult(outcome);
  }, [config]);

  useEffect(() => {
    if (!result) return;
    setDisplayLogs([]);
    setIsPlaying(true);

    let idx = 0;
    timerRef.current && clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      idx += 1;
      setDisplayLogs(result.logs.slice(0, idx));
      if (idx >= result.logs.length) {
        timerRef.current && clearInterval(timerRef.current);
        setIsPlaying(false);
        onComplete?.();
      }
    }, 500);

    return () => {
      timerRef.current && clearInterval(timerRef.current);
    };
  }, [result, onComplete]);

  const handleDeploy = () => {
    const outcome = simulateBattle(config);
    setResult(outcome);
  };

  const roiColor =
    result && result.finalRoi >= 0 ? "text-cyber-neon" : "text-red-400";

  return (
    <section className="glass-panel p-6 space-y-4">
      <header className="flex items-center gap-2">
        <TerminalSquare className="h-5 w-5 text-cyber-accent" />
        <h2 className="text-lg font-semibold uppercase tracking-widest">
          Battle Arena
        </h2>
      </header>

      <div className="flex gap-3">
        <button
          onClick={handleDeploy}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-cyber-neon/50 bg-cyber-neon/10 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-cyber-neon transition hover:bg-cyber-neon hover:text-black"
        >
          <Play className="h-4 w-4" />
          Deploy Agent
        </button>
        {result && !isPlaying && (
          <button
            onClick={onReset}
            className="flex items-center justify-center gap-2 rounded-md border border-cyber-accent/50 bg-cyber-accent/10 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-cyber-accent transition hover:bg-cyber-accent hover:text-black"
          >
            <RefreshCcw className="h-4 w-4" />
            Reset / Play Again
          </button>
        )}
      </div>

      <div className="min-h-[180px] space-y-2 rounded-md border border-cyber-neon/20 bg-black/40 p-4 font-mono text-sm text-cyber-muted shadow-neon">
        {displayLogs.length === 0 && !isPlaying && (
          <p className="text-cyber-muted/70">Awaiting deployment...</p>
        )}
        {displayLogs.map((log, i) => (
          <p key={`${log}-${i}`} className="animate-[fadeIn_0.3s_ease]">
            {log}
          </p>
        ))}
      </div>

      {result && !isPlaying && (
        <div className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-cyber-muted">
            Final ROI
          </p>
          <p className={`text-4xl font-semibold ${roiColor}`}>
            {result.finalRoi}% · {result.status}
          </p>
        </div>
      )}
    </section>
  );
}

