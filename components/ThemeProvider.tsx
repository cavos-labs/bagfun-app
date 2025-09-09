'use client';

import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { themeAtom } from '@/lib/theme-atoms';

export default function ThemeProvider() {
  const [theme] = useAtom(themeAtom);

  useEffect(() => {
    // Set the data-theme attribute on the document element
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return null;
}