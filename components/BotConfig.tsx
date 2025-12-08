import { SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import type { BotConfig } from "@/lib/engine";

type SliderProps = {
  label: string;
  minLabel: string;
  maxLabel: string;
  value: number;
  onChange: (value: number) => void;
};

function SliderRow({ label, minLabel, maxLabel, value, onChange }: SliderProps) {
  return (
    <div className="space-y-3 rounded-lg border border-cyber-neon/30 bg-black/40 p-4 shadow-neon">
      <div className="flex items-center justify-between text-sm uppercase tracking-wide text-cyber-muted">
        <span>{label}</span>
        <span className="text-cyber-accent">{value}%</span>
      </div>
      <input
        type="range"
        min={1}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-cyber-neon"
      />
      <div className="flex justify-between text-xs uppercase tracking-wide text-cyber-muted">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}

type BotConfigProps = {
  onDeploy?: (config: BotConfig) => void;
};

export function BotConfig({ onDeploy }: BotConfigProps) {
  const [riskLevel, setRiskLevel] = useState(50);
  const [tradeFrequency, setTradeFrequency] = useState(40);
  const [assetSlider, setAssetSlider] = useState(65); // bias toward memecoins
  const [assetFocus, setAssetFocus] = useState<BotConfig["assetFocus"]>("Memecoin");

  useEffect(() => {
    if (assetSlider < 40) setAssetFocus("BlueChip");
    else if (assetSlider < 60) setAssetFocus("Layer2");
    else setAssetFocus("Memecoin");
  }, [assetSlider]);

  const handleDeploy = () => {
    const config: BotConfig = {
      riskLevel,
      tradeFrequency,
      assetFocus
    };
    onDeploy?.(config);
  };

  return (
    <section className="glass-panel p-6 space-y-4">
      <header className="flex items-center gap-2">
        <SlidersHorizontal className="h-5 w-5 text-cyber-accent" />
        <h2 className="text-lg font-semibold uppercase tracking-widest">
          Bot Config
        </h2>
      </header>

      <div className="space-y-4">
        <SliderRow
          label="Risk Level"
          minLabel="Safe"
          maxLabel="Degen"
          value={riskLevel}
          onChange={setRiskLevel}
        />
        <SliderRow
          label="Trade Frequency"
          minLabel="Low"
          maxLabel="High"
          value={tradeFrequency}
          onChange={setTradeFrequency}
        />
        <SliderRow
          label="Asset Focus"
          minLabel="ETH/BTC"
          maxLabel="Memecoins"
          value={assetSlider}
          onChange={setAssetSlider}
        />
      </div>

      <div className="text-xs uppercase tracking-[0.25em] text-cyber-muted">
        Focus: {assetFocus}
      </div>

      <button
        onClick={handleDeploy}
        className="mt-4 w-full rounded-md border border-cyber-neon/50 bg-cyber-neon/10 py-3 text-sm font-semibold uppercase tracking-wide text-cyber-neon transition hover:bg-cyber-neon hover:text-black"
      >
        Deploy Loadout
      </button>
    </section>
  );
}
  return (
    <section className="glass-panel p-6 space-y-4">
      <header className="flex items-center gap-2">
        <SlidersHorizontal className="h-5 w-5 text-cyber-accent" />
        <h2 className="text-lg font-semibold uppercase tracking-widest">
          Bot Config
        </h2>
      </header>

      <div className="space-y-4">
        <SliderRow label="Risk Level" minLabel="Safe" maxLabel="Degen" />
        <SliderRow
          label="Trade Frequency"
          minLabel="Low"
          maxLabel="High"
          initial={30}
        />
        <SliderRow
          label="Asset Focus"
          minLabel="ETH/BTC"
          maxLabel="Memecoins"
          initial={65}
        />
      </div>

      <button className="mt-4 w-full rounded-md border border-cyber-neon/50 bg-cyber-neon/10 py-3 text-sm font-semibold uppercase tracking-wide text-cyber-neon transition hover:bg-cyber-neon hover:text-black">
        Save Loadout
      </button>
    </section>
  );
}

