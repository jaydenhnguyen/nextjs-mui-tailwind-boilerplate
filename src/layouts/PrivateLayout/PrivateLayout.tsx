import * as React from 'react';
import { useRouter } from 'next/router';
import { tokenManager } from 'src/configs';
import { APP_ROUTES } from 'src/shared/constants';
import { Box, Container, Typography } from '@mui/material';
import { ThemeModeToggle } from 'src/components';
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
        <Typography variant="subtitle1" fontWeight={600}>
          THIS IS PRIVATE HEADER
        </Typography>
        <ThemeModeToggle />
      </Box>

      {/* Main content */}
      <Box component="main" flex={1} className={classes['content-area']}>
        <Container maxWidth="lg" style={{ padding: 0 }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
}
