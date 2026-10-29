import * as React from 'react';
import clsx from 'clsx';
import { Button, Typography } from '@mui/material';
import ErrorOutlineOutlined from '@mui/icons-material/ErrorOutlineOutlined';
import { toApiError } from 'src/shared/utils/apiError';
import classes from './ErrorState.module.scss';

type Props = {
  error?: unknown;
  title?: string;
  description?: React.ReactNode;
  onRetry?: () => void;
  className?: string;
};

export function ErrorState({ error, title = 'Something went wrong', description, onRetry, className }: Props) {
  const message = description ?? (error ? toApiError(error).message : undefined);

  return (
    <div role="alert" className={clsx(classes['root'], className)}>
      <ErrorOutlineOutlined className={classes['icon']} aria-hidden />
      <Typography variant="h6" component="p">
        {title}
      </Typography>
      {message && <Typography color="text.secondary">{message}</Typography>}
      {onRetry && (
        <Button variant="outlined" onClick={onRetry} className={classes['action']}>
          Try again
        </Button>
      )}
    </div>
  );
}
