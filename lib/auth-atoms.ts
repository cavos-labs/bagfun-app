import { atom } from "jotai";
import { disconnectWalletAtom } from "./wallet-atoms";

export interface UserData {
  access_token: string;
  wallet_address: string;
  network: string;
  email?: string;
  wallet_name?: string;
  auth_method?: 'email' | 'social' | 'wallet';
}

export interface SignInResponse {
  success: boolean;
  access_token?: string;
  wallet_address?: string;
  network?: string;
  email?: string;
  message?: string;
  data?: {
    user: {
      id: string;
      email?: string;
      wallet_address?: string;
      wallet_name?: string;
    };
    token: string;
  };
  method?: 'email' | 'social' | 'wallet';
}

// Internal atom that holds the user data
const baseUserAtom = atom<UserData | null>(null);

// Atom to track if we've initialized from sessionStorage
const isInitializedAtom = atom<boolean>(false);

// User data atom with sessionStorage sync
export const userAtom = atom(
  (get) => get(baseUserAtom),
  (get, set, newValue: UserData | null) => {
    set(baseUserAtom, newValue);
    
    // Sync to sessionStorage on client-side only
    if (typeof window !== 'undefined') {
      try {
        if (newValue === null) {
          window.sessionStorage.removeItem('bagfun-user-session');
        } else {
          window.sessionStorage.setItem('bagfun-user-session', JSON.stringify(newValue));
        }
      } catch {
        // Ignore sessionStorage errors
      }
    }
  }
);

// Computed atom to check if user is authenticated
export const isAuthenticatedAtom = atom((get) => {
  const user = get(userAtom);
  return user !== null && user.access_token !== '';
});

// Sign in action atom
export const signInAtom = atom(
  null,
  (get, set, signInResponse: SignInResponse) => {
    if (signInResponse.success) {
      let userData: UserData;
      
      // Handle different response formats (cavos-sdk vs wallet vs direct API)
      if (signInResponse.data) {
        // Cavos SDK or wallet format
        userData = {
          access_token: signInResponse.data.token,
          wallet_address: signInResponse.data.user.wallet_address || signInResponse.data.user.id,
          network: process.env.NEXT_PUBLIC_STARKNET_NETWORK || 'sepolia',
          email: signInResponse.data.user.email,
          wallet_name: signInResponse.data.user.wallet_name,
          auth_method: signInResponse.method || 'social',
        };
      } else {
        // Direct API format
        userData = {
          access_token: signInResponse.access_token!,
          wallet_address: signInResponse.wallet_address!,
          network: signInResponse.network || process.env.NEXT_PUBLIC_STARKNET_NETWORK || 'sepolia',
          email: signInResponse.email,
          auth_method: 'email',
        };
      }
      
      // Save to sessionStorage via atomWithStorage
      set(userAtom, userData);
    }
  }
);

// Sign out action atom
export const signOutAtom = atom(null, (get, set) => {
  const user = get(userAtom);
  
  // If user authenticated via wallet, also disconnect wallet
  if (user?.auth_method === 'wallet') {
    set(disconnectWalletAtom);
  }
  
  // Clear user session
  set(userAtom, null);
});

// Export the initialization status
export const isInitializedAtom_ = atom((get) => get(isInitializedAtom));

// Initialize user - loads from sessionStorage on client-side
export const initUserAtom = atom(null, (get, set) => {
  // Only load from sessionStorage on client-side
  if (typeof window !== 'undefined') {
    try {
      const stored = window.sessionStorage.getItem('bagfun-user-session');
      if (stored) {
        const userData = JSON.parse(stored);
        set(baseUserAtom, userData);
      }
      set(isInitializedAtom, true);
    } catch {
      // Ignore sessionStorage errors
      set(isInitializedAtom, true);
    }
  } else {
    // On server-side, mark as initialized immediately
    set(isInitializedAtom, true);
  }
});