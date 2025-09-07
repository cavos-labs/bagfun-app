export interface ApiToken {
  id: string;
  name: string;
  ticker: string;
  image_url?: string;
  amount: number;
  creator_address: string;
  contract_address?: string;
  website?: string;
  telegram_url?: string;
  x_url?: string;
  created_at: string;
}

export interface TokensResponse {
  data: ApiToken[];
  error?: string;
}

export class TokenService {
  static async fetchTokens(options: {
    creatorAddress?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<TokensResponse> {
    try {
      const params = new URLSearchParams();
      
      if (options.creatorAddress) {
        params.append('creator_address', options.creatorAddress);
      }
      if (options.limit) {
        params.append('limit', options.limit.toString());
      }
      if (options.offset) {
        params.append('offset', options.offset.toString());
      }

      const response = await fetch(`/api/tokens?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch tokens');
      }

      return result;
    } catch (error: any) {
      console.error('Error fetching tokens:', error);
      return {
        data: [],
        error: error.message || 'Failed to fetch tokens'
      };
    }
  }

  static async createToken(tokenData: {
    name: string;
    ticker: string;
    creator_address: string;
    amount?: number;
    contract_address?: string;
    website?: string;
    image_file?: string;
  }): Promise<{ data?: ApiToken; error?: string }> {
    try {
      const response = await fetch('/api/tokens/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tokenData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create token');
      }

      return { data: result.data };
    } catch (error: any) {
      console.error('Error creating token:', error);
      return {
        error: error.message || 'Failed to create token'
      };
    }
  }
}