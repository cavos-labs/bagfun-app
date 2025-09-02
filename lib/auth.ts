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
    const userData: UserData = {
      access_token: signInResponse.access_token,
      wallet_address: signInResponse.wallet_address,
      network: signInResponse.network,
      email: signInResponse.email,
    };
    
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