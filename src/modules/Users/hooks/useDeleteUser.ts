import { useQueryClient } from '@tanstack/react-query';
import { deleteUser } from 'src/apis/users';
import { useAppMutation } from 'src/hooks';
import { USER_QUERY_KEYS } from '../constants';

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: (id: string) => deleteUser(id),
    meta: { successMessage: 'User deleted' },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEYS.GET_USER_LIST] }),
  });
}
