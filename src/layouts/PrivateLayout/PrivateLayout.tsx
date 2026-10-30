import * as React from 'react';
import { useRouter } from 'next/router';
import { ErrorState } from 'src/components/ErrorState';
import { LoadingState } from 'src/components/LoadingState';
import { FadeIn } from 'src/components/Motion';
import { navigationConfig } from 'src/configs';
import { useAuth, UserMenu } from 'src/modules/Authentication';
import { APP_ROUTES } from 'src/shared/constants';
import { DURATION } from 'src/theme/motion';
import { Header, MAIN_CONTENT_ID, SkipLink } from '../components';
import classes from './PrivateLayout.module.scss';

export function PrivateLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isChecking, sessionError, retry } = useAuth();

  const shouldRedirect = !isChecking && !isAuthenticated && !sessionError;

  React.useEffect(() => {
    if (shouldRedirect) void router.replace({ pathname: APP_ROUTES.LOGIN, query: { redirect: router.asPath } });
  }, [shouldRedirect, router]);

  if (sessionError) return <ErrorState error={sessionError} onRetry={() => void retry()} />;

  if (!isAuthenticated) return <LoadingState fullScreen />;

  return (
    <div className={classes['root']}>
      <SkipLink />
      <Header navItems={navigationConfig.private} homeHref={APP_ROUTES.HOME} actions={<UserMenu />} />
      <main id={MAIN_CONTENT_ID} tabIndex={-1} className={classes['main']}>
        <FadeIn key={router.pathname} y={8} duration={DURATION.medium}>
          {children}
        </FadeIn>
      </main>
    </div>
  );
}
