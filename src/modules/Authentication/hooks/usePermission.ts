import * as React from 'react';
import { ROLES } from 'src/shared/enums';
import { Permission } from '../constants';
import { hasPermission } from '../utils/permission';
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

  const can = React.useCallback((permission: Permission) => !!user && hasPermission(user, permission), [user]);

  return { can, hasRole };
}
