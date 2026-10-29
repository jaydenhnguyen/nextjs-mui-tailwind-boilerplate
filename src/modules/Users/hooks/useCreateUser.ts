import { useQueryClient } from '@tanstack/react-query';
import { createUser } from 'src/apis/users';
import { useAppMutation } from 'src/hooks';
import { USER_QUERY_KEYS } from '../constants';
import { CreateUserRequest } from '../models';

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: (payload: CreateUserRequest) => createUser(payload),
    meta: { successMessage: 'User created', silent: true },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEYS.GET_USER_LIST] }),
  });
}
