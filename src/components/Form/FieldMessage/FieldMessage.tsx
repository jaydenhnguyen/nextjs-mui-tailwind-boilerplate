import * as React from 'react';
import clsx from 'clsx';
import { AnimatePresence, m } from 'motion/react';
import { enterTransition, exitTransition } from 'src/theme/motion';
import classes from './FieldMessage.module.scss';

type Props = {
  message?: React.ReactNode;
  reserveSpace?: boolean;
};

const slideFade = {
  initial: { opacity: 0, y: -4 },
  animate: { opacity: 1, y: 0, transition: enterTransition() },
  exit: { opacity: 0, y: -4, transition: exitTransition() },
};

// No reserved line, so the height animates together with the text instead.
const collapse = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: 'auto', transition: enterTransition() },
  exit: { opacity: 0, height: 0, transition: exitTransition() },
};

export function FieldMessage({ message, reserveSpace = true }: Props) {
  return (
    <span className={clsx(classes['root'], reserveSpace && classes['reserved'])}>
      {/* AnimatePresence keeps the last text on screen while it fades out. */}
      <AnimatePresence initial={false}>
        {!!message && (
          <m.span
            key="message"
            className={clsx(classes['text'], !reserveSpace && classes['clip'])}
            {...(reserveSpace ? slideFade : collapse)}
          >
            {message}
          </m.span>
        )}
      </AnimatePresence>
    </span>
  );
}
