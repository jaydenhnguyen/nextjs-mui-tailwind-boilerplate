import { IconButton, Tooltip } from '@mui/material';
import DarkModeOutlined from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlined from '@mui/icons-material/LightModeOutlined';
import { useThemeMode } from 'src/hooks';

export function ThemeModeToggle() {
  const { resolvedMode, isReady, toggleMode } = useThemeMode();

  const nextMode = resolvedMode === 'dark' ? 'light' : 'dark';
  const label = `Switch to ${nextMode} mode`;

  return (
    <Tooltip title={isReady ? label : ''}>
      <span>
        <IconButton onClick={toggleMode} disabled={!isReady} aria-label={label} color="inherit">
          {resolvedMode === 'dark' ? <LightModeOutlined /> : <DarkModeOutlined />}
        </IconButton>
      </span>
    </Tooltip>
  );
}
