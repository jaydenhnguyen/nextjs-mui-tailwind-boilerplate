import { z } from 'zod';
import { loginSchema } from '../schema/login.schema';
import { User } from './user.model';

export type LoginRequest = z.output<typeof loginSchema>;

// With the `cookie` auth strategy the backend sets httpOnly cookies instead of returning tokens.
export type LoginResponse = {
  accessToken?: string;
  refreshToken?: string;
  user?: User;
};
