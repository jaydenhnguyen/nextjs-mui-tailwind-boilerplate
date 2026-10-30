# Layout Example

This example demonstrates the standard layout architecture used in this boilerplate.

It teaches:

- layout ownership
- `getLayout` pattern
- public/private/admin layouts
- responsive shell structure
- mobile navigation
- route guarding
- page-to-layout relationship
- layout component boundaries

---

# Core Philosophy

**Canonical layout rules:** `01-project-structure.template.md` §3.8. This file shows implementation examples only.

Layouts are app shell wrappers named **`PublicLayout`** and **`PrivateLayout`** (plus optional **`AdminLayout`**).

| Authentication | Layouts                                                      |
| -------------- | ------------------------------------------------------------ |
| Yes            | `PublicLayout` + `PrivateLayout`                             |
| No             | `PublicLayout` only — remove / do not create `PrivateLayout` |

Do not use custom shell names (`AppShell`, `DashboardLayout`, etc.) as substitutes.

Each layout folder contains **exactly 3 files** (`Layout.tsx`, `Layout.module.scss`, `index.ts`). Header, footer, sidebar, and nav chrome belong in `src/components/`.

They own:

- header
- footer
- sidebar
- navigation
- route guard behavior
- shell responsiveness
- app-level page structure

Layouts must NOT:

- own feature business logic
- call feature APIs directly
- contain feature-specific UI
- duplicate module composition

---

# Standard Flow

```txt
Page
    ↓
getLayout
    ↓
Layout
    ↓
Module Root
    ↓
Feature Components
```

Example:

```txt
ProductsPage
    ↓
PrivateLayout
    ↓
Products
    ↓
ProductList / ProductFilters
```

---

# Folder Structure

```txt
src/
├── components/
│   ├── PublicHeader/
│   ├── PublicFooter/
│   ├── PrivateHeader/
│   ├── PrivateSidebar/
│   └── ...
│
├── layouts/
│   ├── PublicLayout/
│   │   ├── PublicLayout.tsx
│   │   ├── PublicLayout.module.scss
│   │   └── index.ts
│   │
│   ├── PrivateLayout/
│   │   ├── PrivateLayout.tsx
│   │   ├── PrivateLayout.module.scss
│   │   └── index.ts
│   │
│   ├── AdminLayout/
│   │   ├── AdminLayout.tsx
│   │   ├── AdminLayout.module.scss
│   │   └── index.ts
│   │
│   └── index.ts
```

---

# Ownership Rules

| Concern                  | Owner                                     |
| ------------------------ | ----------------------------------------- |
| Route shell              | `src/layouts`                             |
| Header/footer/sidebar    | `src/components`                          |
| Mobile drawer navigation | `src/components`                          |
| Auth route guard         | `PrivateLayout`                           |
| Public auth redirect     | `PublicLayout`                            |
| Admin permission guard   | `AdminLayout`                             |
| Feature UI               | `src/modules/<Feature>`                   |
| Page route               | `src/pages`                               |
| Route constants          | `src/shared/constants/routes.constant.ts` |

---

# PublicLayout Example

Use for:

- landing pages
- login
- register
- forgot password
- public content pages

```tsx
import * as React from 'react';
import { PublicFooter } from 'src/components/PublicFooter';
import { PublicHeader } from 'src/components/PublicHeader';
import classes from './PublicLayout.module.scss';

type Props = {
  children: React.ReactNode;
};

export function PublicLayout({ children }: Props): React.ReactElement {
  return (
    <div className={classes['public-layout']}>
      <PublicHeader />

      <main className={classes['public-layout__main']}>{children}</main>

      <PublicFooter />
    </div>
  );
}
```

---

# PublicLayout Styling

```scss
.public-layout {
  @apply flex min-h-screen flex-col bg-background-default;
}

.public-layout__main {
  @apply w-full flex-1 overflow-x-hidden;
}
```

Rules:

- layout is responsive
- main content grows
- no feature-specific spacing here
- feature modules own their internal layout

---

# PrivateLayout Example

Use for:

- authenticated dashboard
- customer account pages
- private booking flows
- protected user pages

The real one is `src/layouts/PrivateLayout/PrivateLayout.tsx`. A variant with a sidebar keeps the same guard:

