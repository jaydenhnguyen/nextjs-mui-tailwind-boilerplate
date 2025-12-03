import { palette } from './pallete';
import { themeConfig } from './_config';
import { typography } from './typography';
import { ThemeOptions } from 'src/theme/types';

export const base: ThemeOptions = {
  colorSchemes: {
    light: { palette: palette.light },
  },
  typography,
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: 0,
          '&.Mui-disabled': {
            color: themeConfig.darkText.disabled, // Light mode
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          padding: 0,
          '&.Mui-disabled': {
            color: themeConfig.darkText.disabled, // Light mode
          },
        },
      },
    },
  },
};
