import path from 'path';
import { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  bundlePagesRouterDependencies: true,
  sassOptions: {
    includePaths: [path.join(__dirname)],
  },
  turbopack: {
    resolveAlias: {
      // MSW's browser entry doesn't exist for the server build, so the server gets a stub instead.
      'msw/browser': { browser: 'msw/browser', default: './src/mocks/msw-browser.server.ts' },
    },
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [],
  },
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
      ],
    },
  ],
};

export default config;
