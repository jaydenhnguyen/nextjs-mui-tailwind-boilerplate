import * as React from 'react';
import { useRouter } from 'next/router';
import { APP_ROUTES } from 'src/shared/constants';
import { LoadingState } from 'src/components/LoadingState';
import { useAuth } from 'src/modules/Authentication';

export default function IndexPage() {
  const router = useRouter();
  const { isAuthenticated, isChecking } = useAuth();

  React.useEffect(() => {
    if (!isChecking) void router.replace(isAuthenticated ? APP_ROUTES.HOME : APP_ROUTES.INTRODUCTION);
  }, [isAuthenticated, isChecking, router]);

  return <LoadingState fullScreen />;
}
