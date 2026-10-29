import * as React from 'react';
import { useRouter } from 'next/router';
import { navigationConfig, tokenManager } from 'src/configs';
import { APP_ROUTES } from 'src/shared/constants';
import { useIsClient } from 'src/hooks/useIsClient';
import { LoadingState } from 'src/components/LoadingState';
import { Header, MAIN_CONTENT_ID, SkipLink } from '../components';
import classes from './PrivateLayout.module.scss';

export function PrivateLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isClient = useIsClient();
  const isAuthenticated = isClient && tokenManager.isAuthenticated();

  React.useEffect(() => {
    if (isClient && !isAuthenticated) void router.replace(APP_ROUTES.INTRODUCTION);
  }, [isClient, isAuthenticated, router]);

  if (!isAuthenticated) return <LoadingState fullScreen />;

  return (
    <div className={classes['root']}>
      <SkipLink />
      <Header navItems={navigationConfig.private} homeHref={APP_ROUTES.HOME} />
      <main id={MAIN_CONTENT_ID} tabIndex={-1} className={classes['main']}>
        {children}
      </main>
    </div>
  );
}
