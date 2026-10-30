import * as React from 'react';
import { useRouter } from 'next/router';
import { FadeIn } from 'src/components/Motion';
import { navigationConfig } from 'src/configs';
import { AuthActions } from 'src/modules/Authentication';
import { APP_ROUTES } from 'src/shared/constants';
import { DURATION } from 'src/theme/motion';
import { Footer, Header, MAIN_CONTENT_ID, SkipLink } from '../components';
import classes from './PublicLayout.module.scss';

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useRouter();

  return (
    <div className={classes['root']}>
      <SkipLink />
      <Header navItems={navigationConfig.public} homeHref={APP_ROUTES.LANDING} actions={<AuthActions />} />
      <main id={MAIN_CONTENT_ID} tabIndex={-1} className={classes['main']}>
        <FadeIn key={pathname} y={8} duration={DURATION.medium}>
          {children}
        </FadeIn>
      </main>
      <Footer />
    </div>
  );
}
