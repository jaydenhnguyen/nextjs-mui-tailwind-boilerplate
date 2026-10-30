import { z } from 'zod';
import { ROLES } from 'src/shared/enums';
import { PaginatedResponse, PaginationRequest } from 'src/shared/types';
import { User } from 'src/shared/types/user.type';
import { createUserSchema } from '../schema/create-user.schema';

export type { User };

export type GetUserListRequest = PaginationRequest & {
  search?: string;
};

export type GetUserListResponse = PaginatedResponse<User>;

export type CreateUserFormValues = z.input<typeof createUserSchema>;

// The form picks one role, but the API takes a list.
export type CreateUserRequest = Omit<z.output<typeof createUserSchema>, 'role'> & {
  roles: ROLES[];
};
