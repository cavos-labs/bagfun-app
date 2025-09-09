"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ApiToken } from "@/lib/tokenService";

interface TokenSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: ApiToken;
}

export default function TokenSuccessModal({
  isOpen,
  onClose,
  token,
}: TokenSuccessModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  const formatAmount = (amount: number) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}k`;
    }
    return amount.toString();
  };

  const generateShareText = () => {
    const baseUrl = "https://app.bbag.fun";
    const tokenUrl = `${baseUrl}/token/${token.contract_address}`;

    const shareText = `NEW MEMECOIN ALERT!

${token.name} ($${token.ticker})

${token.website ? `Website: ${token.website}` : ""}

Ready to moon? Trade now on @bagdotfun!

${tokenUrl}

@Starknet`;

    return encodeURIComponent(shareText);
  };

  const handleShareOnX = () => {
    const shareText = generateShareText();
    const twitterUrl = `https://twitter.com/intent/tweet?text=${shareText}`;
    window.open(twitterUrl, "_blank", "width=600,height=400");
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  useEffect(() => {
    console.log(
      "🔍 TokenSuccessModal useEffect - isOpen:",
      isOpen,
      "token:",
      token
    );
    if (isOpen) {
      console.log("🎉 TokenSuccessModal opening with token:", token);
      console.log("🎯 Setting isVisible to true");
      setIsVisible(true);
    } else {
      console.log("❌ TokenSuccessModal closing");
      setIsVisible(false);
    }
  }, [isOpen, token]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-[9999] transition-all duration-500 ease-out ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
      style={{ zIndex: 9999 }}
    >
      {/* Notification Card */}
      <div
        className={`relative w-80 max-w-[90vw] theme-bg-primary theme-border-primary border rounded-xl p-4 shadow-2xl transform transition-all duration-500 ${
          isVisible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-2 scale-95 opacity-0"
        }`}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 theme-text-secondary hover:theme-text-primary transition-all duration-200 z-10"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Success Header */}
        <div className="flex items-center gap-3 mb-3 pr-6">
          <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
            <svg
              className="w-4 h-4 text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h2
              className="theme-text-primary text-sm font-bold"
              style={{ fontFamily: "RamaGothicBold, sans-serif" }}
            >
              TOKEN CREATED!
            </h2>
            <p className="theme-text-secondary text-xs">Your meme coin is now live</p>
          </div>
        </div>

        {/* Token Info */}
        <div className="flex items-center gap-3 mb-3">
          {/* Token Image */}
          <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-white flex-shrink-0">
            {token.image_url ? (
              <Image
                src={token.image_url}
                alt={token.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                <span className="text-white font-bold text-xs">
                  {token.ticker.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Token Basic Info */}
          <div className="flex-1">
            <h3 className="theme-text-primary font-bold text-sm">${token.ticker}</h3>
            <p className="theme-text-secondary text-xs">{token.name}</p>
            <p className="theme-text-secondary text-xs">
              Supply: {formatAmount(token.amount)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* Share on X Button */}
          <button
            onClick={handleShareOnX}
            className="flex-1 theme-bg-secondary theme-border-primary border rounded-lg px-2 py-1.5 theme-text-primary font-medium hover:theme-border-secondary transition-all duration-200 flex items-center justify-center gap-1"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span className="text-xs">X Share</span>
          </button>

          {/* View on Voyager Button */}
          {token.contract_address && (
            <a
              href={`https://voyager.online/contract/${token.contract_address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 theme-bg-secondary theme-border-primary border rounded-lg px-2 py-1.5 theme-text-primary font-medium hover:theme-border-secondary transition-all duration-200 flex items-center justify-center gap-1"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              <span className="text-xs">Voyager</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
