'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAtom } from 'jotai';
import Sidebar from '@/components/Sidebar';
import TokenBalancesModal from '@/components/TokenBalancesModal';
import { userAtom } from '@/lib/auth-atoms';
import { useWalletConnector } from '@/lib/useWalletConnector';
import { QuotesService, AVNUQuote } from '@/lib/quotesService';
import { SwapService, SwapParams } from '@/lib/swapService';
import { formatAmount, getBalanceOf } from 'cavos-service-sdk';
import { getERC20Balance } from '@/lib/utils';
import { ChartService, ChartDataPoint } from '@/lib/chartService';
import LineChart from '@/components/LineChart';
import DepositModal from '@/components/DepositModal';
import { cairo, CallData, Contract, RpcProvider, WalletAccount } from 'starknet';
import { connect } from '@starknet-io/get-starknet';
import { AVNU } from '@/app/abis/AVNU';
import { ERC20_ABI } from '@/app/abis/ERC20';
import { executeSwap, fetchQuotes, Quote } from '@avnu/avnu-sdk';

interface Token {
  id: string;
  name: string;
  ticker: string;
  description?: string;
  image_url?: string;
  contract_address: string;
  website?: string;
  created_at: string;
  amount: number;
  creator_address: string;
}

export default function TokenPage() {
  const params = useParams();
  const router = useRouter();
  const [token, setToken] = useState<Token | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buyAmount, setBuyAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [isTokenBalancesModalOpen, setIsTokenBalancesModalOpen] = useState(false);
  const [allTokens, setAllTokens] = useState<Token[]>([]);
  const [tradingMode, setTradingMode] = useState<'buy' | 'sell'>('buy');
  const [user, setUser] = useAtom(userAtom);
  const { isConnected: isWalletConnected, address: walletAddress, account: walletAccount } = useWalletConnector();
  const [starkBalance, setStarkBalance] = useState(0);
  const [quote, setQuote] = useState<AVNUQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [swapping, setSwapping] = useState(false);
  const [swapError, setSwapError] = useState<string | null>(null);
  const [swapSuccess, setSwapSuccess] = useState<string | null>(null);
  const [swapTxHash, setSwapTxHash] = useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [priceChange, setPriceChange] = useState({ change: 0, changePercent: 0, isPositive: true });
  const [currentPrice, setCurrentPrice] = useState(0);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

  const address = params?.address as string;

  // STRK token address on Starknet mainnet
  const STRK_TOKEN_ADDRESS = "0x04718f5a0Fc34cC1AF16A1cdee98fFB20C31f5cD61D6Ab07201858f4287c938D";

  useEffect(() => {
    if (address) {
      fetchTokenDetails();
      fetchChartData();
    }
  }, [address]);

  const fetchChartData = async () => {
    if (!address) return;

    setChartLoading(true);
    try {
      const result = await ChartService.fetchPriceData({
        tokenAddress: address,
        resolution: 5,
        days: 1
      });

      if (result.error) {
        console.error('Error fetching chart data:', result.error);
      } else {
        setChartData(result.data);

        // Calculate price statistics
        const changeStats = ChartService.calculatePriceChange(result.data);
        setPriceChange(changeStats);

        const latestPrice = ChartService.getLatestPrice(result.data);
        setCurrentPrice(latestPrice);
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setChartLoading(false);
    }
  };

  // Fetch balances when authentication or wallet connection changes
  useEffect(() => {
    const fetchBalances = async () => {
      console.log('Fetching balances - isWalletConnected:', isWalletConnected, 'walletAddress:', walletAddress, 'user:', user);

      if (isWalletConnected && walletAddress) {
        console.log('Fetching balance for Starknet wallet user:', walletAddress);
        // Fetch balances for direct wallet users using getERC20Balance
        try {
          const strkBalance = await getERC20Balance(walletAddress, STRK_TOKEN_ADDRESS, 18);
          console.log('Wallet STRK balance result:', strkBalance);
          setStarkBalance(strkBalance);
        } catch (error) {
          console.error('Error fetching wallet STRK balance:', error);
          setStarkBalance(0);
        }

        // Fetch token balance if token is available
        if (token?.contract_address) {
          try {
            const tokenBalance = await getERC20Balance(walletAddress, token.contract_address, 18);
            console.log('Wallet token balance result:', tokenBalance);
            setTokenBalance(tokenBalance);
          } catch (error) {
            console.error('Error fetching wallet token balance:', error);
            setTokenBalance(0);
          }
        }
      }
      else if (user && user.access_token && user.wallet_address) {
        console.log('Fetching balance for Cavos user:', user.wallet_address);
        // Fetch balances for Cavos authenticated users using getBalanceOf
        try {
          const strkResult = await getBalanceOf(user.wallet_address, STRK_TOKEN_ADDRESS, "18", process.env.NEXT_PUBLIC_CAVOS_APP_ID || '');
          console.log('Cavos STRK balance result:', strkResult);
          if (strkResult.error) {
            console.error('Error fetching Cavos STRK balance:', strkResult.error);
            setStarkBalance(0);
          } else {
            setStarkBalance(strkResult.balance);
          }
        } catch (error) {
          console.error('Error fetching Cavos STRK balance:', error);
          setStarkBalance(0);
        }

        // Fetch token balance if token is available
        if (token?.contract_address) {
          try {
            const result = await getBalanceOf(user.wallet_address, token.contract_address, "18", process.env.NEXT_PUBLIC_CAVOS_APP_ID || '');
            console.log('Cavos token balance result:', result);
            if (result.error) {
              console.error('Error fetching Cavos token balance:', result.error);
              setTokenBalance(0);
            } else {
              setTokenBalance(result.balance);
            }
          } catch (error) {
            console.error('Error fetching Cavos token balance:', error);
            setTokenBalance(0);
          }
        }
      } else {
        console.log('No wallet or user, clearing balances');
        // Clear balances if no user and no wallet
        setStarkBalance(0);
        setTokenBalance(0);
      }
    };

    fetchBalances();
  }, [user, isWalletConnected, walletAddress, token?.contract_address]);

  // Debounce quote fetching
  useEffect(() => {
    if (token?.contract_address) {
      const timeoutId = setTimeout(() => {
        fetchQuote();
      }, 500); // 500ms debounce

      return () => clearTimeout(timeoutId);
    }
  }, [buyAmount, sellAmount, tradingMode, token?.contract_address]);

  const fetchQuote = async () => {
    if (!token?.contract_address) return;

    const currentAmount = tradingMode === 'buy' ? buyAmount : sellAmount;
    if (!currentAmount || parseFloat(currentAmount) <= 0) {
      setQuote(null);
      setQuoteError(null);
      return;
    }

    setQuoteLoading(true);
    setQuoteError(null);

    try {
      const sellTokenAddress = tradingMode === 'buy' ? STRK_TOKEN_ADDRESS : token.contract_address;
      const buyTokenAddress = tradingMode === 'buy' ? token.contract_address : STRK_TOKEN_ADDRESS;

      const result = await QuotesService.fetchQuotes({
        sellTokenAddress,
        buyTokenAddress,
        sellAmount: currentAmount,
      });

      console.log('Quote result:', result);

      if (result.error) {
        setQuoteError(result.error);
        setQuote(null);
      } else if (result.data?.quotes && result.data.quotes.length > 0) {
        setQuote(result.data.quotes[0]);
        setQuoteError(null);
      } else {
        setQuoteError('No quotes available');
        setQuote(null);
      }
    } catch (error) {
      console.error('Error fetching quote:', error);
      setQuoteError('Failed to fetch quote');
      setQuote(null);
    } finally {
      setQuoteLoading(false);
    }
  };

  const fetchTokenDetails = async () => {
    try {
      setLoading(true);

      // First try to find token by contract address from all tokens
      const allTokensResponse = await fetch(`/api/tokens`);
      if (!allTokensResponse.ok) throw new Error('Failed to fetch tokens');

      const allTokens = await allTokensResponse.json();

      // Handle different response formats
      const tokensArray = allTokens.data;

      if (!Array.isArray(tokensArray)) {
        throw new Error('Invalid tokens response format');
      }

      const foundToken = tokensArray.find((t: Token) => t.contract_address === address);

      if (foundToken) {
        setToken(foundToken);
      } else {
        setError('Token not found');
      }

      // Store all tokens for the TokenBalancesModal
      setAllTokens(tokensArray);
    } catch (err) {
      setError('Failed to load token details');
      console.error('Error fetching token:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBagFunClick = () => {
    setIsTokenBalancesModalOpen(true);
  };

  const handleBackClick = () => {
    router.push('/');
  };

  const handleDepositClick = () => {
    setIsDepositModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const handleSwap = async () => {
    // Determine which swap method to use - prioritize wallet connection
    if (isWalletConnected && walletAddress) {
      // Use direct wallet connection for wallet users
      console.log('Using wallet swap for connected Starknet wallet');
      await handleWalletSwap();
    } else if (user?.access_token) {
      // Use Cavos API for authenticated users (only when no wallet connected)
      console.log('Using Cavos swap for authenticated user');
      await handleCavosSwap();
    } else {
      setSwapError('Please connect a wallet or login to trade');
    }
  };

  const handleCavosSwap = async () => {
    if (!user?.access_token || !user?.wallet_address || !token?.contract_address || !quote) {
      setSwapError('Missing required data for swap');
      return;
    }

    const currentAmount = tradingMode === 'buy' ? buyAmount : sellAmount;
    if (!currentAmount || parseFloat(currentAmount) <= 0) {
      setSwapError('Please enter a valid amount');
      return;
    }

    setSwapping(true);
    setSwapError(null);
    setSwapSuccess(null);
    setSwapTxHash(null);

    try {
      // Format amount to wei
      const formattedAmount = await SwapService.formatAmountForSwap(currentAmount, 18);

      const swapParams: SwapParams = {
        address: user.wallet_address,
        amount: formattedAmount,
        sellTokenAddress: tradingMode === 'buy' ? STRK_TOKEN_ADDRESS : token.contract_address,
        buyTokenAddress: tradingMode === 'buy' ? token.contract_address : STRK_TOKEN_ADDRESS,
      };

      // Validate parameters
      const validationError = SwapService.validateSwapParams(swapParams);
      if (validationError) {
        setSwapError(validationError);
        return;
      }

      console.log('Executing Cavos swap with params:', swapParams);

      const swapResult = await SwapService.executeSwap(swapParams, user.access_token);

      if (swapResult.error) {
        setSwapError(swapResult.error);
      } else {
        setSwapSuccess(`Swap successful!`);
        setSwapTxHash(swapResult.result || null);

        // Update access token if provided
        if (swapResult.accessToken && user) {
          console.log('Updating user access token with new token from swap');
          setUser({
            ...user,
            access_token: swapResult.accessToken
          });
        }

        // Clear form
        setBuyAmount('');
        setSellAmount('');

        // Refresh balances
        const walletAddr = user.wallet_address;

        // Refresh STRK balance
        try {
          const strkResult = await getBalanceOf(walletAddr, STRK_TOKEN_ADDRESS, "18", process.env.NEXT_PUBLIC_CAVOS_APP_ID || '');
          if (!strkResult.error) {
            setStarkBalance(strkResult.balance);
          }
        } catch (error) {
          console.error('Error refreshing STRK balance:', error);
        }

        // Refresh token balance
        if (token?.contract_address && walletAddr) {
          try {
            const result = await getBalanceOf(walletAddr, token.contract_address, "18", process.env.NEXT_PUBLIC_CAVOS_APP_ID || '');
            if (!result.error) {
              setTokenBalance(result.balance);
            }
          } catch (error) {
            console.error('Error refreshing token balance:', error);
          }
        }
      }
    } catch (error) {
      console.error('Swap execution error:', error);
      setSwapError('Failed to execute swap. Please try again.');
    } finally {
      setSwapping(false);
    }
  };

  // Helper function to execute swap with a specific wallet account using AVNU SDK
  const executeSwapWithAccount = async (account: any, swapData: any, quote: AVNUQuote, currentAmount: string, walletAddr: string) => {
    console.log('Executing AVNU SDK swap with account:', account.address);
    console.log('Account object:', account);
    console.log('Account type:', typeof account);
    console.log('Account constructor:', account.constructor.name);
    console.log('Account properties:', Object.keys(account));
    console.log('Swap data:', swapData);
    
    // Convert amount to wei (BigInt)
    const sellAmountWei = BigInt(Math.floor(parseFloat(currentAmount) * Math.pow(10, 18)));
    
    console.log('Sell amount in wei:', sellAmountWei.toString());
    
    // Create fresh quote parameters for AVNU SDK
    const params = {
      sellTokenAddress: swapData.sellTokenAddress.toLowerCase(),
      buyTokenAddress: swapData.buyTokenAddress.toLowerCase(),
      sellAmount: sellAmountWei,
      takerAddress: walletAddr.toLowerCase(),
      size: 1
    };
    
    console.log('Fetching fresh AVNU quotes with params:', params);
    
    // Use AVNU SDK options for sepolia testnet
    const AVNU_OPTIONS = { baseUrl: 'https://starknet.api.avnu.fi' };
    
    try {
      // Validate account before proceeding
      if (!account || !account.address) {
        throw new Error('Invalid account object - missing address');
      }
      
      // Check if account has required methods for AVNU SDK
      if (typeof account.execute !== 'function') {
        throw new Error('Invalid account object - missing execute method');
      }
      
      // Fetch fresh quotes from AVNU
      const freshQuotes = await fetchQuotes(params, AVNU_OPTIONS);
      
      if (!freshQuotes || freshQuotes.length === 0) {
        throw new Error('No quotes available for this swap');
      }
      
      console.log('Fresh AVNU quotes:', freshQuotes);
      
      // Execute the swap using AVNU SDK
      const result = await executeSwap(
        account, 
        freshQuotes[0], 
        { 
          executeApprove: true,
        }, 
        AVNU_OPTIONS
      );
      
      console.log('AVNU SDK swap result:', result);
      
      return result.transactionHash;
      
    } catch (error) {
      console.error('AVNU SDK swap error:', error);
      throw error;
    }
  };

  const handleWalletSwap = async () => {
    if (!isWalletConnected || !walletAddress || !token?.contract_address || !quote) {
      setSwapError('Missing required data for wallet swap');
      return;
    }

    const currentAmount = tradingMode === 'buy' ? buyAmount : sellAmount;
    if (!currentAmount || parseFloat(currentAmount) <= 0) {
      setSwapError('Please enter a valid amount');
      return;
    }

    setSwapping(true);
    setSwapError(null);
    setSwapSuccess(null);
    setSwapTxHash(null);

    try {
      console.log('=== WALLET SWAP SIMULATION ===');
      console.log('Trading Mode:', tradingMode);
      console.log('Amount:', currentAmount);
      console.log('Wallet Address:', walletAddress);
      console.log('Token Address:', token.contract_address);
      console.log('STRK Address:', STRK_TOKEN_ADDRESS);
      console.log('Quote:', quote);

      // Simulate wallet swap with AVNU
      const swapData = {
        sellTokenAddress: tradingMode === 'buy' ? STRK_TOKEN_ADDRESS : token.contract_address,
        buyTokenAddress: tradingMode === 'buy' ? token.contract_address : STRK_TOKEN_ADDRESS,
        sellAmount: currentAmount,
        walletAddress: walletAddress,
        quoteId: quote.quoteId || 'simulated-quote-id',
        slippageBps: 50, // 0.5% slippage
      };

      console.log('Swap Data for Wallet Transaction:', swapData);

      // REAL IMPLEMENTATION - Starknet wallet contract calls
      console.log('=== STARTING WALLET SWAP IMPLEMENTATION ===');
      console.log('Wallet account available:', !!walletAccount);
      console.log('Wallet connected:', isWalletConnected);
      console.log('Wallet address:', walletAddress);

      if (!walletAccount) {
        console.error('Wallet account not available. Attempting to reconnect...');
        
        // Try to reconnect if the account is missing but wallet is connected
        if (isWalletConnected && walletAddress) {
          try {
            console.log('Attempting manual reconnection...');
            const nodeUrl = process.env.NEXT_PUBLIC_RPC;
            const provider = new RpcProvider({ nodeUrl });
            
            // Try to get the wallet
            const selectedWallet = await connect({ modalMode: 'neverAsk' });
            
            if (selectedWallet) {
              const account = await WalletAccount.connect(provider, selectedWallet);
              console.log('Manual reconnection successful:', account.address);
              
              // Use the reconnected account for this transaction
              // Note: This doesn't update the global state, just for this swap
              const tempWalletAccount = account;
              
              // Continue with the swap using the temporary account
              const txHash = await executeSwapWithAccount(tempWalletAccount, swapData, quote, currentAmount, walletAddress);
              
              // Update UI with success
              setSwapSuccess('Wallet swap successful!');
              setSwapTxHash(txHash);
              return;
            } else {
              throw new Error('Unable to reconnect to wallet');
            }
          } catch (reconnectError) {
            console.error('Manual reconnection failed:', reconnectError);
            throw new Error(`Wallet account not available. Reconnection failed: ${reconnectError}`);
          }
        } else {
          throw new Error('Wallet account not available. Please reconnect your wallet.');
        }
      }
      
      // If wallet account is available, proceed normally
      const txHash = await executeSwapWithAccount(walletAccount, swapData, quote, currentAmount, walletAddress);
      
      // Update UI with success
      setSwapSuccess('Wallet swap successful!');
      setSwapTxHash(txHash);

      // Clear form
      setBuyAmount('');
      setSellAmount('');
      
      // Refresh balances for wallet users
      console.log('Refreshing wallet balances for:', walletAddress);
      
      // Refresh STRK balance
      try {
        const strkBalance = await getERC20Balance(walletAddress, STRK_TOKEN_ADDRESS, 18);
        console.log('Refreshed wallet STRK balance:', strkBalance);
        setStarkBalance(strkBalance);
      } catch (error) {
        console.error('Error refreshing wallet STRK balance:', error);
      }
      
      // Refresh token balance
      if (token?.contract_address) {
        try {
          const tokenBalance = await getERC20Balance(walletAddress, token.contract_address, 18);
          console.log('Refreshed wallet token balance:', tokenBalance);
          setTokenBalance(tokenBalance);
        } catch (error) {
          console.error('Error refreshing wallet token balance:', error);
        }
      }

    } catch (error) {
      console.error('Wallet swap error:', error);
      setSwapError(`Wallet swap failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSwapping(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414]">
        <Sidebar onBagFunClick={handleBagFunClick} />
        <div className="lg:ml-48 flex flex-col min-h-screen pt-16 lg:pt-0">
          <main className="flex-1 p-4 lg:p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-white border-t-transparent mx-auto mb-4"></div>
              <p className="text-[#a1a1aa]">Loading token...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !token) {
    return (
      <div className="min-h-screen bg-[#141414]">
        <Sidebar onBagFunClick={handleBagFunClick} />
        <div className="lg:ml-48 flex flex-col min-h-screen pt-16 lg:pt-0">
          <main className="flex-1 p-4 lg:p-8 flex items-center justify-center">
            <div className="text-center">
              <svg className="w-24 h-24 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h2 className="text-white text-2xl font-bold mb-4">Token Not Found</h2>
              <p className="text-[#a1a1aa] mb-6">{error || 'The requested token could not be found.'}</p>
              <button
                onClick={handleBagFunClick}
                className="bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-200"
              >
                Back to Home
              </button>
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
        {/* Header */}
        <header className="p-4 lg:p-8 pb-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <button
                onClick={handleBackClick}
                className="text-[#a1a1aa] hover:text-white transition-colors duration-200 mr-4"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
            </div>

            {/* Balance Display */}
            {(user || isWalletConnected) && (
              <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full overflow-hidden">
                    <Image
                      src="/strk-logo.png"
                      alt="STRK"
                      width={24}
                      height={24}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-[#a1a1aa] text-xs">Balance</p>
                    <p className="text-white font-semibold text-sm">
                      {starkBalance.toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={handleDepositClick}
                    className="ml-2 w-6 h-6 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors duration-200"
                    title="Add STRK"
                  >
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Token Info & Chart */}
              <div className="lg:col-span-2 space-y-6">
                {/* Token Header */}
                <div className="bg-[#1a1a1a] border border-[#333333] rounded-2xl p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                      {token.image_url ? (
                        <Image
                          src={token.image_url}
                          alt={token.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                          <span className="text-white font-bold text-2xl">
                            {token.ticker?.charAt(0) || token.name?.charAt(0) || 'T'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h2 className="text-white text-2xl font-bold">{token.name}</h2>
                        <span className="text-[#a1a1aa] text-lg">{token.ticker}</span>
                        <button className="text-[#a1a1aa] hover:text-white transition-colors duration-200">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-[#a1a1aa] text-sm">Created {formatDate(token.created_at)}</p>
                      {token.contract_address && (
                        <a
                          href={`https://voyager.online/contract/${token.contract_address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-sm font-mono break-all"
                        >
                          {token.contract_address}
                        </a>
                      )}
                    </div>
                  </div>

                  {token.description && (
                    <p className="text-[#a1a1aa] mb-4">{token.description}</p>
                  )}

                  {token.website && (
                    <a
                      href={token.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      {token.website}
                    </a>
                  )}
                </div>

                {/* Market Stats */}
                <div className="bg-[#1a1a1a] border border-[#333333] rounded-2xl p-6">
                  <h3 className="text-white text-lg font-semibold mb-4">Price</h3>
                  {chartLoading ? (
                    <div className="animate-pulse">
                      <div className="h-8 bg-[#333333] rounded mb-2"></div>
                      <div className="h-4 bg-[#333333] rounded w-2/3"></div>
                    </div>
                  ) : (
                    <>
                      <div className="text-white text-3xl font-bold mb-2">
                        {currentPrice > 0 ? `${currentPrice.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 6
                        })} STRK` : 'N/A'}
                      </div>
                      <div className={`text-sm ${priceChange.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {priceChange.isPositive ? '+' : ''}{priceChange.change.toFixed(6)} STRK ({priceChange.isPositive ? '+' : ''}{priceChange.changePercent.toFixed(2)}%) 24hr
                      </div>
                    </>
                  )}
                </div>

                {/* Price Chart */}
                <div className="bg-[#1a1a1a] border border-[#333333] rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white text-lg font-semibold">Price Chart (24h)</h3>
                    <div className="flex space-x-2 text-sm">
                      <button
                        onClick={() => fetchChartData()}
                        disabled={chartLoading}
                        className="text-white bg-[#333333] px-3 py-1 rounded hover:bg-[#444444] transition-colors"
                      >
                        {chartLoading ? 'Loading...' : '24h'}
                      </button>
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="h-64 bg-[#0a0a0a] rounded-lg">
                    {chartLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent mx-auto mb-2"></div>
                          <p className="text-[#a1a1aa]">Loading chart...</p>
                        </div>
                      </div>
                    ) : (
                      <LineChart
                        data={ChartService.formatChartData(chartData).values}
                        labels={ChartService.formatChartData(chartData).labels}
                        isPositive={priceChange.isPositive}
                        className="h-full"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Trading */}
              <div className="space-y-6">
                {/* Trading Section with Toggle */}
                <div className="bg-[#1a1a1a] border border-[#333333] rounded-2xl p-6">
                  {/* Buy/Sell Toggle */}
                  <div className="flex bg-[#0a0a0a] rounded-lg p-1 mb-6">
                    <button
                      onClick={() => setTradingMode('buy')}
                      className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all duration-200 ${tradingMode === 'buy'
                        ? 'bg-green-500 text-white'
                        : 'text-[#a1a1aa] hover:text-white'
                        }`}
                    >
                      Buy
                    </button>
                    <button
                      onClick={() => setTradingMode('sell')}
                      className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all duration-200 ${tradingMode === 'sell'
                        ? 'bg-red-500 text-white'
                        : 'text-[#a1a1aa] hover:text-white'
                        }`}
                    >
                      Sell
                    </button>
                  </div>

                  {/* Dynamic Trading Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-[#a1a1aa] text-sm block mb-2">
                        Amount ({tradingMode === 'buy' ? 'STRK' : token.ticker})
                      </label>
                      <input
                        type="number"
                        value={tradingMode === 'buy' ? buyAmount : sellAmount}
                        onChange={(e) =>
                          tradingMode === 'buy'
                            ? setBuyAmount(e.target.value)
                            : setSellAmount(e.target.value)
                        }
                        placeholder="0.00"
                        className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-4 py-3 text-white placeholder-[#666666] focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Status Messages */}
                    <div className="space-y-2">
                      {swapSuccess && (
                        <div className="bg-green-500/10 border border-green-500 rounded-lg p-3 text-green-400 text-sm">
                          <div>{swapSuccess}</div>
                          {swapTxHash && (
                            <a
                              href={`https://voyager.online/tx/${swapTxHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-300 hover:text-green-200 underline text-xs mt-1 inline-block"
                            >
                              View on Voyager →
                            </a>
                          )}
                        </div>
                      )}

                      {swapError && (
                        <div className="bg-red-500/10 border border-red-500 rounded-lg p-3 text-red-400 text-sm">
                          {swapError}
                        </div>
                      )}

                      {quoteLoading && (
                        <div className="flex items-center text-[#a1a1aa] text-sm">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#a1a1aa] border-t-transparent mr-2"></div>
                          Getting best price...
                        </div>
                      )}

                      {quoteError && (
                        <div className="text-red-400 text-sm">
                          {quoteError}
                        </div>
                      )}

                      {quote && (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between text-[#a1a1aa]">
                            <span>You'll receive:</span>
                            <span className="text-white font-medium">
                              ≈ {QuotesService.formatTokenAmount(quote.buyAmount).toLocaleString(undefined, {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 6
                              })} {tradingMode === 'buy' ? token.ticker : 'STRK'}
                            </span>
                          </div>

                          <div className="flex justify-between text-[#a1a1aa]">
                            <span>Est. USD Value:</span>
                            <span className="text-white">
                              ${quote.buyAmountInUsd.toFixed(2)}
                            </span>
                          </div>

                          <div className="flex justify-between text-[#a1a1aa]">
                            <span>Network Fee:</span>
                            <span className="text-white">
                              ${quote.gasFeesInUsd.toFixed(4)}
                            </span>
                          </div>

                          <div className="flex justify-between text-[#a1a1aa]">
                            <span>AVNU Fee:</span>
                            <span className="text-white">
                              ${quote.avnuFeesInUsd.toFixed(4)}
                            </span>
                          </div>

                          {quote.estimatedSlippage > 0 && (
                            <div className="flex justify-between text-[#a1a1aa]">
                              <span>Est. Slippage:</span>
                              <span className="text-yellow-400">
                                {(quote.estimatedSlippage * 100).toFixed(4)}%
                              </span>
                            </div>
                          )}

                          <div className="flex justify-between text-[#a1a1aa] border-t border-[#333333] pt-2">
                            <span>Route:</span>
                            <span className="text-white">
                              {quote.routes[0]?.name || 'Direct'}
                            </span>
                          </div>
                        </div>
                      )}

                      {!quoteLoading && !quoteError && !quote && (tradingMode === 'buy' ? buyAmount : sellAmount) && (
                        <div className="text-[#a1a1aa] text-sm">
                          Enter an amount to see quote
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleSwap}
                      disabled={!quote || quoteLoading || swapping || (!user?.access_token && !isWalletConnected)}
                      className={`w-full font-semibold py-3 rounded-lg transition-colors duration-200 ${!quote || quoteLoading || swapping || (!user?.access_token && !isWalletConnected)
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : tradingMode === 'buy'
                          ? 'bg-green-500 hover:bg-green-600 text-white'
                          : 'bg-red-500 hover:bg-red-600 text-white'
                        }`}
                    >
                      {swapping ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                          Swapping...
                        </div>
                      ) : quoteLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                          Loading...
                        </div>
                      ) : (!user?.access_token && !isWalletConnected) ? (
                        'Connect Wallet or Login to Trade'
                      ) : !quote ? (
                        'Enter Amount'
                      ) : (
                        `${tradingMode === 'buy' ? 'Buy' : 'Sell'} ${token.ticker}`
                      )}
                    </button>
                  </div>
                </div>

                {/* Holdings */}
                <div className="bg-[#1a1a1a] border border-[#333333] rounded-2xl p-6">
                  <h3 className="text-white text-lg font-semibold mb-4">Your Position</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[#a1a1aa]">Balance:</span>
                      <span className="text-white">
                        {tokenBalance.toLocaleString(undefined, {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 6
                        })} {token.ticker}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#a1a1aa]">Value:</span>
                      <span className="text-white">
                        {tokenBalance > 0 && currentPrice > 0
                          ? `${(tokenBalance * currentPrice).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })} STRK`
                          : '$0.00'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Floating bag-fun.png button */}
        <div className="fixed bottom-4 right-4 lg:bottom-6 lg:right-6">
          <button
            onClick={handleBagFunClick}
            className="hover:opacity-80 transition-all duration-200 transform rotate-3 hover:rotate-6"
          >
            <Image
              src="/bag-fun.png"
              alt="BAG.FUN Holdings"
              width={60}
              height={60}
              className="object-contain lg:w-20 lg:h-20"
            />
          </button>
        </div>

        {/* Token Balances Modal */}
        <TokenBalancesModal
          isOpen={isTokenBalancesModalOpen}
          onClose={() => setIsTokenBalancesModalOpen(false)}
          tokens={allTokens}
        />

        {/* Deposit Modal */}
        <DepositModal
          isOpen={isDepositModalOpen}
          onClose={() => setIsDepositModalOpen(false)}
          walletAddress={isWalletConnected ? walletAddress || undefined : user?.wallet_address || undefined}
        />
      </div>
    </div>
  );
}
