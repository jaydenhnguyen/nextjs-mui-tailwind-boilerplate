# 05 Tailwind Style Template

This file defines the standard Tailwind + SCSS module styling architecture for this boilerplate.

It is the source of truth for:

- Tailwind usage
- SCSS module conventions
- `@apply` rules
- responsive layout rules
- Tailwind + MUI coexistence
- global style boundaries

---

# 1. Styling Philosophy

This boilerplate uses:

```txt
MUI Theme      → design tokens, component defaults, MUI component styling
Tailwind       → layout, spacing, flex/grid, responsive utilities
SCSS Modules   → module/component scoped styling using Tailwind `@apply`
MUI sx         → theme-aware one-off styling on MUI components
```

Default styling approach:

```txt
SCSS Module + Tailwind @apply
```

This keeps JSX clean and keeps styling colocated with modules/components.

---

# 2. Deterministic Styling Rule

When multiple styling approaches are possible, follow this order:

1. Existing repo pattern
2. SCSS module + Tailwind `@apply`
3. MUI `sx` for theme-aware MUI adjustments
4. Short Tailwind utility classes in JSX only when simple
5. Raw SCSS only when Tailwind is awkward
6. Global SCSS only for app-wide styles

Do not introduce another styling system.

---

# 3. Expected Folder Structure

```txt
project-root/
├── tailwind.config.ts
├── postcss.config.js
├── src/
│   ├── styles/
│   │   ├── tailwind.scss
│   │   ├── _core.scss
│   │   └── _app.scss
│   │
│   ├── theme/
│   │   └── core/
│   │       └── _config.ts
│   │
│   ├── components/
│   │   └── Card/
│   │       ├── Card.tsx
│   │       ├── card.module.scss
│   │       └── index.ts
│   │
│   ├── modules/
│   │   └── Books/
│   │       ├── components/
│   │       ├── Books.tsx
│   │       ├── books.module.scss
│   │       └── index.ts
│   │
│   ├── layouts/
│   └── pages/
```

This boilerplate uses the Next.js Pages Router.

Do not use `app/` structure unless the project explicitly migrates to App Router.

---

# 4. Global Style Files

Global styles live in:

```txt
src/styles/
```

Recommended files:

```txt
src/styles/
├── tailwind.scss
├── _core.scss
└── _app.scss
```

## `tailwind.scss`

Only Tailwind directives should live here.

```scss
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Do not put feature/component styles in `tailwind.scss`.

---

## `_core.scss`

Use for:

- global reset additions
- html/body styles
- scrollbar styles
- selection styles
- global typography fallback
- document-level behavior

Do not put feature-specific styles here.

---

## `_app.scss`

Use for:

- app shell styles
- `#__next`
- layout root behavior
- globally reused utility helpers like `.sr-only`

Example:

```scss
#__next {
  min-height: 100vh;
}
```

---

# 5. Import Order

Import global styles once in:

```txt
src/pages/_app.tsx
```

Recommended order:

```ts
import 'src/styles/_app.scss';
import 'src/styles/_core.scss';
import 'src/styles/tailwind.scss';
```

Follow the existing repo order first.

If both MUI `CssBaseline` and global styles set `body` styles, document which one wins.

---

# 6. Tailwind Config

Expected file:

```txt
tailwind.config.ts
```

or:

```txt
tailwind.config.js
```

Use whichever the repo already uses.

---

## 6.1 Content Paths

For Pages Router projects:

```ts
content: ['./src/**/*.{js,ts,jsx,tsx}'];
```

If the project has additional folders, include them intentionally.

Example:

```ts
content: [
  './src/**/*.{js,ts,jsx,tsx}',
  './docs/**/*.{md,mdx}',
  './stories/**/*.{js,ts,jsx,tsx,mdx}',
];
```

Do not include unnecessary broad paths that slow down builds.

---

## 6.2 Sharing Design Tokens with MUI

The preferred source of design tokens is:

```txt
src/theme/core/_config.ts
```

If the Tailwind config can safely import from this file, map those tokens into Tailwind.

Example:

```ts
import { themeConfig } from './src/theme/core/_config';

export default {
  theme: {
    extend: {
      colors: {
        primary: themeConfig.palette.primary,
        secondary: themeConfig.palette.secondary,
        grey: themeConfig.palette.grey,
        common: themeConfig.palette.common,
        'text-primary': themeConfig.text.primary,
        'text-secondary': themeConfig.text.secondary,
      },
    },
  },
};
```

