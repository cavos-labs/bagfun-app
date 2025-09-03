'use client';

import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { useRouter } from 'next/navigation';
import { userAtom } from '@/lib/auth-atoms';
import { ProfileService, UserProfile } from '@/lib/profileService';
import Sidebar from '@/components/Sidebar';
import Image from 'next/image';

export default function ProfilePage() {
  const [user] = useAtom(userAtom);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInitialized, setUserInitialized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Add a timeout to handle initialization
    const timer = setTimeout(() => {
      setUserInitialized(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Wait for user state to be initialized
    if (user === null && !userInitialized) {
      return; // Still loading user state
    }

    // If authenticated, fetch profile
    if (user && user.access_token) {
      fetchProfile();
    }
  }, [user, userInitialized]);

  const fetchProfile = async () => {
    if (!user?.access_token) return;

    setLoading(true);
    setError(null);

    try {
      const result = await ProfileService.getUserProfile(user.access_token);
      
      if (result.error) {
        setError(result.error);
      } else if (result.profile) {
        setProfile(result.profile);
      }
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const handleBagFunClick = () => {
    router.push('/');
  };

  if (user === null && !userInitialized) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-[#a1a1aa]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !user.access_token) {
    return (
      <div className="min-h-screen bg-[#141414]">
        <Sidebar onBagFunClick={handleBagFunClick} />
        
        <div className="lg:ml-48 flex flex-col min-h-screen pt-16 lg:pt-0">
          <main className="flex-1 p-4 lg:p-8">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="text-[#a1a1aa] text-6xl mb-4">🔒</div>
                  <h2 
                    className="text-white text-2xl font-bold mb-4"
                    style={{ fontFamily: 'RamaGothicBold, sans-serif' }}
                  >
                    LOGIN REQUIRED
                  </h2>
                  <p className="text-[#a1a1aa] mb-6">
                    You need to sign in to view your profile information
                  </p>
                  <button 
                    onClick={() => router.push('/')}
                    className="bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-200"
                  >
                    Go to Home
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414]">
      <Sidebar onBagFunClick={handleBagFunClick} />
      
      <div className="lg:ml-48 flex flex-col min-h-screen pt-16 lg:pt-0">

        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-2xl mx-auto">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-2 border-white border-t-transparent mx-auto mb-4"></div>
                  <p className="text-[#a1a1aa]">Loading profile...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="text-red-500 text-6xl mb-4">⚠️</div>
                  <p className="text-red-400 mb-4">{error}</p>
                  <button 
                    onClick={fetchProfile}
                    className="bg-white text-black px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : profile ? (
              <div className="bg-[#1a1a1a] border border-[#333333] rounded-2xl p-8">
                {/* Profile Header */}
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl font-bold">
                      {profile.email?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <h2 className="text-white text-xl font-semibold mb-2">
                    {profile.email || 'No email'}
                  </h2>
                  <p className="text-[#a1a1aa] text-sm">
                    Member since {formatDate(profile.created_at)}
                  </p>
                </div>

                {/* Profile Details */}
                <div className="space-y-6">
                  {/* Email */}
                  <div className="flex items-center justify-between p-4 bg-[#141414] rounded-lg border border-[#333333]">
                    <div>
                      <p className="text-[#a1a1aa] text-sm mb-1">Email</p>
                      <p className="text-white font-medium">{profile.email || 'Not provided'}</p>
                    </div>
                  </div>

                  {/* Network */}
                  <div className="flex items-center justify-between p-4 bg-[#141414] rounded-lg border border-[#333333]">
                    <div>
                      <p className="text-[#a1a1aa] text-sm mb-1">Network</p>
                      <p className="text-white font-medium capitalize">{profile.network}</p>
                    </div>
                  </div>

                  {/* Wallet Address */}
                  <div className="flex items-center justify-between p-4 bg-[#141414] rounded-lg border border-[#333333]">
                    <div className="flex-1 min-w-0">
                      <p className="text-[#a1a1aa] text-sm mb-1">Wallet Address</p>
                      <p className="text-white font-medium font-mono text-sm break-all">
                        {profile.wallet_address}
                      </p>
                    </div>
                    <button
                      onClick={() => navigator.clipboard?.writeText(profile.wallet_address)}
                      className="ml-3 text-[#a1a1aa] hover:text-white transition-colors duration-200"
                      title="Copy address"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>

                  {/* Wallet Network */}
                  <div className="flex items-center justify-between p-4 bg-[#141414] rounded-lg border border-[#333333]">
                    <div>
                      <p className="text-[#a1a1aa] text-sm mb-1">Wallet Network</p>
                      <p className="text-white font-medium capitalize">{profile.wallet_network}</p>
                    </div>
                  </div>

                </div>

                {/* Back to Home Button */}
                <div className="mt-8 text-center">
                  <button 
                    onClick={handleBagFunClick}
                    className="bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-200"
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}