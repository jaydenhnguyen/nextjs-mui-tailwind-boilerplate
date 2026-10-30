import * as React from 'react';
import { domAnimation, LazyMotion, MotionConfig } from 'motion/react';

// LazyMotion ships only the features the app uses, and `strict` throws on `motion.div` so everything uses the
// lighter `m.div`. reducedMotion="user" drops movement for people who ask for less motion but keeps the fades.
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
