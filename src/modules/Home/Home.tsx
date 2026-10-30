import { Typography } from '@mui/material';
import { useAuth } from 'src/modules/Authentication';
import classes from './Home.module.scss';

export function Home() {
  const { user } = useAuth();

  return (
    <div className={classes['wrapper']}>
      <Typography variant="h4" component="h1">
        Welcome back{user ? `, ${user.firstName}` : ''}
      </Typography>
      <Typography color="text.secondary">Here&apos;s where your app starts.</Typography>
    </div>
  );
}
