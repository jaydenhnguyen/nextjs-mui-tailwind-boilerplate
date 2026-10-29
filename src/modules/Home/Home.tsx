import Link from 'next/link';
import { Button, Paper, Typography } from '@mui/material';
import ArrowForwardOutlined from '@mui/icons-material/ArrowForwardOutlined';
import { APP_ROUTES } from 'src/shared/constants';
import { useAuth } from 'src/modules/Authentication';
import classes from './Home.module.scss';

export function Home() {
  const { user } = useAuth();

  return (
    <div className={classes['wrapper']}>
      <div>
        <Typography variant="h4" component="h1">
          Welcome back{user ? `, ${user.firstName}` : ''}
        </Typography>
        <Typography color="text.secondary">Here&apos;s where your app starts.</Typography>
      </div>

      <Paper variant="outlined" className={classes['card']}>
        <Typography variant="h6" component="h2">
          Users
        </Typography>
        <Typography color="text.secondary">
          A full example: list with search and pagination, create form, delete with confirm.
        </Typography>
        <Button component={Link} href={APP_ROUTES.USERS} endIcon={<ArrowForwardOutlined />} className={classes['link']}>
          Open users
        </Button>
      </Paper>
    </div>
  );
}
