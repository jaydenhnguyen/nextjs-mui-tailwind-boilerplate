import { QueryClient } from '@tanstack/react-query';

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        refetchOnReconnect: 'always',
        retry: 0,
        staleTime: 0,
        gcTime: 0,
      },
    },
  });
}
