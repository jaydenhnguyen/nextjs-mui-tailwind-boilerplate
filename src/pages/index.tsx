import * as React from 'react';
import { useRouter } from 'next/router';
import { tokenManager } from 'src/configs';
import { APP_ROUTES } from 'src/shared/constants';
import { LoadingState } from 'src/components/LoadingState';

export default function IndexPage() {
  const router = useRouter();

  React.useEffect(() => {
    void router.replace(tokenManager.isAuthenticated() ? APP_ROUTES.HOME : APP_ROUTES.INTRODUCTION);
  }, [router]);

  return <LoadingState fullScreen />;
}
