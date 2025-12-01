import { useQuery } from '@tanstack/react-query';
import { getMe } from 'src/apis/users';

export function useGetCurrentUserInfo() {
  const { data, status, error, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['getCurrentUserInfo'],
    queryFn: () => getMe(),
    enabled: false,
  });

  return { data, status, error, isLoading, isFetching, refetch };
}
