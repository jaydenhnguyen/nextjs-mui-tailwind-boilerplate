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

| What                                                         | Duration    | Tailwind        |
|--------------------------------------------------------------|-------------|-----------------|
| Tiny feedback: hover, pressed, color/opacity of small parts  | 100–150ms   | `duration-100/150` |
| Small elements entering: helper text, tooltip, chip, badge   | 150–200ms   | `duration-200`  |
| Medium elements: menu, popover, card, snackbar               | 200–300ms   | `duration-300`  |
| Large surfaces: dialog, drawer, full-width panel             | 300–400ms   | `duration-300`, `duration-[400ms]` |
| Page-level / hero storytelling                               | 400–700ms   | use `motion`    |

Rules:

- The bigger the element or the farther it travels, the longer it takes.
- Exits are faster than entries (about 75% of the entry time). People don't need to watch something leave.
- Never go over ~500ms for anything the user is waiting on to keep working.

---

# 3. Easing

| Situation                          | Easing     | Tailwind      | Curve                          |
|------------------------------------|------------|---------------|--------------------------------|
| Entering (arrives, settles softly) | ease-out   | `ease-out`    | `cubic-bezier(0, 0, 0.2, 1)`   |
| Leaving (accelerates away)         | ease-in    | `ease-in`     | `cubic-bezier(0.4, 0, 1, 1)`   |
| Moving / resizing on screen        | ease-in-out| `ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| Continuous loops (spinners, marquee)| linear    | `ease-linear` |                                |

Never use linear for things entering or leaving: it feels robotic.

---

# 4. Which Animation to Use

| Animation                  | Use it for                                                                 |
|----------------------------|----------------------------------------------------------------------------|
| Fade + small slide (4–8px) | default for small things appearing: messages, tooltips, dropdown content  |
| Fade only                  | replacing content in place (skeleton → data, tab panels), overlays/backdrops |
| Slide from an edge         | drawers, sheets, toasts: things that live off-screen                      |
| Scale (0.95 → 1) + fade    | menus, popovers, dialogs: things that open from a trigger                 |
| Height / grid-rows         | accordions and expandable sections whose size isn't known                  |
| Stagger (30–60ms apart)    | lists or groups appearing together, to show order and hierarchy           |
| Morph / shared layout      | keeping one object continuous between two states or screens (`motion` layout animations) |
| Parallax / zoom            | storytelling and marketing pages only, never in forms or dashboards       |

Movement distance stays small: 4–8px for small elements, up to 16–24px for large surfaces. Big distances look sloppy.

When two neighbors change at once, give them different treatments (one fades and moves, the other only fades) so they read as separate.

---

# 5. How to Implement

- Animate only `opacity` and `transform` whenever possible. They're smooth and don't cause layout work.
- If size has to animate, use the `grid-template-rows: 0fr → 1fr` trick or MUI `Collapse`, never `height: auto` jumps.
- Simple enter/exit of one element: CSS transitions in the SCSS module with Tailwind classes:

  ```scss
  .message {
    @apply opacity-0 -translate-y-1 transition-[opacity,transform] duration-150 ease-in motion-reduce:transition-none;
  }

  .visible {
    @apply opacity-100 translate-y-0 duration-200 ease-out;
  }
  ```

- Anything that unmounts must stay mounted until its exit animation finishes (keep the last content, or use MUI transitions / `motion`'s `AnimatePresence`).
- MUI components (`Collapse`, `Fade`, `Grow`, `Slide`, `Dialog`, `Menu`) already animate. Use them instead of hand-rolling.
- Orchestrated, staggered, layout or gesture animations: use `motion` (`motion/react`).
- Loading states: wait ~200ms before showing a spinner, and keep it up at least ~400ms once shown, so it never flashes.

---

# 6. Accessibility

- Always respect reduced motion: `motion-reduce:transition-none` in Tailwind, `useReducedMotion()` in `motion`.
- With reduced motion, keep opacity fades but drop movement, scale and parallax.
- Never autoplay looping motion that can't be paused.

---

# 7. Reference Implementation

`src/components/Form/FieldMessage` follows all of this:

- reserves one line under each field so an error never pushes content down
- fades in with a 4px slide, 200ms `ease-out`
- fades out 150ms `ease-in`, keeping the text until the fade finishes
- turns transitions off for reduced motion
