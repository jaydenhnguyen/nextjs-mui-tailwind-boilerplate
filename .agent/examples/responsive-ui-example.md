# Responsive UI Example

This example demonstrates the standard responsive UI architecture used in this boilerplate.

It teaches:

- mobile-first design
- responsive layouts
- MUI + Tailwind integration
- responsive grids
- responsive typography
- mobile navigation patterns
- responsive spacing
- responsive tables/cards
- responsive forms
- breakpoint strategy

---

# Core Philosophy

The UI must be:

```txt
mobile-first
    ↓
tablet-friendly
    ↓
desktop-enhanced
```

NOT:

```txt
desktop-first
    ↓
broken mobile fixes
```

Every component should work on:

- mobile
- tablet
- laptop
- desktop

by default.

---

# Tech Stack Philosophy

This boilerplate uses:

| Technology   | Purpose                     |
|--------------|-----------------------------|
| MUI          | design system               |
| Tailwind     | layout/utilities            |
| SCSS Modules | scoped styling              |
| MUI sx       | theme-aware one-off styling |

Preferred pattern:

```txt
SCSS Modules + Tailwind @apply
```

---

# Responsive Rules

## Always Mobile-first

Correct:

```scss
.wrapper {
  @apply grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3;
}
```

Wrong:

```scss
.wrapper {
  @apply grid-cols-3;
}
```

then patching mobile later.

---

# Breakpoint Philosophy

Recommended breakpoints:

| Breakpoint | Usage        |
|------------|--------------|
| default    | mobile       |
| `sm:`      | large mobile |
| `md:`      | tablet       |
| `lg:`      | desktop      |
| `xl:`      | wide desktop |

Avoid:

- excessive custom breakpoints
- desktop-only assumptions

---

# Example Folder Structure

```txt
src/
├── modules/
│   └── Products/
│       ├── Products.tsx
│       ├── Products.module.scss
│       ├── components/
│       │   ├── ProductList/
│       │   ├── ProductCard/
│       │   ├── ProductFilters/
│       │   └── ProductMobileFilters/
│
├── layouts/
│   └── PrivateLayout/
│       ├── components/
│       │   ├── Sidebar/
│       │   ├── MobileSidebarDrawer/
│       │   └── PrivateHeader/
│
└── components/
    ├── Card/
    ├── EmptyState/
    ├── ErrorState/
    └── LoadingState/
```

---

# Mobile-first Page Layout

## Products.module.scss

```scss
.products-wrapper {
  @apply flex flex-col gap-4 px-4 py-4 md:px-6 lg:px-8;
}

.products-header {
  @apply flex flex-col gap-3 md:flex-row md:items-center md:justify-between;
}
```

Rules:

- start with mobile stacking
- enhance for desktop later
- avoid desktop-first layout

---

# Responsive Grid Example

## ProductList.module.scss

```scss
.product-list {
  @apply grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4;
}
```

Behavior:

| Screen        | Columns |
|---------------|---------|
| mobile        | 1       |
| small tablet  | 2       |
| desktop       | 3       |
| large desktop | 4       |

Rules:

- grids should scale naturally
- avoid hardcoded widths
- prefer responsive grid system

---

# Responsive Card Example

## ProductCard.tsx

```tsx
import * as React from 'react';
import { Typography } from '@mui/material';

import { Card } from 'src/components/Card';

import { Product } from '../../models';

import classes from './ProductCard.module.scss';

type Props = {
  product: Product;
};

export function ProductCard({
  product,
}: Props): React.ReactElement {
  return (
    <Card className={classes['product-card']}>
      <div className={classes['product-card__image-wrapper']}>
        <img
          src={product.imageUrl}
          alt={product.name}
          className={classes['product-card__image']}
        />
      </div>

      <div className={classes['product-card__content']}>
        <Typography variant="h6">
          {product.name}
        </Typography>

        <Typography variant="body2">
          ${product.price}
        </Typography>
      </div>
    </Card>
  );
}
```

