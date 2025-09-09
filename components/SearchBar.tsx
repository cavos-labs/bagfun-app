'use client';

import { useState, useEffect } from 'react';

interface SearchBarProps {
  onSearch?: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('search-input');
        searchInput?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch?.(value);
  };

  return (
    <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-xl">
      <div className="relative">
        <input
          id="search-input"
          type="text"
          placeholder="Search (⌘ + K)"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full theme-bg-secondary theme-border-primary border rounded-lg px-3 sm:px-4 py-2 text-center
          text-sm sm:text-base theme-text-primary placeholder:theme-text-tertiary focus:outline-none focus:theme-border-secondary 
          transition-colors duration-200 hover:theme-border-secondary"
        />
        <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2">
          <svg className="w-3 h-3 sm:w-4 sm:h-4 theme-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
    </div>
  );
}