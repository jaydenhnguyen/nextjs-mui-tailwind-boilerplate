export type AuthStrategy = 'bearer' | 'cookie';

export const authConfig = {
  strategy: 'bearer' as AuthStrategy,
  refreshPath: '/auth/refresh' as string | null,
};
