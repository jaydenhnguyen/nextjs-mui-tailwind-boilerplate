import { z } from 'zod';
import { ROLES } from 'src/shared/enums';

export const createUserSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  email: z.email(),
  role: z.enum(ROLES),
});