```tsx
import * as React from 'react';
import { useRouter } from 'next/router';
import { ErrorState } from 'src/components/ErrorState';
import { LoadingState } from 'src/components/LoadingState';
import { useAuth } from 'src/modules/Authentication';
import { APP_ROUTES } from 'src/shared/constants';
import { Sidebar } from '../components/Sidebar';
import classes from './PrivateLayout.module.scss';

export function PrivateLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isChecking, sessionError, retry } = useAuth();

  const shouldRedirect = !isChecking && !isAuthenticated && !sessionError;

  React.useEffect(() => {
    if (shouldRedirect) void router.replace({ pathname: APP_ROUTES.LOGIN, query: { redirect: router.asPath } });
  }, [shouldRedirect, router]);

  if (sessionError) return <ErrorState error={sessionError} onRetry={() => void retry()} />;
  if (!isAuthenticated) return <LoadingState fullScreen />;

  return (
    <div className={classes['private-layout']}>
      <Sidebar />
      <main className={classes['private-layout__main']}>{children}</main>
    </div>
  );
}
```

Never decide "signed in" from `tokenManager` in a layout; use `useAuth`.

---

# PrivateLayout Styling

```scss
.private-layout {
  @apply flex min-h-screen bg-background-default;
}

.private-layout__content {
  @apply flex min-w-0 flex-1 flex-col;
}

.private-layout__main {
  @apply w-full flex-1 overflow-x-hidden px-4 py-4 md:px-6 lg:px-8;
}
```

Rules:

- layout handles shell spacing only
- feature module owns feature-specific layout
- mobile spacing is included
- sidebar should collapse or move to drawer on mobile

---

# AdminLayout Example

Use for:

- admin dashboard
- role-protected pages
- internal management screens

Build it on top of `PrivateLayout` (which already handles sign-in) and add the role check with `<Can>`:

```tsx
import * as React from 'react';
import { StatusPage } from 'src/components/StatusPage';
import { Can } from 'src/modules/Authentication';
import { ROLES } from 'src/shared/enums';
import { PrivateLayout } from '../PrivateLayout';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <PrivateLayout>
      <Can role={[ROLES.ADMIN, ROLES.SUPER_ADMIN]} fallback={<StatusPage code={403} title="No access" />}>
        {children}
      </Can>
    </PrivateLayout>
  );
}
```

Rules:

- admin layout owns role guard
- admin pages do not duplicate permission logic
- current user should load once
- redirect unauthorized users consistently

---

# Page Usage with getLayout

## Public page

```tsx
import * as React from 'react';
import Head from 'next/head';
import { PublicLayout } from 'src/layouts/PublicLayout';
import { Home } from 'src/modules/Home';

export default function HomePage(): React.ReactElement {
  return (
    <>
      <Head>
        <title>Home</title>
      </Head>

      <Home />
    </>
  );
}

HomePage.getLayout = function getLayout(page: React.ReactElement) {
  return <PublicLayout>{page}</PublicLayout>;
};
```

---

## Private page

```tsx
import * as React from 'react';
import Head from 'next/head';
import { PrivateLayout } from 'src/layouts/PrivateLayout';
import { Products } from 'src/modules/Products';

export default function ProductsPage(): React.ReactElement {
  return (
    <>
      <Head>
        <title>Products</title>
      </Head>

      <Products />
    </>
  );
}

ProductsPage.getLayout = function getLayout(page: React.ReactElement) {
  return <PrivateLayout>{page}</PrivateLayout>;
};
```

---

## Admin page

```tsx
import * as React from 'react';
import Head from 'next/head';
import { AdminLayout } from 'src/layouts/AdminLayout';
import { AdminProducts } from 'src/modules/AdminProducts';

export default function AdminProductsPage(): React.ReactElement {
  return (
    <>
      <Head>
        <title>Admin Products</title>
      </Head>

      <AdminProducts />
    </>
  );
}

AdminProductsPage.getLayout = function getLayout(page: React.ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};
```

---

# _app.tsx getLayout Setup

```tsx
import * as React from 'react';
import type { AppProps } from 'next/app';
import { AppThemeProvider } from 'src/theme/AppThemeProvider';
import 'src/styles/_app.scss';
import 'src/styles/_core.scss';
import 'src/styles/tailwind.scss';

type PageWithLayout = AppProps['Component'] & {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: PageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout): React.ReactElement {
  const getLayout = Component.getLayout ?? ((page) => page);

  return <AppThemeProvider>{getLayout(<Component {...pageProps} />)}</AppThemeProvider>;
}
```

Rules:

- `_app.tsx` applies global providers
- page defines layout choice
- no layout logic inside modules

---

# Route Constants

## src/shared/constants/routes.constant.ts

```ts
export const APP_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  PRODUCTS: '/products',
  ADMIN_PRODUCTS: '/admin/products',
  NOT_FOUND: '/404',
};
```

Rules:

- do not hardcode route strings repeatedly
- navigation uses `APP_ROUTES`
- redirects use `APP_ROUTES`
- layout guards use `APP_ROUTES`

---

# Navigation Example

## Sidebar.tsx

