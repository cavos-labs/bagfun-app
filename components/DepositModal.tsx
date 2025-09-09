'use client';

import { useState, useEffect } from 'react';
import { formatAddress } from '@/lib/utils';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress?: string;
}

export default function DepositModal({ isOpen, onClose, walletAddress }: DepositModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const handleCopyAddress = async () => {
    if (walletAddress) {
      try {
        await navigator.clipboard.writeText(walletAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy address:', error);
      }
    }
  };

  const handleBuyCrypto = () => {
    if (walletAddress) {
      const formattedAddress = formatAddress(walletAddress);
      const rampUrl = `https://app.ramp.network/exchange?defaultFlow=ONRAMP&enabledCryptoAssets=STARKNET_%2A&enabledFlows=ONRAMP&hostApiKey=p8skgorascdvryjzeqoah3xxfbpnx79nopzo6pzw&hostLogoUrl=https%3A%2F%2Fdv3jj1unlp2jl.cloudfront.net%2Fargent-assets%2Fhito-orange.svg&inAsset=CRC&inAssetValue=6000000&outAsset=STARKNET_STRK&userAddress=${formattedAddress}`;
      window.open(rampUrl, '_blank', 'noopener,noreferrer');
    }
  };

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
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
      <div className={`relative w-full max-w-md mx-4 theme-bg-secondary theme-border-primary border rounded-2xl p-6 transform transition-all duration-200 ${
        isVisible 
          ? 'translate-y-0 scale-100 opacity-100' 
          : 'translate-y-4 scale-95 opacity-0'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="theme-text-primary text-xl font-semibold">Add STRK</h2>
          <button
            onClick={handleClose}
            className="theme-text-secondary hover:theme-text-primary transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {/* Deposit from Starknet Wallet */}
          <div className="theme-bg-tertiary theme-border-primary border rounded-xl p-4 hover:theme-border-secondary transition-colors duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9c1.657 0 3-4.03 3-9s1.343-9 3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <div>
                <h3 className="theme-text-primary font-semibold">Deposit from Starknet Wallet</h3>
                <p className="theme-text-secondary text-sm">Send STRK to your wallet address</p>
              </div>
            </div>
            
            {walletAddress && (
              <div className="space-y-3">
                <div className="theme-bg-primary theme-border-primary border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="theme-text-secondary text-xs mb-2">Your Wallet Address</p>
                      <div className="flex items-center gap-2">
                        <span className="theme-text-primary font-mono text-sm theme-bg-tertiary px-2 py-1 rounded theme-border-primary border">
                          {walletAddress.slice(0, 6)}...{walletAddress.slice(-6)}
                        </span>
                        <button
                          onClick={handleCopyAddress}
                          className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition-all duration-200"
                          title="Copy address"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {copied && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <div className="text-green-400 text-sm flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Address copied to clipboard!
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Buy Crypto */}
          <div className="theme-bg-tertiary theme-border-primary border rounded-xl p-4 hover:theme-border-secondary transition-colors duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="theme-text-primary font-semibold">Buy Crypto</h3>
                <p className="theme-text-secondary text-sm">Purchase STRK with fiat currency</p>
              </div>
            </div>
            
            <button
              onClick={handleBuyCrypto}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              Buy STRK with Ramp
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t theme-border-primary">
          <p className="theme-text-tertiary text-xs text-center">
            Make sure you're sending STRK tokens to the correct network (Starknet)
          </p>
        </div>
      </div>
    </div>
  );
}