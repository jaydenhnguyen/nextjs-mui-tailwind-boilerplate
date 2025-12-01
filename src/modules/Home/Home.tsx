import * as React from 'react';
import { Box, Typography } from '@mui/material';
import classes from './Home.module.scss';

export function Home(): React.ReactElement {
  return (
    <Box className={classes['wrapper']}>
      <Typography variant="subtitle1" fontWeight={600}>
        THIS IS PRIVATE HOME PAGE
      </Typography>
    </Box>
  );
}
