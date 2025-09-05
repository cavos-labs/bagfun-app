interface MarketData {
  currentPrice: number;
  marketCap: number;
  fullyDilutedValuation: number | null;
  starknetTvl: number;
  priceChange1h: number;
  priceChangePercentage1h: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  priceChange7d: number;
  priceChangePercentage7d: number | null;
  marketCapChange24h: number | null;
  marketCapChangePercentage24h: number | null;
  starknetVolume24h: number;
  starknetTradingVolume24h: number;
}

interface TokenMarketResponse {
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  logoUri: string | null;
  coingeckoId: string | null;
  verified: boolean;
  market: MarketData;
  tags: string[];
}

class MarketService {
  private static readonly BASE_URL = 'https://starknet.impulse.avnu.fi/v1';
  private static cache = new Map<string, { data: TokenMarketResponse; timestamp: number }>();
  private static readonly CACHE_DURATION = 60000; // 1 minute cache

  static async getTokenMarketData(contractAddress: string): Promise<TokenMarketResponse | null> {
    if (!contractAddress) return null;

    // Check cache first
    const cached = this.cache.get(contractAddress);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const response = await fetch(`${this.BASE_URL}/tokens/${contractAddress}`, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: TokenMarketResponse = await response.json();
      
      // Cache the result
      this.cache.set(contractAddress, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      return null;
    }
  }

  static formatMarketCap(marketCap: number): string {
    if (marketCap >= 1000000000) {
      return `$${(marketCap / 1000000000).toFixed(2)}B`;
    } else if (marketCap >= 1000000) {
      return `$${(marketCap / 1000000).toFixed(2)}M`;
    } else if (marketCap >= 1000) {
      return `$${(marketCap / 1000).toFixed(2)}K`;
    }
    return `$${marketCap.toFixed(2)}`;
  }

  static formatPrice(price: number): string {
    if (price >= 1) {
      return `$${price.toFixed(4)}`;
    } else if (price >= 0.01) {
      return `$${price.toFixed(6)}`;
    } else if (price >= 0.000001) {
      return `$${price.toFixed(8)}`;
    }
    return `$${price.toExponential(3)}`;
  }

  static formatPercentageChange(change: number): string {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  }
}

export { MarketService };
export type { TokenMarketResponse, MarketData };