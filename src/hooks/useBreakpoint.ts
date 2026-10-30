import { useMediaQuery, useTheme } from '@mui/material';

// For behavior that depends on screen size (e.g. a drawer vs a dialog). Use CSS breakpoints for layout,
// because this hook only knows the real size after the first render on the client.
export function useBreakpoint() {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const isLgUp = useMediaQuery(theme.breakpoints.up('lg'));

  return {
    isMobile: !isMdUp,
    isTablet: isMdUp && !isLgUp,
    isDesktop: isLgUp,
  };
}
