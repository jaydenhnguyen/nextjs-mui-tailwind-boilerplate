import { keepPreviousData } from '@tanstack/react-query';
import { getUserList } from 'src/apis/users';
import { useAppQuery } from 'src/hooks';
import { USER_QUERY_KEYS } from '../constants';
import { GetUserListRequest } from '../models';

export function useGetUserList(params: GetUserListRequest, { enabled = true }: { enabled?: boolean } = {}) {
  return useAppQuery({
    queryKey: [USER_QUERY_KEYS.GET_USER_LIST, params],
    queryFn: ({ signal }) => getUserList(params, signal),
    // Keeps the current page on screen while the next one loads, instead of flashing a spinner.
    placeholderData: keepPreviousData,
    enabled,
  });
}
