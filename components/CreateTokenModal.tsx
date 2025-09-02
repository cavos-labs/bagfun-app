'use client';

import { useState, useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import { userAtom } from '@/lib/auth-atoms';
import { TokenService } from '@/lib/tokenService';
import Image from 'next/image';

interface CreateTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTokenCreated?: (token: any) => void;
}

export default function CreateTokenModal({ isOpen, onClose, onTokenCreated }: CreateTokenModalProps) {
  const [user] = useAtom(userAtom);
  const [formData, setFormData] = useState({
    name: '',
    ticker: '',
    amount: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!user?.wallet_address) {
        setError('Please connect your wallet first');
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
        creator_address: user.wallet_address,
        amount: formData.amount ? parseFloat(formData.amount) : 0,
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

      // Call API to create token using TokenService
      const result = await TokenService.createToken(tokenData);

      if (result.error) {
        throw new Error(result.error);
      }

      // Reset form
      setFormData({ name: '', ticker: '', amount: '' });
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
      setFormData({ name: '', ticker: '', amount: '' });
      setImageFile(null);
      setImagePreview(null);
    }, 200);
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
          isVisible ? 'bg-black bg-opacity-40' : 'bg-opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full max-w-md mx-4 bg-black rounded-2xl p-8 border border-[#333333] transform transition-all duration-200 max-h-[90vh] overflow-y-auto ${
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
            CREATE TOKEN
          </h2>
          <p className="text-[#a1a1aa] text-sm">
            Launch your meme coin on bag.fun
          </p>
        </div>

        {/* Error message */}
        <div className={`overflow-hidden transition-all duration-300 ease-out ${
          error ? 'max-h-20 mb-4' : 'max-h-0 mb-0'
        }`}>
          <div className={`p-3 bg-red-900/20 border border-red-500/20 rounded-lg text-red-400 text-sm transform transition-all duration-300 ${
            error ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
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
              value={formData.name}
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
              value={formData.ticker}
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

          {/* Initial Amount */}
          <div className="relative">
            <label className="block text-white text-sm font-medium mb-2">Initial Amount</label>
            <input
              type="number"
              name="amount"
              placeholder="1000000"
              value={formData.amount}
              onChange={handleInputChange}
              min="0"
              step="any"
              className="w-full bg-[#1a1a1a] border border-[#333333] rounded-lg px-4 py-3 text-white placeholder-[#a1a1aa] focus:outline-none focus:border-[#555555] focus:ring-2 focus:ring-[#555555]/20 transition-all duration-200 hover:border-[#444444]"
            />
            <p className="text-xs text-[#a1a1aa] mt-1">Optional. Total supply of tokens to create</p>
          </div>

          <button
            type="submit"
            disabled={loading || !user?.wallet_address}
            className="w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
          >
            <span className={`transition-opacity duration-200 ${loading ? 'opacity-0' : 'opacity-100'}`}>
              {!user?.wallet_address ? 'Connect Wallet First' : 'Create Token'}
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