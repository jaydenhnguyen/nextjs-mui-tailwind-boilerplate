import { ROLES } from 'src/shared/enums';

export const AUTH_QUERY_KEYS = {
  CURRENT_USER: ['currentUser'],
} as const;

export const PERMISSIONS = {
  USERS_READ: 'users:read',
  USERS_WRITE: 'users:write',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ROLE_PERMISSIONS: Record<ROLES, Permission[]> = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
  [ROLES.EMPLOYEE]: [PERMISSIONS.USERS_READ],
};
