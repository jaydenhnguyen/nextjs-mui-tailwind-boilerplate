# 04 MUI Theme

The design system lives in `src/theme`. Brand colors, fonts, radius and breakpoints are set there once, and MUI, Tailwind and SCSS all read the same values.

---

## 1. Files

```txt
src/theme/
├── core/
│   ├── _config.ts        ← the file you edit for a new brand: colors, greys, light/dark tokens, radius
│   ├── palette.ts        turns _config into MUI color schemes (light + dark)
│   ├── typography.ts     variants h1–h6, body, button, ... (responsive sizes)
│   └── breakpoints.ts    xs 0, sm 640, md 768, lg 1024, xl 1280, 2xl 1536 (shared with Tailwind)
├── components/           MUI component overrides, one file per component (button.ts)
├── fonts/index.ts        next/font setup → --font-sans, --font-mono
├── helpers/              pxToRem, responsiveFontSizes
├── types/mui.d.ts        extra palette shades (lighter, darker), typography fields, 2xl breakpoint
├── motion.ts             animation durations and easings (see 09-motion.template.md)
├── theme.ts              createTheme: CSS variables, color schemes, typography, components
├── AppThemeProvider.tsx  ThemeProvider + CssBaseline + CSS layer order + font variables
└── emotionCache.ts       Emotion cache with CSS layers (used in _app and _document)
```

---

## 2. Rebranding a project

1. Colors: `src/theme/core/_config.ts`, `brand` (primary, secondary, info, success, warning, error with lighter → darker + contrastText), `grey`, and the `light` / `dark` background, text and divider tokens.
2. Radius: `borderRadius` in the same file (Tailwind's `rounded-theme` follows it).
3. Fonts: `src/theme/fonts/index.ts`. Swap `Geist` / `Geist_Mono` for other `next/font/google` or `next/font/local` fonts; keep the variable names.
4. Type scale: `src/theme/core/typography.ts`.
5. Component defaults: add a file in `src/theme/components/` and register it in `components/index.ts`.
6. Default mode: `DEFAULT_THEME_MODE` in `theme.ts` (`'system'`, `'light'` or `'dark'`).

The manifest's theme color and the browser `theme-color` meta read the same config, so there's nothing else to update.

---

## 3. How light and dark mode work

- MUI runs with `cssVariables: { colorSchemeSelector: 'class' }`: every palette value is a CSS variable (`--mui-palette-primary-main`), and the `<html>` element gets a `light` or `dark` class.
- `InitColorSchemeScript` in `_document` sets the class before the page paints, so there's no flash of the wrong mode.
- Tailwind colors point at the same variables (`05-tailwind-style.template.md`), so `text-text-secondary` or `bg-background-paper` switch with the mode automatically.
- Switch with `useThemeMode()` (`toggleMode`, `setMode`) or `<ThemeModeToggle />`.

Never write colors per mode by hand (`dark:bg-...`, `theme.palette.mode === 'dark' ? ... : ...`). Add a token to `_config.ts` instead.

---

## 4. CSS layers: who wins

```txt
@layer reset, mui;   ← declared first in AppThemeProvider
```

Low to high priority: `reset` (`src/styles/_core.scss`), then `mui` (all Emotion styles), then anything outside a layer (Tailwind utilities and SCSS modules). So a Tailwind class or SCSS module rule always beats MUI's own styles, without `!important`.

---

## 5. Using the theme in components

| Need                                 | Use                                                             |
| ------------------------------------ | --------------------------------------------------------------- |
| Layout, spacing, colors, borders     | SCSS module with `@apply` (`05-tailwind-style.template.md`)     |
| A color on an MUI prop               | the prop: `color="primary"`, `color="text.secondary"`           |
| Text style                           | `<Typography variant="h4" component="h1">`                      |
| A one-off value that needs the theme | `sx` with theme keys: `sx={{ color: 'text.secondary', mt: 2 }}` |
| The same change to every Button      | an override in `src/theme/components/`                          |

In overrides, read colors through `(theme.vars ?? theme).palette...` so they stay CSS variables:

```ts
export const MuiButton: Components<Theme>['MuiButton'] = {
  styleOverrides: {
    outlined: ({ theme }) => ({ '&.Mui-disabled': { color: (theme.vars ?? theme).palette.grey['500'] } }),
  },
};
```

---

## 6. Rules

- No raw colors (`#315EFB`, `rgb(...)`) in components or SCSS. Use theme tokens.
- No `styled()` components; use SCSS modules, and `sx` only for small theme-aware tweaks.
- Use MUI components for interactive UI (buttons, inputs, dialogs, menus, tables) so focus, keyboard and ARIA behavior come for free.
- Headings: pick the look with `variant` and the HTML level with `component`, keeping one `h1` per page.
- Keep MUI's own transitions (Dialog, Menu, Drawer, Collapse). Everything else animates with `motion` (`09-motion.template.md`).
- Don't import from `src/theme/core/*` in feature code. Use the theme through MUI props, `sx` or Tailwind classes.
