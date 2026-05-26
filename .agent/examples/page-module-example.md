# Page Module Example

This example demonstrates the standard page-to-module architecture used in this boilerplate.

It teaches:

- thin page structure
- module root ownership
- `getLayout` usage
- SEO ownership
- route constants
- dynamic routes
- query params
- page vs module responsibility
- what NOT to put inside pages

---

# Core Philosophy

Pages are route entry points only.

Pages should:

```txt
define route
    ↓
optionally define SEO
    ↓
optionally define getLayout
    ↓
render module root
```

Pages must NOT:

- call APIs directly
- contain business logic
- contain large JSX composition
- own feature state
- render many feature sections directly

Feature logic belongs inside:

```txt
src/modules/<Feature>/
```

---

# Standard Flow

```txt
src/pages/products/index.tsx
    ↓
getLayout
    ↓
PrivateLayout
    ↓
Products module
    ↓
ProductHeader / ProductFilters / ProductList
```

---

# Folder Structure Example

```txt
src/
├── pages/
│   ├── products/
│   │   └── index.tsx
│   │
│   ├── products/
│   │   └── [id].tsx
│   │
│   └── login/
│       └── index.tsx
│
├── layouts/
│   ├── PublicLayout/
│   ├── PrivateLayout/
│   └── AdminLayout/
│
├── modules/
│   ├── Products/
│   │   ├── Products.tsx
│   │   ├── Products.module.scss
│   │   ├── components/
│   │   ├── hooks/
│   │   └── index.ts
│   │
│   ├── ProductDetail/
│   │   ├── ProductDetail.tsx
│   │   ├── ProductDetail.module.scss
│   │   ├── hooks/
│   │   └── index.ts
│   │
│   └── Authentication/
│       └── Login/
│           ├── Login.tsx
│           └── index.ts
```

---

# Ownership Rules

| Concern          | Owner                                     |
|------------------|-------------------------------------------|
| Route file       | `src/pages/`                              |
| SEO/Head         | page or reusable SEO component            |
| Layout selection | page via `getLayout`                      |
| Feature screen   | `src/modules/<Feature>/`                  |
| Feature sections | module components                         |
| Feature hooks    | module hooks                              |
| API clients      | `src/apis/`                               |
| Route constants  | `src/shared/constants/routes.constant.ts` |

---

# Basic Static Page Example

## src/pages/products/index.tsx

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
        <meta
          name="description"
          content="View and manage products."
        />
      </Head>

      <Products />
    </>
  );
}

ProductsPage.getLayout = function getLayout(page: React.ReactElement) {
  return <PrivateLayout>{page}</PrivateLayout>;
};
```

Rules:

- page is thin
- page imports module root
- page uses layout
- page may define SEO
- page does not fetch data directly

---

# Corresponding Module Root

## src/modules/Products/Products.tsx

```tsx
import * as React from 'react';

import { EmptyState, ErrorState, LoadingState } from 'src/components';

import { ProductFilters } from './components/ProductFilters';
import { ProductList } from './components/ProductList';
import { useGetProducts } from './hooks';

import classes from './Products.module.scss';

export function Products(): React.ReactElement {
  const [searchValue, setSearchValue] = React.useState('');

  const { data, isLoading, error } = useGetProducts({
    payload: {
      page: 1,
      pageSize: 12,
      searchValue,
    },
  });

  const handleSearchChange = React.useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState />;
  }

  return (
    <section className={classes['products-wrapper']}>
      <ProductFilters
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
      />

      {!data?.data?.length ? (
        <EmptyState />
      ) : (
        <ProductList products={data.data} />
      )}
    </section>
  );
}
```

Rules:

- module owns feature state
- module calls feature hooks
- module composes feature UI
- module handles loading/error/empty states

---

# Dynamic Route Example

## src/pages/products/[id].tsx

```tsx
import * as React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

import { PrivateLayout } from 'src/layouts/PrivateLayout';
import { ProductDetail } from 'src/modules/ProductDetail';

export default function ProductDetailPage(): React.ReactElement {
  const router = useRouter();

  const productId =
    typeof router.query.id === 'string'
      ? router.query.id
      : '';

  return (
    <>
      <Head>
        <title>Product Detail</title>
      </Head>

      <ProductDetail productId={productId} />
    </>
  );
}

