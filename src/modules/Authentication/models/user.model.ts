import { ROLES } from 'src/shared/enums';

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  roles: ROLES[];
  // Leave out if the backend only sends roles; permissions then come from ROLE_PERMISSIONS.
  permissions?: string[];
};