This allows classes like:

```txt
bg-primary-main
text-primary-main
border-grey-300
text-common-white
```

If importing TypeScript theme config creates build issues, duplicate the Tailwind mapping carefully and keep it aligned
with `_config.ts`.

Do not create a separate unrelated Tailwind color system.

---

## 6.3 Tailwind Preflight

Because this boilerplate uses MUI `CssBaseline`, Tailwind preflight should usually be disabled.

Example:

```ts
corePlugins: {
  preflight: false,
}
,
```

Use Tailwind preflight only if the project intentionally removes or does not use MUI `CssBaseline`.

Do not allow Tailwind preflight and MUI CssBaseline to fight each other without testing.

---

## 6.4 Breakpoints

Use a single responsive strategy shared with MUI as much as possible.

Default Tailwind-style breakpoints are acceptable:

```ts
screens: {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}
```

If the project customizes MUI breakpoints, Tailwind screens should be aligned or clearly mapped.

Do not scatter raw breakpoint numbers across SCSS files.

---

# 7. Default Module Styling Pattern

The preferred pattern is:

```txt
Module component
  ↓
module SCSS file
  ↓
Tailwind @apply
```

Example:

```txt
src/modules/Books/
├── Books.tsx
├── books.module.scss
└── index.ts
```

```tsx
import classes from './books.module.scss';

export function Books() {
  return <section className={classes['books-wrapper']}>...</section>;
}
```

```scss
.books-wrapper {
  @apply flex flex-col gap-y-4;
}
```

---

# 8. Module SCSS Naming

Each module should use:

```txt
<module-name>.module.scss
```

Examples:

```txt
books.module.scss
checkout.module.scss
admin-dashboard.module.scss
```

For reusable components in `src/components`, use:

```txt
<component-name>.module.scss
```

Example:

```txt
src/components/Card/card.module.scss
```

For module-specific child components, either:

- keep styles in the parent module SCSS if simple
- create a local component SCSS file if complex

Do not create unnecessary style files.

---

# 9. SCSS Class Naming

Use readable kebab-case class names.

Recommended:

```scss
.books-wrapper {}
.top-page-wrapper {}
.book-card {}
.book-card--featured {}
```

Use modifier classes for state:

```scss
.card {}
.card--active {}
.card--disabled {}
.card--visible {}
```

When using CSS module classes with hyphens, access them with bracket notation:

```tsx
className={classes['books-wrapper']}
```

For conditional classes, use `classnames` or `clsx`.

Example:

```tsx
import classNames from 'classnames';

<div
  className={classNames(
    classes['book-card'],
    isFeatured && classes['book-card--featured'],
  )}
/>
```

---

# 10. `@apply` Rules

Use `@apply` for:

- flex/grid layout
- spacing
- typography utilities
- borders
- shadows
- rounded corners
- responsive utilities
- simple state styles

Example:

```scss
.book-card {
  @apply flex flex-col gap-4 rounded-lg border border-grey-200 bg-common-white p-4 shadow-sm;
}

.book-title {
  @apply text-lg font-semibold text-primary-main;
}
```

Group utilities in this order:

```txt
layout → position → size → spacing → typography → color → border → effects → state
```

Example:

```scss
.card {
  @apply flex relative w-full gap-4 p-4 text-sm text-primary-main border border-grey-200 rounded-lg shadow-sm;
}
```

Keep classes readable.

If `@apply` becomes too long or awkward, split into nested elements or use raw CSS where appropriate.

---

# 11. Responsive-First Rule

All UI must be mobile-friendly by default.

Write mobile styles first, then enhance for larger screens.

Example:

```scss
.books-wrapper {
  @apply flex flex-col gap-y-4 px-4 md:px-6 lg:px-8;
}

.top-page-wrapper {
  @apply flex flex-col gap-4 rounded-lg bg-common-white p-4 shadow-md md:flex-row md:items-center md:justify-between md:p-6;
}
```

Rules:

- avoid desktop-only layouts
- avoid fixed widths unless necessary
- use responsive prefixes like `sm:`, `md:`, `lg:`
- use `overflow-x-auto` for tables/cards when needed
- test common mobile widths mentally

Do not create UI that only works on desktop unless explicitly requested.

---

