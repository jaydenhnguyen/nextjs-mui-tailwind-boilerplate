import * as React from 'react';
import { useRouter } from 'next/router';
import { tokenManager } from 'src/configs';
import { APP_ROUTES } from 'src/shared/constants';
import { Box, Container, Typography } from '@mui/material';
import classes from './PrivateLayout.module.scss';

export function PrivateLayout({ children }: { children: React.ReactElement }) {
  const router = useRouter();
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    const init = async () => {
      if (!tokenManager.isAuthenticated()) {
        router.replace(APP_ROUTES.INTRODUCTION).then();
        return;
      }
      setHydrated(true);
    };

    init().then();
  }, []);

  if (!hydrated) return null;

  return (
    <Box className={classes['wrapper']}>
      {/* Header */}
      <Box component="header" className={classes['header']}>
        <Container maxWidth="lg" className="!p-0">
          <Box className={classes['header-inner']}>
            <Typography variant="subtitle1" className={classes['header-title']}>
              THIS IS PRIVATE HEADER
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Content */}
      <Box component="main" className={classes['main']}>
        <Container maxWidth="lg" className="!p-0">
          <Box className={classes['content-box']}>{children}</Box>
        </Container>
      </Box>
    </Box>
  );
}
