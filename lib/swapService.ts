import { formatAmount } from 'cavos-service-sdk';

export interface SwapParams {
  address: string;
  amount: string;
  sellTokenAddress: string;
  buyTokenAddress: string;
}

export interface SwapResponse {
  result?: string; // Transaction hash
  accessToken?: string; // Refreshed token
  error?: string;
}

export class SwapService {
  private static readonly CAVOS_SWAP_ENDPOINT = 'https://services.cavos.xyz/api/v1/external/execute/session/swap';

  static async executeSwap(params: SwapParams, accessToken: string): Promise<SwapResponse> {
    try {
      const response = await fetch(this.CAVOS_SWAP_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: params.address,
          org_id: process.env.NEXT_PUBLIC_CAVOS_APP_ID,
          network: process.env.NEXT_PUBLIC_STARKNET_NETWORK,
          amount: params.amount,
          sellTokenAddress: params.sellTokenAddress,
          buyTokenAddress: params.buyTokenAddress,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      return {
        result: result.result,
        accessToken: result.accessToken,
      };
    } catch (error) {
      console.error('Swap execution failed:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to execute swap',
      };
    }
  }

  static async formatAmountForSwap(amount: string, decimals: number = 18): Promise<string> {
    try {
      const result = await formatAmount(amount, decimals);
      // formatAmount returns { uint256: { low: string; high: string } }
      // Convert to a single string representation
      return BigInt(result.uint256.low).toString();
    } catch (error) {
      throw new Error('Failed to format amount');
    }
  }

  static validateSwapParams(params: SwapParams): string | null {
    if (!params.address || params.address.length < 10) {
      return 'Invalid wallet address';
    }
    
    if (!params.amount || parseFloat(params.amount) <= 0) {
      return 'Amount must be greater than 0';
    }
    
    if (!params.sellTokenAddress || !params.buyTokenAddress) {
      return 'Token addresses are required';
    }
    
    if (params.sellTokenAddress === params.buyTokenAddress) {
      return 'Cannot swap the same token';
    }
    
    return null;
  }
}