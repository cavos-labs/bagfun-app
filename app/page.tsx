"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";
import TokenCard from "@/components/TokenCard";
import CreateTokenModal from "@/components/CreateTokenModal";
import TokenBalancesModal from "@/components/TokenBalancesModal";
import DepositModal from "@/components/DepositModal";
import WithdrawModal from "@/components/WithdrawModal";
import { TokenService, ApiToken } from "@/lib/tokenService";
import { getBalanceOf } from "cavos-service-sdk";
import { userAtom } from "@/lib/auth-atoms";
import { useAtom } from "jotai";
import { useWalletConnector } from "@/lib/useWalletConnector";
import { getERC20Balance } from "@/lib/utils";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateTokenModalOpen, setIsCreateTokenModalOpen] = useState(false);
  const [isTokenBalancesModalOpen, setIsTokenBalancesModalOpen] =
    useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user] = useAtom(userAtom);
  const {
    isConnected: isWalletConnected,
    address: walletAddress,
    account: walletAccount,
  } = useWalletConnector();
  const [starkBalance, setStarkBalance] = useState(0);

  const filteredTokens = tokens.filter(
    (token) =>
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.ticker.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBagFunClick = () => {
    setIsTokenBalancesModalOpen(true);
  };

  const handleCreateToken = () => {
    setIsCreateTokenModalOpen(true);
  };

  const handleDepositClick = () => {
    setIsDepositModalOpen(true);
  };

  const handleWithdrawClick = () => {
    setIsWithdrawModalOpen(true);
  };

  const handleTokenCreated = (token: any) => {
    // Add the new token to the list
    setTokens((prevTokens) => [token, ...prevTokens]);
  };

  const fetchTokens = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await TokenService.fetchTokens({ limit: 100 });

      if (result.error) {
        setError(result.error);
      } else {
        setTokens(result.data);
      }

      // Balance fetching is now handled in separate useEffect
    } catch (err) {
      setError("Failed to load tokens");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  // Fetch balance when authentication or wallet connection changes
  useEffect(() => {
    const fetchBalance = async () => {

      if (isWalletConnected && walletAddress) {
        // Fetch balance for direct wallet users
        try {
          const currentBalance = await getERC20Balance(
            walletAddress,
            "0x04718f5a0Fc34cC1AF16A1cdee98fFB20C31f5cD61D6Ab07201858f4287c938D",
            18
          );
          setStarkBalance(currentBalance);
        } catch (error) {
          setStarkBalance(0);
        }
      } else if (user && user.auth_method !== "wallet") {
        // Fetch balance for Cavos authenticated users
        try {
          const currentBalance = await getBalanceOf(
            user.wallet_address,
            "0x04718f5a0Fc34cC1AF16A1cdee98fFB20C31f5cD61D6Ab07201858f4287c938D",
            "18",
            process.env.NEXT_PUBLIC_CAVOS_APP_ID || ""
          );
          setStarkBalance(currentBalance.balance);
        } catch (error) {
          setStarkBalance(0);
        }
      } else {
        // Clear balance if no user and no wallet
        setStarkBalance(0);
      }
    };

    fetchBalance();
  }, [user, isWalletConnected, walletAddress]);

  return (
    <div className="min-h-screen bg-[#141414]">
      <Sidebar onBagFunClick={handleBagFunClick} />

      <div className="lg:ml-48 flex flex-col min-h-screen pt-16 lg:pt-0">
        <header className="p-4 lg:p-6 mt-4 lg:mt-10">
          <div className="flex flex-col lg:flex-row items-center justify-center relative gap-4 lg:gap-0">
            {/* Balance Display - Left of search */}
            {(user || isWalletConnected) && (
              <div className="lg:absolute lg:left-0 w-full lg:w-auto">
                <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl px-3 sm:px-4 py-2 sm:py-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                    {/* Balance Info */}
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden flex-shrink-0">
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
                        <p className="text-white font-semibold text-sm sm:text-base">
                          {starkBalance.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={handleDepositClick}
                        className="flex-1 sm:flex-none bg-blue-500 hover:bg-blue-600 text-white px-2 sm:px-3 py-1.5 sm:py-1 rounded-lg text-xs font-medium transition-colors duration-200 flex items-center justify-center gap-1"
                        title="Add STRK"
                      >
                        <svg
                          className="w-3 h-3 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        <span className="hidden sm:inline">Deposit</span>
                        <span className="sm:hidden">+</span>
                      </button>
                      
                      {/* Withdraw button - only show for Cavos users */}
                      {user && user.auth_method !== "wallet" && (
                        <button
                          onClick={handleWithdrawClick}
                          className="flex-1 sm:flex-none bg-red-500 hover:bg-red-600 text-white px-2 sm:px-3 py-1.5 sm:py-1 rounded-lg text-xs font-medium transition-colors duration-200 flex items-center justify-center gap-1"
                          title="Withdraw STRK"
                        >
                          <svg
                            className="w-3 h-3 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M12 6v6m0 0v6m0-6H6m6 0h6"
                            />
                          </svg>
                          <span className="hidden sm:inline">Withdraw</span>
                          <span className="sm:hidden">-</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <SearchBar onSearch={setSearchQuery} />

            <div className="lg:absolute lg:right-0">
              <button
                onClick={handleCreateToken}
                className="hover:opacity-80 transition-all duration-200 transform rotate-12 hover:rotate-6"
              >
                <Image
                  src="/create-coin.png"
                  alt="Create Coin"
                  width={150}
                  height={75}
                  className="object-contain lg:w-[200px] lg:h-[100px]"
                />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-white border-t-transparent mx-auto mb-4"></div>
                <p className="text-[#a1a1aa]">Loading tokens...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <svg
                  className="w-24 h-24 mx-auto mb-4 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <p className="text-red-400 mb-4">{error}</p>
                <button
                  onClick={fetchTokens}
                  className="bg-white text-black px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : filteredTokens.length === 0 ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <svg
                  className="w-24 h-24 mx-auto mb-4 text-[#a1a1aa]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
                  />
                </svg>
                <p className="text-[#a1a1aa] mb-4">
                  {searchQuery
                    ? "No tokens match your search"
                    : "No tokens found"}
                </p>
                {!searchQuery && (
                  <button
                    onClick={handleCreateToken}
                    className="bg-white text-black px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200"
                  >
                    Create First Token
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-8 max-w-7xl mx-auto">
              {filteredTokens.map((token, index) => (
                <div
                  key={token.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <TokenCard token={token} />
                </div>
              ))}
            </div>
          )}
        </main>

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

        {/* Create Token Modal */}
        <CreateTokenModal
          isOpen={isCreateTokenModalOpen}
          onClose={() => setIsCreateTokenModalOpen(false)}
          onTokenCreated={handleTokenCreated}
        />

        {/* Token Balances Modal */}
        <TokenBalancesModal
          isOpen={isTokenBalancesModalOpen}
          onClose={() => setIsTokenBalancesModalOpen(false)}
          tokens={tokens}
        />

        {/* Deposit Modal */}
        <DepositModal
          isOpen={isDepositModalOpen}
          onClose={() => setIsDepositModalOpen(false)}
          walletAddress={
            isWalletConnected
              ? walletAddress || undefined
              : user?.wallet_address || undefined
          }
        />

        {/* Withdraw Modal */}
        <WithdrawModal
          isOpen={isWithdrawModalOpen}
          onClose={() => setIsWithdrawModalOpen(false)}
          currentBalance={starkBalance}
        />
      </div>
    </div>
  );
}
