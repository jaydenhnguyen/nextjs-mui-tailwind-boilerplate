# API Hook Example

This example demonstrates the standard API/query/mutation architecture used in this boilerplate.

It teaches:

- API client ownership
- query hook structure
- mutation hook structure
- `useAppQuery` usage
- TanStack Query integration
- query key strategy
- cache invalidation
- loading/error ownership
- typed request/response flow

---

# Core Philosophy

The architecture follows:

```txt
Component
    ↓
Feature Hook
    ↓
API Client
    ↓
Request Client
```

Components must NEVER:

- call APIs directly
- use raw fetch/axios
- use raw useQuery
- contain server-state logic

---

# Folder Structure Example

```txt
src/
├── apis/
│   └── products/
│       ├── endpoints.ts
│       ├── get-products.ts
│       ├── get-product-detail.ts
│       ├── create-product.ts
│       ├── update-product.ts
│       ├── delete-product.ts
│       └── index.ts
│
├── modules/
│   └── Products/
│       ├── hooks/
│       │   ├── useGetProducts.ts
│       │   ├── useGetProductDetail.ts
│       │   ├── useCreateProduct.ts
│       │   ├── useUpdateProduct.ts
│       │   ├── useDeleteProduct.ts
│       │   ├── query-keys.ts
│       │   └── index.ts
│       │
│       ├── models/
│       └── components/
```

---

# Ownership Rules

| Concern            | Owner               |
|--------------------|---------------------|
| API request        | `src/apis`          |
| Query hook         | feature hooks       |
| Mutation hook      | feature hooks       |
| Cache invalidation | mutation hook       |
| Loading state      | query/mutation hook |
| Rendering          | component           |
| Request typing     | models              |
| Query keys         | feature hooks       |

---

# Endpoint Constants

## endpoints.ts

```ts
export const PRODUCTS_ENDPOINTS = {
  GET_PRODUCTS: '/products',
  GET_PRODUCT_DETAIL: '/products/:id',
  CREATE_PRODUCT: '/products',
  UPDATE_PRODUCT: '/products/:id',
  DELETE_PRODUCT: '/products/:id',
};
```

Rules:

- centralize endpoints
- avoid hardcoded strings
- use clear naming
- group by domain

---

# Request / Response Models

## models/get-products.request.ts

```ts
export type GetProductsRequest = {
  page: number;
  pageSize: number;
  searchValue?: string;
  categoryId?: string;
};
```

---

## models/get-products.response.ts

```ts
export type Product = {
  id: string;
  name: string;
  price: number;
};

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

# API Client Example

## apis/products/get-products.ts

```ts
import { request } from 'src/configs/request';

import { GetProductsRequest } from 'src/modules/Products/models/get-products.request';
import { GetProductsResponse } from 'src/modules/Products/models/get-products.response';

import { PRODUCTS_ENDPOINTS } from './endpoints';

type Params = {
  payload: GetProductsRequest;
};

export async function getProducts({
                                    payload,
                                  }: Params): Promise<GetProductsResponse> {
  return request.get(
    PRODUCTS_ENDPOINTS.GET_PRODUCTS,
    {
      params: payload,
    },
  );
}
```

---

# API Client Rules

API clients:

- live in `src/apis`
- are pure request functions
- contain NO React hooks
- contain NO UI logic
- contain NO toast logic
- contain NO cache logic

API clients should:

- return typed responses
- accept typed payloads
- use centralized request client
- remain reusable

---

# Query Key Structure

## hooks/query-keys.ts

```ts
export const PRODUCTS_QUERY_KEYS = {
  GET_PRODUCTS: 'GET_PRODUCTS',
  GET_PRODUCT_DETAIL: 'GET_PRODUCT_DETAIL',
};
```

Rules:

- centralize query keys
- use deterministic naming
- group by feature
- avoid inline query keys

---

# Query Hook Example

## hooks/useGetProducts.ts

```ts
import { getProducts } from 'src/apis/products';

import { useAppQuery } from 'src/hooks/useAppQuery';

import { GetProductsRequest } from '../models/get-products.request';
import { PRODUCTS_QUERY_KEYS } from './query-keys';

type Params = {
  payload: GetProductsRequest;
};

export function useGetProducts({
  payload,
}: Params) {
  return useAppQuery({
    queryKey: [
      PRODUCTS_QUERY_KEYS.GET_PRODUCTS,
      payload,
    ],
    queryFn: () =>
      getProducts({
        payload,
      }),
  });
}
```

---

# Query Hook Rules

Query hooks:

- belong inside feature hooks
- use `useAppQuery`
- own query keys
- own server-state fetching
- expose loading/error/data state

Query hooks must NOT:

- render UI
- show toast
- contain business JSX
- contain component state

---

# useAppQuery Philosophy

The project standardizes all queries through:

```txt
useAppQuery
```

Purpose:

- centralized defaults
- consistent retry logic
- consistent stale time
- centralized error handling
- deterministic query architecture

Do NOT use raw:

```ts
useQuery(...)
```

directly inside features unless explicitly required.

---

# Mutation Hook Example

## hooks/useCreateProduct.ts

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createProduct } from 'src/apis/products';

import { notify } from 'src/shared/utils/notify';

import { CreateProductRequest } from '../models/create-product.request';

import { PRODUCTS_QUERY_KEYS } from './query-keys';

export function useCreateProduct(
  onSuccessCallback?: () => void,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      payload: CreateProductRequest,
    ) => createProduct(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          PRODUCTS_QUERY_KEYS.GET_PRODUCTS,
        ],
      });

      notify.success('Product created successfully');

      onSuccessCallback?.();
    },

    onError: () => {
      notify.error('Failed to create product');
    },
  });
}
```

