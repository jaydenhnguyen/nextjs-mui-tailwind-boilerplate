# 09 Motion Template

Rules for anything that appears, disappears, moves or changes size.

Guiding idea (from https://motion.zajno.com/): motion should keep continuity and guide attention. Easing, delay and pairing fade with a small movement are what make UI feel alive instead of mechanical. The numbers below follow Material Design's motion spec, which Tailwind's built-in easing classes already match.

---

# 1. The Non-negotiable Rule

Nothing may appear, disappear or change state with a glitch.

That means:

- no layout jumps: showing or hiding something must never shove other content around suddenly
- no instant pop-in or pop-out of visible UI (messages, menus, panels, toasts, badges, skeleton → content)
- no flicker when data loads fast (don't flash a spinner for 50ms)

If something has to take space when it appears, either:

1. **reserve the space up front** (preferred for small, predictable things like field error messages), or
2. **animate the space** (height/grid rows) together with the content, for things whose size can't be known ahead of time (accordions, expanding panels).

---

# 2. Durations

| What                                                         | Duration  | Token (`src/theme/motion.ts`) |
| ------------------------------------------------------------ | --------- | ----------------------------- |
| Tiny feedback: hover, pressed, color/opacity of small parts  | 100–150ms | `DURATION.tiny`               |
| Small elements entering: helper text, tooltip, chip, badge   | 150–200ms | `DURATION.small` (default)    |
| Medium elements: menu, popover, card, snackbar, page content | 200–300ms | `DURATION.medium`             |
| Large surfaces: dialog, drawer, full-width panel             | 300–400ms | `DURATION.large`              |
| Hero storytelling on marketing pages                         | 400–700ms | a custom value, only there    |

Durations in `motion` are in seconds (`0.2`), not milliseconds.

Rules:

- The bigger the element or the farther it travels, the longer it takes.
- Exits are faster than entries (about 75% of the entry time). People don't need to watch something leave.
- Never go over ~500ms for anything the user is waiting on to keep working.

---

# 3. Easing

| Situation                            | Easing      | Use                                | Curve                          |
| ------------------------------------ | ----------- | ---------------------------------- | ------------------------------ |
| Entering (arrives, settles softly)   | ease-out    | `enterTransition()` / `EASE.enter` | `cubic-bezier(0, 0, 0.2, 1)`   |
| Leaving (accelerates away)           | ease-in     | `exitTransition()` / `EASE.exit`   | `cubic-bezier(0.4, 0, 1, 1)`   |
| Moving / resizing / dimming          | ease-in-out | `moveTransition()` / `EASE.move`   | `cubic-bezier(0.4, 0, 0.2, 1)` |
| Continuous loops (spinners, marquee) | linear      | `ease: 'linear'`                   |                                |

Never use linear for things entering or leaving: it feels robotic.

---

# 4. Which Animation to Use

| Animation                  | Use it for                                                                               |
| -------------------------- | ---------------------------------------------------------------------------------------- |
| Fade + small slide (4–8px) | default for small things appearing: messages, tooltips, dropdown content                 |
| Fade only                  | replacing content in place (skeleton → data, tab panels), overlays/backdrops             |
| Slide from an edge         | drawers, sheets, toasts: things that live off-screen                                     |
| Scale (0.95 → 1) + fade    | menus, popovers, dialogs: things that open from a trigger                                |
| Height / grid-rows         | accordions and expandable sections whose size isn't known                                |
| Stagger (30–60ms apart)    | lists or groups appearing together, to show order and hierarchy                          |
| Morph / shared layout      | keeping one object continuous between two states or screens (`motion` layout animations) |
| Parallax / zoom            | storytelling and marketing pages only, never in forms or dashboards                      |

Movement distance stays small: 4–8px for small elements, up to 16–24px for large surfaces. Big distances look sloppy.

When two neighbors change at once, give them different treatments (one fades and moves, the other only fades) so they read as separate.

---

# 5. How to Implement

Animations are written with [`motion`](https://motion.dev), not CSS keyframes or `transition` classes. The only CSS transitions allowed are hover/focus color changes (`transition-colors duration-150`).

- Import from `motion/react` and use `m.*` components (`m.div`, `m.span`, `m.li`). `MotionProvider` (in `AppProviders`) uses `LazyMotion` in strict mode, so `motion.div` throws.
- Take timing from `src/theme/motion.ts`: `DURATION`, `EASE`, `enterTransition()`, `exitTransition()`, `moveTransition()`. Don't hard-code numbers.
- Most things that appear on mount: use `<FadeIn>` from `src/components/Motion` (`y` for a slide, `delay`, `duration`).
- Animate only `opacity` and `transform` (`x`, `y`, `scale`) whenever possible. They're smooth and don't cause layout work.
- If size has to animate, animate `height: 0 → 'auto'` with `m.*`, or use MUI `Collapse`.
- Anything that unmounts must stay mounted until its exit animation finishes: wrap it in `AnimatePresence` and give it an `exit` target with `exitTransition()`. A child needs a stable `key`.
- Different timing in and out: put the transition inside the target, `animate={{ opacity: 1, transition: enterTransition() }}` and `exit={{ opacity: 0, transition: exitTransition() }}`.
- Animating between states of something that stays mounted (dimming, highlighting): `initial={false}` and change `animate`, with `moveTransition()`.
- Stagger: `transition: { delay: index * 0.04 }` or variants with `staggerChildren`.
- Layout / shared-element animations (`layout`, `layoutId`) need the `domMax` feature set. Switch `domAnimation` to `domMax` in `MotionProvider` only when you use them.
- MUI components (`Collapse`, `Fade`, `Grow`, `Slide`, `Dialog`, `Menu`, `Drawer`) already animate. Use them as they are; don't rebuild them with `motion`.
- First page load: content in the server HTML must be visible without JavaScript. `FadeIn` skips its animation while the page hydrates and animates everything mounted later. If you use `m.*` directly on something that's in the server HTML, use `initial={false}` or `FadeIn`'s approach (`useIsClient()`).
- Loading states: wait ~200ms before showing a spinner so fast loads never flash one. `LoadingState` already does this.
- Page transitions: both layouts wrap the page in `<FadeIn key={pathname}>`, so pages don't add their own.

```tsx
import { AnimatePresence, m } from 'motion/react';
import { enterTransition, exitTransition } from 'src/theme/motion';

<AnimatePresence initial={false}>
  {isOpen && (
    <m.div
      key="panel"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0, transition: enterTransition() }}
      exit={{ opacity: 0, y: -4, transition: exitTransition() }}
    >
      ...
    </m.div>
  )}
</AnimatePresence>;
```

---

# 6. Accessibility

- `MotionProvider` sets `reducedMotion="user"`: people who ask for less motion get opacity fades only, no movement, scale or parallax. Don't override it.
- For anything decorative that `motion` can't drop on its own (autoplay, parallax driven by scroll), check `useReducedMotion()` and skip it.
- `_core.scss` turns CSS transitions (MUI's included) nearly off for reduced motion.
- Never autoplay looping motion that can't be paused.

---

# 7. Reference Implementations

- `src/components/Form/FieldMessage`: reserves one line under each field so an error never pushes content down; fades in with a 4px slide using `enterTransition()`, fades out faster with `exitTransition()`, and `AnimatePresence` keeps the text until the fade finishes. Without the reserved line it animates `height` with the text instead.
- `src/components/Motion/FadeIn`: mount animation that never hides server-rendered content on the first load.
- `src/modules/Users/Users.tsx`: dims the current page with `moveTransition()` while the next page loads.
