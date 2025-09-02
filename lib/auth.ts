import { UserData, SignInResponse } from './auth-atoms';

const USER_STORAGE_KEY = 'cavos_user';

export const auth = {
  // Get user from localStorage
  getUser(): UserData | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error getting user from localStorage:', error);
      return null;
    }
  },

  // Set user in localStorage
  setUser(signInResponse: SignInResponse): UserData {
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
      // Direct API format - ensure required fields are present
      if (!signInResponse.access_token || !signInResponse.wallet_address) {
        throw new Error('Missing required authentication data');
      }
      
      userData = {
        access_token: signInResponse.access_token,
        wallet_address: signInResponse.wallet_address,
        network: signInResponse.network || process.env.NEXT_PUBLIC_STARKNET_NETWORK || 'sepolia',
        email: signInResponse.email,
        auth_method: 'email',
      };
    }
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    }
    
    return userData;
  },

  // Remove user from localStorage
  removeUser(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const user = this.getUser();
    return user !== null && user.access_token !== '';
  },

  // Get access token
  getAccessToken(): string | null {
    const user = this.getUser();
    return user?.access_token || null;
  },

  // Get wallet address
  getWalletAddress(): string | null {
    const user = this.getUser();
    return user?.wallet_address || null;
  },

  // Get network
  getNetwork(): string {
    const user = this.getUser();
    return user?.network || 'sepolia';
  },
};