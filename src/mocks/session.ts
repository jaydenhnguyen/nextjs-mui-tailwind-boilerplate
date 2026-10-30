import { HttpResponse } from 'msw';
import { User } from 'src/shared/types';
import { db } from './db';

// Short on purpose, so the refresh-token flow actually runs while you click around.
const ACCESS_TOKEN_LIFETIME_MS = 5 * 60 * 1000;

export const issueTokens = (userId: string) => ({
  accessToken: `mock-access.${userId}.${Date.now()}`,
  refreshToken: `mock-refresh.${userId}`,
});

export function getUserFromRefreshToken(token: unknown): User | null {
  const match = typeof token === 'string' ? /^mock-refresh\.(.+)$/.exec(token) : null;
  return db.users.find((user) => user.id === match?.[1]) ?? null;
}

export function getRequestUser(request: Request): User | null {
  const match = /^Bearer mock-access\.(.+)\.(\d+)$/.exec(request.headers.get('Authorization') ?? '');
  if (!match || Date.now() - Number(match[2]) > ACCESS_TOKEN_LIFETIME_MS) return null;
  return db.users.find((user) => user.id === match[1]) ?? null;
}

export const unauthorized = () => HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });

export const forbidden = () => HttpResponse.json({ message: "You don't have permission to do that" }, { status: 403 });
