import type { Transition } from 'motion/react';

// Seconds, on the scale in .agent/templates/09-motion.template.md. Exits run at about 75% of the entry time.
export const DURATION = {
  tiny: 0.15,
  small: 0.2,
  medium: 0.3,
  large: 0.4,
};

type Bezier = [number, number, number, number];

export const EASE: Record<'enter' | 'exit' | 'move', Bezier> = {
  enter: [0, 0, 0.2, 1],
  exit: [0.4, 0, 1, 1],
  move: [0.4, 0, 0.2, 1],
};

export const enterTransition = (duration = DURATION.small, delay = 0): Transition => ({
  duration,
  delay,
  ease: EASE.enter,
});

export const exitTransition = (duration = DURATION.tiny): Transition => ({ duration, ease: EASE.exit });

export const moveTransition = (duration = DURATION.small): Transition => ({ duration, ease: EASE.move });
