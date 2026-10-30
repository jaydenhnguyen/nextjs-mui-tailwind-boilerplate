# 05 Tailwind + SCSS Style

Tailwind 3.4 utilities, applied inside SCSS modules with `@apply`. MUI provides the components; Tailwind and SCSS handle layout, spacing and the odd visual detail.

---

## 1. The default pattern

```tsx
import classes from './ProductCard.module.scss';

<div className={classes['root']}>
  <Typography variant="h6" component="h2">
    {name}
  </Typography>
  <div className={classes['meta']}>...</div>
</div>;
```

```scss
.root {
  @apply flex flex-col gap-2 rounded-theme border border-solid border-divider bg-background-paper p-4 md:p-6;
}

.meta {
  @apply flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-secondary;
}
```

- Every styled component or screen has its own `<Name>.module.scss` next to it.
- Read classes with brackets: `classes['root']` (TypeScript's index-signature rule).
- Class names are kebab-case and describe the part, not the look: `.header`, `.empty-hint`, not `.blue-box`.
- Combine classes with `clsx(classes['row'], isActive && classes['active'])`.
- Plain Tailwind classes in JSX are fine for one or two utilities (`className="sr-only"`); anything more goes in the module.
- Prettier sorts the classes in `@apply` and `clsx(...)` automatically.

---

## 2. Colors and tokens

Every Tailwind color maps to an MUI CSS variable, so it follows the brand and light/dark mode.

| Tailwind                                                                                                                            | Comes from                                 |
| ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `primary-` / `secondary-` / `info-` / `success-` / `warning-` / `error-` + `lighter`, `light`, `main`, `dark`, `darker`, `contrast` | `palette.<color>.*`                        |
| `grey-50` … `grey-900`                                                                                                              | `palette.grey`                             |
| `background-default`, `background-paper`                                                                                            | `palette.background`                       |
| `text-primary`, `text-secondary`, `text-disabled`                                                                                   | `palette.text` (so: `text-text-secondary`) |
| `divider`                                                                                                                           | `palette.divider`                          |
| `common-black`, `common-white`                                                                                                      | `palette.common`                           |
| `rounded-theme`                                                                                                                     | `shape.borderRadius`                       |
| `font-sans`, `font-mono`                                                                                                            | the fonts in `src/theme/fonts`             |

- Opacity modifiers (`bg-background-paper/80`, `text-primary-main/60`) work on `main`, `light`, `dark`, `contrast`, background and text colors.
- Tailwind's own palette (`blue-500`, `gray-100`) and arbitrary colors (`bg-[#123456]`) are off-limits. Missing a color? Add it to `src/theme/core/_config.ts`.
- Borders need `border-solid`: Tailwind's preflight reset is off, so the default border style isn't set.

---

## 3. Responsive, mobile first

Breakpoints are the theme's: `sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536. Write the phone layout first, then widen.

```scss
.header {
  @apply flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between;
}

.grid {
  @apply grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3;
}
```

- No fixed widths for content (`w-[960px]`). Use `max-w-*` with `w-full`.
- Full-height areas use `min-h-dvh`, not `min-h-screen` (mobile address bars).
- Wide tables scroll inside their container (`overflow-x-auto`), never the page.
- Hide secondary columns on small screens (`hidden md:table-cell`) instead of squeezing them.
- Tap targets are at least 40px; MUI buttons already are.
- Use `useBreakpoint()` only when behavior changes (drawer vs dialog), never for layout.

---

## 4. Global styles

| File                       | Holds                                                                      |
| -------------------------- | -------------------------------------------------------------------------- |
| `src/styles/_core.scss`    | small reset in `@layer reset` (margins, lists, media), reduced-motion rule |
| `src/styles/_app.scss`     | `body` / `#__next` sizing                                                  |
| `src/styles/tailwind.scss` | the three `@tailwind` directives                                           |

Imported once, in `_app.tsx`. Don't add global class names; anything specific belongs in a module.

---

## 5. Rules

- No inline `style={{...}}` except for values computed at runtime (a progress width, a color from data).
- No `!important`. The CSS layers already let Tailwind and SCSS beat MUI.
- No CSS keyframes or `transition` classes for things that appear, disappear or move: use `motion` (`09-motion.template.md`). `transition-colors duration-150` for hover and focus colors is the one exception.
- No new styling libraries (styled-components, CSS-in-JS helpers, other utility frameworks).
- Visible focus must survive: don't remove outlines without a replacement.
