import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getCurrentUser } from 'src/apis/auth';
import { apiUrl } from 'src/mocks/apiUrl';
import { issueTokens } from 'src/mocks/session';
import { server, signInAs } from 'src/test';
import { onSessionExpired } from './interceptors';
import { tokenManager } from './tokenManager';

// An access token the mock API treats as expired, next to a refresh token that still works.
const storeExpiredSession = () =>
  tokenManager.storeTokens({ accessToken: 'mock-access.u1.0', refreshToken: 'mock-refresh.u1' });

describe('auth interceptors', () => {
  afterEach(() => onSessionExpired(() => tokenManager.removeAllCredentials()));

  it('sends the access token', async () => {
    const user = signInAs();

    await expect(getCurrentUser()).resolves.toMatchObject({ id: user.id });
  });

  it('refreshes an expired token once for parallel requests, then retries them', async () => {
    storeExpiredSession();
    let refreshCalls = 0;
    server.use(
      http.post(apiUrl('/auth/refresh'), () => {
        refreshCalls += 1;
        return HttpResponse.json(issueTokens('u1'));
      }),
    );

    const users = await Promise.all([getCurrentUser(), getCurrentUser()]);

    expect(users.map((user) => user.id)).toEqual(['u1', 'u1']);
    expect(refreshCalls).toBe(1);
    expect(tokenManager.getAccessToken()).not.toBe('mock-access.u1.0');
  });

  it('ends the session once when the refresh fails', async () => {
    storeExpiredSession();
    const sessionExpired = vi.fn();
    onSessionExpired(sessionExpired);
    server.use(http.post(apiUrl('/auth/refresh'), () => HttpResponse.json({}, { status: 401 })));

    const results = await Promise.allSettled([getCurrentUser(), getCurrentUser()]);

    expect(results.map((result) => result.status)).toEqual(['rejected', 'rejected']);
    expect(results[0]).toMatchObject({ reason: { status: 401 } });
    expect(sessionExpired).toHaveBeenCalledTimes(1);
  });
});
