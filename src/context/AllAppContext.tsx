import * as React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export type Props = {
  children: React.ReactNode;
};

export function AllAppContexts({ children }: Props) {
  const queryClientRef = React.useRef<QueryClient | null>(null);

  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient({
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
  return (
    <QueryClientProvider client={queryClientRef.current}>
      <ErrorBoundary FallbackComponent={() => <p>Some errors happened</p>}>{children}</ErrorBoundary>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
