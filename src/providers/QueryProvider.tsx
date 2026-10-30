import * as React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createQueryClient } from 'src/configs/queryClient';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // One client per app instance; creating it in render would reset the cache on every re-render.
  const [queryClient] = React.useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
