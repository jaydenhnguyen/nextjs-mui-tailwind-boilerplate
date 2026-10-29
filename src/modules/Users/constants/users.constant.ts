import { FieldOption } from 'src/components/Form';
import { ROLES } from 'src/shared/enums';

export const USER_QUERY_KEYS = {
  GET_USER_LIST: 'getUserList',
} as const;

export const USER_LIST_PAGE_SIZE = 10;

export const ROLE_LABELS: Record<ROLES, string> = {
  [ROLES.SUPER_ADMIN]: 'Super admin',
  [ROLES.ADMIN]: 'Admin',
  [ROLES.EMPLOYEE]: 'Employee',
};

export const ROLE_OPTIONS: FieldOption<ROLES>[] = Object.values(ROLES).map((role) => ({
  label: ROLE_LABELS[role],
  value: role,
}));
