import * as React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { ConfirmProvider } from 'src/components/ConfirmDialog';
import { MotionProvider } from 'src/components/Motion';
import { createQueryClient } from 'src/configs/queryClient';
import { theme } from 'src/theme/theme';

// The app's providers minus fonts and devtools. A fresh query client per render keeps cached data out of other tests.
export function renderWithProviders(ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  const queryClient = createQueryClient();
  const defaults = queryClient.getDefaultOptions();
  // Retries would make error tests wait for the backoff.
  queryClient.setDefaultOptions({ ...defaults, queries: { ...defaults.queries, retry: false } });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <MotionProvider>
          <ConfirmProvider>{children}</ConfirmProvider>
        </MotionProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );

  return { user: userEvent.setup(), queryClient, ...render(ui, { wrapper, ...options }) };
}
