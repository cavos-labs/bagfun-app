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
  const [showSkeleton, setShowSkeleton] = useState(true);

  // Use image preloader for IPFS optimization
  const { optimizedSrc, isPreloading, handleHover } = useImagePreloader(src, {
    preloadOnHover,
    priority,
  });

  // Get optimized URLs if it's an IPFS URL
  const optimizedUrls = isIPFSUrl(src) ? getOptimizedIPFSUrls(src) : [src];

  useEffect(() => {
    setCurrentSrc(optimizedSrc);
    setHasError(false);
    setIsLoading(true);
    setShowSkeleton(true);
  }, [optimizedSrc]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    // Hide skeleton immediately when image loads
    setShowSkeleton(false);
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

  // Create an animated gradient skeleton
  const SkeletonComponent = ({ className: skeletonClass }: { className?: string }) => (
    <div className={`animate-pulse bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%] animate-shimmer ${skeletonClass}`}>
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
          <span className="text-gray-400 font-bold text-sm">
            {alt.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );

  const imageProps = {
    src: currentSrc,
    alt,
    onLoad: handleLoad,
    onError: handleError,
    className: `transition-opacity duration-300 ${
      isLoading || showSkeleton ? 'opacity-0' : 'opacity-100'
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
        {(showSkeleton || isPreloading) && (
          <SkeletonComponent className="absolute inset-0 rounded-inherit" />
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
      style={{ width, height }}
    >
      {(showSkeleton || isPreloading) && (
        <SkeletonComponent 
          className="absolute inset-0 rounded-inherit"
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