---

# Mutation Hook Rules

Mutation hooks:

- own cache invalidation
- own mutation lifecycle
- may own toast notifications
- may own optimistic updates
- may execute callbacks

Mutation hooks must NOT:

- render UI
- contain JSX
- directly manipulate DOM

---

# Query Key Philosophy

Query keys should:

- be deterministic
- include filters/pagination
- support proper invalidation
- support refetching correctly

Correct:

```ts
queryKey: [
  PRODUCTS_QUERY_KEYS.GET_PRODUCTS,
  payload,
]
```

Incorrect:

```ts
queryKey: ['products']
```

for every query variation.

---

# Cache Invalidation Rules

Mutations should invalidate:

- affected list queries
- affected detail queries
- dependent feature queries when needed

Example:

```ts
queryClient.invalidateQueries({
  queryKey: [
    PRODUCTS_QUERY_KEYS.GET_PRODUCTS,
  ],
});
```

Avoid:

- invalidating everything globally
- unnecessary refetch storms

---

# Loading / Error Ownership

## Query Hook

Owns:

- isLoading
- isFetching
- error
- data

---

## Component

Owns:

- rendering states
- loading skeletons
- empty states
- error states

Correct:

```tsx
if (isLoading) {
  return <LoadingState />;
}

if (error) {
  return <ErrorState />;
}

if (!data?.data?.length) {
  return <EmptyState />;
}
```

---

# Component Usage Example

## components/ProductList/ProductList.tsx

```tsx
import { useGetProducts } from '../../hooks';

export function ProductList() {
  const {
    data,
    isLoading,
    error,
  } = useGetProducts({
    payload: {
      page: 1,
      pageSize: 10,
    },
  });

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState />;
  }

  if (!data?.data?.length) {
    return <EmptyState />;
  }

  return (
    <div>
      {data.data.map((product) => (
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

# Async Flow Example

```txt
ProductList.tsx
    ↓
useGetProducts
    ↓
useAppQuery
    ↓
getProducts API client
    ↓
request client
    ↓
server
```

---

# Pagination Example

```ts
const {
  data,
  isLoading,
} = useGetProducts({
  payload: {
    page,
    pageSize,
    searchValue,
  },
});
```

Query key:

```ts
queryKey: [
  PRODUCTS_QUERY_KEYS.GET_PRODUCTS,
  payload,
]
```

This ensures:

- correct caching
- proper pagination behavior
- independent cache entries

---

# Search / Filter Example

Correct:

```ts
const filters = {
  page,
  pageSize,
  searchValue,
  categoryId,
};

useGetProducts({
  payload: filters,
});
```

Avoid:

- separate query keys manually
- string concatenation query keys

---

# Detail Query Example

## hooks/useGetProductDetail.ts

```ts
import { getProductDetail } from 'src/apis/products';

import { useAppQuery } from 'src/hooks/useAppQuery';

import { PRODUCTS_QUERY_KEYS } from './query-keys';

type Params = {
  id: string;
};

export function useGetProductDetail({
  id,
}: Params) {
  return useAppQuery({
    enabled: Boolean(id),

    queryKey: [
      PRODUCTS_QUERY_KEYS.GET_PRODUCT_DETAIL,
      id,
    ],

    queryFn: () =>
      getProductDetail({
        id,
      }),
  });
}
```

---

# Optimistic Update Guidance

Default:

```txt
Prefer server-confirmed updates.
```

Use optimistic updates only when:

- UX strongly benefits
- rollback is manageable
- cache ownership is clear

Avoid unnecessary optimistic complexity.

---

# Anti-patterns

Do NOT:

- call APIs inside components
- use raw fetch/axios in components
- use raw useQuery repeatedly
- hardcode query keys
- invalidate all queries globally
- mix UI state with server state
- duplicate API logic
- create inline query functions everywhere
- create inconsistent query keys

---

# Strict Rules

1. APIs belong in `src/apis`.
2. Query hooks belong in feature hooks.
3. Query hooks use `useAppQuery`.
4. Mutation hooks use `useMutation`.
5. Components never call APIs directly.
6. Query keys must be centralized.
7. Requests/responses must be typed.
8. Mutations own invalidation.
9. Components own rendering.
10. Server state stays inside TanStack Query.

---

# AI Agent Notes

When creating API/query architecture:

1. Create endpoint constants first.
2. Create typed request/response models.
3. Create API clients in `src/apis`.
4. Create query keys.
5. Create query hooks using `useAppQuery`.
6. Create mutation hooks using `useMutation`.
7. Handle invalidation in mutations.
8. Keep components UI-only.
9. Reuse shared loading/error states.
10. Keep query keys deterministic.

The final architecture should remain:

- predictable
- scalable
- reusable
- typed
- cache-friendly
- production-grade
- AI-agent-friendly
