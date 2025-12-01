import { CookieKey } from 'src/shared/constants';
import { envVariables } from './environment';
import { CookiesStorage, cookiesStorage } from './cookies';

type StoreTokensParams = {
  accessToken: string;
  refreshToken?: string;
  accessTokenTTL?: number;
  refreshTokenTTL?: number;
};

class TokensManager {
  constructor(private readonly cookiesStorage: CookiesStorage) {}

  setAccessToken(accessToken: string, ttl = envVariables.ACCESS_TOKEN_TTL) {
    this.cookiesStorage.setCookieData(CookieKey.AccessToken, accessToken, ttl);
  }

  setRefreshToken(refreshToken: string, ttl = envVariables.REFRESH_TOKEN_TTL) {
    this.cookiesStorage.setCookieData(CookieKey.RefreshToken, refreshToken, ttl);
  }

  getAccessToken(): string | null {
    return this.cookiesStorage.get(CookieKey.AccessToken) ?? null;
  }

  getRefreshToken(): string | null {
    return this.cookiesStorage.get(CookieKey.RefreshToken) ?? null;
  }

  storeTokens({
    accessToken,
    refreshToken,
    accessTokenTTL = envVariables.ACCESS_TOKEN_TTL,
    refreshTokenTTL = envVariables.REFRESH_TOKEN_TTL,
  }: StoreTokensParams) {
    if (accessToken) this.setAccessToken(accessToken, accessTokenTTL);

    if (refreshToken) this.setRefreshToken(refreshToken, refreshTokenTTL);
  }

  isAuthenticated() {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    return !!accessToken || !!refreshToken;
  }

  removeAllCredentials() {
    this.cookiesStorage.clearCookieData(CookieKey.AccessToken);
    this.cookiesStorage.clearCookieData(CookieKey.RefreshToken);
  }
}

export const tokenManager = new TokensManager(cookiesStorage);
