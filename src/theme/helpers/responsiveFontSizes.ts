import { AppBreakpoint, BREAKPOINTS } from '../core/breakpoints';
import { pxToRem } from './pxToRem';

type FontSizesByBreakpoint = Partial<Record<AppBreakpoint, number>>;

export function responsiveFontSizes(sizes: FontSizesByBreakpoint): Record<string, { fontSize: string }> {
  const entries = Object.entries(sizes) as [AppBreakpoint, number][];

  return Object.fromEntries(
    entries
      .sort(([a], [b]) => BREAKPOINTS[a] - BREAKPOINTS[b])
      .map(([breakpoint, px]) => [`@media (min-width:${BREAKPOINTS[breakpoint]}px)`, { fontSize: pxToRem(px) }]),
  );
}
