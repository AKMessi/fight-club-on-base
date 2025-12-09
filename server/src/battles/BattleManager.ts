import { TradingAgent, BotConfig, MarketData } from '../agents/TradingAgent.js';
import { PriceFeeder } from '../market/PriceFeeder.js';
import { ContractManager } from '../blockchain/ContractManager.js';

export type BattlePlayer = {
  address: string;
  config: BotConfig;
  agent: TradingAgent;
};

export class BattleManager {
  private battleId: number;
  private players: BattlePlayer[] = [];
  private priceFeeder: PriceFeeder;
  private contractManager: ContractManager;
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor(battleId: number, priceFeeder: PriceFeeder, contractManager: ContractManager) {
    this.battleId = battleId;
    this.priceFeeder = priceFeeder;
    this.contractManager = contractManager;
  }

  addPlayer(address: string, config: BotConfig): void {
    const agent = new TradingAgent(address, config);
    this.players.push({ address, config, agent });
    console.log(`✅ Player ${address} joined battle ${this.battleId}`);
  }

  async start(durationMinutes = 30): Promise<void> {
    if (this.players.length < 2) {
      throw new Error('Need at least 2 players to start battle');
    }

    if (this.isRunning) {
      console.warn(`Battle ${this.battleId} already running`);
      return;
    }

    console.log(`🚀 Starting battle ${this.battleId} with ${this.players.length} players`);
    this.isRunning = true;

    const endTime = Date.now() + durationMinutes * 60 * 1000;

    this.intervalId = setInterval(async () => {
      if (Date.now() >= endTime) {
        await this.finalize();
        return;
      }
      await this.executeTradingRound();
    }, 30 * 1000);

    await this.executeTradingRound();
  }

  private async executeTradingRound(): Promise<void> {
    try {
      const marketData = await this.priceFeeder.getCurrentPrices();

      for (const player of this.players) {
        const decision = player.agent.decide(marketData);
        if (decision !== 'HOLD') {
          player.agent.executeTrade(decision, marketData);
        }
      }

      this.logLeaderboard(marketData);
    } catch (error) {
      console.error('❌ Error in trading round:', error);
    }
  }

  private logLeaderboard(marketData: MarketData): void {
    const standings = this.players
      .map((p) => ({
        address: `${p.address.slice(0, 8)}...`,
        pnl: `${p.agent.calculatePnL(marketData).toFixed(2)}%`
      }))
      .sort((a, b) => parseFloat(b.pnl) - parseFloat(a.pnl));

    console.log('\n📊 Leaderboard:');
    standings.forEach((s, i) => {
      console.log(`${i + 1}. ${s.address} → ${s.pnl}`);
    });
    console.log('---');
  }

  private async finalize(): Promise<void> {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning = false;

    try {
      const finalMarketData = await this.priceFeeder.getCurrentPrices();
      const results = this.players.map((p) => ({
        address: p.address,
        pnl: p.agent.calculatePnL(finalMarketData)
      }));

      results.sort((a, b) => b.pnl - a.pnl);
      const winner = results[0];

      console.log(`\n🏆 Battle ${this.battleId} FINISHED!`);
      console.log(`Winner: ${winner.address} with ${winner.pnl.toFixed(2)}% P&L\n`);

      await this.contractManager.finalizeBattle(
        this.battleId,
        winner.address,
        Math.round(winner.pnl * 100)
      );
      console.log('✅ Battle finalized on-chain');
    } catch (error) {
      console.error('❌ Failed to finalize battle:', error);
    }
  }

  getPlayers(): BattlePlayer[] {
    return this.players;
  }

  isActive(): boolean {
    return this.isRunning;
  }
}

