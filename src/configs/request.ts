import qs from 'qs';
import isNil from 'lodash/isNil';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import camelcaseKeys from 'camelcase-keys';
import { StatusCodes } from 'http-status-codes';
import { envVariables } from './environment';
import { tokenManager } from './tokensManager';

export const request = axios.create({
  timeout: 10000,
  baseURL: envVariables.BASE_API_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'X-Requested-With': 'XMLHttpRequest',
  },
  paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'brackets' }),
});

function backToLogin() {
  tokenManager.removeAllCredentials();
  // window.location.href = APP_ROUTES.LOGIN;
}

request.interceptors.request.use((config) => {
    const accessToken = tokenManager.getAccessToken();

    if (!isNil(accessToken)) config.headers.Authorization = `Bearer ${accessToken}`;

    return config;
  },
);


let isRefreshingAccessToken = false;
let queue: ((token: string) => void)[] = [];

function subscribe(cb: (token: string) => void) {
  queue.push(cb);
}

function flushQueue(token: string) {
  queue.forEach((cb) => cb(token));
  queue = [];
}

async function refreshTokenFlow(refreshToken: string, originalRequest: InternalAxiosRequestConfig) {
  // If already refreshing, add this request to queue
  if (isRefreshingAccessToken) {
    return new Promise((resolve) => {
      subscribe((newToken) => {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        resolve(request(originalRequest));
      });
    });
  }

  try {
    isRefreshingAccessToken = true;

    const response = await axios.post(`${envVariables.BASE_API_URL}/auth/refresh`, {
      refreshToken,
    });

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

    tokenManager.storeTokens({ accessToken: newAccessToken, refreshToken: newRefreshToken });

    return { newAccessToken, newRefreshToken };
  } catch (e) {
    throw e;
  } finally {
    isRefreshingAccessToken = false;
  }
}

request.interceptors.response.use(
  (response) => camelcaseKeys(response.data),

  async (error: AxiosError) => {
    const originalRequest = error.config;

    const errorResponse = error.response as {
      status: number;
      data: {
        code: string;
        message: string;
      };
    };
    const status = errorResponse?.status;

    if (status !== StatusCodes.UNAUTHORIZED) {
      return Promise.reject(error.response?.data);
    }

    const refreshToken = tokenManager.getRefreshToken();

    // If no refresh token → force logout
    if (isNil(refreshToken) || isNil(originalRequest)) {
      backToLogin();
      return Promise.reject(error.response?.data);
    }

    try {
      const { newAccessToken } = await refreshTokenFlow(refreshToken, originalRequest) as {
        newAccessToken: string,
        newRefreshToken: string
      };

      flushQueue(newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return request(originalRequest);
    } catch (err) {
      tokenManager.removeAllCredentials();
      return Promise.reject(error.response?.data);
    }
  },
);
