export type BotConfig = {
  riskLevel: number; // 1-100
  tradeFrequency: number; // 1-100
  assetFocus: "BlueChip" | "Memecoin" | "Layer2";
};

type BattleOutcome = {
  finalRoi: number;
  logs: string[];
  status: "Winner" | "Rekt" | "Mid";
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const randomBetween = (min: number, max: number) =>
  Math.random() * (max - min) + min;

function buildFlavorLog(message: string) {
  const prefixes = ["⚡", "🛰️", "📡", "🛠️", "⚠️", "🚀", "🧬", "🔒"];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  return `${prefix} ${message}`;
}

export function simulateBattle(config: BotConfig): BattleOutcome {
  const { riskLevel, tradeFrequency, assetFocus } = {
    riskLevel: clamp(config.riskLevel, 1, 100),
    tradeFrequency: clamp(config.tradeFrequency, 1, 100),
    assetFocus: config.assetFocus
  };

  const logs: string[] = [];
  let roi = 0;

  // Base logs seeded by asset focus
  if (assetFocus === "Memecoin") {
    logs.push(
      buildFlavorLog("Memecoin scanner online. Watching for stealth launches."),
      buildFlavorLog("Liquidity locks verified. Bots circling.")
    );
  } else if (assetFocus === "BlueChip") {
    logs.push(
      buildFlavorLog("BlueChip radar calibrated. Minimal volatility expected."),
      buildFlavorLog("Cold storage routes mapped. Counterparty risk low.")
    );
  } else {
    logs.push(
      buildFlavorLog("Layer2 bridges synced. Sequencer latency minimized."),
      buildFlavorLog("MEV protections armed. Rollup gas optimized.")
    );
  }

  // High risk + Memecoin special case
  if (riskLevel >= 80 && assetFocus === "Memecoin") {
    const roll = Math.random();
    if (roll < 0.7) {
      roi = -99;
      logs.push(
        buildFlavorLog("Rug pull detected. Liquidity evaporated instantly."),
        buildFlavorLog("Vault alarms triggered. Treasury drained.")
      );
    } else if (roll < 0.9) {
      roi = randomBetween(-60, 40);
      logs.push(
        buildFlavorLog("Front-run attempt dodged, but morale is shaky."),
        buildFlavorLog("Holders thinning. Volatility spike incoming.")
      );
    } else {
      roi = 1000;
      logs.push(
        buildFlavorLog("Moon event. Social channels melting down."),
        buildFlavorLog("CEX listings rumored. Bots piling in.")
      );
    }
  } else if (riskLevel <= 20 && assetFocus === "BlueChip") {
    roi = Number(randomBetween(-5, 10).toFixed(2));
    logs.push(
      buildFlavorLog("Stable accumulation. Treasury hedged."),
      buildFlavorLog("Validator set calm. No major forks on radar.")
    );
  } else {
    // General case influenced by risk
    const riskBias = (riskLevel - 50) / 50; // -1 to 1
    const baseVolatility = 50 + riskLevel * 0.8;
    roi = randomBetween(-baseVolatility, baseVolatility * (1 + riskBias));

    logs.push(
      buildFlavorLog(
        `Aggro stance ${riskLevel >= 60 ? "enabled" : "tempered"}. Volatility ${
          baseVolatility.toFixed(0)
        }bps.`
      ),
      buildFlavorLog(
        `Orderflow heatmap lit up. Risk bias ${riskBias >= 0 ? "long" : "short"}.`
      )
    );
  }

  // Frequency effects: more logs, more sandwich risk
  const extraLogs = Math.max(1, Math.floor(tradeFrequency / 20));
  for (let i = 0; i < extraLogs; i += 1) {
    const sandwichRoll = Math.random() < tradeFrequency / 140; // higher freq, higher chance
    if (sandwichRoll) {
      const slip = Number(randomBetween(1, 8).toFixed(1));
      roi -= slip;
      logs.push(
        buildFlavorLog(`MEV Bot detected. Evasion failed. Slippage -${slip}%.`)
      );
    } else {
      logs.push(
        buildFlavorLog(
          `Micro-trade executed. Latency ${
            tradeFrequency > 70 ? "sub-50ms" : "95ms"
          }.`
        )
      );
    }
  }

  // Normalize logs length 5-10
  while (logs.length < 5) {
    logs.push(
      buildFlavorLog(
        "Sentiment parser updating. Newsfeeds scanned for hidden catalysts."
      )
    );
  }
  while (logs.length > 10) {
    logs.pop();
  }

  // Determine status
  const status: BattleOutcome["status"] =
    roi > 50 ? "Winner" : roi < -50 ? "Rekt" : "Mid";

  return {
    finalRoi: Number(roi.toFixed(1)),
    logs,
    status
  };
}

