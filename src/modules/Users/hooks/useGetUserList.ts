import { useQuery } from '@tanstack/react-query';
import { getUserList } from 'src/apis/users';
import { GetUserListRequest } from '../models';

export function useGetUserList({ payload }: { payload: GetUserListRequest }) {
  const { data, status, error, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['getUserList', payload],
    queryFn: () => getUserList(payload),
  });

  return { data, status, error, isLoading, isFetching, refetch };
}