ProductDetailPage.getLayout = function getLayout(
  page: React.ReactElement,
) {
  return <PrivateLayout>{page}</PrivateLayout>;
};
```

Rules:

- page may read route params
- page passes route params to module
- page does not fetch product detail directly
- module handles product detail query

---

# Dynamic Module Example

## src/modules/ProductDetail/ProductDetail.tsx

```tsx
import * as React from 'react';

import { ErrorState, LoadingState } from 'src/components';

import { useGetProductDetail } from './hooks';

type Props = {
  productId: string;
};

export function ProductDetail({
  productId,
}: Props): React.ReactElement {
  const { data, isLoading, error } = useGetProductDetail({
    id: productId,
  });

  if (!productId) {
    return <ErrorState />;
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState />;
  }

  return (
    <section>
      <h1>{data?.name}</h1>
      <p>{data?.sku}</p>
    </section>
  );
}
```

Rules:

- module owns data fetching
- module handles missing ID
- module renders feature detail UI

---

# Public Page Example

## src/pages/login/index.tsx

```tsx
import * as React from 'react';
import Head from 'next/head';

import { PublicLayout } from 'src/layouts/PublicLayout';
import { Login } from 'src/modules/Authentication/Login';

export default function LoginPage(): React.ReactElement {
  return (
    <>
      <Head>
        <title>Login</title>
      </Head>

      <Login />
    </>
  );
}

LoginPage.getLayout = function getLayout(page: React.ReactElement) {
  return <PublicLayout>{page}</PublicLayout>;
};
```

Rules:

- login page uses PublicLayout
- login logic stays in Login module
- page only owns route + SEO + layout

---

# Admin Page Example

## src/pages/admin/products/index.tsx

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

AdminProductsPage.getLayout = function getLayout(
  page: React.ReactElement,
) {
  return <AdminLayout>{page}</AdminLayout>;
};
```

Rules:

- admin page uses AdminLayout
- admin guard belongs in layout
- feature logic stays in AdminProducts module

---

# Query Param Example

Pages may read query params when they represent route-level state.

Example:

## src/pages/search/index.tsx

```tsx
import * as React from 'react';
import { useRouter } from 'next/router';

import { PublicLayout } from 'src/layouts/PublicLayout';
import { Search } from 'src/modules/Search';

export default function SearchPage(): React.ReactElement {
  const router = useRouter();

  const keyword =
    typeof router.query.keyword === 'string'
      ? router.query.keyword
      : '';

  return <Search initialKeyword={keyword} />;
}

SearchPage.getLayout = function getLayout(page: React.ReactElement) {
  return <PublicLayout>{page}</PublicLayout>;
};
```

Rules:

- page may parse route query
- module owns search behavior after receiving initial value
- page does not call search API

---

# getStaticProps Example

Use `getStaticProps` only when page-level static data is required.

Example:

```tsx
import * as React from 'react';
import { GetStaticProps } from 'next';

import { PublicLayout } from 'src/layouts/PublicLayout';
import { Blog } from 'src/modules/Blog';

type Props = {
  generatedAt: string;
};

export default function BlogPage({
  generatedAt,
}: Props): React.ReactElement {
  return <Blog generatedAt={generatedAt} />;
}

BlogPage.getLayout = function getLayout(page: React.ReactElement) {
  return <PublicLayout>{page}</PublicLayout>;
};

export const getStaticProps: GetStaticProps<Props> = async () => {
  return {
    props: {
      generatedAt: new Date().toISOString(),
    },
  };
};
```

Rules:

- page-level data fetching is allowed only for Next.js SSR/SSG use cases
- do not move regular client API querying into `getStaticProps`
- module still owns feature UI

---

# getServerSideProps Example

Use `getServerSideProps` when route-level server data is required.

Example:

```tsx
import * as React from 'react';
import { GetServerSideProps } from 'next';

import { PrivateLayout } from 'src/layouts/PrivateLayout';
import { ProductDetail } from 'src/modules/ProductDetail';

type Props = {
  productId: string;
};

export default function ProductDetailPage({
  productId,
}: Props): React.ReactElement {
  return <ProductDetail productId={productId} />;
}

ProductDetailPage.getLayout = function getLayout(
  page: React.ReactElement,
) {
  return <PrivateLayout>{page}</PrivateLayout>;
};

export const getServerSideProps: GetServerSideProps<Props> = async (
  context,
) => {
  const productId =
    typeof context.params?.id === 'string'
      ? context.params.id
      : '';

  return {
    props: {
      productId,
    },
  };
};
```

