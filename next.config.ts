import path from 'path';
import { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: false,
  eslint: {
    dirs: ['src'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  sassOptions: {
    includePaths: [path.join(__dirname)],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [768, 1024, 1920],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'icon-library.com',
      },
      {
        protocol: 'https',
        hostname: 'assets-global.website-files.com',
      },
    ],
  },
  poweredByHeader: false,
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ];
  },
  experimental: {
    turbo: {},
  },
};

export default config;
