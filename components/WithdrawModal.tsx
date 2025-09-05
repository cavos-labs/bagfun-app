"use client";

import React, { useState } from "react";
import { useAtom } from "jotai";
import { userAtom } from "@/lib/auth-atoms";
import { CavosAuth } from "cavos-service-sdk";
import { cairo } from "starknet";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
}

export default function WithdrawModal({
  isOpen,
  onClose,
  currentBalance,
}: WithdrawModalProps) {
  const [user] = useAtom(userAtom);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleWithdraw = async () => {
    // Clear any previous messages first
    setError(null);
    setSuccess(null);

    // Validate user authentication
    if (!user?.access_token || !user?.wallet_address) {
      setError("User not authenticated");
      return;
    }

    // Validate recipient address
    if (!recipientAddress.trim()) {
      setError("Please enter recipient address");
      return;
    }

    // Basic address format validation (should start with 0x and be at least 60 chars)
    if (
      !recipientAddress.trim().startsWith("0x") ||
      recipientAddress.trim().length < 60
    ) {
      setError("Please enter a valid Starknet address (starts with 0x)");
      return;
    }

    // Validate amount
    if (!amount || amount.trim() === "") {
      setError("Please enter an amount");
      return;
    }

    const amountNumber = parseFloat(amount);
    if (isNaN(amountNumber) || amountNumber <= 0) {
      setError("Please enter a valid amount (greater than 0)");
      return;
    }

    if (amountNumber > currentBalance) {
      setError("Insufficient balance");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Executing withdraw transaction...");
      console.log("User wallet address:", user.wallet_address);
      console.log("Recipient address:", recipientAddress.trim());
      console.log("Amount:", amount);
      console.log("Access token:", user.access_token);

      // Initialize CavosAuth with user's network and app ID
      const cavosAuth = new CavosAuth(
        user.network,
        process.env.NEXT_PUBLIC_CAVOS_APP_ID || ""
      );

      const calls = [
        {
          contractAddress:
            "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
          entrypoint: "transfer",
          calldata: [
            recipientAddress.trim(),
            cairo.uint256(Number(amount) * 10 ** 18),
          ],
        },
      ];

      const result = await cavosAuth.executeCalls(
        user.wallet_address,
        calls,
        user.access_token
      );
      console.log("result", result);

      console.log("Transaction sent:", result.txHash);
      console.log("New access token:", result.accessToken);

      setSuccess("Transaction successful!");
      setTxHash(result.txHash);

      // Reset form immediately after success
      setRecipientAddress("");
      setAmount("");

      // Modal will stay open for user to manually close
    } catch (error: any) {
      console.error("Transaction failed:", error);
      setError(error.message || "Transaction failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError(null);
      setSuccess(null);
      setRecipientAddress("");
      setAmount("");
      onClose();
    }
  };

  // Clear form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setRecipientAddress("");
      setAmount("");
      setError(null);
      setSuccess(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-opacity-50" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-[#1a1a1a] border border-[#333333] rounded-2xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-xl font-semibold">Withdraw STRK</h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-[#a1a1aa] hover:text-white transition-colors duration-200 disabled:opacity-50"
          >
            <svg
              className="w-6 h-6"
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
        </div>

        <div className="space-y-4">
          {/* Current Balance */}
          <div className="bg-[#141414] border border-[#333333] rounded-lg p-3">
            <p className="text-[#a1a1aa] text-sm">Available Balance</p>
            <p className="text-white font-semibold text-lg">
              {currentBalance.toLocaleString()} STRK
            </p>
          </div>

          {/* Recipient Address */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Recipient Address
            </label>
            <input
              type="text"
              value={recipientAddress}
              onChange={(e) => {
                setRecipientAddress(e.target.value);
                // Clear error when user starts typing
                if (error) setError(null);
              }}
              placeholder="0x..."
              disabled={isLoading}
              className="w-full bg-[#141414] border border-[#333333] rounded-lg px-3 py-2 text-white placeholder-[#a1a1aa] focus:border-blue-500 focus:outline-none disabled:opacity-50"
            />
            {recipientAddress && !recipientAddress.startsWith("0x") && (
              <p className="text-red-400 text-xs mt-1">
                Address must start with 0x
              </p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Amount (STRK)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                // Clear error when user starts typing
                if (error) setError(null);
              }}
              placeholder="0.0"
              min="0"
              max={currentBalance}
              step="0.000000000000000001"
              disabled={isLoading}
              className="w-full bg-[#141414] border border-[#333333] rounded-lg px-3 py-2 text-white placeholder-[#a1a1aa] focus:border-blue-500 focus:outline-none disabled:opacity-50"
            />
            <button
              onClick={() => {
                setAmount(currentBalance.toString());
                if (error) setError(null);
              }}
              disabled={isLoading}
              className="mt-1 text-blue-500 text-xs hover:text-blue-400 transition-colors duration-200 disabled:opacity-50"
            >
              Max
            </button>
            {amount && parseFloat(amount) > currentBalance && (
              <p className="text-red-400 text-xs mt-1">
                Amount exceeds available balance
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <p className="text-green-400 text-sm">
                {success}
                <br />
                <a
                  href={`https://voyager.online/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  View on Voyager
                </a>
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 bg-[#333333] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#444444] transition-colors duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleWithdraw}
              disabled={
                isLoading ||
                !recipientAddress.trim() ||
                !amount ||
                parseFloat(amount) <= 0
              }
              className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </div>
              ) : (
                "Withdraw"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
