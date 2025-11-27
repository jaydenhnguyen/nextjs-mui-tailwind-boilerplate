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
        outlined: {
          '&.Mui-disabled': {
            color: themeConfig.palette.grey['500'],
          },
        },
      },
    },
  },
};
