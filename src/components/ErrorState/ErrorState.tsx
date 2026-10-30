import * as React from 'react';
import clsx from 'clsx';
import ErrorOutlineOutlined from '@mui/icons-material/ErrorOutlineOutlined';
import { Button, Typography } from '@mui/material';
import { FadeIn } from '../Motion';
import classes from './ErrorState.module.scss';

type Props = {
  error?: unknown;
  title?: string;
  description?: React.ReactNode;
  onRetry?: () => void;
  className?: string;
};

export function ErrorState({ error, title = 'Something went wrong', description, onRetry, className }: Props) {
  const message = description ?? (error instanceof Error ? error.message : undefined);

  return (
    <FadeIn y={4} role="alert" className={clsx(classes['root'], className)}>
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
    </FadeIn>
  );
}
