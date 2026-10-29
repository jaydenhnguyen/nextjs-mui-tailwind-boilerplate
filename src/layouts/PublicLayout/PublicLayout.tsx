import React from 'react';
import { useRouter } from 'next/router';
import { Box, Container, Typography } from '@mui/material';
import { tokenManager } from 'src/configs';
import { ThemeModeToggle } from 'src/components';
import classes from './PublicLayout.module.scss';

export function PublicLayout({ children }: { children: React.ReactElement }): React.ReactElement | null {
  const router = useRouter();
  const [isClient, setIsClient] = React.useState(false);

  const isAuthenticated = tokenManager.isAuthenticated();

  React.useEffect(() => setIsClient(true), []);

  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace('/home').then();
    }
  }, [isAuthenticated, router]);

  return isClient && !isAuthenticated ? (
    <Box className={classes['wrapper']}>
      {/* Header */}
      <Box component="header" className={classes['header']}>
        <Typography variant="subtitle1" fontWeight={600}>
          THIS IS PUBLIC HEADER
        </Typography>
        <ThemeModeToggle />
      </Box>

      {/* Main content */}
      <Box component="main" flex={1} className={classes['main-wrapper']}>
        <Container maxWidth="lg" style={{ padding: 0 }}>
          {children}
        </Container>
      </Box>

      {/* Footer */}
      <Box component="footer" className={classes['footer-wrapper']}>
        <Container maxWidth="lg">
          <Box className={classes['footer-content']}>
            <Typography variant="caption" display="block" textAlign="center" mt={3}>
              THIS IS FOOTER
            </Typography>

            <Typography variant="caption" display="block" textAlign="center" mt={3}>
              Powered by Jayden
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  ) : null;
}
