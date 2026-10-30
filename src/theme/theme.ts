import { createTheme } from '@mui/material/styles';
import { components } from './components';
import { themeConfig } from './core/_config';
import { BREAKPOINTS } from './core/breakpoints';
import { colorSchemes } from './core/palette';
import { typography } from './core/typography';

export const DEFAULT_THEME_MODE = 'system';

export const theme = createTheme({
  cssVariables: { colorSchemeSelector: 'class' },
  colorSchemes,
  breakpoints: { values: BREAKPOINTS },
  typography,
  shape: { borderRadius: themeConfig.borderRadius },
  components,
});
