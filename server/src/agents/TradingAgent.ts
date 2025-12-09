export type BotConfig = {
  riskLevel: number;
  tradeFrequency: number;
  assetFocus: 'BlueChip' | 'Layer2' | 'Memecoin';
};

export type MarketData = {
  timestamp: number;
  prices: {
    BTC: number;
    ETH: number;
    DOGE: number;
    PEPE: number;
  };
  volatility: number;
};

export type Position = {
  asset: string;
  entryPrice: number;
  amount: number; // % of portfolio
  entryTime: number;
};

export type TradeRecord =
  | {
      action: 'BUY';
      asset: string;
      price: number;
      amount: number;
      timestamp: number;
    }
  | {
      action: 'SELL';
      asset: string;
      price: number;
      profit: number;
      timestamp: number;
    };

export class TradingAgent {
  public playerId: string;
  public config: BotConfig;
  public portfolio: number = 100; // Start with $100
  public positions: Position[] = [];
  public tradeHistory: TradeRecord[] = [];
  public pnl: number = 0; // Percentage

  constructor(playerId: string, config: BotConfig) {
    this.playerId = playerId;
    this.config = config;
  }

  // Main decision engine
  decide(marketData: MarketData): 'BUY' | 'SELL' | 'HOLD' {
    // Simple rule-based logic for MVP
    const { riskLevel, tradeFrequency, assetFocus } = this.config;

    // High frequency = trade more often
    const shouldTrade = Math.random() * 100 < tradeFrequency;
    if (!shouldTrade) return 'HOLD';

    // Risk appetite determines position size
    const positionSize = riskLevel / 100 * 0.5; // Max 50% portfolio

    // Asset focus determines which assets to trade
    let targetAsset: string;
    if (assetFocus === 'BlueChip') {
      targetAsset = Math.random() > 0.5 ? 'BTC' : 'ETH';
    } else if (assetFocus === 'Layer2') {
      targetAsset = 'ETH'; // Simplified for MVP
    } else {
      targetAsset = Math.random() > 0.5 ? 'DOGE' : 'PEPE';
    }

    // Simple momentum strategy
    // In real version, you'd calculate actual momentum indicators
    const momentum = Math.random() - 0.5; // -0.5 to 0.5

    if (this.positions.length === 0) {
      // No position - consider buying
      if (momentum > 0) {
        return 'BUY';
      }
    } else {
      // Have position - consider selling
      const position = this.positions[0];
      const currentPrice = marketData.prices[position.asset as keyof typeof marketData.prices];
      const priceChange = (currentPrice - position.entryPrice) / position.entryPrice;

      // Take profit at +5% or stop loss at -3%
      if (priceChange > 0.05 || priceChange < -0.03) {
        return 'SELL';
      }
    }

    return 'HOLD';
  }

  executeTrade(action: 'BUY' | 'SELL', marketData: MarketData) {
    if (action === 'BUY' && this.positions.length === 0) {
      const asset = this.selectAsset();
      const price = marketData.prices[asset as keyof typeof marketData.prices];
      const positionSize = this.config.riskLevel / 100 * 0.5;

      this.positions.push({
        asset,
        entryPrice: price,
        amount: positionSize,
        entryTime: marketData.timestamp,
      });

      this.tradeHistory.push({
        action: 'BUY',
        asset,
        price,
        amount: positionSize,
        timestamp: marketData.timestamp,
      });
    }

    if (action === 'SELL' && this.positions.length > 0) {
      const position = this.positions[0];
      const currentPrice = marketData.prices[position.asset as keyof typeof marketData.prices];
      const profitPercent = ((currentPrice - position.entryPrice) / position.entryPrice) * 100;

      this.pnl += profitPercent * position.amount; // Weight by position size
      this.positions = [];

      this.tradeHistory.push({
        action: 'SELL',
        asset: position.asset,
        price: currentPrice,
        profit: profitPercent,
        timestamp: marketData.timestamp,
      });
    }
  }

  selectAsset(): string {
    const { assetFocus } = this.config;
    if (assetFocus === 'BlueChip') {
      return Math.random() > 0.5 ? 'BTC' : 'ETH';
    } else if (assetFocus === 'Layer2') {
      return 'ETH';
    } else {
      return Math.random() > 0.5 ? 'DOGE' : 'PEPE';
    }
  }

  calculatePnL(marketData: MarketData): number {
    let totalPnL = this.pnl;

    // Add unrealized P&L from open positions
    for (const position of this.positions) {
      const currentPrice = marketData.prices[position.asset as keyof typeof marketData.prices];
      const unrealizedPnL = ((currentPrice - position.entryPrice) / position.entryPrice) * 100 * position.amount;
      totalPnL += unrealizedPnL;
    }

    return totalPnL;
  }
}