---

## ProductCard.module.scss

```scss
.product-card {
  @apply flex flex-col overflow-hidden;
}

.product-card__image-wrapper {
  @apply aspect-square w-full overflow-hidden;
}

.product-card__image {
  @apply h-full w-full object-cover;
}

.product-card__content {
  @apply flex flex-col gap-2 p-4;
}
```

Rules:

- use aspect ratios
- avoid fixed image heights
- cards should resize naturally

---

# Responsive Typography

Correct:

```tsx
<Typography
  variant="h4"
  sx={{
    fontSize: {
      xs: '1.5rem',
      md: '2rem',
    },
  }}
>
  Products
</Typography>
```

Better approach using theme variants:

```tsx
<Typography variant="pageTitle">
  Products
</Typography>
```

Configured in MUI theme.

Rules:

- typography scales responsively
- avoid giant mobile text
- avoid tiny desktop text

---

# Responsive Table Strategy

Large tables are difficult on mobile.

Preferred approaches:

- responsive cards
- horizontal scroll wrapper
- collapsible rows
- mobile-specific list view

---

## Responsive Table Wrapper

```scss
.table-wrapper {
  @apply w-full overflow-x-auto;
}
```

---

## Mobile Card Alternative

Instead of forcing huge tables on mobile:

```txt
Desktop → table
Mobile → stacked cards
```

Example:

```tsx
{isMobile ? (
  <ProductMobileList products={products} />
) : (
  <ProductTable products={products} />
)}
```

Use:

- Context
- `useMediaQuery`
- UIContext

---

# UIContext Example

## UIContext.tsx

```tsx
import * as React from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';

type UIContextValue = {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
};

const UIContext = React.createContext<UIContextValue | undefined>(
  undefined,
);

export function UIProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useMediaQuery('(max-width:900px)');
  const isTablet = useMediaQuery('(min-width:901px) and (max-width:1200px)');
  const isDesktop = useMediaQuery('(min-width:1201px)');

  const value = React.useMemo(
    () => ({
      isMobile,
      isTablet,
      isDesktop,
    }),
    [isMobile, isTablet, isDesktop],
  );

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = React.useContext(UIContext);

  if (!context) {
    throw new Error('useUI must be used inside UIProvider');
  }

  return context;
}
```

Rules:

- UIContext owns responsive helper states
- avoid repeated media queries everywhere
- use only when needed

---

# Responsive Sidebar Example

Desktop:

```txt
persistent sidebar
```

Mobile:

```txt
drawer navigation
```

---

## Desktop Sidebar

```scss
.sidebar {
  @apply hidden w-[280px] border-r bg-common-white lg:flex;
}
```

---

## Mobile Drawer Trigger

```scss
.mobile-nav-trigger {
  @apply flex lg:hidden;
}
```

Rules:

- sidebar hidden on mobile
- drawer shown on mobile
- avoid desktop sidebar shrinking into unusable state

---

# Mobile Drawer Example

## MobileSidebarDrawer.tsx

```tsx
import * as React from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import { Drawer, IconButton } from '@mui/material';

import { Sidebar } from '../Sidebar';

export function MobileSidebarDrawer(): React.ReactElement {
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <IconButton onClick={handleOpen}>
        <MenuIcon />
      </IconButton>

      <Drawer
        anchor="left"
        open={open}
        onClose={handleClose}
      >
        <Sidebar />
      </Drawer>
    </>
  );
}
```

---

# Responsive Form Example

## CreateProductForm.module.scss

```scss
.create-product-form {
  @apply flex flex-col gap-6;
}

.form-grid {
  @apply grid grid-cols-1 gap-4 md:grid-cols-2;
}

.form-actions {
  @apply flex flex-col gap-3 md:flex-row md:justify-end;
}
```

Rules:

- fields stack on mobile
- split columns only on larger screens
- actions should remain touch-friendly

---

# Responsive Modal Example

