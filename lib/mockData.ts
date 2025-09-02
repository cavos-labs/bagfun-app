export interface Token {
  id: string;
  name: string;
  ticker: string;
  image_url: string;
  amount: string;
  creator_address: string;
  created_at: string;
  market_cap: number;
  price_change: number;
}

export const mockTokens: Token[] = [
  {
    id: "1",
    name: "Schizodio coin",
    ticker: "SCHIZODIO",
    image_url: "/tokens/schizodio.svg",
    amount: "1000000000000000000000000",
    creator_address: "0x09.123",
    created_at: "2024-01-01T00:00:00Z",
    market_cap: 500000,
    price_change: 5.2
  },
  {
    id: "2", 
    name: "Brother coin",
    ticker: "BROTHER",
    image_url: "/tokens/brother.svg",
    amount: "800000000000000000000000",
    creator_address: "0x09.123", 
    created_at: "2024-01-02T00:00:00Z",
    market_cap: 400000,
    price_change: 3.1
  },
  {
    id: "3",
    name: "Ducks coin", 
    ticker: "DUCKS",
    image_url: "/tokens/ducks.svg",
    amount: "500000000000000000000000",
    creator_address: "0x09.123",
    created_at: "2024-01-03T00:00:00Z", 
    market_cap: 100000,
    price_change: -2.5
  },
  {
    id: "4",
    name: "Schizodio coin",
    ticker: "SCHIZODIO", 
    image_url: "/tokens/schizodio.svg",
    amount: "1000000000000000000000000",
    creator_address: "0x09.123",
    created_at: "2024-01-04T00:00:00Z",
    market_cap: 500000,
    price_change: 5.2
  },
  {
    id: "5",
    name: "Brother coin",
    ticker: "BROTHER",
    image_url: "/tokens/brother.svg", 
    amount: "800000000000000000000000",
    creator_address: "0x09.123",
    created_at: "2024-01-05T00:00:00Z",
    market_cap: 400000,
    price_change: 3.1
  },
  {
    id: "6",
    name: "Ducks coin",
    ticker: "DUCKS",
    image_url: "/tokens/ducks.svg",
    amount: "500000000000000000000000", 
    creator_address: "0x09.123",
    created_at: "2024-01-06T00:00:00Z",
    market_cap: 100000,
    price_change: -2.5
  },
  {
    id: "7", 
    name: "Schizodio coin",
    ticker: "SCHIZODIO",
    image_url: "/tokens/schizodio.svg",
    amount: "1000000000000000000000000",
    creator_address: "0x09.123", 
    created_at: "2024-01-07T00:00:00Z",
    market_cap: 500000,
    price_change: 5.2
  },
  {
    id: "8",
    name: "Brother coin", 
    ticker: "BROTHER",
    image_url: "/tokens/brother.svg",
    amount: "800000000000000000000000",
    creator_address: "0x09.123",
    created_at: "2024-01-08T00:00:00Z",
    market_cap: 400000,
    price_change: 3.1
  },
  {
    id: "9",
    name: "Ducks coin",
    ticker: "DUCKS", 
    image_url: "/tokens/ducks.svg",
    amount: "500000000000000000000000",
    creator_address: "0x09.123",
    created_at: "2024-01-09T00:00:00Z",
    market_cap: 100000,
    price_change: -2.5
  }
];