'use client';

import { atom } from 'jotai';

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  chainId: string | null;
  walletName: string | null;
  walletIcon: string | null;
  account: any | null; // Store the wallet account for transactions
}

const initialWalletState: WalletState = {
  address: null,
  isConnected: false,
  chainId: null,
  walletName: null,
  walletIcon: null,
  account: null,
};

export const walletStateAtom = atom<WalletState>(initialWalletState);

export const isWalletConnectedAtom = atom(
  (get) => get(walletStateAtom).isConnected
);

export const walletAddressAtom = atom(
  (get) => get(walletStateAtom).address
);

export const connectWalletAtom = atom(
  null,
  (get, set, walletData: Partial<WalletState>) => {
    const currentState = get(walletStateAtom);
    set(walletStateAtom, {
      ...currentState,
      ...walletData,
      isConnected: true,
    });
  }
);

export const disconnectWalletAtom = atom(
  null,
  (get, set) => {
    set(walletStateAtom, initialWalletState);
  }
);