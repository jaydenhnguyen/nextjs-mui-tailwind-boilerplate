import { QueryClient } from '@tanstack/react-query';
import { tokenManager } from 'src/configs/auth';
import { AUTH_QUERY_KEYS } from '../constants';

// The current user is set to null rather than removed, so guards watching it react and redirect right away.
// Everything else is dropped so the next person to sign in never sees the previous user's data.
export function clearSession(queryClient: QueryClient) {
  tokenManager.removeAllCredentials();
  queryClient.setQueryData(AUTH_QUERY_KEYS.CURRENT_USER, null);
  queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== AUTH_QUERY_KEYS.CURRENT_USER[0] });
}

// Only same-site paths, so a crafted ?redirect=https://evil.com link can't send users elsewhere after login.
export function getSafeRedirect(value: unknown, fallback: string): string {
  const path = Array.isArray(value) ? value[0] : value;
  if (typeof path !== 'string' || !path.startsWith('/') || path.startsWith('//') || path.startsWith('/\\')) {
    return fallback;
  }
  return path;
}
