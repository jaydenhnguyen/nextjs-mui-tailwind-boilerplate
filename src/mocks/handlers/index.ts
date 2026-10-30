import type { AnyHandler } from 'msw';
import { authHandlers } from './auth.handlers';
import { usersHandlers } from './users.handlers';

export const handlers: AnyHandler[] = [...authHandlers, ...usersHandlers];