Rules:

- SSR props should be route-level only
- avoid duplicating feature business logic in SSR
- feature module still owns rendering logic

---

# Route Constants

## src/shared/constants/routes.constant.ts

```ts
export const APP_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/products/[id]',
  ADMIN_PRODUCTS: '/admin/products',
};
```

Programmatic route helper:

```ts
export function getProductDetailRoute(id: string) {
  return APP_ROUTES.PRODUCT_DETAIL.replace('[id]', id);
}
```

Use:

```tsx
router.push(getProductDetailRoute(product.id));
```

Rules:

- do not hardcode routes repeatedly
- use route helpers for dynamic routes
- keep APP_ROUTES aligned with `src/pages`

---

# Good Page Pattern

```tsx
export default function SomePage(): React.ReactElement {
  return (
    <>
      <Head>
        <title>Some Page</title>
      </Head>

      <SomeModule />
    </>
  );
}

SomePage.getLayout = function getLayout(page: React.ReactElement) {
  return <PrivateLayout>{page}</PrivateLayout>;
};
```

---

# Bad Page Pattern

```tsx
export default function ProductsPage() {
  const { data } = useQuery(...);

  return (
    <>
      <ProductFilters />
      <ProductList products={data} />
      <CreateProductModal />
    </>
  );
}
```

Why bad:

- page owns feature logic
- page calls query logic
- page composes feature internals
- page becomes hard to maintain

Fix:

- move logic to `src/modules/Products/Products.tsx`
- page renders `<Products />`

---

# Page Responsibilities

Pages may:

- define route entry
- define SEO/Head
- define layout
- parse route params
- use Next.js data fetching methods intentionally
- pass route-level props to modules

Pages must not:

- call API clients directly
- use raw `useQuery`
- contain feature business logic
- contain feature components directly
- contain forms
- contain modals
- manage feature state

---

# Module Responsibilities

Modules may:

- call feature hooks
- use `useAppQuery`
- use mutation hooks
- manage feature UI state
- compose feature components
- render loading/error/empty states
- own forms/modals/dialogs

Modules must not:

- define route files
- use Next.js page-only data APIs
- duplicate layout guard behavior

---

# SEO / Head Rules

Pages may use `Head` for:

- title
- description
- canonical URL
- Open Graph tags
- structured data if page-level

Example:

```tsx
<Head>
  <title>Products</title>
  <meta
    name="description"
    content="Browse available products."
  />
</Head>
```

If SEO grows complex, create reusable SEO component:

```txt
src/components/SEO/
```

---

# Layout Selection Rules

Use:

| Route Type              | Layout                           |
|-------------------------|----------------------------------|
| Public marketing        | `PublicLayout`                   |
| Login/register          | `PublicLayout`                   |
| Authenticated user page | `PrivateLayout`                  |
| Admin dashboard         | `AdminLayout`                    |
| 404 page                | `PublicLayout` or minimal layout |

---

# Anti-patterns

Do NOT:

- put feature logic in pages
- call APIs inside pages
- use raw `useQuery` in pages
- render feature sections directly in pages
- put modals/forms in pages
- duplicate layout wrappers manually
- use App Router conventions
- use `page.tsx` or `layout.tsx`
- hardcode routes repeatedly
- skip `getLayout` when layout is needed

---

# Strict Rules

1. Pages stay thin.
2. Pages render module roots.
3. Pages use `getLayout`.
4. Pages may own SEO.
5. Modules own feature logic.
6. Components do not call APIs.
7. Route constants must be used.
8. Dynamic route helpers should be centralized.
9. No App Router patterns.
10. No business logic in pages.

---

# AI Agent Notes

When creating a new route:

1. Create the page in `src/pages`.
2. Create or reuse the module root in `src/modules`.
3. Use the correct layout through `getLayout`.
4. Add `Head` if SEO is needed.
5. Add route constant in `APP_ROUTES`.
6. For dynamic routes, add route helper.
7. Pass route params to module if needed.
8. Keep all feature logic inside module.
9. Do not call APIs in the page.
10. Keep page under control and easy to scan.

The final page/module relationship should remain:

- thin
- predictable
- layout-aware
- SEO-ready
- feature-owned
- AI-agent-friendly
