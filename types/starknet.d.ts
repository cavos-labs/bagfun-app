interface StarknetWallet {
  enable(): Promise<void>;
  isConnected: boolean;
  selectedAddress?: string;
  account?: {
    address: string;
  };
  chainId?: string;
  name?: string;
  icon?: string;
  provider?: any;
}

declare global {
  interface Window {
    starknet?: StarknetWallet;
  }
}

export {};