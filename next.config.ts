import path from 'path';
import { NextConfig } from 'next';

// Off by default because a wrong policy silently breaks the page. Turn it on once you know every outside origin
// the app talks to, add those to the lists below, and check the browser console for blocked requests.
const ENABLE_CSP = false;

const isDev = process.env.NODE_ENV !== 'production';

const originOf = (url: string | undefined) => {
  try {
    return url ? new URL(url).origin : '';
  } catch {
    return '';
  }
};

// MUI/Emotion inject styles at runtime and the color-scheme script runs inline, so both need 'unsafe-inline'.
// The policy still blocks scripts, frames and connections from anywhere not listed.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' ${originOf(process.env.NEXT_PUBLIC_API_URL)}${isDev ? ' ws:' : ''}`,
  "worker-src 'self'",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

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
        // Switch to 'same-origin-allow-popups' if you add a sign-in popup (Google, Apple, etc.).
        { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        ...(ENABLE_CSP ? [{ key: 'Content-Security-Policy', value: contentSecurityPolicy }] : []),
      ],
    },
  ],
};

export default config;
