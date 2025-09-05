/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Enable image optimization for IPFS gateways
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud',
        port: '',
        pathname: '/ipfs/**',
      },
      {
        protocol: 'https',
        hostname: 'ipfs.io',
        port: '',
        pathname: '/ipfs/**',
      },
      {
        protocol: 'https',
        hostname: 'cloudflare-ipfs.com',
        port: '',
        pathname: '/ipfs/**',
      },
      {
        protocol: 'https',
        hostname: 'ipfs.infura.io',
        port: '',
        pathname: '/ipfs/**',
      },
      {
        protocol: 'https',
        hostname: 'dweb.link',
        port: '',
        pathname: '/ipfs/**',
      },
      {
        protocol: 'https',
        hostname: 'w3s.link',
        port: '',
        pathname: '/ipfs/**',
      },
      {
        protocol: 'https',
        hostname: '*.ipfs.nftstorage.link',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'schizodio.xyz',
        port: '',
        pathname: '/**',
      },
    ],
    // Optimize image loading
    formats: ['image/webp', 'image/avif'],
    // Cache images for longer periods
    minimumCacheTTL: 31536000, // 1 year in seconds
    // Enable placeholder blur
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['@/lib', '@/components'],
  },
};

module.exports = nextConfig;