'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Sidebar from '@/components/Sidebar';
import SearchBar from '@/components/SearchBar';
import TokenCard from '@/components/TokenCard';
import CreateTokenModal from '@/components/CreateTokenModal';
import { TokenService, ApiToken } from '@/lib/tokenService';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateTokenModalOpen, setIsCreateTokenModalOpen] = useState(false);
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filteredTokens = tokens.filter(token =>
    token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.ticker.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBagFunClick = () => {
    console.log('Navigate to meme-coin holdings');
  };

  const handleCreateToken = () => {
    setIsCreateTokenModalOpen(true);
  };

  const handleTokenCreated = (token: any) => {
    console.log('Token created:', token);
    // Add the new token to the list
    setTokens(prevTokens => [token, ...prevTokens]);
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
    } catch (err) {
      setError('Failed to load tokens');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  return (
    <div className="min-h-screen bg-[#141414]">
      <Sidebar onBagFunClick={handleBagFunClick} />
      
      <div className="lg:ml-48 flex flex-col min-h-screen pt-16 lg:pt-0">
        <header className="p-4 lg:p-6 mt-4 lg:mt-10">
          <div className="flex flex-col lg:flex-row items-center justify-center relative gap-4 lg:gap-0">
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
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
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
                <div className="text-[#a1a1aa] text-6xl mb-4">🚀</div>
                <p className="text-[#a1a1aa] mb-4">
                  {searchQuery ? 'No tokens match your search' : 'No tokens found'}
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
      </div>
    </div>
  );
}
