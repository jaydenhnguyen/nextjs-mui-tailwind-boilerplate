import * as React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { QueryClientProvider, QueryErrorResetBoundary } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createQueryClient } from 'src/configs';
import { AppThemeProvider } from 'src/theme';
import { AppToaster } from 'src/components/AppToaster';
import { ConfirmProvider } from 'src/components/ConfirmDialog';
import { ErrorFallback } from 'src/components/ErrorFallback';
import { MotionProvider } from 'src/components/Motion';
import { SessionWatcher } from 'src/modules/Authentication';

type Props = {
  children: React.ReactNode;
};

export function AppProviders({ children }: Props) {
  const [queryClient] = React.useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <SessionWatcher />
      <AppThemeProvider>
        <MotionProvider>
          <ConfirmProvider>
            <QueryErrorResetBoundary>
              {({ reset }) => (
                <ErrorBoundary FallbackComponent={ErrorFallback} onReset={reset}>
                  {children}
                </ErrorBoundary>
              )}
            </QueryErrorResetBoundary>
          </ConfirmProvider>
          <AppToaster />
        </MotionProvider>
      </AppThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
