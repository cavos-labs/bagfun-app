'use client';

import { useCallback, useEffect } from 'react';
import { useAtom } from 'jotai';
import { connectWalletAtom, disconnectWalletAtom, walletStateAtom } from './wallet-atoms';
import { connect } from '@starknet-io/get-starknet';
import { RpcProvider, WalletAccount } from 'starknet';

export const useWalletConnector = () => {
  const [walletState] = useAtom(walletStateAtom);
  const [, connectWallet] = useAtom(connectWalletAtom);
  const [, disconnectWallet] = useAtom(disconnectWalletAtom);

  const connectModern = useCallback(async () => {
    try {
      const nodeUrl = 'https://starknet-sepolia.public.blastapi.io/rpc/v0_8';
      const myFrontendProviderUrl = new RpcProvider({ nodeUrl });
      
      // Use get-starknet v4+ modal to select wallet
      const selectedWalletSWO = await connect({ 
        modalMode: 'alwaysAsk', 
        modalTheme: 'dark' 
      });

      if (!selectedWalletSWO) {
        throw new Error('No wallet selected');
      }

      // Connect using WalletAccount
      const myWalletAccount = await WalletAccount.connect(
        myFrontendProviderUrl ,
        selectedWalletSWO
      );

      if (!myWalletAccount.address) {
        throw new Error('No wallet address found');
      }

      // Get wallet details
      const address = myWalletAccount.address;
      // const chainId = selectedWalletSWO.chainId || 'unknown';
      const walletName = selectedWalletSWO.name || 'Starknet Wallet';
      // const walletIcon = selectedWalletSWO.icon || null;

      connectWallet({
        address: address,
        // chainId: chainId,
        walletName,
        // walletIcon,
        account: myWalletAccount,
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

  // Log wallet state changes for debugging
  useEffect(() => {
    console.log('Wallet state changed:', {
      isConnected: walletState.isConnected,
      address: walletState.address,
      walletName: walletState.walletName,
      hasAccount: !!walletState.account
    });
  }, [walletState]);

  return {
    walletState,
    connect: connectModern,
    disconnect,
    isConnected: walletState.isConnected,
    address: walletState.address,
    walletName: walletState.walletName,
    account: walletState.account,
  };
};