import * as React from 'react';
import { useRouter } from 'next/router';
import { Box, Button, Typography } from '@mui/material';
import { tokenManager } from 'src/configs';
import { APP_ROUTES } from 'src/shared/constants';
import classes from './Introduction.module.scss';

export function Introduction(): React.ReactElement {
  const router = useRouter();

  const handleLoginSuccess = React.useCallback(() => {
    tokenManager.storeTokens({ accessToken: 'dummy access token', refreshToken: 'dummy refresh token' });

    return router.replace(APP_ROUTES.HOME);
  }, []);

  return (
    <Box className={classes['wrapper']}>
      <Typography variant="subtitle1" fontWeight={600}>
        THIS IS PUBLIC INTRODUCTION PAGE
      </Typography>
      <Button variant={'contained'} onClick={handleLoginSuccess}>
        Go to Private
      </Button>
    </Box>
  );
}
