type ColorScale = {
  lighter: string;
  light: string;
  main: string;
  dark: string;
  darker: string;
  contrastText: string;
};

type BrandColor = 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';
type GreyShade = '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';

type SchemeTokens = {
  background: { default: string; paper: string };
  text: { primary: string; secondary: string; disabled: string };
  divider: string;
};

type ThemeConfig = {
  brand: Record<BrandColor, ColorScale>;
  grey: Record<GreyShade, string>;
  common: { black: string; white: string };
  light: SchemeTokens;
  dark: SchemeTokens;
  borderRadius: number;
};

const grey: ThemeConfig['grey'] = {
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
};

export const themeConfig: ThemeConfig = {
  brand: {
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
      main: '#7B1FA2',
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
  },
  grey,
  common: { black: '#1C252E', white: '#FFFFFF' },
  light: {
    background: { default: '#FFFFFF', paper: '#FFFFFF' },
    text: { primary: '#1B1B1B', secondary: '#5C5F62', disabled: '#9E9E9E' },
    divider: 'rgba(145, 158, 171, 0.24)',
  },
  dark: {
    background: { default: grey['900'], paper: grey['800'] },
    text: { primary: '#FFFFFF', secondary: grey['500'], disabled: grey['600'] },
    divider: 'rgba(145, 158, 171, 0.2)',
  },
  borderRadius: 8,
};
