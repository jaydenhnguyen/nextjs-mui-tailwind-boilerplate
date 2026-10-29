import * as React from 'react';
import { ToastContainer } from 'react-toastify';
import { ErrorBoundary } from 'react-error-boundary';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createQueryClient } from 'src/configs';
import { AppThemeProvider } from 'src/theme';
import { UserContextProvider } from 'src/context';

type Props = {
  children: React.ReactNode;
};

export function AppProviders({ children }: Props) {
  const [queryClient] = React.useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <AppThemeProvider>
        <ErrorBoundary FallbackComponent={() => <p>Some errors happened</p>}>
          <UserContextProvider>{children}</UserContextProvider>
        </ErrorBoundary>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar
          newestOnTop
          closeOnClick
          pauseOnFocusLoss
          pauseOnHover
        />
      </AppThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
