export interface AVNUQuote {
  quoteId: string;
  sellTokenAddress: string;
  sellAmount: string;
  sellAmountInUsd: number;
  buyTokenAddress: string;
  buyAmount: string;
  buyAmountInUsd: number;
  buyAmountWithoutFees: string;
  buyAmountWithoutFeesInUsd: number;
  estimatedAmount: boolean;
  chainId: string;
  blockNumber: string;
  expiry: string | null;
  routes: Route[];
  gasFees: string;
  gasFeesInUsd: number;
  avnuFees: string;
  avnuFeesInUsd: number;
  avnuFeesBps: string;
  integratorFees: string;
  integratorFeesInUsd: number;
  integratorFeesBps: string;
  priceRatioUsd: number;
  liquiditySource: string;
  sellTokenPriceInUsd: number;
  buyTokenPriceInUsd: number;
  gasless: {
    active: boolean;
    gasTokenPrices: GasTokenPrice[];
  };
  exactTokenTo: boolean;
  estimatedSlippage: number;
}

export interface Route {
  name: string;
  address: string;
  percent: number;
  sellTokenAddress: string;
  buyTokenAddress: string;
  routeInfo: {
    token0: string;
    token1: string;
    fee: string;
    tickSpacing: string;
    extension: string;
  };
  routes: Route[];
}

export interface GasTokenPrice {
  tokenAddress: string;
  gasFeesInGasToken: string;
  gasFeesInUsd: number;
}

export interface QuotesResponse {
  quotes: AVNUQuote[];
  prices: any[];
}

export interface QuotesError {
  error: string;
  details?: string;
}

export class QuotesService {
  static async fetchQuotes(params: {
    sellTokenAddress: string;
    buyTokenAddress: string;
    sellAmount: string;
  }): Promise<{ data?: QuotesResponse; error?: string }> {
    try {
      const { sellTokenAddress, buyTokenAddress, sellAmount } = params;
      
      const queryParams = new URLSearchParams({
        sellTokenAddress,
        buyTokenAddress,
        sellAmount,
      });

      const response = await fetch(`/api/quotes?${queryParams.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        return { error: result.error || 'Failed to fetch quotes' };
      }

      return { data: result };
    } catch (error: any) {
      console.error('Error fetching quotes:', error);
      return { error: 'Network error while fetching quotes' };
    }
  }

  static formatTokenAmount(amountHex: string, decimals: number = 18): number {
    try {
      // Convert hex to BigInt then to number
      const amountBigInt = BigInt(amountHex);
      const amountNumber = Number(amountBigInt) / (10 ** decimals);
      return amountNumber;
    } catch (error) {
      console.error('Error formatting token amount:', error);
      return 0;
    }
  }

  static calculatePriceImpact(quote: AVNUQuote): number {
    if (!quote.buyAmountWithoutFeesInUsd || !quote.buyAmountInUsd) return 0;
    
    const priceImpact = ((quote.buyAmountWithoutFeesInUsd - quote.buyAmountInUsd) / quote.buyAmountWithoutFeesInUsd) * 100;
    return Math.abs(priceImpact);
  }
}