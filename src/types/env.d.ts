declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_APP_KEY?: string;
    NEXT_PUBLIC_SITE_URL?: string;
    NEXT_PUBLIC_API_URL?: string;
    NEXT_PUBLIC_ACCESS_TOKEN_TTL?: string;
    NEXT_PUBLIC_REFRESH_TOKEN_TTL?: string;
    NEXT_PUBLIC_API_MOCKING?: 'enabled' | 'disabled';
    // Build-time only, set by the Dockerfile.
    NEXT_OUTPUT?: 'standalone';
  }
}
