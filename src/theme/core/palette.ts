import { ColorSystemOptions } from '@mui/material/styles';
import { themeConfig } from './_config';

type Scheme = 'light' | 'dark';

function buildPalette(scheme: Scheme): ColorSystemOptions['palette'] {
  const tokens = themeConfig[scheme];

  return {
    mode: scheme,
    ...themeConfig.brand,
    grey: themeConfig.grey,
    common: themeConfig.common,
    background: tokens.background,
    text: tokens.text,
    divider: tokens.divider,
  };
}

export const colorSchemes = {
  light: { palette: buildPalette('light') },
  dark: { palette: buildPalette('dark') },
};
