import { DefaultError, QueryKey, useQuery, UseQueryOptions } from '@tanstack/react-query';

export function useAppQuery<TQueryFnData, TData = TQueryFnData, TQueryKey extends QueryKey = QueryKey>(
  options: UseQueryOptions<TQueryFnData, DefaultError, TData, TQueryKey>,
) {
  return useQuery(options);
}
