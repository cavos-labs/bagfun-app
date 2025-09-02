'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAtom } from 'jotai';
import { signInAtom } from '@/lib/auth-atoms';

interface SignInResponse {
  success: boolean;
  access_token: string;
  wallet_address: string;
  network: string;
}

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, signIn] = useAtom(signInAtom);

  useEffect(() => {
    const handleCallback = () => {
      const userData = searchParams.get("user_data");
      const error = searchParams.get("error");

      if (error) {
        console.error("Social login error:", error);
        router.push("/?error=social_login_failed");
        return;
      }

      if (userData) {
        try {
          const decodedUserData = decodeURIComponent(userData);
          const parsedUserData = JSON.parse(decodedUserData);
          
          const signInResponse: SignInResponse = {
            success: true,
            access_token: parsedUserData.authData.accessToken,
            wallet_address: parsedUserData.wallet.address,
            network: parsedUserData.wallet.network || "sepolia",
          };
          
          signIn(signInResponse);
          router.push("/");
        } catch (error) {
          console.error("Error parsing user data:", error);
          router.push("/?error=callback_error");
        }
      }
    };
    
    handleCallback();
  }, [router, searchParams, signIn]);

  return (
    <div className="min-h-screen bg-[#141414] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white">Completing sign in...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}