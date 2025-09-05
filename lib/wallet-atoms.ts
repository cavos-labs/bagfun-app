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

// Always start with the same initial state to avoid hydration mismatch
const initialWalletState: WalletState = {
  address: null,
  isConnected: false,
  chainId: null,
  walletName: null,
  walletIcon: null,
  account: null,
};

export const walletStateAtom = atom<WalletState>(initialWalletState);

// Add a separate atom to track if we've hydrated from localStorage
export const isHydratedAtom = atom(false);

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
    const newState = {
      ...currentState,
      ...walletData,
      isConnected: true,
    };
    set(walletStateAtom, newState);
    
    // Save to localStorage (excluding account object)
    if (typeof window !== 'undefined') {
      try {
        const stateToSave = {
          address: newState.address,
          isConnected: newState.isConnected,
          chainId: newState.chainId,
          walletName: newState.walletName,
          walletIcon: newState.walletIcon,
          // Don't save account object
        };
        localStorage.setItem('walletState', JSON.stringify(stateToSave));
      } catch (error) {
        console.error('Error saving wallet state:', error);
      }
    }
  }
);

export const disconnectWalletAtom = atom(
  null,
  (get, set) => {
    set(walletStateAtom, initialWalletState);
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('walletState');
      } catch (error) {
        console.error('Error clearing wallet state:', error);
      }
    }
  }
);

// Atom to hydrate wallet state from localStorage after component mounts
export const hydrateWalletStateAtom = atom(
  null,
  (get, set) => {
    if (typeof window !== 'undefined' && !get(isHydratedAtom)) {
      try {
        const saved = localStorage.getItem('walletState');
        if (saved) {
          const parsed = JSON.parse(saved);
          // Only restore basic connection info, not the account object
          set(walletStateAtom, {
            address: parsed.address || null,
            isConnected: parsed.isConnected || false,
            chainId: parsed.chainId || null,
            walletName: parsed.walletName || null,
            walletIcon: parsed.walletIcon || null,
            account: null, // Account will be reconnected separately
          });
        }
        set(isHydratedAtom, true);
      } catch (error) {
        console.error('Error hydrating wallet state:', error);
        set(isHydratedAtom, true); // Mark as hydrated even if it failed
      }
    }
  }
);