```tsx
<Dialog
  open={open}
  fullWidth
  maxWidth="sm"
>
```

Avoid:

- fixed width modals
- desktop-only modal dimensions

---

# Responsive Spacing Rules

Use responsive spacing:

```scss
.wrapper {
  @apply px-4 py-4 md:px-6 lg:px-8;
}
```

Avoid:

- giant desktop padding on mobile
- tiny desktop spacing

---

# Touch-friendly UI Rules

Buttons:

- minimum touch size
- proper spacing
- avoid tiny icons

Correct:

```scss
.action-button {
  @apply min-h-[44px];
}
```

Rules:

- mobile users use thumbs
- clickable targets should be large enough

---

# Responsive Image Rules

Correct:

```scss
.image {
  @apply h-full w-full object-cover;
}
```

Use:

- `object-cover`
- `aspect-*`
- responsive containers

Avoid:

- fixed pixel image dimensions
- stretched images

---

# Overflow Rules

Common fix:

```scss
.content {
  @apply min-w-0;
}
```

Important for:

- flex layouts
- table wrappers
- content shells

Avoid:

- hidden horizontal overflow bugs

---

# Responsive Flex Example

Correct:

```scss
.header {
  @apply flex flex-col gap-4 md:flex-row md:items-center md:justify-between;
}
```

Behavior:

- mobile stacks
- desktop aligns horizontally

---

# Responsive Empty State Example

```scss
.empty-state {
  @apply flex flex-col items-center justify-center px-6 py-12 text-center;
}
```

Rules:

- centered
- readable on mobile
- avoid giant whitespace

---

# Responsive Loading State Example

```scss
.loading-wrapper {
  @apply flex items-center justify-center py-12;
}
```

---

# Responsive Auth Page Example

```scss
.login-page {
  @apply flex min-h-screen items-center justify-center px-4;
}

.login-card {
  @apply w-full max-w-md rounded-xl bg-common-white p-6 shadow-md;
}
```

Rules:

- full width on mobile
- constrained width on desktop
- centered vertically

---

# Responsive Admin Dashboard Example

```scss
.dashboard-grid {
  @apply grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4;
}
```

Rules:

- cards stack naturally
- desktop expands grid
- avoid fixed dashboard widths

---

# Responsive State Strategy

Use:

- CSS first
- Tailwind responsive classes
- MUI responsive props
- `useMediaQuery` only when behavior changes

Avoid:

- excessive JS-based responsiveness

---

# Good Responsive Patterns

Use:

- mobile-first grids
- responsive spacing
- responsive drawers
- responsive forms
- responsive cards
- aspect ratios
- overflow wrappers
- flexible layouts
- touch-friendly actions

---

# Anti-patterns

Do NOT:

- create desktop-first layouts
- use fixed pixel widths everywhere
- shrink giant tables onto mobile
- ignore touch interactions
- hardcode heights
- create horizontal overflow
- use tiny clickable targets
- duplicate mobile and desktop pages unnecessarily
- use media query hooks for pure styling

---

# Strict Rules

1. Mobile-first by default.
2. Layouts must scale progressively.
3. Responsive grids are preferred.
4. Forms stack on mobile.
5. Sidebar becomes drawer on mobile.
6. Tables require mobile strategy.
7. Images must scale responsively.
8. Avoid fixed desktop dimensions.
9. Use SCSS Modules + Tailwind `@apply`.
10. Use JS responsiveness only when behavior changes.

---

# AI Agent Notes

When creating responsive UI:

1. Start with mobile layout first.
2. Add responsive breakpoints progressively.
3. Use responsive grids.
4. Use responsive spacing.
5. Make forms stack on mobile.
6. Convert sidebar to drawer on mobile.
7. Ensure touch-friendly actions.
8. Prevent horizontal overflow.
9. Use responsive images.
10. Keep layouts flexible.

The final UI should be:

- mobile-friendly
- tablet-friendly
- desktop-enhanced
- accessible
- scalable
- production-grade
- AI-agent-friendly
