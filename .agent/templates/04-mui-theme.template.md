# 04 MUI Theme Template

This file defines the standard MUI theme architecture for this boilerplate.

It is the source of truth for:

- MUI theme folder structure
- palette and design tokens
- typography
- breakpoints
- component overrides
- theme provider setup
- MUI + Tailwind + SCSS module usage
- responsive styling rules

---

# 1. Styling Architecture

This boilerplate uses:

```txt
MUI Theme        → design system, component defaults, palette, typography
MUI Components   → reusable UI primitives and app UI
Tailwind         → layout, spacing, responsive utility classes
SCSS Modules     → module-specific styling, nested selectors, complex sections
```

The goal is to keep styling:

- consistent
- theme-driven
- mobile-friendly
- easy to reuse
- predictable for AI agents

---

# 2. Deterministic Styling Rule

When multiple styling approaches are valid, follow this order:

1. Existing repo pattern
2. MUI theme tokens
3. Reusable components from `src/components`
4. Tailwind utilities in SCSS modules
5. `sx` prop for theme-aware one-off adjustments
6. Custom CSS only when necessary

Do not introduce another styling system.

---

# 3. Expected Theme Structure

Expected structure:

```txt
src/theme/
├── AppThemeProvider.tsx
├── core/
│   ├── _config.ts
│   ├── palette.ts
│   ├── typography.ts
│   ├── base.ts
│   └── viewport_breakpoints.ts
├── components/
│   ├── button.ts
│   ├── textField.ts
│   ├── container.ts
│   └── index.ts
├── fonts/
│   ├── index.ts
│   ├── PrimaryFont.ts
│   └── SecondaryFont.ts
├── helpers/
│   ├── index.ts
│   ├── pxToRem.ts
│   ├── setFont.ts
│   └── responsiveFontSizes.ts
└── types/
    ├── index.ts
    └── appTheme.type.ts
```

Do not create all folders if they are not needed yet.

For small projects, this structure is acceptable:

```txt
src/theme/
├── AppThemeProvider.tsx
└── core/
    ├── _config.ts
    ├── palette.ts
    ├── typography.ts
    └── base.ts
```

---

# 4. File Responsibilities

| File                           | Responsibility                                                     |
|--------------------------------|--------------------------------------------------------------------|
| `AppThemeProvider.tsx`         | Wraps app with MUI `ThemeProvider` and `CssBaseline`               |
| `core/_config.ts`              | Raw design tokens: colors, grey scale, background, semantic values |
| `core/palette.ts`              | Maps raw tokens into MUI palette shape                             |
| `core/typography.ts`           | Typography variants, font family, font weights                     |
| `core/base.ts`                 | Creates final MUI theme using `createTheme`                        |
| `core/viewport_breakpoints.ts` | Custom breakpoint values and module augmentation                   |
| `components/*.ts`              | MUI component overrides                                            |
| `fonts/*`                      | Font setup using `next/font` or local fonts                        |
| `helpers/*`                    | Theme helper functions like `pxToRem`                              |
| `types/*`                      | MUI TypeScript module augmentation                                 |

---

# 5. Import Rules

This project uses `src/` imports.

Correct:

```ts
import {AppThemeProvider} from 'src/theme/AppThemeProvider';
import {baseTheme} from 'src/theme/core/base';
import {Card} from 'src/components/Card';
```

Incorrect:

```ts
import {AppThemeProvider} from '@/theme/AppThemeProvider';
```

Feature components should not import private theme config directly.

Avoid:

```ts
import {themeConfig} from 'src/theme/core/_config';
```

Prefer:

```tsx
<Box sx={{color: 'primary.main', bgcolor: 'background.paper'}}/>
```

or:

```ts
const theme = useTheme();
```

Theme internals may import `_config.ts`.

App/components should use theme tokens through:

- `sx`
- `useTheme`
- MUI component props
- reusable components

---

# 6. Design Token Layer

Raw design tokens must live in:

```txt
src/theme/core/_config.ts
```

Use this file for:

- raw hex colors
- grey scale
- semantic colors
- text colors
- background colors
- brand color values
- non-MUI token values

Example:

