import { CookieKey } from 'src/shared/constants/auth.constant';
import { env } from './env';
import { cookieStorage } from './cookies';

type StoreTokensParams = {
  accessToken: string;
  refreshToken?: string;
  accessTokenTTL?: number;
  refreshTokenTTL?: number;
};

// Only used with apiConfig.authStrategy = 'bearer'. With 'cookie', the backend owns the tokens.
export const tokenManager = {
  getAccessToken(): string | null {
    return cookieStorage.get(CookieKey.AccessToken) ?? null;
  },

  getRefreshToken(): string | null {
    return cookieStorage.get(CookieKey.RefreshToken) ?? null;
  },

  storeTokens({
    accessToken,
    refreshToken,
    accessTokenTTL = env.ACCESS_TOKEN_TTL,
    refreshTokenTTL = env.REFRESH_TOKEN_TTL,
  }: StoreTokensParams) {
    cookieStorage.set(CookieKey.AccessToken, accessToken, { expiresIn: accessTokenTTL });
    if (refreshToken) cookieStorage.set(CookieKey.RefreshToken, refreshToken, { expiresIn: refreshTokenTTL });
  },

  isAuthenticated() {
    return !!tokenManager.getAccessToken() || !!tokenManager.getRefreshToken();
  },

  removeAllCredentials() {
    cookieStorage.remove(CookieKey.AccessToken);
    cookieStorage.remove(CookieKey.RefreshToken);
  },
};
