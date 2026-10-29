import { Typography } from '@mui/material';
import { MOCK_ACCOUNTS, MOCK_PASSWORD } from '../db';
import classes from './MockBanner.module.scss';

export function MockBanner() {
  return (
    <aside aria-label="Mock API" className={classes['root']}>
      <Typography variant="caption" component="p" fontWeight={600}>
        Mock API
      </Typography>
      <Typography variant="caption" component="p" color="text.secondary">
        {MOCK_ACCOUNTS.ADMIN} or {MOCK_ACCOUNTS.VIEWER} · password: {MOCK_PASSWORD}
      </Typography>
    </aside>
  );
}
