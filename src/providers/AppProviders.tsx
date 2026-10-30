import * as React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { AppToaster } from 'src/components/AppToaster';
import { ConfirmProvider } from 'src/components/ConfirmDialog';
import { ErrorFallback } from 'src/components/ErrorFallback';
import { MotionProvider } from 'src/components/Motion';
import { SessionWatcher } from 'src/modules/Authentication';
import { reportError } from 'src/shared/utils/telemetry';
import { AppThemeProvider } from 'src/theme';
import { QueryProvider } from './QueryProvider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <SessionWatcher />
      <AppThemeProvider>
        <MotionProvider>
          <ConfirmProvider>
            <ErrorBoundary
              FallbackComponent={ErrorFallback}
              onError={(error, info) => reportError(error, { componentStack: info.componentStack })}
            >
              {children}
            </ErrorBoundary>
          </ConfirmProvider>
          <AppToaster />
        </MotionProvider>
      </AppThemeProvider>
    </QueryProvider>
  );
}
