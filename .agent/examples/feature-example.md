# Feature Example

This example demonstrates the standard feature/module architecture used in this boilerplate.

It teaches:

- feature ownership
- module folder structure
- module root composition
- feature-specific components
- feature hooks
- feature models
- schemas/constants/utils ownership
- reusable shared component usage
- mobile-first styling
- thin page relationship

---

# Example Feature

This example uses:

```txt
Products
```

as the feature domain.

The same pattern applies to:

- Orders
- Booking
- Users
- Rooms
- Posts
- Categories
- Dashboard
- Admin modules

---

# Core Philosophy

A feature module should own everything needed to implement that feature.

```txt
src/modules/<Feature>/
```

owns:

- feature screen
- feature-specific components
- feature hooks
- feature models
- feature schemas
- feature constants
- feature utilities
- feature styles

Reusable generic UI stays in:

```txt
src/components/
```

API clients stay in:

```txt
src/apis/
```

Pages stay in:

```txt
src/pages/
```

---

# Full Feature Structure

```txt
src/modules/Products/
├── Products.tsx
├── Products.module.scss
├── components/
│   ├── ProductHeader/
│   │   ├── ProductHeader.tsx
│   │   ├── ProductHeader.module.scss
│   │   └── index.ts
│   │
│   ├── ProductFilters/
│   │   ├── ProductFilters.tsx
│   │   ├── ProductFilters.module.scss
│   │   └── index.ts
│   │
│   ├── ProductList/
│   │   ├── ProductList.tsx
│   │   ├── ProductList.module.scss
│   │   └── index.ts
│   │
│   ├── ProductCard/
│   │   ├── ProductCard.tsx
│   │   ├── ProductCard.module.scss
│   │   └── index.ts
│   │
│   └── index.ts
│
├── hooks/
│   ├── useGetProducts.ts
│   ├── useCreateProduct.ts
│   ├── useProductFilters.ts
│   └── index.ts
│
├── models/
│   ├── product.model.ts
│   ├── get-products.request.ts
│   ├── get-products.response.ts
│   ├── create-product.request.ts
│   └── index.ts
│
├── schema/
│   └── create-product.schema.ts
│
├── constants/
│   ├── product-query.constant.ts
│   ├── product-form.constant.ts
│   └── index.ts
│
├── utils/
│   ├── product.mapper.ts
│   └── index.ts
│
└── index.ts
```

---

# Ownership Rules

| Concern                         | Location                                    |
|---------------------------------|---------------------------------------------|
| Feature root screen             | `src/modules/Products/Products.tsx`         |
| Feature styling                 | `src/modules/Products/Products.module.scss` |
| Feature-only components         | `src/modules/Products/components/`          |
| Feature hooks                   | `src/modules/Products/hooks/`               |
| Feature request/response models | `src/modules/Products/models/`              |
| Feature schemas                 | `src/modules/Products/schema/`              |
| Feature constants               | `src/modules/Products/constants/`           |
| Feature utilities/mappers       | `src/modules/Products/utils/`               |
| Reusable UI                     | `src/components/`                           |
| API clients                     | `src/apis/products/`                        |
| Page route                      | `src/pages/products/index.tsx`              |

---

# Module Root

## Products.tsx

The module root should orchestrate the feature.

It may:

- call feature hooks
- own feature-level UI state
- compose feature components
- render loading/error/empty states

It must not:

- call API clients directly
- contain all feature JSX in one file
- become a giant component

```tsx
import * as React from 'react';
import { Button } from '@mui/material';

import { EmptyState, ErrorState, LoadingState } from 'src/components';

import { ProductHeader } from './components/ProductHeader';
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
      <ProductHeader
        title="Products"
        action={
          <Button variant="contained">
            Create Product
          </Button>
        }
      />

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

---

# Module Root Styling

## Products.module.scss

```scss
.products-wrapper {
  @apply flex flex-col gap-4 px-4 py-6 md:px-6 lg:px-8;
}
```

Rules:

- mobile-first
- module-level layout only
- no global styles
- use Tailwind `@apply`

---

# Feature Header Component

## ProductHeader.tsx

```tsx
import * as React from 'react';
import { Box, Typography } from '@mui/material';

import classes from './ProductHeader.module.scss';

type Props = {
  title: string;
  action?: React.ReactNode;
};

export function ProductHeader({
  title,
  action,
}: Props): React.ReactElement {
  return (
    <Box className={classes['product-header']}>
      <Typography variant="h4" component="h1">
        {title}
      </Typography>

      {action}
    </Box>
  );
}
```

---

## ProductHeader.module.scss

```scss
.product-header {
  @apply flex flex-col gap-3 md:flex-row md:items-center md:justify-between;
}
```

---

# Feature Filters Component

## ProductFilters.tsx

```tsx
import * as React from 'react';
import { TextField } from '@mui/material';

import classes from './ProductFilters.module.scss';

type Props = {
  searchValue: string;
  onSearchChange: (value: string) => void;
};

export function ProductFilters({
  searchValue,
  onSearchChange,
}: Props): React.ReactElement {
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    onSearchChange(event.target.value);
  };

  return (
    <div className={classes['product-filters']}>
      <TextField
        value={searchValue}
        onChange={handleChange}
        label="Search products"
        fullWidth
      />
    </div>
  );
}
```

---

## ProductFilters.module.scss

```scss
.product-filters {
  @apply rounded-lg bg-common-white p-4 shadow-sm;
}
```

Rules:

- filters receive state from parent
- filters do not call API directly
- filters are feature-specific

---

# Feature List Component

## ProductList.tsx

```tsx
import * as React from 'react';

import { Product } from '../../models';
import { ProductCard } from '../ProductCard';

import classes from './ProductList.module.scss';

