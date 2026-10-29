import * as React from 'react';
import { navigationConfig } from 'src/configs';
import { APP_ROUTES } from 'src/shared/constants';
import { Footer, Header, MAIN_CONTENT_ID, SkipLink } from '../components';
import classes from './PublicLayout.module.scss';

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={classes['root']}>
      <SkipLink />
      <Header navItems={navigationConfig.public} homeHref={APP_ROUTES.INTRODUCTION} />
      <main id={MAIN_CONTENT_ID} tabIndex={-1} className={classes['main']}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
