import Link from 'next/link';
import { Button, Typography } from '@mui/material';
import { siteConfig } from 'src/configs';
import { APP_ROUTES } from 'src/shared/constants';
import classes from './Introduction.module.scss';

export function Introduction() {
  return (
    <section className={classes['wrapper']}>
      <Typography variant="h2" component="h1">
        {siteConfig.name}
      </Typography>
      <Typography color="text.secondary" className={classes['description']}>
        {siteConfig.description}
      </Typography>
      <Button component={Link} href={APP_ROUTES.LOGIN} variant="contained" size="large">
        Sign in
      </Button>
    </section>
  );
}