```ts
export const themeConfig = {
  palette: {
    primary: {
      lighter: '#EAF3FF',
      light: '#8EC5FF',
      main: '#1976D2',
      dark: '#115293',
      darker: '#082F5F',
      contrastText: '#FFFFFF',
    },
    secondary: {
      lighter: '#F3E8FF',
      light: '#C084FC',
      main: '#9333EA',
      dark: '#6B21A8',
      darker: '#3B0764',
      contrastText: '#FFFFFF',
    },
    grey: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#EEEEEE',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#9E9E9E',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
    common: {
      black: '#000000',
      white: '#FFFFFF',
    },
  },
  text: {
    primary: '#111827',
    secondary: '#4B5563',
    disabled: '#9CA3AF',
  },
  background: {
    default: '#F9FAFB',
    paper: '#FFFFFF',
  },
};
```

Rules:

- raw hex values belong here
- do not copy raw hex values into feature components
- do not duplicate palette values in SCSS variables
- document any special non-palette color here

---

# 7. Palette Builder

MUI palette mapping must live in:

```txt
src/theme/core/palette.ts
```

Example:

```ts
import {themeConfig} from './_config';

export const palette = {
  light: {
    primary: themeConfig.palette.primary,
    secondary: themeConfig.palette.secondary,
    grey: themeConfig.palette.grey,
    common: themeConfig.palette.common,
    text: themeConfig.text,
    background: themeConfig.background,
  },
};
```

If dark mode is supported:

```ts
export const palette = {
  light: {
    // light palette
  },
  dark: {
    // dark palette
  },
};
```

Do not add dark mode unless the project needs it.

---

# 8. Theme Assembly

The final MUI theme must be created in:

```txt
src/theme/core/base.ts
```

Example:

```ts
import {createTheme} from '@mui/material/styles';
import {palette} from './palette';
import {typography} from './typography';
import {components} from '../components';

export const baseTheme = createTheme({
  palette: palette.light,
  typography,
  shape: {
    borderRadius: 8,
  },
  components,
});
```

If the project uses MUI v6/v7 color schemes:

```ts
export const baseTheme = createTheme({
  colorSchemes: {
    light: {
      palette: palette.light,
    },
  },
  defaultColorScheme: 'light',
  typography,
  shape: {
    borderRadius: 8,
  },
  components,
});
```

Follow the existing repo and installed MUI version first.

---

# 9. AppThemeProvider

Theme provider must live in:

```txt
src/theme/AppThemeProvider.tsx
```

Example:

```tsx
import {CssBaseline, ThemeProvider} from '@mui/material';
import {baseTheme} from './core/base';

export function AppThemeProvider({
                                   children,
                                 }: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={baseTheme}>
      <CssBaseline/>
      {children}
    </ThemeProvider>
  );
}
```

Wrap the app once in:

```txt
src/pages/_app.tsx
```

Example:

```tsx
import {AppThemeProvider} from 'src/theme/AppThemeProvider';

export default function App({Component, pageProps}: AppProps) {
  return (
    <AppThemeProvider>
      <Component {...pageProps} />
    </AppThemeProvider>
  );
}
```

If the app also uses QueryProvider/AuthProvider/UIProvider, compose providers cleanly.

---

# 10. Typography

Typography must live in:

```txt
src/theme/core/typography.ts
```

Rules:

- use `pxToRem`
- define common variants
- avoid inline font sizes in components
- add variants to theme if reused
- use `next/font` when possible
- keep font setup centralized

Example:

```ts
import {pxToRem} from '../helpers';

export const typography = {
  fontFamily: '"Inter", system-ui, sans-serif',
  h1: {
    fontWeight: 700,
    lineHeight: 1.2,
    fontSize: pxToRem(40),
  },
  h2: {
    fontWeight: 700,
    lineHeight: 1.25,
    fontSize: pxToRem(32),
  },
  body1: {
    fontSize: pxToRem(16),
    lineHeight: 1.6,
  },
  body2: {
    fontSize: pxToRem(14),
    lineHeight: 1.5,
  },
  button: {
    textTransform: 'none',
    fontWeight: 600,
  },
};
```

Use components like:

```tsx
<Typography variant="h2">Title</Typography>
<Typography variant="body1" color="text.secondary">
  Description
</Typography>
```

Avoid:

```tsx
<Typography sx={{fontSize: 37}}>
  Title
</Typography>
```

unless it is a true one-off.

---

# 11. Font Setup

Fonts should live in:

```txt
src/theme/fonts/
```

Prefer `next/font`.

Example:

```ts
import {Inter} from 'next/font/google';

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});
```

Use CSS variables or helper functions consistently.