# 12. Tailwind in JSX

Tailwind classes directly in JSX are allowed only for simple one-off layout.

Allowed:

```tsx
<div className="flex items-center gap-2">
  ...
</div>
```

Avoid long class strings:

```tsx
<div className="flex min-h-screen w-full flex-col items-center justify-center gap-6 rounded-lg border border-grey-200 bg-common-white px-4 py-8 shadow-md md:flex-row md:px-8">
```

Move long styles into a SCSS module:

```tsx
<div className={classes['empty-state']}>
  ...
</div>
```

Use `classnames`/`clsx` for conditions.

Do not build most components with long inline utility strings unless the project explicitly chooses utility-first JSX.

---

# 13. MUI + Tailwind Rules

MUI component default styles belong in:

```txt
src/theme/components/
```

Tailwind module styles should not duplicate global MUI theme overrides.

Correct:

- global Button radius in `MuiButton`
- module-specific Button spacing in module SCSS
- one-off theme-aware value in `sx`

Example:

```tsx
<Button className={classes['submit-button']}>
  Submit
</Button>
```

```scss
.submit-button {
  @apply w-full md:w-auto;
}
```

Do not repeat global defaults everywhere:

```tsx
<Button sx={{ textTransform: 'none', borderRadius: '999px' }}>
  Submit
</Button>
```

if those are already in the theme.

---

# 14. `sx` vs SCSS Module

Use `sx` when:

- value depends on MUI theme
- using MUI palette tokens
- using MUI breakpoints
- styling one MUI component instance
- value is dynamic

Example:

```tsx
<Box
  sx={{
    bgcolor: 'background.paper',
    color: 'text.secondary',
    p: { xs: 2, md: 4 },
  }}
/>
```

Use SCSS modules when:

- styling a full section
- using nested selectors
- using Tailwind `@apply`
- writing pseudo-elements
- writing animations
- styling complex markup

Example:

```scss
.hero-section {
  @apply relative flex min-h-screen items-center justify-center overflow-hidden;

  &::before {
    content: '';
    @apply absolute inset-0 bg-black/40;
  }
}
```

---

# 15. Raw SCSS Usage

Use raw SCSS when Tailwind cannot express the style clearly.

Good use cases:

- keyframes
- transitions with custom easing
- pseudo-elements
- multi-layer backgrounds
- complex gradients
- third-party library DOM
- complex selectors

Example:

```scss
.hero {
  @apply relative flex min-h-screen items-center justify-center;

  background:
    linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35)),
    url('/images/hero.webp') center / cover no-repeat;
}
```

Do not use raw SCSS to duplicate simple Tailwind utilities.

---

# 16. `!important` Rule

Avoid `!important` by default.

Use this order first:

1. MUI theme override
2. MUI `sx`
3. SCSS module selector specificity
4. `#{!important}` only for local MUI override exceptions

Example:

```scss
.cta-button {
  @apply px-4 py-2 text-primary-main #{!important};

  &:hover {
    @apply bg-primary-main text-common-white #{!important};
  }
}
```

Do not use `!important` globally.

Do not use `!important` to fight poor architecture.

---

# 17. Color Rules

Do not hardcode raw hex colors in:

- JSX
- SCSS modules
- pages
- layouts
- feature components

Avoid:

```scss
.title {
  color: #1976d2;
}
```

Prefer:

```scss
.title {
  @apply text-primary-main;
}
```

Avoid:

```tsx
<Box sx={{ color: '#1976d2' }} />
```

Prefer:

```tsx
<Box sx={{ color: 'primary.main' }} />
```

Exceptions:

- charts
- maps
- third-party widgets
- external brand assets
- temporary prototypes

If a color repeats three or more times, promote it to the theme config.

---

# 18. Typography Rules

Typography should primarily come from MUI theme variants.

Use MUI:

```tsx
<Typography variant="h2" className={classes['title']}>
  Books
</Typography>
```

Use Tailwind in SCSS modules for:

- small layout-specific tweaks
- color
- alignment
- responsive spacing
- rare one-off text styles

Example:

```scss
.title {
  @apply text-primary-main;
}
```

Do not create a second full typography system in Tailwind if MUI already defines the typography scale.

---

# 19. Animation and Motion

Animations should be scoped to modules unless globally reused.

Example:

