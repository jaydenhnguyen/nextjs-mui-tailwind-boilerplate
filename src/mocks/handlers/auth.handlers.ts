import { delay, http, HttpResponse } from 'msw';
import { db, MOCK_PASSWORD } from '../db';
import { apiUrl, getRequestUser, getUserFromRefreshToken, issueTokens, unauthorized } from '../session';

type LoginBody = { email?: string; password?: string };

export const authHandlers = [
  http.post(apiUrl('/auth/login'), async ({ request }) => {
    await delay();
    const { email, password } = (await request.json()) as LoginBody;

    const user = db.users.find((item) => item.email === email?.toLowerCase());
    if (!user || password !== MOCK_PASSWORD) {
      return HttpResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    return HttpResponse.json({ ...issueTokens(user.id), user });
  }),

  http.get(apiUrl('/auth/me'), async ({ request }) => {
    await delay();
    const user = getRequestUser(request);
    return user ? HttpResponse.json(user) : unauthorized();
  }),

  http.post(apiUrl('/auth/refresh'), async ({ request }) => {
    await delay();
    const { refreshToken } = (await request.json()) as { refreshToken?: string };
    const user = getUserFromRefreshToken(refreshToken);
    return user ? HttpResponse.json(issueTokens(user.id)) : unauthorized();
  }),

  http.post(apiUrl('/auth/logout'), async () => {
    await delay();
    return new HttpResponse(null, { status: 204 });
  }),
];
