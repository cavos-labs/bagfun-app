export interface ChartDataPoint {
  date: string;
  value: number;
}

export interface ChartParams {
  tokenAddress: string;
  baseTokenAddress?: string;
  resolution?: number;
  days?: number;
}

export class ChartService {
  private static readonly AVNU_CHART_ENDPOINT = 'https://starknet.impulse.avnu.fi/v1/tokens';
  private static readonly STRK_ADDRESS = '0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d';

  static async fetchPriceData(params: ChartParams): Promise<{ data: ChartDataPoint[]; error?: string }> {
    try {
      const {
        tokenAddress,
        baseTokenAddress = this.STRK_ADDRESS,
        resolution = 5,
        days = 1
      } = params;

      // Calculate dates (current time and 1 day ago)
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

      const url = `${this.AVNU_CHART_ENDPOINT}/${tokenAddress}/prices/line?resolution=${resolution}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&in=${baseTokenAddress}`;
      
      console.log('Fetching chart data from:', url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }

      return { data };
    } catch (error) {
      console.error('Chart data fetch error:', error);
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Failed to fetch chart data'
      };
    }
  }

  static formatChartData(data: ChartDataPoint[]): { labels: string[]; values: number[] } {
    const labels = data.map(point => {
      const date = new Date(point.date);
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    });

    const values = data.map(point => point.value);

    return { labels, values };
  }

  static calculatePriceChange(data: ChartDataPoint[]): { 
    change: number; 
    changePercent: number; 
    isPositive: boolean 
  } {
    if (data.length < 2) {
      return { change: 0, changePercent: 0, isPositive: true };
    }

    const firstPrice = data[0].value;
    const lastPrice = data[data.length - 1].value;
    const change = lastPrice - firstPrice;
    const changePercent = (change / firstPrice) * 100;

    return {
      change,
      changePercent,
      isPositive: change >= 0
    };
  }

  static getLatestPrice(data: ChartDataPoint[]): number {
    if (data.length === 0) return 0;
    return data[data.length - 1].value;
  }
}