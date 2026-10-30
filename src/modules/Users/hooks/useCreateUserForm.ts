import { useZodForm } from 'src/components/Form';
import { ROLES } from 'src/shared/enums';
import { CreateUserFormValues } from '../models';
import { createUserSchema } from '../schema/create-user.schema';

export const initialCreateUserValues: CreateUserFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  role: ROLES.EMPLOYEE,
};

export function useCreateUserForm() {
  return useZodForm(createUserSchema, { defaultValues: initialCreateUserValues });
}
