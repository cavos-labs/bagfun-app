'use client';

import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { userAtom } from '@/lib/auth-atoms';
import { ApiToken } from '@/lib/tokenService';
import { getBalanceOf } from 'cavos-service-sdk';
import Image from 'next/image';

interface TokenBalancesModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokens: ApiToken[];
}

interface TokenBalance {
  token: ApiToken;
  balance: number;
  loading: boolean;
  error?: string;
}

export default function TokenBalancesModal({ isOpen, onClose, tokens }: TokenBalancesModalProps) {
  const [user] = useAtom(userAtom);
  const [isVisible, setIsVisible] = useState(false);
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const fetchTokenBalance = async (token: ApiToken): Promise<number> => {
    if (!user?.wallet_address || !user?.access_token || !token.contract_address) {
      throw new Error('Missing required data');
    }

    const result = await getBalanceOf(
      user.wallet_address,
      token.contract_address,
      "18", // Default to 18 decimals
      user.access_token
    );

    return result.balance || 0;
  };

  const loadAllBalances = async () => {
    if (!user?.wallet_address || tokens.length === 0) return;

    setLoading(true);
    
    // Initialize all tokens with loading state
    const initialBalances = tokens
      .filter(token => token.contract_address) // Only tokens with contract addresses
      .map(token => ({
        token,
        balance: 0,
        loading: true
      }));

    setTokenBalances(initialBalances);

    // Fetch balances for all tokens
    const balancePromises = initialBalances.map(async (tokenBalance) => {
      try {
        const balance = await fetchTokenBalance(tokenBalance.token);
        return {
          ...tokenBalance,
          balance,
          loading: false
        };
      } catch (error) {
        return {
          ...tokenBalance,
          balance: 0,
          loading: false,
          error: 'Failed to load balance'
        };
      }
    });

    // Wait for all balance requests to complete
    const results = await Promise.all(balancePromises);
    
    // Filter to only show tokens with non-zero balances
    const tokensWithBalance = results.filter(result => result.balance > 0);
    
    setTokenBalances(tokensWithBalance);
    setLoading(false);
  };

  const formatBalance = (balance: number) => {
    if (balance >= 1000000000) {
      return `${(balance / 1000000000).toFixed(2)}B`;
    } else if (balance >= 1000000) {
      return `${(balance / 1000000).toFixed(2)}M`;
    } else if (balance >= 1000) {
      return `${(balance / 1000).toFixed(2)}K`;
    }
    return balance.toLocaleString();
  };

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      loadAllBalances();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 transition-opacity duration-200 ${
          isVisible ? 'bg-opacity-40' : 'bg-opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full max-w-lg mx-4 bg-black rounded-2xl p-8 border border-[#333333] transform transition-all duration-200 max-h-[80vh] overflow-hidden ${
        isVisible 
          ? 'translate-y-0 scale-100 opacity-100' 
          : 'translate-y-4 scale-95 opacity-0'
      }`}>
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-[#a1a1aa] hover:text-white transition-all duration-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 
            className="text-white text-2xl font-bold mb-2"
            style={{ fontFamily: 'RamaGothicBold, sans-serif' }}
          >
            MY BAG
          </h2>
          <p className="text-[#a1a1aa] text-sm">
            Your holdings across all tokens
          </p>
        </div>

        {/* Content */}
        <div className="max-h-[50vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent mx-auto mb-4"></div>
                <p className="text-[#a1a1aa] text-sm">Loading token balances...</p>
              </div>
            </div>
          ) : tokenBalances.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="text-[#a1a1aa] text-4xl mb-4">💰</div>
                <p className="text-[#a1a1aa] text-sm">
                  No token balances found
                </p>
                <p className="text-[#666666] text-xs mt-2">
                  You don't hold any tokens from this platform
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {tokenBalances.map(({ token, balance, loading: itemLoading, error }) => (
                <div key={token.id} className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-4 flex items-center gap-3">
                  {/* Token Image */}
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-white flex-shrink-0">
                    {token.image_url ? (
                      <Image
                        src={token.image_url}
                        alt={token.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                        <span className="text-white font-bold text-sm">
                          {token.ticker.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Token Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">${token.ticker}</p>
                        <p className="text-[#a1a1aa] text-sm truncate">{token.name}</p>
                      </div>
                      <div className="text-right">
                        {itemLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border border-white border-t-transparent"></div>
                        ) : error ? (
                          <p className="text-red-400 text-xs">Error</p>
                        ) : (
                          <p className="text-white font-semibold">{formatBalance(balance)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}