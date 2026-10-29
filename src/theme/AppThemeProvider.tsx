import { ReactNode } from 'react';
import { CssBaseline, GlobalStyles, ThemeProvider } from '@mui/material';
import { FONT_VARIABLES } from './fonts';
import { DEFAULT_THEME_MODE, theme } from './theme';

// Style priority from low to high: our global resets, then MUI, then anything not in a layer (Tailwind, SCSS modules).
// It has to be the very first style on the page, which is why it sits above CssBaseline.
const CSS_LAYER_ORDER = '@layer reset, mui;';

type Props = {
  children: ReactNode;
};

export function AppThemeProvider({ children }: Props) {
  return (
    <ThemeProvider theme={theme} defaultMode={DEFAULT_THEME_MODE} disableTransitionOnChange>
      <GlobalStyles styles={CSS_LAYER_ORDER} />
      <CssBaseline enableColorScheme />
      <GlobalStyles styles={{ ':root': FONT_VARIABLES }} />
      {children}
    </ThemeProvider>
  );
}
