import Link from 'next/link';
import { Button } from '@mui/material';
import { FadeIn } from 'src/components/Motion';
import { APP_ROUTES } from 'src/shared/constants';
import { useAuth } from '../../hooks/useAuth';

export function AuthActions() {
  const { isAuthenticated, isChecking } = useAuth();

  if (isChecking) return null;

  return (
    <FadeIn>
      <Button
        component={Link}
        href={isAuthenticated ? APP_ROUTES.HOME : APP_ROUTES.LOGIN}
        variant="contained"
        size="small"
      >
        {isAuthenticated ? 'Open app' : 'Sign in'}
      </Button>
    </FadeIn>
  );
}
