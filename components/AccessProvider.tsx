'use client';

import { useState, useEffect, ReactNode } from 'react';
import InvitationGate from './InvitationGate';

interface AccessProviderProps {
  children: ReactNode;
}

export default function AccessProvider({ children }: AccessProviderProps) {
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage on mount
    const checkAccess = () => {
      const access = localStorage.getItem('bagfun_access');
      setHasAccess(access === 'true');
      setIsLoading(false);
    };

    checkAccess();
  }, []);

  const handleValidCode = () => {
    setHasAccess(true);
  };

  // Show loading while checking access
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-[#a1a1aa]">Loading...</p>
        </div>
      </div>
    );
  }

  // Show invitation gate if no access
  if (!hasAccess) {
    return <InvitationGate onValidCode={handleValidCode} />;
  }

  // Show app if access granted
  return <>{children}</>;
}