'use client';

import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  chainId: string | null;
  walletName: string | null;
  walletIcon: string | null;
}

const initialWalletState: WalletState = {
  address: null,
  isConnected: false,
  chainId: null,
  walletName: null,
  walletIcon: null,
};

export const walletStateAtom = atomWithStorage<WalletState>('wallet-state', initialWalletState);

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