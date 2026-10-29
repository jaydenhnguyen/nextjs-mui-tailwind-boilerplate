import { Slide, ToastContainer } from 'react-toastify';
import { useThemeMode } from 'src/hooks/useThemeMode';

export function AppToaster() {
  const { resolvedMode } = useThemeMode();

  return (
    <ToastContainer
      position="top-right"
      autoClose={4000}
      hideProgressBar
      newestOnTop
      closeOnClick
      pauseOnFocusLoss
      pauseOnHover
      transition={Slide}
      theme={resolvedMode === 'dark' ? 'dark' : 'light'}
    />
  );
}