Do not add fonts in random components.

---

# 12. Breakpoints

Use MUI default breakpoints unless custom breakpoints are already defined.

Default breakpoints:

```txt
xs
sm
md
lg
xl
```

Use responsive `sx`:

```tsx
<Box
  sx={{
    p: {xs: 2, md: 4},
    display: 'flex',
    flexDirection: {xs: 'column', md: 'row'},
  }}
/>
```

If custom breakpoints are needed, define them in:

```txt
src/theme/core/viewport_breakpoints.ts
```

Example:

```ts
export const customViewport = {
  breakpoints: {
    values: {
      xs: 0,
      sm: 640,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
};
```

Do not scatter breakpoint values across components.

---

# 13. MUI Component Overrides

MUI component overrides should live in:

```txt
src/theme/components/
```

Example:

```txt
src/theme/components/
├── button.ts
├── textField.ts
├── container.ts
└── index.ts
```

Naming convention:

```txt
button.ts      → exports MuiButton
dialog.ts      → exports MuiDialog
textField.ts   → exports MuiTextField
```

Example:

```ts
// src/theme/components/button.ts

export const MuiButton = {
  defaultProps: {
    disableElevation: true,
  },
  styleOverrides: {
    root: {
      textTransform: 'none',
      borderRadius: '999px',
      fontWeight: 600,
    },
  },
};
```

```ts
// src/theme/components/index.ts

import {MuiButton} from './button';

export const components = {
  MuiButton,
};
```

Do not duplicate global defaults in every component instance.

Example:

Incorrect:

```tsx
<Button sx={{textTransform: 'none', borderRadius: '999px'}}>
  Submit
</Button>
```

if this is the default button style.

Correct:

- put it in `MuiButton` override once.

---

# 14. Theme vs Component Styling

| Belongs in theme           | Belongs in component/module    |
|----------------------------|--------------------------------|
| default button radius      | page-specific layout           |
| input border style         | hero section image positioning |
| typography scale           | one-off animation              |
| card shadow standard       | module-specific spacing        |
| focus-visible style        | pseudo-elements                |
| disabled states            | third-party widget styling     |
| global container max width | complex grid composition       |

Use theme for reusable global visual rules.

Use module/component styling for feature-specific layout.

---

# 15. Reusable Components + MUI

Reusable UI components belong in:

```txt
src/components/
```

Example:

```txt
src/components/Card/
├── Card.tsx
├── card.module.scss
└── index.ts
```

Feature-specific components should reuse global UI primitives.

Example:

```tsx
import {Card} from 'src/components/Card';

export function BookCard() {
  return (
    <Card>
      {/* book-specific UI */}
    </Card>
  );
}
```

Correct:

```txt
src/components/Card
src/modules/Books/components/BookCard
```

Incorrect:

```txt
src/components/BookCard
```

unless `BookCard` is truly reused across multiple modules and is no longer domain-specific.

---

# 16. MUI + Tailwind + SCSS Modules

This project uses all three with clear responsibilities.

## MUI

Use MUI for:

- components
- theme tokens
- typography
- palette
- form controls
- dialogs/modals
- responsive `sx` when theme-aware

## Tailwind

Use Tailwind for:

- layout
- spacing
- flex/grid
- responsive utility classes
- quick structural styling

## SCSS Modules

Use SCSS modules for:

- module-specific styles
- nested selectors
- complex sections
- pseudo-elements
- animations
- non-MUI widget styling

---

# 17. Module SCSS Convention

Each module should have a module SCSS file.

Pattern:

```txt
src/modules/<Module>/<module-name>.module.scss
```

Example:

```txt
src/modules/Books/books.module.scss
```

Example usage:

```scss
.books-wrapper {
  @apply flex flex-col gap-y-4;
}

.top-page-wrapper {
  @apply flex bg-white border shadow-md rounded-lg p-6 items-center justify-end;

  .add-product-btn {
    @apply flex items-center text-white font-bold py-2 px-4;
  }
}
```

Rules:

- use `@apply` for Tailwind utilities
- keep styles scoped to the module
- avoid global class names
- avoid duplicating theme colors
- use responsive utilities from the start

---

# 18. `sx` Usage Rules

Use `sx` when:

- style depends on MUI theme
- using palette tokens
- using MUI breakpoints
- styling MUI component slots
- applying one-off theme-aware spacing

Example:

