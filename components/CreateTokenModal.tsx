'use client';

import { useState, useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import { userAtom } from '@/lib/auth-atoms';
import { useWalletConnector } from '@/lib/useWalletConnector';
import { TokenService } from '@/lib/tokenService';
import Image from 'next/image';
import { CavosAuth, formatAmount, getBalanceOf } from 'cavos-service-sdk';
import { Contract, CallData, cairo, RpcProvider } from 'starknet';
import { formatPercentage, getERC20Balance } from '@/lib/utils';
import { MEMECOIN_FACTORY_ABI } from '@/app/abis/MemecoinFactory';
import { STRK_ABI } from '@/app/abis/STRK';
import axios from 'axios';
import { Percent } from '@uniswap/sdk-core';

interface CreateTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTokenCreated?: (token: any) => void;
}

export default function CreateTokenModal({ isOpen, onClose, onTokenCreated }: CreateTokenModalProps) {
  const [user, setUser] = useAtom(userAtom);
  const { isConnected: isWalletConnected, address: walletAddress, account: walletAccount } = useWalletConnector();
  const [formData, setFormData] = useState({
    name: '',
    ticker: '',
    website: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [starkBalance, setStarkBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchStarkBalance = async () => {
    // For Cavos authenticated users
    if (isWalletConnected && walletAddress) {
      setBalanceLoading(true);
      try {
        // Use getERC20Balance utility function
        const balance = await getERC20Balance(
          walletAddress,
          "0x04718f5a0Fc34cC1AF16A1cdee98fFB20C31f5cD61D6Ab07201858f4287c938D",
          18
        );
        setStarkBalance(balance);
      } catch (error) {
        console.error('Error fetching STRK balance:', error);
        setStarkBalance(null);
      } finally {
        setBalanceLoading(false);
      }
    }
    else if (user?.wallet_address && user?.access_token) {
      setBalanceLoading(true);
      try {
        const currentBalance = await getBalanceOf(
          user.wallet_address,
          "0x04718f5a0Fc34cC1AF16A1cdee98fFB20C31f5cD61D6Ab07201858f4287c938D",
          "18",
          user.access_token
        );
        console.log('STRK Balance in modal:', currentBalance);
        setStarkBalance(currentBalance.balance);
      } catch (error) {
        console.error('Error fetching STRK balance:', error);
        setStarkBalance(null);
      } finally {
        setBalanceLoading(false);
      }
      return;
    }
  };

  const handleDirectWalletSubmit = async (tokenData: any) => {
    if (!isWalletConnected || !walletAddress || !walletAccount) {
      throw new Error('Wallet not connected');
    }

    const provider = new RpcProvider({
      nodeUrl: 'https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0_8/dql5pMT88iueZWl7L0yzT56uVk0EBU4L'
    });

    // Create memecoin factory contract instance
    const memecoinFactoryContract = new Contract(
      MEMECOIN_FACTORY_ABI,
      "0x01a46467a9246f45c8c340f1f155266a26a71c07bd55d36e8d1c7d0d438a2dbc",
      provider
    );

    console.log('Executing create token transaction...');
    const createTxResult = await walletAccount.execute({
      contractAddress:
        "0x01a46467a9246f45c8c340f1f155266a26a71c07bd55d36e8d1c7d0d438a2dbc",
      entrypoint: "create_memecoin",
      calldata: CallData.compile([
        walletAddress,
        formData.name,
        formData.ticker,
        await formatAmount("10000000000"),
        "0x063ee878d3559583ceae80372c6088140e1180d9893aa65fbefc81f45ddaaa17",
      ]),
    });
    console.log('Create token transaction:', createTxResult);

    // Wait additional time for indexing
    await new Promise(resolve => setTimeout(resolve, 15000));

    // Get transaction details to extract contract address
    const txDetails = await axios.get(`/api/voyager/${createTxResult.transaction_hash}`);

    const memecoinCreatedEvent = txDetails.data.receipt.events.find((event: any) =>
      event.name === "OwnershipTransferred"
    );

    if (!memecoinCreatedEvent) {
      throw new Error('MemecoinCreated event not found in transaction');
    }

    const contractAddress = memecoinCreatedEvent.fromAddress;
    console.log('New token contract address:', contractAddress);

    // Add contract address to token data
    tokenData.contract_address = contractAddress;

    console.log('Executing launch transaction...');
    const launchTxResult = await walletAccount.execute([
      {
        contractAddress:
          "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
        entrypoint: "transfer",
        calldata: CallData.compile([
          "0x01a46467a9246f45c8c340f1f155266a26a71c07bd55d36e8d1c7d0d438a2dbc",
          "16091183952307027001",
          "0"
        ]),
      },
      {
        contractAddress:
          "0x01a46467a9246f45c8c340f1f155266a26a71c07bd55d36e8d1c7d0d438a2dbc",
        entrypoint: "launch_on_ekubo",
        calldata: CallData.compile([
          contractAddress,
          "1800",
          "100",
          "2009894490435840142178314390393166646092438090257831307886760648929397478285",
          "1",
          walletAddress,
          "1",
          "2000000000000000000000000",
          "0",
          "1020847100762815390390123822295304634",
          "5982",
          "11736684",
          "1",
          "88719042"
        ]),
      },
    ]);
    console.log('Launch transaction:', launchTxResult);

    return tokenData;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check if user has Cavos auth or direct wallet connection
      const hasCavosAuth = user?.wallet_address && user?.access_token;
      const hasDirectWallet = isWalletConnected && walletAddress;

      if (!hasCavosAuth && !hasDirectWallet) {
        setError('Please connect your wallet first');
        return;
      }

      // Check STRK balance
      if (starkBalance === null || starkBalance < 20) {
        setError(`Insufficient STRK balance. You need at least 20 STRK to create a token. Current balance: ${starkBalance?.toLocaleString() || 0} STRK`);
        return;
      }

      // Validate required fields
      if (!formData.name || !formData.ticker) {
        setError('Name and ticker are required');
        return;
      }

      // Validate ticker format
      const tickerRegex = /^[A-Z0-9]{1,16}$/;
      if (!tickerRegex.test(formData.ticker)) {
        setError('Ticker must be 1-16 characters, alphanumeric uppercase only');
        return;
      }

      // Prepare form data
      const tokenData: any = {
        name: formData.name,
        ticker: formData.ticker,
        website: formData.website || null,
        creator_address: hasCavosAuth ? user.wallet_address : walletAddress,
        amount: 10000000000, // Fixed amount
      };

      // Handle image file if provided
      if (imageFile) {
        // Convert file to base64
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });

        const base64Data = await base64Promise;
        tokenData.image_file = base64Data;
      }

      // Choose flow based on authentication method - prioritize direct wallet
      if (hasDirectWallet) {
        // Direct wallet flow
        await handleDirectWalletSubmit(tokenData);
      } else if (hasCavosAuth) {
        // Cavos authentication flow
        const cavosAuth = new CavosAuth(user.network, process.env.NEXT_PUBLIC_CAVOS_APP_ID || '');
        const calls = [
          {
            contractAddress:
              "0x01a46467a9246f45c8c340f1f155266a26a71c07bd55d36e8d1c7d0d438a2dbc",
            entrypoint: "create_memecoin",
            calldata: [
              user.wallet_address,
              formData.name,
              formData.ticker,
              await formatAmount("10000000000"),
              "0x063ee878d3559583ceae80372c6088140e1180d9893aa65fbefc81f45ddaaa17",
            ],
          },
        ];
        const txResult = await cavosAuth.executeCalls(user.wallet_address, calls, user.access_token);

        await new Promise(resolve => setTimeout(resolve, 15000));

        const txDetails = await axios.get(`/api/voyager/${txResult.txHash}`);

        console.log(txDetails);

        const ownershipTransferredEvent = txDetails.data.receipt.events.find((event: any) =>
          event.name === "OwnershipTransferred"
        );

        if (!ownershipTransferredEvent) {
          throw new Error('OwnershipTransferred event not found in transaction');
        }

        const address = ownershipTransferredEvent.fromAddress;

        console.log(address);

        // Add contract address to token data
        tokenData.contract_address = address;

        const launchCalls = [
          {
            contractAddress:
              "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
            entrypoint: "transfer",
            calldata: [
              "0x01a46467a9246f45c8c340f1f155266a26a71c07bd55d36e8d1c7d0d438a2dbc",
              "16091183952307027001",
              "0"
            ],
          },
          {
            contractAddress:
              "0x01a46467a9246f45c8c340f1f155266a26a71c07bd55d36e8d1c7d0d438a2dbc",
            entrypoint: "launch_on_ekubo",
            calldata: [
              address,
              "1800",
              "100",
              "2009894490435840142178314390393166646092438090257831307886760648929397478285",
              "1",
              user.wallet_address,
              "1",
              "2000000000000000000000000",
              "0",
              "1020847100762815390390123822295304634",
              "5982",
              "11736684",
              "1",
              "88719042"
            ]
          },
        ];

        await cavosAuth.executeCalls(user.wallet_address, launchCalls, txResult.accessToken);

        const updatedUser = {
          ...user,
          access_token: txResult.accessToken
        };

        setUser(updatedUser);
      }

      // Call API to create token using TokenService
      const result = await TokenService.createToken(tokenData);

      if (result.error) {
        throw new Error(result.error);
      }

      // Reset form
      setFormData({ name: '', ticker: '', website: '' });
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Notify parent component
      if (onTokenCreated && result.data) {
        onTokenCreated(result.data);
      }

      onClose();
    } catch (error: any) {
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      setImageFile(file);
      setError('');

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
      setError('');
      setFormData({ name: '', ticker: '', website: '' });
      setImageFile(null);
      setImagePreview(null);
    }, 200);
  };

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      fetchStarkBalance();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && (user?.wallet_address || (isWalletConnected && walletAddress))) {
      fetchStarkBalance();
    }
  }, [user?.wallet_address, isWalletConnected, walletAddress, isOpen]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'
      }`}>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 transition-opacity duration-200 ${isVisible ? 'bg-opacity-40' : 'bg-opacity-0'
          }`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div className={`relative w-full max-w-md mx-4 bg-black rounded-2xl p-8 border border-[#333333] transform transition-all duration-200 max-h-[90vh] overflow-y-auto ${isVisible
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
            CREATE TOKEN
          </h2>
          <p className="text-[#a1a1aa] text-sm mb-3">
            Launch your meme coin on bag.fun
          </p>

          {/* Balance Display */}
          {user?.wallet_address && (
            <div className="inline-flex items-center gap-2 bg-[#1a1a1a] border border-[#333333] rounded-lg px-3 py-2">
              <div className="w-4 h-4 rounded-full overflow-hidden">
                <Image
                  src="/strk-logo.png"
                  alt="STRK"
                  width={16}
                  height={16}
                  className="w-full h-full object-cover"
                />
              </div>
              {balanceLoading ? (
                <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
              ) : (
                <span className={`text-xs font-medium ${starkBalance !== null && starkBalance >= 20 ? 'text-green-400' : 'text-red-400'}`}>
                  {starkBalance?.toLocaleString() || 0} STRK
                </span>
              )}
              {starkBalance !== null && starkBalance < 20 && (
                <span className="text-xs text-red-400">(Need 20+ STRK)</span>
              )}
            </div>
          )}
        </div>

        {/* Error message */}
        <div className={`overflow-hidden transition-all duration-300 ease-out ${error ? 'max-h-20 mb-4' : 'max-h-0 mb-0'
          }`}>
          <div className={`p-3 bg-red-900/20 border border-red-500/20 rounded-lg text-red-400 text-sm transform transition-all duration-300 ${error ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
            }`}>
            {error}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={`space-y-6 transition-opacity duration-200 ${loading ? 'opacity-90' : 'opacity-100'}`}>
          {/* Image Upload */}
          <div className="space-y-2">
            <label className="block text-white text-sm font-medium">Token Image</label>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                {imagePreview ? (
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#333333]">
                    <Image
                      src={imagePreview}
                      alt="Token preview"
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#1a1a1a] border-2 border-[#333333] flex items-center justify-center">
                    <svg className="w-8 h-8 text-[#a1a1aa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-[#1a1a1a] border border-[#333333] rounded-lg text-white text-sm hover:border-[#555555] transition-colors duration-200"
              >
                Choose Image
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            <p className="text-xs text-[#a1a1aa]">Optional. Max 5MB. JPG, PNG, GIF supported.</p>
          </div>

          {/* Token Name */}
          <div className="relative">
            <label className="block text-white text-sm font-medium mb-2">Token Name *</label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Pepe Coin"
              value={formData.name || ''}
              onChange={handleInputChange}
              required
              className="w-full bg-[#1a1a1a] border border-[#333333] rounded-lg px-4 py-3 text-white placeholder-[#a1a1aa] focus:outline-none focus:border-[#555555] focus:ring-2 focus:ring-[#555555]/20 transition-all duration-200 hover:border-[#444444]"
            />
          </div>

          {/* Token Ticker */}
          <div className="relative">
            <label className="block text-white text-sm font-medium mb-2">Token Ticker *</label>
            <input
              type="text"
              name="ticker"
              placeholder="e.g. PEPE"
              value={formData.ticker || ''}
              onChange={(e) => {
                // Auto-uppercase and limit to 16 chars
                const value = e.target.value.toUpperCase().slice(0, 16);
                setFormData(prev => ({ ...prev, ticker: value }));
              }}
              required
              maxLength={16}
              pattern="[A-Z0-9]{1,16}"
              className="w-full bg-[#1a1a1a] border border-[#333333] rounded-lg px-4 py-3 text-white placeholder-[#a1a1aa] focus:outline-none focus:border-[#555555] focus:ring-2 focus:ring-[#555555]/20 transition-all duration-200 hover:border-[#444444]"
            />
            <p className="text-xs text-[#a1a1aa] mt-1">1-16 characters, letters and numbers only</p>
          </div>


          {/* Website */}
          <div className="relative">
            <label className="block text-white text-sm font-medium mb-2">Website</label>
            <input
              type="url"
              name="website"
              placeholder="https://example.com"
              value={formData.website || ''}
              onChange={handleInputChange}
              className="w-full bg-[#1a1a1a] border border-[#333333] rounded-lg px-4 py-3 text-white placeholder-[#a1a1aa] focus:outline-none focus:border-[#555555] focus:ring-2 focus:ring-[#555555]/20 transition-all duration-200 hover:border-[#444444]"
            />
            <p className="text-xs text-[#a1a1aa] mt-1">Optional. Project website or social media link</p>
          </div>

          <button
            type="submit"
            disabled={loading || !user?.wallet_address || (starkBalance !== null && starkBalance < 20)}
            className="w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
          >
            <span className={`transition-opacity duration-200 ${loading ? 'opacity-0' : 'opacity-100'}`}>
              {!user?.wallet_address
                ? 'Connect Wallet First'
                : starkBalance !== null && starkBalance < 20
                  ? 'Insufficient STRK Balance'
                  : 'Create Token'}
            </span>
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-600 border-t-transparent"></div>
              </div>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}