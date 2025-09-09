'use client';

import { Provider } from 'jotai';
import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { initUserAtom } from '@/lib/auth-atoms';
import ThemeProvider from './ThemeProvider';

function AuthInitializer() {
  const [, initUser] = useAtom(initUserAtom);

  useEffect(() => {
    initUser();
  }, [initUser]);

  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider>
      <ThemeProvider />
      <AuthInitializer />
      {children}
    </Provider>
  );
}