```tsx
<Box
  sx={{
    bgcolor: 'background.paper',
    color: 'text.primary',
    p: {xs: 2, md: 4},
    borderRadius: 2,
  }}
/>
```

Do not use `sx` for large complex section styling.

For complex module styling, prefer SCSS modules.

---

# 19. Raw Color Rules

Do not hardcode raw hex colors in:

- feature components
- module components
- pages
- layouts
- SCSS modules

Avoid:

```tsx
<Box sx={{color: '#1976D2'}}/>
```

Prefer:

```tsx
<Box sx={{color: 'primary.main'}}/>
```

Avoid:

```scss
.title {
  color: #1976D2;
}
```

Prefer:

- MUI `sx`
- theme override
- CSS variable from theme if already configured
- documented token in `_config.ts`

Exceptions:

- charts
- maps
- third-party widgets
- external brand assets
- temporary prototypes

Any exception should be intentional.

---

# 20. Responsive-First Rule

All UI must be responsive by default.

Preferred approach:

1. Build mobile layout first
2. Enhance for tablet/desktop
3. Use Tailwind responsive utilities or MUI breakpoints
4. Avoid fixed widths unless needed
5. Test common mobile widths mentally

Example SCSS:

```scss
.books-wrapper {
  @apply flex flex-col gap-y-4 px-4 md:px-6 lg:px-8;
}

.top-page-wrapper {
  @apply flex flex-col gap-4 md:flex-row md:items-center md:justify-between;
}
```

Example MUI `sx`:

```tsx
<Box
  sx={{
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: 'repeat(2, 1fr)',
      lg: 'repeat(3, 1fr)',
    },
    gap: 3,
  }}
/>
```

Do not create desktop-only layouts unless explicitly requested.

---

# 21. Accessibility Rules

Theme and components should support accessibility.

Rules:

- ensure button text has enough contrast
- keep visible focus states
- use semantic MUI components when possible
- do not remove outlines unless replacing with accessible focus styles
- respect `prefers-reduced-motion` for large animations
- use correct Typography variants/HTML tags where possible

Example:

```tsx
<Typography variant="h1" component="h1">
  Page title
</Typography>
```

---

# 22. Styled API Rule

Avoid heavy use of MUI `styled()` unless creating a reusable primitive.

Prefer:

- theme overrides for global MUI behavior
- `sx` for theme-aware one-offs
- SCSS modules for complex module styling
- Tailwind utilities inside SCSS modules for layout

Use `styled()` only when:

- the styled component is reusable
- the style strongly depends on theme
- `sx` would be repeated in many places
- SCSS module is not appropriate

---

# 23. Global Styles

Global styles belong in:

```txt
src/styles/
```

Example:

```txt
src/styles/
├── _app.scss
├── _core.scss
└── tailwind.scss
```

Use global styles for:

- Tailwind imports
- CSS reset additions
- global body/html rules
- global third-party overrides

Do not place feature-specific styles in global files.

Feature/module styles belong in module SCSS files.

---

# 24. New Project Checklist

When setting up a new project:

1. Create or verify `src/theme`
2. Add/update `_config.ts`
3. Add/update `palette.ts`
4. Add/update `typography.ts`
5. Add/update `base.ts`
6. Add/update `AppThemeProvider.tsx`
7. Add MUI component overrides in `src/theme/components`
8. Wrap app once in `_app.tsx`
9. Confirm Tailwind and SCSS modules work
10. Confirm responsive mobile layout works
11. Avoid raw hex in components
12. Reuse `src/components` primitives before creating one-off UI

---

# 25. Strict Rules

Do NOT:

- use `@/` imports
- hardcode raw hex colors in components
- duplicate MUI overrides in every instance
- create another styling system
- put feature styles in global styles
- put domain-specific components in `src/components`
- import `_config.ts` directly inside feature components
- scatter breakpoint numbers across the app
- create desktop-only UI by default
- remove focus states without replacement
- use large `styled()` trees for normal module layout

---

# 26. AI Agent Notes

When creating UI:

- use MUI components when available
- use theme tokens before hardcoded values
- use reusable components from `src/components`
- use module SCSS files for module-specific styling
- use Tailwind `@apply` for layout/spacing inside SCSS modules
- use `sx` for theme-aware MUI adjustments
- keep components mobile-friendly by default
- avoid creating new design conventions
- follow existing theme structure first

The final UI should feel consistent, responsive, and connected to the same design system.
