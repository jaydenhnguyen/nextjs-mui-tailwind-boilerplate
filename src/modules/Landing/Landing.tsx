import { Typography } from '@mui/material';
import { siteConfig } from 'src/configs';
import classes from './Landing.module.scss';

export function Landing() {
  return (
    <section className={classes['wrapper']}>
      <Typography variant="h2" component="h1">
        {siteConfig.name}
      </Typography>
      <Typography color="text.secondary" className={classes['description']}>
        {siteConfig.description}
      </Typography>
    </section>
  );
}
