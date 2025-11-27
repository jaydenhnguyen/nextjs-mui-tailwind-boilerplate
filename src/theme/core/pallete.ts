import { ColorSystemOptions } from '@mui/material/styles';
import { themeConfig } from './_config';
import { ThemeColorScheme } from 'src/theme/types';

export const palette: Partial<Record<ThemeColorScheme, ColorSystemOptions['palette']>> = {
  light: {
    ...themeConfig.palette,
    text: themeConfig.darkText,
    background: {
      paper: '#FFFFFF',
      default: '#FFFFFF',
    },
    action: {
      active: themeConfig.palette.primary.main,
      disabled: '#FFFFFF',
      disabledBackground: themeConfig.palette.grey['500'],
    },
  },
};
