'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface InvitationGateProps {
  onValidCode: () => void;
}

const VALID_CODES = [
  'FILLYOURBAGBUDDY'
]; // You can manage these codes as needed

export default function InvitationGate({ onValidCode }: InvitationGateProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if user already has access
  useEffect(() => {
    const hasAccess = localStorage.getItem('bagfun_access');
    if (hasAccess === 'true') {
      onValidCode();
    }
  }, [onValidCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (VALID_CODES.includes(code.toUpperCase())) {
      localStorage.setItem('bagfun_access', 'true');
      onValidCode();
    } else {
      setError('Invalid invitation code. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#141414] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#1a1a1a] border border-[#333333] rounded-2xl p-8 text-center">
          {/* Logo/Brand */}
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto mb-4">
              <Image
                src="/bag-fun.png"
                alt="bag.fun"
                width={128}
                height={128}
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-[#a1a1aa] text-sm">
              Exclusive Access Required
            </p>
          </div>

          {/* Invitation Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="inviteCode" className="block text-white text-sm font-medium mb-3">
                Enter Invitation Code
              </label>
              <input
                type="text"
                id="inviteCode"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="INVITATION-CODE"
                className="w-full bg-[#141414] border border-[#333333] rounded-lg px-4 py-3 text-white placeholder-[#666666] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-mono tracking-wider"
                disabled={loading}
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="w-full bg-white text-black py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"></div>
                  Verifying...
                </>
              ) : (
                'Enter App'
              )}
            </button>
          </form>

          {/* Info */}
          <div className="mt-8 pt-6 border-t border-[#333333]">
            <p className="text-[#666666] text-xs">
              Don't have an invitation code? Contact us for early access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}