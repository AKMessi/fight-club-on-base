import axios from 'axios';
import type { MarketData } from '../agents/TradingAgent.js';

export class PriceFeeder {
  private lastPrices: MarketData | null = null;
  private cacheTimeout = 60_000; // 1 minute cache
  private lastFetchTime = 0;

  async getCurrentPrices(): Promise<MarketData> {
    const now = Date.now();

    if (this.lastPrices && now - this.lastFetchTime < this.cacheTimeout) {
      return this.lastPrices;
    }

    try {
      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
        params: {
          ids: 'bitcoin,ethereum,dogecoin,pepe',
          vs_currencies: 'usd'
        },
        timeout: 8000
      });

      const data = response.data ?? {};
      const prices = {
        BTC: data.bitcoin?.usd ?? 0,
        ETH: data.ethereum?.usd ?? 0,
        DOGE: data.dogecoin?.usd ?? 0,
        PEPE: data.pepe?.usd ?? 0
      };

      const volatility = Math.random() * 0.5 + 0.3;

      this.lastPrices = {
        timestamp: now,
        prices,
        volatility
      };
      this.lastFetchTime = now;

      return this.lastPrices;
    } catch (error) {
      console.error('❌ Failed to fetch prices:', error);

      if (!this.lastPrices) {
        this.lastPrices = {
          timestamp: now,
          prices: {
            BTC: 95000,
            ETH: 3500,
            DOGE: 0.35,
            PEPE: 0.000015
          },
          volatility: 0.5
        };
      }

      return this.lastPrices;
    }
  }

  async getHistoricalPrices(days = 1): Promise<Array<[number, number]>> {
    try {
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart',
        {
          params: {
            vs_currency: 'usd',
            days
          },
          timeout: 8000
        }
      );

      return response.data.prices as Array<[number, number]>;
    } catch (error) {
      console.error('Failed to fetch historical data:', error);
      return [];
    }
  }
}