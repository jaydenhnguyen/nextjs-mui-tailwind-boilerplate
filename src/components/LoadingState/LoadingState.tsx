import clsx from 'clsx';
import { CircularProgress } from '@mui/material';
import classes from './LoadingState.module.scss';

type Props = {
  label?: string;
  fullScreen?: boolean;
  className?: string;
};

export function LoadingState({ label = 'Loading', fullScreen = false, className }: Props) {
  return (
    <div role="status" className={clsx(classes['root'], fullScreen && classes['full-screen'], className)}>
      <CircularProgress size={32} aria-hidden />
      <span className="sr-only">{label}</span>
    </div>
  );
}
