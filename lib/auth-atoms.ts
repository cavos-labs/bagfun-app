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

// User data atom
export const userAtom = atom<UserData | null>(null);

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
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('cavos_user', JSON.stringify(userData));
      }
      
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
  
  // Remove from localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('cavos_user');
  }
  
  set(userAtom, null);
});

// Initialize user from localStorage
export const initUserAtom = atom(null, (get, set) => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('cavos_user');
      if (stored) {
        const userData = JSON.parse(stored);
        set(userAtom, userData);
      }
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
      localStorage.removeItem('cavos_user');
    }
  }
});