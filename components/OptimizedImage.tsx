'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getOptimizedIPFSUrls, isIPFSUrl, generateBlurDataURL } from '@/lib/imageUtils';
import { useImagePreloader } from '@/lib/useImagePreloader';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  fallbackComponent?: React.ReactNode;
  preloadOnHover?: boolean;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  priority = false,
  fallbackComponent,
  preloadOnHover = false,
}: OptimizedImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [urlIndex, setUrlIndex] = useState(0);

  // Use image preloader for IPFS optimization
  const { optimizedSrc, isPreloading, handleHover } = useImagePreloader(src, {
    preloadOnHover,
    cacheInMemory: true,
  });

  // Get optimized URLs if it's an IPFS URL
  const optimizedUrls = isIPFSUrl(src) ? getOptimizedIPFSUrls(src) : [src];

  useEffect(() => {
    if (isIPFSUrl(src)) {
      // Use optimized URL if available, otherwise use first gateway URL
      setCurrentSrc(optimizedSrc || optimizedUrls[0]);
      setUrlIndex(0);
    } else {
      setCurrentSrc(src);
    }
    setHasError(false);
    setIsLoading(true);
  }, [src, optimizedSrc]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    // Try the next gateway if available
    const nextIndex = urlIndex + 1;
    if (nextIndex < optimizedUrls.length) {
      setUrlIndex(nextIndex);
      setCurrentSrc(optimizedUrls[nextIndex]);
      return;
    }
    
    // All gateways failed
    setIsLoading(false);
    setHasError(true);
  };

  if (hasError) {
    return fallbackComponent || (
      <div className={`bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ${className}`}>
        <span className="text-white font-bold text-lg">
          {alt.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  }

  const imageProps = {
    src: currentSrc,
    alt,
    onLoad: handleLoad,
    onError: handleError,
    className: `transition-opacity duration-300 ${
      isLoading ? 'opacity-0' : 'opacity-100'
    } ${className}`,
    priority,
    placeholder: 'blur' as const,
    blurDataURL: generateBlurDataURL(),
  };

  if (fill) {
    return (
      <div 
        className="relative w-full h-full"
        onMouseEnter={preloadOnHover ? handleHover : undefined}
      >
        {(isLoading || isPreloading) && (
          <div className="absolute inset-0 bg-gray-800 animate-pulse rounded-inherit" />
        )}
        <Image
          {...imageProps}
          fill
          style={{ objectFit: 'cover' }}
        />
      </div>
    );
  }

  return (
    <div 
      className="relative"
      onMouseEnter={preloadOnHover ? handleHover : undefined}
    >
      {(isLoading || isPreloading) && (
        <div 
          className="absolute inset-0 bg-gray-800 animate-pulse rounded-inherit"
          style={{ width, height }}
        />
      )}
      <Image
        {...imageProps}
        width={width}
        height={height}
      />
    </div>
  );
}