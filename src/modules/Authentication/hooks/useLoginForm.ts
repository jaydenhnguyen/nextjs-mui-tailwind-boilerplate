import { useZodForm } from 'src/components/Form';
import { loginSchema } from '../schema/login.schema';

export function useLoginForm() {
  return useZodForm(loginSchema, {
    defaultValues: { email: '', password: '' },
  });
}
