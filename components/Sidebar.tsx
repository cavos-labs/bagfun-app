'use client';

import { useState } from 'react';
import { useAtom } from 'jotai';
import { userAtom, isAuthenticatedAtom, signInAtom, signOutAtom } from '@/lib/auth-atoms';
import { useWalletConnector } from '@/lib/useWalletConnector';
import LoginModal from './LoginModal';

interface SidebarProps {
  onBagFunClick?: () => void;
}

export default function Sidebar({ onBagFunClick }: SidebarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  const [user] = useAtom(userAtom);
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);
  const [, signIn] = useAtom(signInAtom);
  const [, signOut] = useAtom(signOutAtom);
  const { isConnected: isWalletConnected, address, walletName } = useWalletConnector();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleSignInClick = () => {
    if (isAuthenticated) {
      signOut();
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleLoginSuccess = (signInResponse: any) => {
    signIn(signInResponse);
    setIsLoginModalOpen(false);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden w-48 h-screen bg-[#141414] border-r border-[#333333] p-8 flex-col items-center fixed left-0 top-0 lg:flex">
        <div className="mb-8">
          <a
            href="/"
            className="text-white text-3xl font-bold hover:opacity-80 transition-opacity duration-200 text-center"
            style={{ fontFamily: 'RamaGothicBold, sans-serif' }}
          >
            BAG.FUN
          </a>
        </div>
        
        <nav className="flex flex-col gap-4 items-center w-full">
          <a
            href="/"
            className="text-white text-sm hover:opacity-80 transition-opacity duration-200 text-center"
          >
            Home
          </a>
          <a
            href="/profile"
            className="text-[#a1a1aa] text-sm hover:text-white transition-colors duration-200 text-center"
          >
            Profile
          </a>
        </nav>
        
        <div className="mt-auto w-full">
          {isAuthenticated && user?.auth_method === 'wallet' && address ? (
            <div className="mb-4 p-3 bg-[#1a1a1a] border border-[#333333] rounded-lg">
              <div className="text-xs text-[#a1a1aa] mb-1">Connected Wallet</div>
              <div className="text-white text-sm font-medium mb-1">
                {walletName || user.wallet_name || 'Unknown Wallet'}
              </div>
              <div className="text-xs text-[#a1a1aa] font-mono">
                {address.slice(0, 6)}...{address.slice(-4)}
              </div>
            </div>
          ) : null}
          <button 
            onClick={handleSignInClick}
            className="w-full bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200"
          >
            {isAuthenticated ? 'Sign out' : 'Sign in'}
          </button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden bg-[#141414] border-b border-[#333333] p-4 flex items-center justify-between fixed top-0 left-0 right-0 z-20">
        <button
          onClick={toggleMenu}
          className="text-white hover:opacity-80 transition-opacity duration-200"
          aria-label="Toggle menu"
        >
          {/* Burger Menu Icon */}
          <svg className="w-6 h-6 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMenuOpen ? (
              <g>
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                  className="animate-pulse"
                />
              </g>
            ) : (
              <g>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h16" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 18h16" />
              </g>
            )}
          </svg>
        </button>

        <button
          onClick={onBagFunClick}
          className="text-white text-xl font-bold hover:opacity-80 transition-opacity duration-200"
          style={{ fontFamily: 'RamaGothicBold, sans-serif' }}
        >
          BAG.FUN
        </button>
        
        <button 
          onClick={handleSignInClick}
          className="bg-white text-black px-3 py-1 rounded font-medium text-sm hover:bg-gray-200 transition-colors duration-200"
        >
          {isAuthenticated ? 'Sign out' : 'Sign in'}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`lg:hidden fixed inset-0 z-30 transition-opacity duration-300 ${
        isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${
            isMenuOpen ? 'bg-opacity-50' : 'bg-opacity-0'
          }`}
          onClick={closeMenu}
        ></div>
        
        {/* Menu Panel */}
        <div className={`absolute left-0 top-0 w-64 h-full bg-[#141414] border-r border-[#333333] p-6 flex flex-col transform transition-transform duration-300 ease-out ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="mb-8">
            <button
              onClick={() => {
                onBagFunClick?.();
                closeMenu();
              }}
              className="text-white text-2xl font-bold hover:opacity-80 transition-opacity duration-200"
              style={{ fontFamily: 'RamaGothicBold, sans-serif' }}
            >
              BAG.FUN
            </button>
          </div>
          
          <nav className="flex flex-col gap-6">
            <a
              href="#"
              onClick={closeMenu}
              className="text-white text-xl hover:opacity-80 transition-opacity duration-200"
            >
              Home
            </a>
            <a
              href="/profile"
              onClick={closeMenu}
              className="text-[#a1a1aa] text-xl hover:text-white transition-colors duration-200"
            >
              Profile
            </a>
          </nav>
          
          <div className="mt-auto">
            {isAuthenticated && user?.auth_method === 'wallet' && address ? (
              <div className="mb-4 p-3 bg-[#1a1a1a] border border-[#333333] rounded-lg">
                <div className="text-xs text-[#a1a1aa] mb-1">Connected Wallet</div>
                <div className="text-white text-sm font-medium mb-1">
                  {walletName || user.wallet_name || 'Unknown Wallet'}
                </div>
                <div className="text-xs text-[#a1a1aa] font-mono">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </div>
              </div>
            ) : null}
            <button 
              onClick={() => {
                handleSignInClick();
                closeMenu();
              }}
              className="w-full bg-white text-black px-4 py-3 rounded-lg font-medium text-lg hover:bg-gray-200 transition-colors duration-200"
            >
              {isAuthenticated ? 'Sign out' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSignIn={handleLoginSuccess}
      />
    </>
  );
}