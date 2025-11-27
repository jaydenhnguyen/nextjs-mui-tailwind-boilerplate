import type {
  Shadows,
  ColorSystemOptions,
  CssVarsThemeOptions,
  SupportedColorScheme,
  ThemeOptions as MuiThemeOptions,
  CSSObject,
} from '@mui/material/styles';

export type ThemeColorScheme = SupportedColorScheme;
export type ThemeCssVariables = Pick<
  CssVarsThemeOptions,
  'colorSchemeSelector' | 'disableCssColorScheme' | 'cssVarPrefix' | 'shouldSkipGeneratingVar'
>;

type ColorSchemeOptionsExtended = ColorSystemOptions & {
  shadows?: Shadows;
};

export type ThemeOptions = Omit<MuiThemeOptions, 'components'> &
  Pick<CssVarsThemeOptions, 'defaultColorScheme' | 'components'> & {
    colorSchemes?: Partial<Record<ThemeColorScheme, ColorSchemeOptionsExtended>>;
    cssVariables?: ThemeCssVariables;
  };

export type FontExtendType = {
  fontWeightSemiBold: CSSObject['fontWeight'];
  fontSecondaryFamily: CSSObject['fontFamily'];
};
