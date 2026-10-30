# 01 Project Structure

Where code goes, who owns it, and which way imports may point. This describes the code in the repo; follow it rather than inventing a new layout.

---

## 1. Routing: Pages Router only

| Use                                                                       | Never                                   |
| ------------------------------------------------------------------------- | --------------------------------------- |
| `src/pages/`, `_app.tsx`, `_document.tsx`                                 | `src/app/`, `layout.tsx`, `page.tsx`    |
| `Page.getLayout` to pick a layout                                         | App Router layouts, route groups        |
| `<Seo />` from `src/components/Seo` for meta tags                         | `metadata` / `generateMetadata` exports |
| `getServerSideProps` only for non-HTML routes (robots, sitemap, manifest) | data fetching in pages (use hooks)      |

---

## 2. The tree

Folders marked with a pack name disappear when that pack is removed (`npm run features remove <pack>`).

```txt
src/
├── apis/                 HTTP functions per backend domain                    [api]
│   ├── <domain>/         endpoints.ts, <domain>.ts, index.ts
│   └── index.ts
├── components/           generic UI with no feature knowledge (Seo, QueryState, Form, Motion, ...)
├── configs/              app-wide setup: env, site, navigation, zod messages, cookies
│   ├── auth/             auth strategy, token storage, 401 → refresh interceptors   [auth]
│   ├── request.ts        axios client + http helpers                          [api]
│   ├── api.config.ts     base URL, timeout                                    [api]
│   └── queryClient.ts    React Query defaults, global error/success toasts    [api]
├── hooks/                generic hooks (useDebounce, useQueryParams, useAppQuery, ...)
├── layouts/
│   ├── PublicLayout/     header + footer, for public pages
│   ├── PrivateLayout/    signed-in shell, redirects to login                  [auth]
│   └── components/       Header, Footer, SkipLink (layout chrome)
├── mocks/                MSW fake backend for dev:mock and tests              [mock-api]
├── modules/              one folder per feature (screens, feature components, hooks, models)
├── pages/                thin route files
├── providers/            AppProviders (theme, motion, confirm, toasts, error boundary), QueryProvider
├── shared/
│   ├── constants/        APP_ROUTES, SITEMAP_ROUTES, NO_INDEX_ROUTES
│   ├── enums/            ROLES                                                [auth]
│   ├── types/            User, PaginationRequest, PaginatedResponse
│   └── utils/            apiError, format, notify, telemetry, webStorage
├── styles/               _core.scss (reset), _app.scss (body/#__next), tailwind.scss
├── test/                 Vitest setup and helpers                             [tests]
├── theme/                MUI theme, fonts, motion tokens
└── types/                global .d.ts (env vars, axios/react-query augmentation)
```

There is no `src/context`, `src/services` or `src/lib`. Create one only when a project actually needs it, and say why in the PR.

---

## 3. Modules

A module is one feature: everything that's only used by that feature lives inside it.

```txt
src/modules/Products/
├── Products.tsx              the screen the page renders
├── Products.module.scss
├── index.ts                  export * from './Products';
├── components/               UI only this feature uses
│   ├── ProductTable/         ProductTable.tsx, ProductTable.module.scss, index.ts
│   └── index.ts
├── hooks/                    useGetProductList, useCreateProduct, useProductForm, ...
├── models/                   product.model.ts: entity, request/response and form types
├── schema/                   product.schema.ts: zod schemas
└── constants/                products.constant.ts: query keys, page size, option lists
```

- Create only the folders you need. `npm run gen crud Products` makes exactly this shape.
- A module may import another module's public `index.ts` (e.g. `src/modules/Authentication` for `useAuth`, `Can`), never its internals.
- Something used by two or more modules moves out: UI to `src/components`, hooks to `src/hooks`, types to `src/shared/types`, helpers to `src/shared/utils`.

---

## 4. Pages

A page picks the layout, sets SEO and renders one module. Nothing else.

```tsx
import * as React from 'react';
import { Seo } from 'src/components/Seo';
import { PrivateLayout } from 'src/layouts';
import { Products } from 'src/modules/Products';

export default function ProductsPage() {
  return (
    <>
      <Seo title="Products" noIndex />
      <Products />
    </>
  );
}

ProductsPage.getLayout = (page: React.ReactElement) => <PrivateLayout>{page}</PrivateLayout>;
```

- Route params are read in the module (`useRouter`, `useQueryParams`), not passed through the page.
- Every route is in `APP_ROUTES`. Private pages go in `NO_INDEX_ROUTES` (robots.txt) and get `noIndex`; public pages that should be found go in `SITEMAP_ROUTES`.
- Menu links come from `src/configs/navigation.config.ts` (`public`, `private`, `footer`).

---

## 5. Layouts

| Layout          | Has                                                        | Use for                |
| --------------- | ---------------------------------------------------------- | ---------------------- |
| `PublicLayout`  | header (`AuthActions` when auth exists), footer, skip link | public pages           |
| `PrivateLayout` | header with `UserMenu`, skip link; guards the session      | signed-in pages [auth] |

Each layout folder has exactly `<Layout>.tsx`, `<Layout>.module.scss`, `index.ts`. Header, footer and skip link are in `src/layouts/components/`. Layouts fade each page in on navigation, so pages don't add their own page transition.

Need a third shell (admin, docs)? Make `src/layouts/<Name>Layout/` the same way, reusing `Header`.

---

## 6. Import rules

- Absolute imports start with `src/` (`import { Seo } from 'src/components/Seo'`). Never `@/`; ESLint blocks it.
- Inside a module, use relative imports and local barrels: `./components`, `../hooks`.
- Import a shared folder through its barrel when one exists: `src/hooks`, `src/components/Form`, `src/shared/utils`.
- Prettier sorts imports on save and commit: React, Next, packages, MUI, `src/`, relative, styles.

Direction (arrows point at what may be imported):

```txt
pages → layouts → modules → components / hooks / shared / apis → configs / theme
```

Not allowed:

- `src/components`, `src/hooks`, `src/shared` importing from `src/modules`
- `src/apis` importing components or hooks (importing a module's `models` for types is fine)
- components or pages calling `src/apis` directly (always through a hook)
- feature code importing from `src/mocks` (only `_app` and tests do)

---

## 7. State: where data lives

| Data                                            | Where                                                          |
| ----------------------------------------------- | -------------------------------------------------------------- |
| Anything from the API, incl. the signed-in user | React Query, through hooks in the module                       |
| Filters, search, page number, selected tab      | the URL, with `useQueryParams`                                 |
| Form values                                     | react-hook-form via `useZodForm`                               |
| UI state of one component (open, hover)         | `useState` / `useOpenState`                                    |
| Preferences that survive reloads                | `useStoredState`                                               |
| Client state many distant components share      | React Context in the owning module, provider in `AppProviders` |

Add Zustand or Redux only when Context has clearly become the problem, and only with the user's agreement.

---

## 8. Creating files

1. Look for an existing component, hook or util first (`src/components/README.md`, `src/hooks/README.md`).
2. Generate instead of copying: `npm run gen crud|page|component|hook <Name>`.
3. Keep it local to the module until a second module needs it.
4. One component per folder: `Name/Name.tsx`, `Name/Name.module.scss` (if styled), `Name/index.ts`.
5. Don't create empty folders or barrels "for later".
