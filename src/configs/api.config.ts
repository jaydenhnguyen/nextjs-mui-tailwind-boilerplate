import { env } from './env';

export type AuthStrategy = 'bearer' | 'cookie';

export const apiConfig = {
  baseURL: env.API_URL,
  timeout: 15_000,
  authStrategy: 'bearer' as AuthStrategy,
  refreshPath: '/auth/refresh' as string | null,
  camelCaseResponse: true,
};