type Props = {
  products: Product[];
};

export function ProductList({
  products,
}: Props): React.ReactElement {
  return (
    <div className={classes['product-list']}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
        />
      ))}
    </div>
  );
}
```

---

## ProductList.module.scss

```scss
.product-list {
  @apply grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3;
}
```

Rules:

- list receives data as props
- list does not fetch
- list uses stable IDs as keys
- list handles layout

---

# Feature Card Component

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
      <Typography variant="h6" component="h2">
        {product.name}
      </Typography>

      <Typography variant="body2" color="text.secondary">
        SKU: {product.sku}
      </Typography>

      <Typography variant="body1">
        ${product.price.toFixed(2)}
      </Typography>
    </Card>
  );
}
```

---

## ProductCard.module.scss

```scss
.product-card {
  @apply flex flex-col gap-2;
}
```

Rules:

- ProductCard is feature-specific
- it reuses generic `Card`
- it does not fetch
- it does not mutate
- it only renders product data

---

# Feature Hook Example

## useGetProducts.ts

```ts
import { getProducts } from 'src/apis/products';
import { useAppQuery } from 'src/hooks/useAppQuery';

import { PRODUCT_QUERY_KEYS } from '../constants';
import { GetProductsRequest } from '../models';

type Params = {
  payload: GetProductsRequest;
};

export function useGetProducts({
  payload,
}: Params) {
  return useAppQuery({
    queryKey: [
      PRODUCT_QUERY_KEYS.GET_PRODUCTS,
      payload,
    ],
    queryFn: () => getProducts(payload),
  });
}
```

Rules:

- feature hook uses API client
- feature hook uses `useAppQuery`
- component uses feature hook
- component does not call API client

---

# Feature Models

## product.model.ts

```ts
export type Product = {
  id: string;
  name: string;
  sku: string;
  price: number;
  categoryId: string;
  isActive: boolean;
};
```

---

## get-products.request.ts

```ts
export type GetProductsRequest = {
  page: number;
  pageSize: number;
  searchValue?: string;
  categoryId?: string;
};
```

---

## get-products.response.ts

```ts
import { Product } from './product.model';

export type GetProductsResponse = {
  data: Product[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
};
```

---

# Feature Constants

## product-query.constant.ts

```ts
export const PRODUCT_QUERY_KEYS = {
  GET_PRODUCTS: 'GET_PRODUCTS',
  GET_PRODUCT_DETAIL: 'GET_PRODUCT_DETAIL',
};
```

---

# Feature Mapper Example

## product.mapper.ts

```ts
import { Product } from '../models';

export type ProductOption = {
  label: string;
  value: string;
};

export function mapProductsToOptions(
  products: Product[],
): ProductOption[] {
  return products.map((product) => ({
    label: product.name,
    value: product.id,
  }));
}
```

Rules:

- mappers are pure
- mappers do not call APIs
- mappers do not mutate input
- mappers live in feature utils

---

# Component Barrel Exports

## components/index.ts

```ts
export * from './ProductHeader';
export * from './ProductFilters';
export * from './ProductList';
export * from './ProductCard';
```

---

# Hook Barrel Exports

## hooks/index.ts

```ts
export * from './useGetProducts';
export * from './useCreateProduct';
export * from './useProductFilters';
```

---

# Model Barrel Exports

## models/index.ts

```ts
export * from './product.model';
export * from './get-products.request';
export * from './get-products.response';
export * from './create-product.request';
```

---

# Module Barrel Export

## index.ts

```ts
export * from './Products';
```

---

# Page Relationship

The page should only render the module root.

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

- page stays thin
- page owns route entry
- page may own SEO
- page uses layout
- page renders module root
- page does not compose feature internals

---

# Shared vs Feature Component Decision

## Keep in feature module

```txt
ProductCard
ProductFilters
ProductList
ProductHeader
```

because they are Product-specific.

---

## Move to shared components

```txt
Card
EmptyState
ErrorState
LoadingState
Modal
Table
Button
```

because they can be reused across features.

---

# Feature Flow Summary

```txt
ProductsPage
    ↓
Products module root
    ↓
ProductHeader / ProductFilters / ProductList
    ↓
useGetProducts
    ↓
getProducts API client
    ↓
request client
```

---

# Good Patterns

Use:

- feature ownership
- reusable UI primitives
- typed hooks
- typed models
- mobile-first styling
- loading/error/empty states
- named exports
- `src/` imports
- SCSS Modules + Tailwind `@apply`

---

# Anti-patterns

Do NOT:

- place `ProductCard` in `src/components`
- fetch inside `ProductCard`
- put feature sections directly in pages
- make `Products.tsx` 500 lines
- use raw `useQuery`
- call API clients in components
- hardcode routes/endpoints
- create global utilities too early
- use desktop-only layouts

---

# Strict Rules

1. Feature UI belongs inside the feature module.
2. Reusable generic UI belongs in `src/components`.
3. Module root orchestrates feature composition.
4. Pages stay thin.
5. Hooks own server-state access.
6. Components do not call APIs.
7. Models live in the feature module.
8. Mappers live in feature utils.
9. Styling is mobile-first.
10. Exports are named.

---

# AI Agent Notes

When generating a feature:

1. Create the module root.
2. Create module SCSS.
3. Create feature components.
4. Create feature hooks.
5. Create models.
6. Create constants.
7. Create schema if forms exist.
8. Create utils/mappers only when needed.
9. Create page route as a thin wrapper.
10. Reuse shared UI components.
11. Keep feature components local.
12. Keep API logic in hooks/apis only.
13. Add loading/error/empty states.
14. Keep mobile-first styling.

The final feature should feel:

- self-contained
- predictable
- reusable where appropriate
- easy to navigate
- consistent with the boilerplate
