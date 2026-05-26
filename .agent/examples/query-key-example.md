# Query Key Example

This example demonstrates the standard TanStack Query key architecture used in this boilerplate.

It teaches:

- query key structure
- query key ownership
- list/detail query separation
- pagination/filter query keys
- invalidation strategy
- mutation relationship
- deterministic cache behavior
- scalable query organization

---

# Core Philosophy

Query keys must be:

- deterministic
- centralized
- predictable
- scalable
- feature-owned

The architecture follows:

```txt
Feature
    ↓
query-keys.ts
    ↓
useAppQuery
    ↓
cache lifecycle
```

Query keys are part of the feature architecture.

They must NOT:

- be inline everywhere
- use random strings
- mix unrelated features
- ignore filters/pagination
- create cache collisions

---

# Folder Structure

```txt
src/
├── modules/
│   └── Products/
│       ├── hooks/
│       │   ├── query-keys.ts
│       │   ├── useGetProducts.ts
│       │   ├── useGetProductDetail.ts
│       │   ├── useCreateProduct.ts
│       │   ├── useUpdateProduct.ts
│       │   └── useDeleteProduct.ts
```

Rules:

- query keys belong inside feature hooks
- query keys stay close to feature queries
- each feature owns its cache namespace

---

# Basic Query Key Structure

## query-keys.ts

```ts
export const PRODUCT_QUERY_KEYS = {
  GET_PRODUCTS: 'GET_PRODUCTS',
  GET_PRODUCT_DETAIL: 'GET_PRODUCT_DETAIL',
};
```

Rules:

- uppercase keys
- grouped by feature
- stable naming
- centralized ownership

---

# Basic List Query Example

## useGetProducts.ts

```ts
import { getProducts } from 'src/apis/products';
import { useAppQuery } from 'src/hooks/useAppQuery';

import { PRODUCT_QUERY_KEYS } from './query-keys';

export function useGetProducts(payload: GetProductsRequest) {
  return useAppQuery({
    queryKey: [
      PRODUCT_QUERY_KEYS.GET_PRODUCTS,
      payload,
    ],

    queryFn: () => getProducts(payload),
  });
}
```

---

# Why Payload Must Be Included

Correct:

```ts
queryKey: [
  PRODUCT_QUERY_KEYS.GET_PRODUCTS,
  payload,
]
```

Wrong:

```ts
queryKey: [
  PRODUCT_QUERY_KEYS.GET_PRODUCTS,
]
```

Why?

Because pagination/filter/search changes should create independent cache entries.

---

# Example Cache Separation

Correct behavior:

```txt
GET_PRODUCTS + { page: 1 }
    ≠
GET_PRODUCTS + { page: 2 }

GET_PRODUCTS + { search: "book" }
    ≠
GET_PRODUCTS + { search: "phone" }
```

Without payload:

- cache collisions occur
- pagination breaks
- filters behave incorrectly
- stale data appears

---

# Detail Query Example

## useGetProductDetail.ts

```ts
import { getProductDetail } from 'src/apis/products';
import { useAppQuery } from 'src/hooks/useAppQuery';

import { PRODUCT_QUERY_KEYS } from './query-keys';

export function useGetProductDetail(id: string) {
  return useAppQuery({
    enabled: Boolean(id),

    queryKey: [
      PRODUCT_QUERY_KEYS.GET_PRODUCT_DETAIL,
      id,
    ],

    queryFn: () => getProductDetail(id),
  });
}
```

Rules:

- detail queries include entity ID
- detail cache stays isolated
- detail queries use enabled when needed

---

# Query Key Philosophy

Think of query keys like:

```txt
Cache Address
```

Example:

```ts
[
  PRODUCT_QUERY_KEYS.GET_PRODUCTS,
  {
    page: 1,
    pageSize: 10,
    searchValue: 'book',
  },
]
```

This uniquely identifies:

- endpoint
- filters
- pagination
- search state

---

# Mutation Invalidation Example

## useCreateProduct.ts

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createProduct } from 'src/apis/products';

