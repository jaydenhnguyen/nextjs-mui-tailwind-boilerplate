import { Role } from './role-permission.model';

export type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
};

export type GetMeResponse = {
  data: User;
};