```scss
.reveal {
  @apply translate-y-8 opacity-0;
  transition:
    transform 0.4s ease,
    opacity 0.4s ease;

  &.reveal--visible {
    @apply translate-y-0 opacity-100;
  }
}
```

Rules:

- keep animations subtle
- respect `prefers-reduced-motion`
- avoid large motion for essential interactions
- use CSS transitions for simple effects
- use Framer Motion only when interaction complexity requires it

Example:

```scss
@media (prefers-reduced-motion: reduce) {
  .reveal {
    transition: none;
    transform: none;
  }
}
```

---

# 20. Third-Party Widgets

For third-party DOM styling:

- keep styles module-scoped
- use `:global()` only inside a local wrapper
- avoid global CSS sprawl

Example:

```scss
.calendar-wrapper {
  :global(.react-datepicker__day--selected) {
    @apply bg-primary-main text-common-white;
  }
}
```

Do not put third-party widget styling in global files unless the widget is truly app-wide.

---

# 21. Layout Patterns

Common app layout classes:

```scss
.layout-root {
  @apply flex min-h-screen flex-col;
}

.layout-main {
  @apply w-full flex-1 overflow-x-hidden;
}

.section {
  @apply px-4 py-10 md:px-6 md:py-14 lg:px-8 lg:py-20;
}

.container {
  @apply mx-auto w-full max-w-7xl;
}
```

If these are reused across many modules, consider moving them to:

- reusable layout components in `src/components`
- global utilities only if truly app-wide

Do not create global classes for every feature.

---

# 22. Accessibility Rules

Styling must preserve accessibility.

Rules:

- do not remove focus outlines without replacement
- ensure text has enough contrast
- use `sr-only` for screen-reader text when needed
- avoid hover-only interactions
- avoid tiny tap targets on mobile
- respect reduced motion

Example focus style:

```scss
.focusable {
  @apply outline-none;

  &:focus-visible {
    @apply outline outline-2 outline-offset-2 outline-primary-main;
  }
}
```

---

# 23. File Creation Rules

Before creating a new SCSS module:

1. Check if the module already has a `.module.scss`
2. Check if the component can use the parent module file
3. Create a component-specific SCSS module only if styles are complex or reusable
4. Do not create unnecessary global styles

Before adding a Tailwind class:

1. Check if the style should come from MUI theme
2. Check if a reusable component already exists
3. Use tokens instead of raw values
4. Keep mobile layout in mind

---

# 24. Tailwind v4 Note

This template targets Tailwind v3.4+.

If upgrading to Tailwind v4:

- plan the migration intentionally
- verify MUI CssBaseline compatibility
- verify `@apply` behavior
- verify config/token sharing
- update this template after migration

Do not randomly mix v3 and v4 patterns.

---

# 25. Checklist: New Project Setup

When setting up Tailwind:

1. Install Tailwind, PostCSS, Autoprefixer, Sass
2. Create `tailwind.config.ts` or use existing config
3. Add correct `content` paths
4. Map design tokens from MUI theme config where possible
5. Disable preflight if using MUI CssBaseline
6. Create `src/styles/tailwind.scss`
7. Import global styles once in `_app.tsx`
8. Confirm SCSS modules work
9. Confirm `@apply` works
10. Confirm responsive classes work
11. Confirm MUI components still render correctly
12. Confirm no raw hex colors are introduced unnecessarily

---

# 26. Strict Rules

Do NOT:

- use `@/` imports
- put feature styles in global SCSS
- hardcode raw hex colors when tokens exist
- create a separate Tailwind design system unrelated to MUI
- use long Tailwind class strings everywhere in JSX
- duplicate MUI theme overrides in SCSS modules
- enable Tailwind preflight without checking MUI CssBaseline
- use `!important` as the first solution
- scatter breakpoint numbers across files
- create desktop-only layouts by default
- style third-party widgets globally without reason
- create unnecessary SCSS files

---

# 27. AI Agent Notes

When styling:

- default to SCSS module + Tailwind `@apply`
- use MUI `sx` for theme-aware MUI-specific styling
- keep JSX class strings short
- use design tokens from the theme
- keep styles mobile-first
- keep feature styles inside modules
- keep reusable UI styles inside `src/components`
- keep app-wide styles inside `src/styles`
- avoid raw hex colors
- avoid new styling conventions

The final UI should stay clean, responsive, consistent, and aligned with the MUI theme.