import { PRODUCT_QUERY_KEYS } from './query-keys';

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          PRODUCT_QUERY_KEYS.GET_PRODUCTS,
        ],
      });
    },
  });
}
```

Rules:

- invalidate list after create
- keep invalidation scoped
- avoid invalidating everything globally

---

# Update Mutation Example

## useUpdateProduct.ts

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateProduct } from 'src/apis/products';

import { PRODUCT_QUERY_KEYS } from './query-keys';

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProduct,

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          PRODUCT_QUERY_KEYS.GET_PRODUCTS,
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          PRODUCT_QUERY_KEYS.GET_PRODUCT_DETAIL,
          variables.id,
        ],
      });
    },
  });
}
```

Rules:

- invalidate affected detail cache
- invalidate list cache
- avoid unrelated invalidation

---

# Delete Mutation Example

## useDeleteProduct.ts

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteProduct } from 'src/apis/products';

import { PRODUCT_QUERY_KEYS } from './query-keys';

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          PRODUCT_QUERY_KEYS.GET_PRODUCTS,
        ],
      });
    },
  });
}
```

---

# Infinite Query Example

For infinite scroll:

```ts
queryKey: [
  PRODUCT_QUERY_KEYS.GET_PRODUCTS,
  filters,
]
```

Do NOT include:

- pageParam
- cursor

inside queryKey manually.

Example:

```ts
useInfiniteQuery({
  queryKey: [
    PRODUCT_QUERY_KEYS.GET_PRODUCTS,
    filters,
  ],

  queryFn: ({ pageParam = 1 }) =>
    getProducts({
      ...filters,
      page: pageParam,
    }),

  getNextPageParam: (lastPage) =>
    lastPage.pagination.hasNext
      ? lastPage.pagination.page + 1
      : undefined,
});
```

Rules:

- filters belong in query key
- pagination cursor/pageParam belongs in queryFn
- avoid duplicate cache entries

---

# Search Query Example

```ts
const payload = {
  page,
  pageSize,
  searchValue,
  categoryId,
};

