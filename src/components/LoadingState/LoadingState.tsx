import clsx from 'clsx';
import { CircularProgress } from '@mui/material';
import { DURATION } from 'src/theme/motion';
import { FadeIn } from '../Motion';
import classes from './LoadingState.module.scss';

type Props = {
  label?: string;
  fullScreen?: boolean;
  className?: string;
};

// Waiting a moment before showing keeps fast loads from flashing a spinner.
const SHOW_AFTER = DURATION.small;

export function LoadingState({ label = 'Loading', fullScreen = false, className }: Props) {
  return (
    <FadeIn
      animateOnLoad
      delay={SHOW_AFTER}
      role="status"
      className={clsx(classes['root'], fullScreen && classes['full-screen'], className)}
    >
      <CircularProgress size={32} aria-hidden />
      <span className="sr-only">{label}</span>
    </FadeIn>
  );
}
