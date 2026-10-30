import { getCurrentUser } from 'src/apis/auth';
import { authConfig, tokenManager } from 'src/configs/auth';
import { useAppQuery } from 'src/hooks/useAppQuery';
import { AUTH_QUERY_KEYS } from '../constants';
import { User } from '../models';

export function useCurrentUser() {
  return useAppQuery<User | null>({
    queryKey: AUTH_QUERY_KEYS.CURRENT_USER,
    queryFn: ({ signal }) => {
      // With bearer tokens there's no point asking the server when there's nothing to send.
      if (authConfig.strategy === 'bearer' && !tokenManager.isAuthenticated()) return null;
      return getCurrentUser(signal);
    },
    staleTime: 5 * 60 * 1000,
    meta: { silent: true },
  });
}
