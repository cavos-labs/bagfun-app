// IPFS Image optimization utilities

/**
 * List of fast IPFS gateways in order of preference
 * These are public gateways optimized for performance
 */
const IPFS_GATEWAYS = [
  'https://cloudflare-ipfs.com/ipfs/', // Cloudflare - generally fastest
  'https://ipfs.io/ipfs/', // Official IPFS gateway
  'https://gateway.pinata.cloud/ipfs/', // Pinata - good for pinned content
  'https://dweb.link/ipfs/', // Protocol Labs gateway
  'https://w3s.link/ipfs/', // Web3 Storage
  'https://ipfs.infura.io/ipfs/', // Infura
];

/**
 * Extract IPFS hash from various IPFS URL formats
 */
export function extractIPFSHash(url: string): string | null {
  if (!url) return null;
  
  // Handle ipfs:// protocol
  if (url.startsWith('ipfs://')) {
    return url.replace('ipfs://', '');
  }
  
  // Handle gateway URLs
  const ipfsHashRegex = /\/ipfs\/([a-zA-Z0-9]+)/;
  const match = url.match(ipfsHashRegex);
  return match ? match[1] : null;
}

/**
 * Check if URL is an IPFS URL
 */
export function isIPFSUrl(url: string): boolean {
  return url.startsWith('ipfs://') || url.includes('/ipfs/');
}

/**
 * Get optimized IPFS URLs with multiple gateway fallbacks
 */
export function getOptimizedIPFSUrls(originalUrl: string): string[] {
  if (!isIPFSUrl(originalUrl)) {
    return [originalUrl];
  }
  
  const hash = extractIPFSHash(originalUrl);
  if (!hash) {
    return [originalUrl];
  }
  
  // Return multiple gateway URLs for fallback
  return IPFS_GATEWAYS.map(gateway => `${gateway}${hash}`);
}

/**
 * Get the primary optimized IPFS URL
 */
export function getOptimizedIPFSUrl(originalUrl: string): string {
  const urls = getOptimizedIPFSUrls(originalUrl);
  return urls[0] || originalUrl;
}

/**
 * Generate a simple blur placeholder for images
 */
export function generateBlurDataURL(): string {
  // Simple 1x1 pixel blur placeholder
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjMjAyMDIwIi8+Cjwvc3ZnPgo=';
}

/**
 * Preload image to test gateway speed
 */
export function preloadImage(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    const timeout = setTimeout(() => {
      resolve(false);
    }, 1500); // Reduced timeout for faster fallback
    
    img.onload = () => {
      clearTimeout(timeout);
      resolve(true);
    };
    
    img.onerror = () => {
      clearTimeout(timeout);
      resolve(false);
    };
    
    img.src = src;
  });
}

/**
 * Find the fastest IPFS gateway for a given hash
 */
export async function getFastestIPFSUrl(originalUrl: string): Promise<string> {
  const urls = getOptimizedIPFSUrls(originalUrl);
  
  if (urls.length === 1) {
    return urls[0];
  }
  
  // Test gateways in parallel and return the first successful one
  try {
    const promises = urls.map(async (url) => {
      const success = await preloadImage(url);
      if (success) return url;
      throw new Error('Failed to load');
    });
    
    const fastestUrl = await Promise.any(promises);
    return fastestUrl;
  } catch {
    // If all fail, return the first one
    return urls[0];
  }
}