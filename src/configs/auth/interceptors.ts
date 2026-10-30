import axios, { AxiosInstance } from 'axios';
import { StatusCodes } from 'http-status-codes';
import { toApiError } from 'src/shared/utils/apiError';
import { authConfig } from './auth.config';
import { tokenManager } from './tokenManager';

type RefreshResponse = { accessToken: string; refreshToken?: string };

let sessionExpiredHandler = () => tokenManager.removeAllCredentials();

export function onSessionExpired(handler: () => void) {
  sessionExpiredHandler = handler;
}

let refreshPromise: Promise<void> | null = null;

async function refreshSession(instance: AxiosInstance) {
  if (!authConfig.refreshPath) throw new Error('No refresh endpoint configured');

  if (authConfig.strategy === 'cookie') {
    await instance.post(authConfig.refreshPath, undefined, { skipAuthRefresh: true });
    return;
  }

  const refreshToken = tokenManager.getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token');

  const tokens = await instance.post<RefreshResponse, RefreshResponse>(
    authConfig.refreshPath,
    { refreshToken },
    { skipAuthRefresh: true },
  );
  tokenManager.storeTokens(tokens);
}

// Parallel 401s share one refresh call, so the session-expired handler also runs only once.
function refreshSessionOnce(instance: AxiosInstance) {
  refreshPromise ??= refreshSession(instance)
    .catch((error: unknown) => {
      sessionExpiredHandler();
      throw error;
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

// Registered after the client's own response handler, so errors arrive here already turned into ApiError.
export function setupAuthInterceptors(instance: AxiosInstance) {
  instance.defaults.withCredentials = authConfig.strategy === 'cookie';

  instance.interceptors.request.use((config) => {
    if (authConfig.strategy === 'bearer') {
      const accessToken = tokenManager.getAccessToken();
      if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });

  instance.interceptors.response.use(undefined, async (error: unknown) => {
    const apiError = toApiError(error);
    const config = axios.isAxiosError(apiError.cause) ? apiError.cause.config : undefined;

    if (apiError.status !== StatusCodes.UNAUTHORIZED || !config || config.skipAuthRefresh) throw apiError;

    if (config._isRetry || !authConfig.refreshPath) {
      sessionExpiredHandler();
      throw apiError;
    }

    try {
      await refreshSessionOnce(instance);
    } catch {
      throw apiError;
    }

    return instance({ ...config, _isRetry: true });
  });
}
