import { ReactElement } from 'react';
import { CssBaseline, createTheme, ThemeProvider } from '@mui/material';
import { base as baseTheme } from 'src/theme/core/base';

type Props = {
  children: ReactElement;
};

export function AppThemeProvider({ children }: Props) {
  const appTheme = createTheme(baseTheme);

  return (
    <ThemeProvider disableTransitionOnChange theme={appTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
