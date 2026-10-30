import { cookieStorage } from '../cookies';
import { env } from '../env';

const COOKIE_KEYS = {
  accessToken: `${env.APP_KEY}_accessToken`,
  refreshToken: `${env.APP_KEY}_refreshToken`,
};

type StoreTokensParams = {
  accessToken: string;
  refreshToken?: string;
  accessTokenTTL?: number;
  refreshTokenTTL?: number;
};

// Only used with authConfig.strategy = 'bearer'. With 'cookie', the backend owns the tokens.
export const tokenManager = {
  getAccessToken(): string | null {
    return cookieStorage.get(COOKIE_KEYS.accessToken) ?? null;
  },

  getRefreshToken(): string | null {
    return cookieStorage.get(COOKIE_KEYS.refreshToken) ?? null;
  },

  storeTokens({
    accessToken,
    refreshToken,
    accessTokenTTL = env.ACCESS_TOKEN_TTL,
    refreshTokenTTL = env.REFRESH_TOKEN_TTL,
  }: StoreTokensParams) {
    cookieStorage.set(COOKIE_KEYS.accessToken, accessToken, { expiresIn: accessTokenTTL });
    if (refreshToken) cookieStorage.set(COOKIE_KEYS.refreshToken, refreshToken, { expiresIn: refreshTokenTTL });
  },

  isAuthenticated() {
    return !!tokenManager.getAccessToken() || !!tokenManager.getRefreshToken();
  },

  removeAllCredentials() {
    cookieStorage.remove(COOKIE_KEYS.accessToken);
    cookieStorage.remove(COOKIE_KEYS.refreshToken);
  },
};
