import * as React from 'react';
import { ROLES } from 'src/shared/enums';
import { Permission } from '../../constants';
import { usePermission } from '../../hooks/usePermission';

type Props = {
  permission?: Permission;
  role?: ROLES | ROLES[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
};

export function Can({ permission, role, fallback = null, children }: Props) {
  const { can, hasRole } = usePermission();

  const isAllowed = (!permission || can(permission)) && (!role || hasRole(role));

  return <>{isAllowed ? children : fallback}</>;
}
