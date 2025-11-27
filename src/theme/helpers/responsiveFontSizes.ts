import type { Breakpoint } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { pxToRem } from './pxToRem';

export type ResponsiveFontSizesInput = Partial<Record<Breakpoint, number>>;
export type ResponsiveFontSizesResult = Record<string, { fontSize: string }>;

export const responsiveFontSizes = (obj: ResponsiveFontSizesInput): ResponsiveFontSizesResult => {
  const defaultMuiTheme = createTheme();
  const breakpoints: Breakpoint[] = defaultMuiTheme.breakpoints.keys;

  return breakpoints.reduce((acc, breakpoint) => {
    const value = obj[breakpoint];

    if (value !== undefined && value >= 0) {
      acc[defaultMuiTheme.breakpoints.up(breakpoint)] = {
        fontSize: pxToRem(value),
      };
    }

    return acc;
  }, {} as ResponsiveFontSizesResult);
};
