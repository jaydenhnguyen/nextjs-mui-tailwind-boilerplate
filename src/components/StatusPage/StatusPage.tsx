import * as React from 'react';
import Link from 'next/link';
import { Button, Typography } from '@mui/material';
import classes from './StatusPage.module.scss';

type Props = {
  code: string | number;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
};

export function StatusPage({ code, title, description, action }: Props) {
  return (
    <div className={classes['root']}>
      <Typography variant="overline" color="primary" className={classes['code']}>
        {code}
      </Typography>
      <Typography variant="h3" component="h1">
        {title}
      </Typography>
      {description && <Typography color="text.secondary">{description}</Typography>}
      <div className={classes['action']}>
        {action ?? (
          <Button component={Link} href="/" variant="contained">
            Back to home
          </Button>
        )}
      </div>
    </div>
  );
}
