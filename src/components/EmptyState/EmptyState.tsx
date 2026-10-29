import * as React from 'react';
import clsx from 'clsx';
import { Typography } from '@mui/material';
import InboxOutlined from '@mui/icons-material/InboxOutlined';
import classes from './EmptyState.module.scss';

type Props = {
  title: string;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({ title, description, icon, action, className }: Props) {
  return (
    <div className={clsx(classes['root'], className)}>
      <div className={classes['icon']} aria-hidden>
        {icon ?? <InboxOutlined fontSize="inherit" />}
      </div>
      <Typography variant="h6" component="p">
        {title}
      </Typography>
      {description && <Typography color="text.secondary">{description}</Typography>}
      {action && <div className={classes['action']}>{action}</div>}
    </div>
  );
}