useGetProducts(payload);
```

Query key:

```ts
[
  PRODUCT_QUERY_KEYS.GET_PRODUCTS,
  payload,
]
```

Correct:

- search cache separated
- category cache separated
- pagination cache separated

---

# Query Key Factory Pattern (Optional)

For larger projects:

## query-keys.ts

```ts
export const PRODUCT_QUERY_KEYS = {
  all: ['PRODUCTS'] as const,

  lists: () =>
    [...PRODUCT_QUERY_KEYS.all, 'LIST'] as const,

  list: (payload: GetProductsRequest) =>
    [...PRODUCT_QUERY_KEYS.lists(), payload] as const,

  details: () =>
    [...PRODUCT_QUERY_KEYS.all, 'DETAIL'] as const,

  detail: (id: string) =>
    [...PRODUCT_QUERY_KEYS.details(), id] as const,
};
```

Usage:

```ts
queryKey: PRODUCT_QUERY_KEYS.list(payload)
```

This is useful for:

- large-scale projects
- advanced invalidation
- infinite query patterns

But for smaller/medium projects:

```ts
const QUERY_KEYS = {
  GET_PRODUCTS: 'GET_PRODUCTS',
}
```

is usually simpler and preferred.

---

# Invalidation Strategy

## Create

Invalidate:

- product list

```ts
invalidateQueries({
  queryKey: [
    PRODUCT_QUERY_KEYS.GET_PRODUCTS,
  ],
});
```

---

## Update

Invalidate:

- product list
- updated product detail

```ts
invalidateQueries({
  queryKey: [
    PRODUCT_QUERY_KEYS.GET_PRODUCT_DETAIL,
    id,
  ],
});
```

---

## Delete

Invalidate:

- product list

---

## Bulk Update

Invalidate:

- list
- affected details

Avoid:

```ts
queryClient.invalidateQueries();
```

globally unless truly necessary.

---

# Query Key Naming Rules

Good:

```ts
GET_PRODUCTS
GET_PRODUCT_DETAIL
GET_BOOKINGS
GET_BOOKING_DETAIL
GET_USERS
```

Bad:

```ts
products
productData
query1
fetchProducts
```

Rules:

- uppercase
- descriptive
- feature-scoped
- deterministic

---

# Query Key Ownership

Query keys belong to:

- feature hooks
- feature cache lifecycle

They should NOT live in:

- components
- shared random folders
- pages

Preferred:

```txt
src/modules/Products/hooks/query-keys.ts
```

---

# Query Key Granularity

Separate:

- list queries
- detail queries
- statistics queries
- dashboard queries
- option queries

Example:

```ts
export const PRODUCT_QUERY_KEYS = {
  GET_PRODUCTS: 'GET_PRODUCTS',
  GET_PRODUCT_DETAIL: 'GET_PRODUCT_DETAIL',
  GET_PRODUCT_STATS: 'GET_PRODUCT_STATS',
  GET_PRODUCT_OPTIONS: 'GET_PRODUCT_OPTIONS',
};
```

Avoid:

- using one giant query key for everything

---

# Cache Collision Example

BAD:

```ts
queryKey: ['products']
```

for:

- pagination
- detail
- search
- category filters

This causes:

- stale UI
- wrong pagination
- invalidation bugs
- inconsistent cache state

---

# Stable Payload Rules

Payloads should be:

- serializable
- deterministic
- stable

Avoid:

- functions
- Date objects when unnecessary
- class instances
- unstable references

Good:

```ts
{
  page: 1,
  pageSize: 10,
  searchValue: 'book',
}
```

Bad:

```ts
{
  filterFn: () => {},
}
```

---

# Query Key + URL Sync Example

Example:

```txt
/products?page=1&search=book
```

Convert URL params:

```ts
const payload = {
  page,
  pageSize,
  searchValue,
};
```

Then:

```ts
queryKey: [
  PRODUCT_QUERY_KEYS.GET_PRODUCTS,
  payload,
]
```

Rules:

- URL state maps to payload
- payload maps to query key
- query key maps to cache

This creates predictable behavior.

---

# Query Key and useMemo

Usually unnecessary:

```ts
const payload = React.useMemo(
  () => ({
    page,
    pageSize,
  }),
  [page, pageSize],
);
```

TanStack Query already handles stable serialization well.

Only optimize if:

- payload becomes extremely large
- performance issue is proven

---

# Loading / Refetch Behavior

Example:

```ts
const {
  data,
  isLoading,
  isFetching,
} = useGetProducts(payload);
```

Difference:

| State        | Meaning            |
|--------------|--------------------|
| `isLoading`  | first load         |
| `isFetching` | background refetch |

Use:

- `isLoading` for initial skeleton
- `isFetching` for subtle refresh indicator

---

# Query Key Flow Summary

```txt
Feature hook
    ↓
queryKey
    ↓
TanStack Query cache
    ↓
API request
    ↓
cache result
    ↓
mutation invalidates queryKey
    ↓
automatic refetch
```

---

# Good Patterns

Use:

- centralized query keys
- payload-based keys
- detail ID keys
- scoped invalidation
- deterministic naming
- feature-owned query keys
- `useAppQuery`

---

# Anti-patterns

Do NOT:

- inline query keys everywhere
- use one query key for everything
- omit filters from query key
- invalidate all queries globally
- use random query key names
- place query keys in components
- create cache collisions
- include unstable objects/functions in query keys
- use raw `useQuery` repeatedly

---

# Strict Rules

1. Query keys are centralized.
2. Query keys are feature-owned.
3. Payload belongs in list query keys.
4. ID belongs in detail query keys.
5. Mutations invalidate relevant queries only.
6. Avoid global invalidation.
7. Query keys must be deterministic.
8. Query keys should be serializable.
9. Use `useAppQuery`.
10. Cache architecture must remain predictable.

---

# AI Agent Notes

When creating query hooks:

1. Create centralized query keys first.
2. Separate list/detail keys.
3. Include payload in list query keys.
4. Include ID in detail query keys.
5. Use `useAppQuery`.
6. Keep query keys deterministic.
7. Keep invalidation scoped.
8. Avoid cache collisions.
9. Reuse existing query key patterns.
10. Keep cache architecture simple and predictable.

The final query key system should be:

- scalable
- cache-safe
- deterministic
- maintainable
- predictable
- production-grade
- AI-agent-friendly
