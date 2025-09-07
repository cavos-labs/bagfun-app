'use client';

import { useEffect, useState, useCallback } from 'react';
import { getOptimizedIPFSUrls, isIPFSUrl } from './imageUtils';

interface ImagePreloaderOptions {
  preloadOnHover?: boolean;
  priority?: boolean;
}

// Simple in-memory cache for optimized URLs
const urlCache = new Map<string, string>();

export function useImagePreloader(src: string, options: ImagePreloaderOptions = {}) {
  const { preloadOnHover = false, priority = false } = options;
  const [optimizedSrc, setOptimizedSrc] = useState<string>(src);
  const [isPreloading, setIsPreloading] = useState(false);

  // Get best IPFS URL immediately for IPFS images
  useEffect(() => {
    if (isIPFSUrl(src)) {
      // Check cache first
      if (urlCache.has(src)) {
        setOptimizedSrc(urlCache.get(src)!);
        return;
      }

      // Get the first (fastest) gateway URL immediately
      const optimizedUrls = getOptimizedIPFSUrls(src);
      const fastestUrl = optimizedUrls[0]; // Cloudflare IPFS is first in our list
      
      setOptimizedSrc(fastestUrl);
      urlCache.set(src, fastestUrl);
    }
  }, [src]);

  const handleHover = useCallback(() => {
    // For hover preload, we can trigger Next.js Image preload
    if (preloadOnHover && !priority) {
      setIsPreloading(true);
      // Next.js will handle the actual preloading via Image component
      setTimeout(() => setIsPreloading(false), 100);
    }
  }, [preloadOnHover, priority]);

  return {
    optimizedSrc,
    isPreloading,
    handleHover,
  };
};

// Simplified bulk preloader that leverages Next.js Image caching
export function useBulkImagePreloader(sources: string[]) {
  const [preloadedCount, setPreloadedCount] = useState(0);
  const [isPreloading, setIsPreloading] = useState(false);

  const preloadAll = useCallback(async () => {
    if (sources.length === 0) return;

    setIsPreloading(true);
    setPreloadedCount(0);

    // Pre-optimize all IPFS URLs immediately
    sources.forEach((src, index) => {
      if (isIPFSUrl(src) && !urlCache.has(src)) {
        const optimizedUrls = getOptimizedIPFSUrls(src);
        const fastestUrl = optimizedUrls[0];
        urlCache.set(src, fastestUrl);
      }
      setPreloadedCount(prev => prev + 1);
    });

    setIsPreloading(false);
  }, [sources]);

  useEffect(() => {
    // Pre-optimize URLs immediately
    preloadAll();
  }, [preloadAll]);

  return {
    preloadedCount,
    totalCount: sources.length,
    isPreloading,
    progress: sources.length > 0 ? (preloadedCount / sources.length) * 100 : 0,
  };
}