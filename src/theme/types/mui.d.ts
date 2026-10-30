import type { CSSProperties } from 'react';
import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface BreakpointOverrides {
    '2xl': true;
  }

  interface PaletteColor {
    lighter: string;
    darker: string;
  }

  interface SimplePaletteColorOptions {
    lighter?: string;
    darker?: string;
  }

  interface TypographyVariants {
    fontWeightSemiBold: CSSProperties['fontWeight'];
    fontSecondaryFamily: CSSProperties['fontFamily'];
  }

  interface TypographyVariantsOptions {
    fontWeightSemiBold?: CSSProperties['fontWeight'];
    fontSecondaryFamily?: CSSProperties['fontFamily'];
  }
}
