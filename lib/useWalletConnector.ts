'use client';

import { useCallback, useEffect } from 'react';
import { useAtom } from 'jotai';
import { connectWalletAtom, disconnectWalletAtom, walletStateAtom } from './wallet-atoms';

export const useWalletConnector = () => {
  const [walletState] = useAtom(walletStateAtom);
  const [, connectWallet] = useAtom(connectWalletAtom);
  const [, disconnectWallet] = useAtom(disconnectWalletAtom);

  const connect = useCallback(async () => {
    try {
      // Check if wallet is available in window
      if (typeof window === 'undefined' || !window.starknet) {
        throw new Error('Starknet wallet not found. Please install Argent X or Braavos.');
      }

      const starknet = window.starknet;
      
      // Enable the wallet
      await starknet.enable();
      
      if (!starknet.isConnected) {
        throw new Error('Failed to connect wallet');
      }

      // Get wallet details
      const address = starknet.selectedAddress || starknet.account?.address;
      
      if (!address) {
        throw new Error('No wallet address found');
      }

      const chainId = starknet.chainId || await starknet.provider?.getChainId?.() || 'unknown';
      
      // Get wallet info
      const walletName = starknet.name || 'Starknet Wallet';
      const walletIcon = starknet.icon || null;

      connectWallet({
        address: address,
        chainId: chainId,
        walletName,
        walletIcon,
      });

      return { success: true, address, walletName };
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      return { success: false, error: error.message };
    }
  }, [connectWallet]);

  const disconnect = useCallback(() => {
    disconnectWallet();
    return { success: true };
  }, [disconnectWallet]);

  // Auto-reconnect on page load if wallet was previously connected
  useEffect(() => {
    const autoReconnect = async () => {
      if (typeof window === 'undefined' || !window.starknet) return;
      
      try {
        const starknet = window.starknet;
        
        // Check if wallet is still connected
        if (!starknet.isConnected) {
          if (walletState.isConnected) {
            disconnectWallet();
          }
          return;
        }

        // Get current address
        const currentAddress = starknet.selectedAddress || starknet.account?.address;
        
        if (!currentAddress) {
          if (walletState.isConnected) {
            disconnectWallet();
          }
          return;
        }

        // If stored wallet matches current wallet, keep connection
        if (walletState.address && walletState.address === currentAddress) {
          return;
        }

        // Update wallet state if address changed or not stored
        if (walletState.isConnected || starknet.isConnected) {
          const chainId = starknet.chainId || 'unknown';
          connectWallet({
            address: currentAddress,
            chainId: chainId,
            walletName: starknet.name || walletState.walletName || 'Starknet Wallet',
            walletIcon: starknet.icon || walletState.walletIcon,
          });
        }
      } catch (error) {
        console.error('Auto-reconnect failed:', error);
        disconnectWallet();
      }
    };

    // Run auto-reconnect on mount
    autoReconnect();
  }, [walletState.isConnected, walletState.address, connectWallet, disconnectWallet]);

  return {
    walletState,
    connect,
    disconnect,
    isConnected: walletState.isConnected,
    address: walletState.address,
    walletName: walletState.walletName,
  };
};