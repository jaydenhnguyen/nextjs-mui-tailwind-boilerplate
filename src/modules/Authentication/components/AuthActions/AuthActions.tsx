import Link from 'next/link';
import { Button } from '@mui/material';
import { APP_ROUTES } from 'src/shared/constants';
import { useAuth } from '../../hooks/useAuth';

export function AuthActions() {
  const { isAuthenticated, isChecking } = useAuth();

  if (isChecking) return null;

  return isAuthenticated ? (
    <Button component={Link} href={APP_ROUTES.HOME} variant="contained" size="small" className="animate-fade-in">
      Open app
    </Button>
  ) : (
    <Button component={Link} href={APP_ROUTES.LOGIN} variant="contained" size="small" className="animate-fade-in">
      Sign in
    </Button>
  );
}
