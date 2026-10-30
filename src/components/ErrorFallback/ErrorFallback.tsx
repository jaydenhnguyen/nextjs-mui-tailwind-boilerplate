import { FallbackProps } from 'react-error-boundary';
import { Button, Typography } from '@mui/material';
import classes from './ErrorFallback.module.scss';

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div role="alert" className={classes['root']}>
      <Typography variant="h5" component="h1">
        Something went wrong
      </Typography>
      <Typography color="text.secondary">
        This part of the page couldn&apos;t be shown. Try again, or reload the page if it keeps happening.
      </Typography>
      <Button variant="contained" onClick={resetErrorBoundary}>
        Try again
      </Button>
      {process.env.NODE_ENV === 'development' && error instanceof Error && (
        <pre className={classes['details']}>{error.stack ?? error.message}</pre>
      )}
    </div>
  );
}
