'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { SignInWithGoogle, SignInWithApple } from 'cavos-service-sdk';
import axios from 'axios';
import { useWalletConnector } from '@/lib/useWalletConnector';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: (signInResponse: any) => void;
}

export default function LoginModal({ isOpen, onClose, onSignIn }: LoginModalProps) {
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  
  const { connect: connectWallet } = useWalletConnector();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLoginForm) {
        // Sign In
        const response = await axios.post('/api/v1/auth/signIn', {
          email: formData.email,
          password: formData.password,
          network: process.env.NEXT_PUBLIC_STARKNET_NETWORK || 'sepolia',
        });

        if (response.data.success) {
          onSignIn(response.data);
          onClose();
        }
      } else {
        // Sign Up
        const response = await axios.post('/api/v1/auth/signUp', {
          email: formData.email,
          password: formData.password,
          network: process.env.NEXT_PUBLIC_STARKNET_NETWORK || 'sepolia',
        });

        if (response.data.success) {
          setError('');
          setIsLoginForm(true);
          setFormData({ email: '', password: '' });
        }
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const handleWalletConnect = async () => {
    setWalletLoading(true);
    setWalletModalOpen(true); // Hide login modal while wallet modal is open
    setError('');
    
    try {
      const result = await connectWallet();
      
      if (result.success && result.address) {
        // Create a wallet sign-in response that matches the expected format
        const walletSignInResponse = {
          success: true,
          data: {
            user: {
              id: result.address,
              email: null,
              wallet_address: result.address,
              wallet_name: result.walletName,
            },
            token: `wallet_${result.address}`, // Simple wallet-based token
          },
          method: 'wallet'
        };
        
        onSignIn(walletSignInResponse);
        onClose();
      } else {
        setError(result.error || 'Failed to connect wallet');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to connect wallet');
    } finally {
      setWalletLoading(false);
      setWalletModalOpen(false); // Show login modal again
    }
  };

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 flex items-center justify-center transition-opacity duration-200 ${
      walletModalOpen ? 'z-0' : 'z-50'
    } ${
      isVisible && !walletModalOpen ? 'opacity-100' : 'opacity-0'
    }`}>
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 transition-opacity duration-200 ${
          isVisible && !walletModalOpen ? 'bg-opacity-40' : 'bg-opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full max-w-md mx-4 theme-bg-primary theme-border-primary rounded-2xl p-8 border transform transition-all duration-200 ${
        isVisible && !walletModalOpen
          ? 'translate-y-0 scale-100 opacity-100' 
          : 'translate-y-4 scale-95 opacity-0'
      }`}>
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 theme-text-secondary hover:theme-text-primary transition-all duration-200 hover:scale-110 active:scale-95"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 
            className="theme-text-primary text-2xl font-bold mb-2"
            style={{ fontFamily: 'RamaGothicBold, sans-serif' }}
          >
            BAG.FUN
          </h2>
          <p className="theme-text-secondary text-sm transition-all duration-300">
            {isLoginForm ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>

        {/* Error message */}
        <div className={`overflow-hidden transition-all duration-300 ease-out ${
          error ? 'max-h-20 mb-4' : 'max-h-0 mb-0'
        }`}>
          <div className={`p-3 bg-red-900/20 border border-red-500/20 rounded-lg text-red-400 text-sm transform transition-all duration-300 ${
            error ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
          }`}>
            {error}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={`space-y-4 mb-6 transition-opacity duration-200 ${loading ? 'opacity-90' : 'opacity-100'}`}>
          <div className="relative">
            <input
              type="email"
              name="email"
              placeholder="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full theme-bg-secondary theme-border-primary border rounded-lg px-4 py-3 theme-text-primary placeholder:theme-text-tertiary focus:outline-none focus:theme-border-secondary focus:ring-2 focus:theme-border-secondary/20 transition-all duration-200 hover:theme-border-secondary"
            />
            <div className={`absolute inset-0 rounded-lg transition-opacity duration-200 pointer-events-none ${
              formData.email ? 'opacity-100' : 'opacity-0'
            } bg-gradient-to-r from-blue-500/5 to-purple-500/5`} />
          </div>
          
          <div className="relative">
            <input
              type="password"
              name="password"
              placeholder="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full theme-bg-secondary theme-border-primary border rounded-lg px-4 py-3 theme-text-primary placeholder:theme-text-tertiary focus:outline-none focus:theme-border-secondary focus:ring-2 focus:theme-border-secondary/20 transition-all duration-200 hover:theme-border-secondary"
            />
            <div className={`absolute inset-0 rounded-lg transition-opacity duration-200 pointer-events-none ${
              formData.password ? 'opacity-100' : 'opacity-0'
            } bg-gradient-to-r from-green-500/5 to-blue-500/5`} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full theme-button-primary hover:theme-button-secondary font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
          >
            <span className={`transition-opacity duration-200 ${loading ? 'opacity-0' : 'opacity-100'}`}>
              {isLoginForm ? 'Sign In' : 'Sign Up'}
            </span>
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-600 border-t-transparent"></div>
              </div>
            )}
          </button>
        </form>

        {/* Toggle between login/signup */}
        <div className="text-center mb-6">
          <button
            onClick={() => {
              setIsLoginForm(!isLoginForm);
              setError('');
              setFormData({ email: '', password: '' });
            }}
            className="theme-text-secondary hover:theme-text-primary transition-colors duration-200 text-sm"
          >
            {isLoginForm ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>

        {/* Divider */}
        <div className="text-center theme-text-secondary text-sm mb-6">
          or
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-3">
          <div className="w-full">
            <SignInWithGoogle
              appId={process.env.NEXT_PUBLIC_CAVOS_APP_ID || ''}
              network={process.env.NEXT_PUBLIC_STARKNET_NETWORK || 'sepolia'}
              finalRedirectUri={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`}
              text="continue with google"
              style={{
                width: '100%',
                backgroundColor: 'white',
                color: 'black',
                fontWeight: '500',
                padding: '12px 16px',
                borderRadius: '8px',
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                border: 'none',
                cursor: 'pointer'
              }}
            />
          </div>

          <div className="w-full">
            <SignInWithApple
              appId={process.env.NEXT_PUBLIC_CAVOS_APP_ID || ''}
              network={process.env.NEXT_PUBLIC_STARKNET_NETWORK || 'sepolia'}
              finalRedirectUri={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`}
              text="continue with apple"
              style={{
                width: '100%',
                backgroundColor: 'white',
                color: 'black',
                fontWeight: '500',
                padding: '12px 16px',
                borderRadius: '8px',
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                border: 'none',
                cursor: 'pointer'
              }}
            />
          </div>

          <button 
            onClick={handleWalletConnect}
            disabled={walletLoading}
            className="w-full bg-[#FF8F5B] text-white font-medium py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
          >
            <span className={`flex items-center gap-3 transition-opacity duration-200 ${walletLoading ? 'opacity-0' : 'opacity-100'}`}>
              <Image
                src="/ready-logo.png"
                alt="Ready Wallet"
                width={20}
                height={20}
                className="object-contain"
              />
              connect wallet
            </span>
            {walletLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}