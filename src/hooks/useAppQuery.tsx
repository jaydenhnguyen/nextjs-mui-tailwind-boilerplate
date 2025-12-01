import { AxiosError } from 'axios';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

type AppQueryOptions<TData, TError = AxiosError> =
  Omit<UseQueryOptions<TData, TError, TData, readonly unknown[]>, 'queryKey' | 'queryFn'>

/**
 * App-wide wrapper for Tans-tack React Query useQuery
 * Provides default staleTime, retry, and global error handling
 *
 * @param queryKey - query key (string or array)
 * @param queryFn - async function returning data
 * @param options - optional overrides
 */
export function useAppQuery<TData, TError = AxiosError>(
  queryKey: string | readonly unknown[],
  queryFn: () => Promise<TData>,
  options?: AppQueryOptions<TData, TError>,
) {
  return useQuery<TData, TError, TData, readonly unknown[]>({
    queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
    queryFn,
    staleTime: 1000 * 60 * 5,
    retry: 1,
    ...options,
  });
}
