import { delay, http, HttpResponse } from 'msw';
import { PERMISSIONS } from 'src/modules/Authentication/constants';
import { hasPermission } from 'src/modules/Authentication/utils/permission';
import { ROLES } from 'src/shared/enums';
import { db } from '../db';
import { apiUrl, forbidden, getRequestUser, unauthorized } from '../session';

type CreateUserBody = { firstName?: string; lastName?: string; email?: string; roles?: ROLES[] };

export const usersHandlers = [
  http.get(apiUrl('/users'), async ({ request }) => {
    await delay();
    const user = getRequestUser(request);
    if (!user) return unauthorized();
    if (!hasPermission(user, PERMISSIONS.USERS_READ)) return forbidden();

    const params = new URL(request.url).searchParams;
    const search = (params.get('search') ?? '').trim().toLowerCase();
    const page = Math.max(1, Number(params.get('page')) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(params.get('pageSize')) || 10));

    // Lets you see the error state without breaking anything: search for "!error".
    if (search === '!error') return HttpResponse.json({ message: 'Database exploded' }, { status: 500 });

    const matches = db.users
      .filter((item) => `${item.firstName} ${item.lastName} ${item.email}`.toLowerCase().includes(search))
      .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));

    return HttpResponse.json({
      data: matches.slice((page - 1) * pageSize, page * pageSize),
      total: matches.length,
    });
  }),

  http.post(apiUrl('/users'), async ({ request }) => {
    await delay();
    const user = getRequestUser(request);
    if (!user) return unauthorized();
    if (!hasPermission(user, PERMISSIONS.USERS_WRITE)) return forbidden();

    const body = (await request.json()) as CreateUserBody;
    const email = body.email?.trim().toLowerCase() ?? '';

    const errors: Record<string, string> = {};
    if (!body.firstName?.trim()) errors['firstName'] = 'First name is required';
    if (!body.lastName?.trim()) errors['lastName'] = 'Last name is required';
    if (!email) errors['email'] = 'Email is required';
    else if (db.users.some((item) => item.email === email)) errors['email'] = 'This email is already in use';

    if (Object.keys(errors).length > 0) {
      return HttpResponse.json({ message: 'Please fix the highlighted fields', errors }, { status: 422 });
    }

    const created = {
      id: `u${Date.now()}`,
      firstName: body.firstName?.trim() ?? '',
      lastName: body.lastName?.trim() ?? '',
      email,
      roles: body.roles?.length ? body.roles : [ROLES.EMPLOYEE],
      createdAt: new Date().toISOString(),
    };
    db.users.push(created);

    return HttpResponse.json(created, { status: 201 });
  }),

  http.delete(apiUrl('/users/:id'), async ({ request, params }) => {
    await delay();
    const user = getRequestUser(request);
    if (!user) return unauthorized();
    if (!hasPermission(user, PERMISSIONS.USERS_WRITE)) return forbidden();

    if (params['id'] === user.id) {
      return HttpResponse.json({ message: "You can't delete your own account" }, { status: 409 });
    }

    const index = db.users.findIndex((item) => item.id === params['id']);
    if (index === -1) return HttpResponse.json({ message: 'User not found' }, { status: 404 });

    db.users.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
