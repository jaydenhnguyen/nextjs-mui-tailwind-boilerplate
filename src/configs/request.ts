import axios, { AxiosRequestConfig } from 'axios';
import camelcaseKeys from 'camelcase-keys';
import isPlainObject from 'lodash/isPlainObject';
import { toApiError } from 'src/shared/utils/apiError';
import { apiConfig } from './api.config';
import { setupAuthInterceptors } from './auth';

const toCamelCase = (data: unknown) =>
  apiConfig.camelCaseResponse && (isPlainObject(data) || Array.isArray(data))
    ? camelcaseKeys(data as Record<string, unknown>, { deep: true })
    : data;

export const request = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  headers: { Accept: 'application/json' },
  // Arrays go out as ids[]=1&ids[]=2. Use { indexes: null } for ids=1&ids=2 if the backend expects that.
  paramsSerializer: { indexes: false },
});

request.interceptors.response.use(
  (response) => (response.config.responseType === 'blob' ? response.data : toCamelCase(response.data)),
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response) error.response.data = toCamelCase(error.response.data);
    throw toApiError(error);
  },
);

setupAuthInterceptors(request);

export const http = {
  get: <T>(url: string, config?: AxiosRequestConfig) => request.get<T, T>(url, config),
  delete: <T = void>(url: string, config?: AxiosRequestConfig) => request.delete<T, T>(url, config),
  post: <T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig) =>
    request.post<T, T, B>(url, body, config),
  put: <T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig) => request.put<T, T, B>(url, body, config),
  patch: <T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig) =>
    request.patch<T, T, B>(url, body, config),
};
