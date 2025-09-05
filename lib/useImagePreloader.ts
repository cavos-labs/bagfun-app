'use client';

import { useEffect, useState, useCallback } from 'react';
import { getFastestIPFSUrl, isIPFSUrl } from './imageUtils';

interface ImagePreloaderOptions {
  preloadOnHover?: boolean;
  cacheInMemory?: boolean;
}

// In-memory cache for preloaded images
const imageCache = new Map<string, string>();
const loadingPromises = new Map<string, Promise<string>>();

export function useImagePreloader(src: string, options: ImagePreloaderOptions = {}) {
  const { preloadOnHover = false, cacheInMemory = true } = options;
  const [optimizedSrc, setOptimizedSrc] = useState<string>(src);
  const [isPreloading, setIsPreloading] = useState(isIPFSUrl(src));

  const preloadImage = useCallback(async (imageSrc: string) => {
    // Check if already cached
    if (cacheInMemory && imageCache.has(imageSrc)) {
      return imageCache.get(imageSrc)!;
    }

    // Check if already loading
    if (loadingPromises.has(imageSrc)) {
      return loadingPromises.get(imageSrc)!;
    }

    // Start loading
    const loadPromise = (async () => {
      if (isIPFSUrl(imageSrc)) {
        const fastestUrl = await getFastestIPFSUrl(imageSrc);
        if (cacheInMemory) {
          imageCache.set(imageSrc, fastestUrl);
        }
        return fastestUrl;
      }
      return imageSrc;
    })();

    if (cacheInMemory) {
      loadingPromises.set(imageSrc, loadPromise);
    }

    try {
      const result = await loadPromise;
      loadingPromises.delete(imageSrc);
      return result;
    } catch (error) {
      loadingPromises.delete(imageSrc);
      throw error;
    }
  }, [cacheInMemory]);

  // Aggressive preloading - start immediately for IPFS URLs
  useEffect(() => {
    if (isIPFSUrl(src)) {
      // Check if already cached first
      if (imageCache.has(src)) {
        setOptimizedSrc(imageCache.get(src)!);
        setIsPreloading(false);
        return;
      }

      if (!preloadOnHover) {
        setIsPreloading(true);
        preloadImage(src)
          .then((optimized) => {
            setOptimizedSrc(optimized);
          })
          .finally(() => {
            setIsPreloading(false);
          });
      }
    } else {
      setIsPreloading(false);
    }
  }, [src, preloadOnHover, preloadImage]);

  const handleHover = useCallback(() => {
    if (preloadOnHover && isIPFSUrl(src) && !imageCache.has(src)) {
      setIsPreloading(true);
      preloadImage(src)
        .then((optimized) => {
          setOptimizedSrc(optimized);
        })
        .finally(() => {
          setIsPreloading(false);
        });
    }
  }, [src, preloadOnHover, preloadImage]);

  return {
    optimizedSrc,
    isPreloading,
    handleHover,
    preloadImage,
  };
}

// Hook for bulk preloading (useful for token lists)
export function useBulkImagePreloader(sources: string[]) {
  const [preloadedCount, setPreloadedCount] = useState(0);
  const [isPreloading, setIsPreloading] = useState(false);

  const preloadAll = useCallback(async () => {
    if (sources.length === 0) return;

    setIsPreloading(true);
    setPreloadedCount(0);

    const promises = sources.map(async (src, index) => {
      if (isIPFSUrl(src) && !imageCache.has(src)) {
        try {
          const optimized = await getFastestIPFSUrl(src);
          imageCache.set(src, optimized);
          setPreloadedCount(prev => prev + 1);
          return optimized;
        } catch {
          setPreloadedCount(prev => prev + 1);
          return src;
        }
      }
      setPreloadedCount(prev => prev + 1);
      return src;
    });

    try {
      await Promise.all(promises);
    } finally {
      setIsPreloading(false);
    }
  }, [sources]);

  useEffect(() => {
    // Start preloading immediately for better perceived performance
    const timer = setTimeout(preloadAll, 10);
    return () => clearTimeout(timer);
  }, [preloadAll]);

  return {
    preloadedCount,
    totalCount: sources.length,
    isPreloading,
    progress: sources.length > 0 ? (preloadedCount / sources.length) * 100 : 0,
  };
}