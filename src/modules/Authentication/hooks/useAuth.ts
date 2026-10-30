import { StatusCodes } from 'http-status-codes';
import { useCurrentUser } from './useCurrentUser';

export function useAuth() {
  const query = useCurrentUser();
  const user = query.data ?? null;

  return {
    user,
    isAuthenticated: !!user,
    isChecking: query.isPending,
    // A network or server failure while checking, as opposed to simply not being signed in.
    sessionError: query.isError && query.error.status !== StatusCodes.UNAUTHORIZED ? query.error : null,
    retry: query.refetch,
  };
}
