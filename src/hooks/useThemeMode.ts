import { useColorScheme } from '@mui/material/styles';

export function useThemeMode() {
  const { mode, systemMode, setMode } = useColorScheme();

  const resolvedMode = mode === 'system' ? systemMode : mode;

  const toggleMode = () => setMode(resolvedMode === 'dark' ? 'light' : 'dark');

  return {
    mode,
    resolvedMode,
    isReady: resolvedMode !== undefined,
    setMode,
    toggleMode,
  };
}
