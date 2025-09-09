'use client';

import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// Theme type
export type Theme = 'dark' | 'light';

// Theme atom with localStorage persistence
export const themeAtom = atomWithStorage<Theme>('bagfun-theme', 'dark');

// Derived atom for theme classes
export const themeClassesAtom = atom((get) => {
  const theme = get(themeAtom);
  
  return {
    // Background colors
    bg: {
      primary: theme === 'dark' ? 'bg-[#141414]' : 'bg-gray-50',
      secondary: theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white',
      tertiary: theme === 'dark' ? 'bg-[#0a0a0a]' : 'bg-gray-100',
      accent: theme === 'dark' ? 'bg-[#333333]' : 'bg-gray-200',
    },
    
    // Text colors
    text: {
      primary: theme === 'dark' ? 'text-white' : 'text-gray-900',
      secondary: theme === 'dark' ? 'text-[#a1a1aa]' : 'text-gray-600',
      tertiary: theme === 'dark' ? 'text-[#666666]' : 'text-gray-400',
    },
    
    // Border colors
    border: {
      primary: theme === 'dark' ? 'border-[#333333]' : 'border-gray-200',
      secondary: theme === 'dark' ? 'border-[#444444]' : 'border-gray-300',
    },
    
    // Hover states
    hover: {
      bg: theme === 'dark' ? 'hover:bg-[#222222]' : 'hover:bg-gray-100',
      text: theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-800',
      border: theme === 'dark' ? 'hover:border-[#555555]' : 'hover:border-gray-400',
    },
    
    // Focus states
    focus: {
      border: theme === 'dark' ? 'focus:border-blue-500' : 'focus:border-blue-500',
      ring: theme === 'dark' ? 'focus:ring-blue-500/20' : 'focus:ring-blue-500/20',
    },
    
    // Special elements
    input: {
      bg: theme === 'dark' ? 'bg-[#0a0a0a]' : 'bg-white',
      placeholder: theme === 'dark' ? 'placeholder-[#666666]' : 'placeholder-gray-400',
    },
    
    // Buttons (primary button stays white/black for contrast)
    button: {
      primary: 'bg-white text-black hover:bg-gray-200', // Always white for visibility
      secondary: theme === 'dark' ? 'bg-[#333333] text-white hover:bg-[#444444]' : 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    },
  };
});

// Theme toggle atom
export const toggleThemeAtom = atom(
  null,
  (get, set) => {
    const currentTheme = get(themeAtom);
    set(themeAtom, currentTheme === 'dark' ? 'light' : 'dark');
  }
);