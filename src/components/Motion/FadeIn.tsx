import { HTMLMotionProps, m } from 'motion/react';
import { useIsClient } from 'src/hooks/useIsClient';
import { DURATION, enterTransition } from 'src/theme/motion';

type Props = Omit<HTMLMotionProps<'div'>, 'initial' | 'animate'> & {
  delay?: number;
  // Pixels it slides up while fading. 0 is a plain fade.
  y?: number;
  duration?: number;
  // Content that's already in the server HTML shows right away by default, so the first paint never waits for
  // JavaScript. Turn this on for things that should fade in even then, like a delayed spinner.
  animateOnLoad?: boolean;
};

export function FadeIn({
  delay = 0,
  y = 0,
  duration = DURATION.small,
  animateOnLoad = false,
  transition,
  ...props
}: Props) {
  // False only while hydrating, so anything mounted later (navigation, loaded data) still animates.
  const isClient = useIsClient();

  return (
    <m.div
      initial={isClient || animateOnLoad ? { opacity: 0, y } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={transition ?? enterTransition(duration, delay)}
      {...props}
    />
  );
}