```tsx
import Link from 'next/link';
import { useRouter } from 'next/router';
import { List, ListItemButton, ListItemText } from '@mui/material';
import { APP_ROUTES } from 'src/shared/constants';

const NAV_ITEMS = [
  {
    label: 'Products',
    href: APP_ROUTES.PRODUCTS,
  },
  {
    label: 'Orders',
    href: '/orders',
  },
];

export function Sidebar(): React.ReactElement {
  const router = useRouter();

  return (
    <List>
      {NAV_ITEMS.map((item) => {
        const isActive = router.pathname === item.href;

        return (
          <ListItemButton key={item.href} component={Link} href={item.href} selected={isActive}>
            <ListItemText primary={item.label} />
          </ListItemButton>
        );
      })}
    </List>
  );
}
```

Rules:

- use `next/link` for navigation
- use route constants
- use active route state
- do not hardcode routes in many places

---

# Mobile Navigation Example

Use MUI Drawer for mobile navigation.

```tsx
import * as React from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import { Drawer, IconButton } from '@mui/material';
import { Sidebar } from '../Sidebar';

export function MobileSidebarDrawer(): React.ReactElement {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <IconButton onClick={handleOpen} aria-label="Open navigation">
        <MenuIcon />
      </IconButton>

      <Drawer open={isOpen} onClose={handleClose} anchor="left">
        <Sidebar />
      </Drawer>
    </>
  );
}
```

Rules:

- use Drawer for mobile navigation
- preserve keyboard accessibility
- use aria labels
- avoid custom modal navigation systems

---

# Layout Component Boundaries

Layouts may contain:

- navigation
- shell state
- responsive drawer state
- auth guard
- current user loading
- header/footer/sidebar

Layouts must NOT contain:

- product list logic
- booking form logic
- order table queries
- feature business rules
- feature-specific modals

---

# Responsive Layout Rules

Layouts must:

- work on mobile first
- support drawer/sidebar behavior
- avoid horizontal overflow
- use `min-w-0` for flex children
- keep main content scrollable
- keep header/sidebar accessible

Example:

```scss
.private-layout {
  @apply flex min-h-screen;
}

.private-layout__sidebar {
  @apply hidden lg:block;
}

.private-layout__mobile-nav {
  @apply block lg:hidden;
}
```

---

# Loading and Guard States

During auth checks or current user loading:

```tsx
if (!isAuthenticated || isLoading) {
  return null;
}
```

For better UX, use shared loading shell if needed:

```tsx
return <FullPageLoading />;
```

Rules:

- avoid flicker
- avoid rendering protected content before guard resolves
- avoid duplicate auth checks inside feature components

---

# Error / 404 Layout

## src/pages/404.tsx

```tsx
import * as React from 'react';
import { PublicLayout } from 'src/layouts/PublicLayout';
import { NotFound } from 'src/modules/NotFound';

export default function NotFoundPage(): React.ReactElement {
  return <NotFound />;
}

NotFoundPage.getLayout = function getLayout(page: React.ReactElement) {
  return <PublicLayout>{page}</PublicLayout>;
};
```

Rules:

- 404 page still renders a module
- keep page thin
- use appropriate layout

---

# Layout Flow Summary

```txt
_app.tsx
    ↓
getLayout(page)
    ↓
PublicLayout / PrivateLayout / AdminLayout
    ↓
Page component
    ↓
Module root
```

---

# Good Patterns

Use:

- getLayout pattern
- route constants
- mobile-first shell
- MUI Drawer for mobile navigation
- layout-based guards
- thin pages
- module root rendering

---

# Anti-patterns

Do NOT:

- put feature logic in layouts
- put route guards inside every page
- put sidebar logic in feature modules
- hardcode route strings repeatedly
- use App Router files
- use `layout.tsx` or `page.tsx`
- create desktop-only layout shells
- render protected content before auth check
- duplicate mobile drawer implementations everywhere

---

# Strict Rules

1. Layouts live in `src/layouts`.
2. Pages use `getLayout`.
3. Pages stay thin.
4. Layouts own shell structure.
5. Layouts may own route guards.
6. Modules own feature UI.
7. Route constants are required.
8. Navigation uses Next.js `Link`.
9. Mobile nav uses accessible drawer/menu patterns.
10. No App Router conventions.

---

# AI Agent Notes

When creating layouts:

1. Identify public/private/admin route type.
2. Use existing layout if possible.
3. Use `getLayout` on the page.
4. Keep page thin.
5. Keep feature UI in module.
6. Put header/footer/sidebar inside layout.
7. Use route constants.
8. Add mobile drawer if navigation exists.
9. Keep layout responsive.
10. Do not put feature business logic inside layout.

The final layout should be:

- responsive
- accessible
- predictable
- reusable
- guard-aware
- AI-agent-friendly
