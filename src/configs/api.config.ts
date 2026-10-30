import { env } from './env';

export const apiConfig = {
  baseURL: env.API_URL,
  timeout: 15_000,
  camelCaseResponse: true,
};
