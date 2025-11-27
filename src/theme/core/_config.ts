import { PaletteColor, CommonColors } from '@mui/material';

type ThemeConfig = {
  fontFamily: Record<'primary' | 'secondary', string>;
  palette: Record<
    'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error',
    PaletteColor & { lighter: string; darker: string }
  > & {
    common: Pick<CommonColors, 'black' | 'white'>;
    grey: Record<'50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900', string>;
  };
  darkText: Record<'primary' | 'secondary' | 'disabled', string>;
};

export const themeConfig: ThemeConfig = {
  fontFamily: {
    primary: 'DM Sans Variable',
    secondary: 'Barlow',
  },
  palette: {
    primary: {
      lighter: '#E0E7FE',
      light: '#95ACFD',
      main: '#315EFB',
      dark: '#042EC2',
      darker: '#021C77',
      contrastText: '#FFFFFF',
    },
    secondary: {
      lighter: '#FFD6C2',
      light: '#FF9966',
      main: '#FF6633',
      dark: '#CC5229',
      darker: '#993D1F',
      contrastText: '#FFFFFF',
    },
    info: {
      lighter: '#EBDCF2',
      light: '#B580D1',
      main: '#7b1fa2',
      dark: '#56177A',
      darker: '#3C0F59',
      contrastText: '#FFFFFF',
    },
    success: {
      lighter: '#D3FCD2',
      light: '#77ED8B',
      main: '#22C55E',
      dark: '#118D57',
      darker: '#065E49',
      contrastText: '#FFFFFF',
    },
    warning: {
      lighter: '#FFF5CC',
      light: '#FFD666',
      main: '#FFAB00',
      dark: '#B76E00',
      darker: '#7A4100',
      contrastText: '#1C252E',
    },
    error: {
      lighter: '#FFE9D5',
      light: '#FFAC82',
      main: '#FF5630',
      dark: '#B71D18',
      darker: '#7A0916',
      contrastText: '#FFFFFF',
    },
    grey: {
      '50': '#FCFDFD',
      '100': '#F9FAFB',
      '200': '#F4F6F8',
      '300': '#DFE3E8',
      '400': '#C4CDD5',
      '500': '#919EAB',
      '600': '#637381',
      '700': '#454F5B',
      '800': '#1C252E',
      '900': '#141A21',
    },
    common: { black: '#1C252E', white: '#FFFFFF' },
  },
  darkText: {
    primary: '#1B1B1B',
    secondary: '#5C5F62',
    disabled: '#9E9E9E',
  },
};
