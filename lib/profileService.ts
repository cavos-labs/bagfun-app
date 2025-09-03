export interface UserProfile {
  email: string;
  network: string;
  wallet_address: string;
  wallet_network: string;
  wallet_public_key: string;
  created_at: string;
}

export class ProfileService {
  static async getUserProfile(accessToken: string): Promise<{ profile?: UserProfile; error?: string }> {
    try {
      const response = await fetch('/api/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to fetch profile');
      }

      if (!responseData.success) {
        throw new Error(responseData.message || 'Profile fetch was not successful');
      }

      const profile: UserProfile = {
        email: responseData.data.email,
        network: responseData.data.network,
        wallet_address: responseData.data.wallet.address,
        wallet_network: responseData.data.wallet.network,
        wallet_public_key: responseData.data.wallet.public_key,
        created_at: responseData.data.created_at,
      };

      return { profile };
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      return { error: error.message || 'Failed to fetch profile' };
    }
  }
}