export type AssetFocus = "BlueChip" | "Layer2" | "Memecoin";

export type BotConfig = {
  riskLevel: number; // 1 to 100
  tradeFrequency: number; // 1 to 100
  assetFocus: AssetFocus;
};

export type BattleResult = "WIN" | "LOSS" | "DRAW";

// --- Simulation Logic ---

// Determines the market volatility seed based on the asset focus
const getMarketSeed = (focus: AssetFocus): number => {
  switch (focus) {
    case "BlueChip":
      return 0.2; // Low Volatility
    case "Layer2":
      return 0.5; // Medium Volatility
    case "Memecoin":
      return 0.9; // High Volatility
  }
};

// Generates a deterministic performance score (0 to 100)
// Simplified logic: High risk pays off in high volatility (Memecoin), low risk pays off in low volatility (BlueChip)
const generatePerformanceScore = (config: BotConfig, marketSeed: number): number => {
  // Normalize variables to 0-1
  const riskNorm = config.riskLevel / 100;
  const frequencyNorm = config.tradeFrequency / 100;

  // Score calculation:
  // 1. Base Score: A simple weighted average of risk and frequency (50/50 split)
  let score = (riskNorm * 0.5 + frequencyNorm * 0.5);

  // 2. Volatility Alignment Bonus/Penalty:
  //    - If Market Seed (volatility) is high (Memecoin), high risk gets a bonus.
  //    - If Market Seed (volatility) is low (BlueChip), low risk gets a bonus.
  const alignment = Math.abs(marketSeed - riskNorm);
  
  // Apply a penalty based on misalignment (The smaller the alignment, the better the performance)
  score = score + (1 - alignment) * 0.5; 
  
  // Scale the score back to 0-100 range and clamp
  return Math.min(100, Math.max(0, Math.round(score * 100)));
};

// --- Battle Simulation Function ---

// Returns a single number representing the final wealth score
export const runBattleSimulation = (playerConfig: BotConfig): number => {
    const marketSeed = getMarketSeed(playerConfig.assetFocus);
    const score = generatePerformanceScore(playerConfig, marketSeed);

    // Add a random element for drama, but keep it constrained (e.g., +/- 10%)
    const randomFactor = (Math.random() * 0.2) - 0.1; // -10% to +10%
    const finalScore = score * (1 + randomFactor);
    
    return Math.round(Math.min(100, Math.max(0, finalScore)));
};

// Simple mock opponent for comparison
export const mockOpponentConfig: BotConfig = {
    riskLevel: 45,
    tradeFrequency: 55,
    assetFocus: "Layer2",
};

export const getResult = (playerScore: number, opponentScore: number): BattleResult => {
    if (playerScore > opponentScore + 10) return "WIN"; // Win by large margin
    if (playerScore < opponentScore - 10) return "LOSS"; // Loss by large margin
    return "DRAW"; // Close battle is a draw
};