import axios from 'axios';
import type { MarketData } from '../agents/TradingAgent.js';

export class PriceFeeder {
  private lastPrices: MarketData | null = null;
  private cacheTimeout: number = 60000; // 1 minute cache
  private lastFetchTime: number = 0;

  async getCurrentPrices(): Promise<MarketData> {
    const now = Date.now();

    // Return cached data if still valid
    if (this.lastPrices && (now - this.lastFetchTime) < this.cacheTimeout) {
      return this.lastPrices;
    }

    try {
      // Fetch from CoinGecko (free tier - 10-30 calls/min)
      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
        params: {
          ids: 'bitcoin,ethereum,dogecoin,pepe',
          vs_currencies: 'usd',
        },
      });

      const data = response.data;
      
      const prices = {
        BTC: data.bitcoin?.usd || 0,
        ETH: data.ethereum?.usd || 0,
        DOGE: data.dogecoin?.usd || 0,
        PEPE: data.pepe?.usd || 0,
      };

      // Calculate simple volatility (in real version, use historical data)
      const volatility = Math.random() * 0.5 + 0.3; // 0.3 to 0.8

      this.lastPrices = {
        timestamp: now,
        prices,
        volatility,
      };

      this.lastFetchTime = now;

      console.log('📈 Price Update:', {
        BTC: `$${prices.BTC.toFixed(0)}`,
        ETH: `$${prices.ETH.toFixed(0)}`,
        DOGE: `$${prices.DOGE.toFixed(4)}`,
        PEPE: `$${prices.PEPE.toFixed(8)}`,
      });

      return this.lastPrices;
    } catch (error) {
      console.error('❌ Failed to fetch prices:', error);

      // Return mock data as fallback
      if (!this.lastPrices) {
        this.lastPrices = {
          timestamp: now,
          prices: {
            BTC: 95000,
            ETH: 3500,
            DOGE: 0.35,
            PEPE: 0.000015,
          },
          volatility: 0.5,
        };
      }

      return this.lastPrices;
    }
  }

  // Get historical data (for backtesting - optional)
  async getHistoricalPrices(days: number = 1) {
    try {
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart',
        {
          params: {
            vs_currency: 'usd',
            days: days,
          },
        }
      );

      return response.data.prices; // Array of [timestamp, price]
    } catch (error) {
      console.error('Failed to fetch historical data:', error);
      return [];
    }
  }
}