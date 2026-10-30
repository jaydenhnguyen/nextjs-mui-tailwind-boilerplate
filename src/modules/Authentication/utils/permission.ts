import { User } from 'src/shared/types';
import { Permission, ROLE_PERMISSIONS } from '../constants';

export function hasPermission(user: User, permission: Permission) {
  if (user.permissions) return user.permissions.includes(permission);
  return user.roles.some((role) => ROLE_PERMISSIONS[role].includes(permission));
}
