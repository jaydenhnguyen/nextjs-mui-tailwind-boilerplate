import { useQuery } from '@tanstack/react-query';
import { getUserDetail } from 'src/apis/users';

export function useGetUserDetail(userId: string) {
  const { data, status, error, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['getUserDetail', userId],
    queryFn: () => getUserDetail(userId),
    enabled: false,
  });

  return { data: data?.data, status, error, isLoading, isFetching, refetch };
}
