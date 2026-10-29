import * as React from 'react';
import { ROLES } from 'src/shared/enums';
import { Permission, ROLE_PERMISSIONS } from '../constants';
import { useAuth } from './useAuth';

export function usePermission() {
  const { user } = useAuth();

  const hasRole = React.useCallback(
    (roles: ROLES | ROLES[]) => {
      const wanted = Array.isArray(roles) ? roles : [roles];
      return !!user && user.roles.some((role) => wanted.includes(role));
    },
    [user],
  );

  const can = React.useCallback(
    (permission: Permission) => {
      if (!user) return false;
      if (user.permissions) return user.permissions.includes(permission);
      return user.roles.some((role) => ROLE_PERMISSIONS[role].includes(permission));
    },
    [user],
  );

  return { can, hasRole };
}
