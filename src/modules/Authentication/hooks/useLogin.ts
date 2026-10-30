import { useQueryClient } from '@tanstack/react-query';
import { login } from 'src/apis/auth';
import { apiConfig } from 'src/configs/api.config';
import { tokenManager } from 'src/configs/tokenManager';
import { useAppMutation } from 'src/hooks/useAppMutation';
import { AUTH_QUERY_KEYS } from '../constants';
import { LoginRequest } from '../models';
import { clearSession } from '../utils/session';

export function useLogin() {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: (payload: LoginRequest) => login(payload),
    meta: { silent: true },
    onSuccess: async ({ accessToken, refreshToken, user }) => {
      clearSession(queryClient);
      if (apiConfig.authStrategy === 'bearer' && accessToken) tokenManager.storeTokens({ accessToken, refreshToken });

      if (user) queryClient.setQueryData(AUTH_QUERY_KEYS.CURRENT_USER, user);
      else await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.CURRENT_USER });
    },
  });
}
