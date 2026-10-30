import { useRouter } from 'next/router';
import { useQueryClient } from '@tanstack/react-query';
import { logout } from 'src/apis/auth';
import { useAppMutation } from 'src/hooks/useAppMutation';
import { APP_ROUTES } from 'src/shared/constants';
import { clearSession } from '../utils/session';

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useAppMutation({
    // The local session ends even if the server call fails, so a dead network can't trap someone signed in.
    mutationFn: () => logout().catch(() => undefined),
    meta: { silent: true },
    onSettled: async () => {
      clearSession(queryClient);
      await router.replace(APP_ROUTES.LOGIN);
    },
  });
}
