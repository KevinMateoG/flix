import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  images: 
  {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/t/p/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND || 'http://localhost:3000'}/api/:path*`,
      },
    ];
  },
  allowedDevOrigins: ['10.33.21.171', 'localhost'],
};

export default nextConfig;
