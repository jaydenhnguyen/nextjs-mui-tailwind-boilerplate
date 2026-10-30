import { Typography } from '@mui/material';
import { FadeIn } from 'src/components/Motion';
import { MOCK_ACCOUNTS, MOCK_PASSWORD } from '../db';
import classes from './MockBanner.module.scss';

export function MockBanner() {
  return (
    <FadeIn y={8} role="complementary" aria-label="Mock API" className={classes['root']}>
      <Typography variant="caption" component="p" fontWeight={600}>
        Mock API
      </Typography>
      <Typography variant="caption" component="p" color="text.secondary">
        {MOCK_ACCOUNTS.ADMIN} or {MOCK_ACCOUNTS.VIEWER} · password: {MOCK_PASSWORD}
      </Typography>
    </FadeIn>
  );
}
