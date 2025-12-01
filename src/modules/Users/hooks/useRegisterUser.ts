import { useMutation } from '@tanstack/react-query';
import { registerUser } from 'src/apis/users';
import { ErrorResponse } from 'src/shared/models';
import { notify, ToastType } from 'src/components';
import { RegisterUserRequest } from '../models';

export function useRegisterUser(onSuccess?: () => void) {
  const { mutate, status, error, isPending } = useMutation({
    mutationFn: (data: Omit<RegisterUserRequest, 'confirmPassword'>) => registerUser(data),
    onSuccess: () => {
      notify({ message: 'Create User Success', type: ToastType.success });
      return onSuccess?.();
    },
    onError: (error: ErrorResponse) => {
      console.log(error);
      if (error.statusCode === 409 || error.statusCode === 400) {
        return notify({ message: error.message, type: ToastType.error });
      }
      return notify({ message: 'Fail to create user', type: ToastType.error });
    },
  });

  return { mutate, status, error, isLoading: isPending };
}
