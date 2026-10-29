import qs from 'qs';
import isPlainObject from 'lodash/isPlainObject';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import camelcaseKeys from 'camelcase-keys';
import { StatusCodes } from 'http-status-codes';
import { toApiError } from 'src/shared/utils/apiError';
import { apiConfig } from './api.config';
import { tokenManager } from './tokenManager';

const toCamelCase = (data: unknown) =>
  apiConfig.camelCaseResponse && (isPlainObject(data) || Array.isArray(data))
    ? camelcaseKeys(data as Record<string, unknown>, { deep: true })
    : data;

export const request = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  withCredentials: apiConfig.authStrategy === 'cookie',
  headers: { Accept: 'application/json' },
  paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'brackets' }),
});

let sessionExpiredHandler = () => tokenManager.removeAllCredentials();

export function onSessionExpired(handler: () => void) {
  sessionExpiredHandler = handler;
}

let refreshPromise: Promise<void> | null = null;

async function refreshSession() {
  if (!apiConfig.refreshPath) throw new Error('No refresh endpoint configured');

  if (apiConfig.authStrategy === 'cookie') {
    await axios.post(apiConfig.refreshPath, undefined, { baseURL: apiConfig.baseURL, withCredentials: true });
    return;
  }

  const refreshToken = tokenManager.getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token');

  const response = await axios.post(apiConfig.refreshPath, { refreshToken }, { baseURL: apiConfig.baseURL });
  const tokens = toCamelCase(response.data) as { accessToken: string; refreshToken?: string };
  tokenManager.storeTokens(tokens);
}

// Parallel 401s share one refresh call, so the session-expired handler also runs only once.
function refreshSessionOnce() {
  refreshPromise ??= refreshSession()
    .catch((error: unknown) => {
      sessionExpiredHandler();
      throw error;
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

request.interceptors.request.use((config) => {
  if (apiConfig.authStrategy === 'bearer') {
    const accessToken = tokenManager.getAccessToken();
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

request.interceptors.response.use(
  (response) => (response.config.responseType === 'blob' ? response.data : toCamelCase(response.data)),

  async (error: AxiosError) => {
    if (error.response) error.response.data = toCamelCase(error.response.data);

    const config = error.config;
    const isUnauthorized = error.response?.status === StatusCodes.UNAUTHORIZED;

    if (!isUnauthorized || !config || config.skipAuthRefresh) throw toApiError(error);

    if (config._isRetry || !apiConfig.refreshPath) {
      sessionExpiredHandler();
      throw toApiError(error);
    }

    try {
      await refreshSessionOnce();
    } catch {
      throw toApiError(error);
    }

    return request({ ...config, _isRetry: true });
  },
);

export const http = {
  get: <T>(url: string, config?: AxiosRequestConfig) => request.get<T, T>(url, config),
  delete: <T = void>(url: string, config?: AxiosRequestConfig) => request.delete<T, T>(url, config),
  post: <T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig) =>
    request.post<T, T, B>(url, body, config),
  put: <T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig) => request.put<T, T, B>(url, body, config),
  patch: <T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig) =>
    request.patch<T, T, B>(url, body, config),
};
