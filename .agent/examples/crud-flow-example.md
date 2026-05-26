# CRUD Flow Example

This example demonstrates the standard CRUD feature flow used in this boilerplate.

It teaches:

- full feature/module structure
- list query flow
- create mutation flow
- update mutation flow
- delete mutation flow
- form architecture
- modal/dialog ownership
- query invalidation
- loading/error/empty states
- table/list rendering
- typed API boundaries

---

# Example Feature

This example uses:

```txt
Products
```

as the feature domain.

The same pattern applies to:

- users
- orders
- bookings
- clients
- rooms
- posts
- categories
- inventory

---

# CRUD Architecture Flow

```txt
Page
    ↓
Products Module
    ↓
Feature Components
    ↓
Feature Hooks
    ↓
API Clients
    ↓
Shared Request Client
    ↓
Backend
```

Components never call APIs directly.

---

# Folder Structure

```txt
src/
├── pages/
│   └── products/
│       └── index.tsx
│
├── apis/
│   └── products/
│       ├── endpoints.ts
│       ├── products.ts
│       └── index.ts
│
└── modules/
    └── Products/
        ├── Products.tsx
        ├── Products.module.scss
        ├── components/
        │   ├── ProductTable/
        │   ├── ProductFilters/
        │   ├── CreateProductModal/
        │   ├── UpdateProductModal/
        │   ├── DeleteProductDialog/
        │   └── ProductForm/
        ├── hooks/
        │   ├── useGetProductList.ts
        │   ├── useGetProductDetail.ts
        │   ├── useCreateProduct.ts
        │   ├── useUpdateProduct.ts
        │   ├── useDeleteProduct.ts
        │   ├── useCreateProductForm.ts
        │   ├── useUpdateProductForm.ts
        │   └── index.ts
        ├── models/
        │   ├── product.model.ts
        │   ├── get-product-list.request.ts
        │   ├── get-product-list.response.ts
        │   ├── create-product.request.ts
        │   ├── create-product.response.ts
        │   ├── update-product.request.ts
        │   ├── update-product.response.ts
        │   └── index.ts
        ├── schema/
        │   ├── create-product.schema.ts
        │   └── update-product.schema.ts
        ├── constants/
        │   ├── product-form.constant.ts
        │   └── product-query.constant.ts
        ├── utils/
        │   └── product.mapper.ts
        └── index.ts
```

---

# Ownership Rules

| Concern               | Owner                                     |
|-----------------------|-------------------------------------------|
| Route                 | `src/pages/products/index.tsx`            |
| Feature orchestration | `src/modules/Products/Products.tsx`       |
| Feature UI            | `src/modules/Products/components/`        |
| Query/mutation hooks  | `src/modules/Products/hooks/`             |
| Form schemas          | `src/modules/Products/schema/`            |
| Models/types          | `src/modules/Products/models/`            |
| API clients           | `src/apis/products/`                      |
| Route constants       | `src/shared/constants/routes.constant.ts` |
| Shared reusable UI    | `src/components/`                         |

---

# Page Example

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
- page renders module root
- page does not fetch data
- page does not contain feature UI

---

# Endpoints

## src/apis/products/endpoints.ts

```ts
export const PRODUCTS_ENDPOINTS = {
  GET_PRODUCT_LIST: '/products',
  GET_PRODUCT_DETAIL: '/products/:id',
  CREATE_PRODUCT: '/products',
  UPDATE_PRODUCT: '/products/:id',
  DELETE_PRODUCT: '/products/:id',
};
```

Rules:

- no hardcoded paths inside hooks/components
- endpoint values are path strings only
- route params are replaced in API client

---

# Models

## product.model.ts

```ts
export type Product = {
  id: string;
  name: string;
  sku: string;
  price: number;
  categoryId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
```

---

## get-product-list.request.ts

```ts
export type GetProductListRequest = {
  page: number;
  pageSize: number;
  searchValue?: string;
  categoryId?: string;
  isActive?: boolean;
};
```

---

## get-product-list.response.ts

```ts
import { Product } from './product.model';

export type GetProductListResponse = {
  data: Product[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
};
```

---

## create-product.request.ts

```ts
import { z } from 'zod';

import { createProductSchema } from '../schema/create-product.schema';

export type CreateProductRequest = z.infer<typeof createProductSchema>;
```

---

## update-product.request.ts

```ts
import { z } from 'zod';

import { updateProductSchema } from '../schema/update-product.schema';

export type UpdateProductRequest = z.infer<typeof updateProductSchema>;
```

---

# API Client

## src/apis/products/products.ts

```ts
import { request } from 'src/configs/request';

import {
  CreateProductRequest,
  CreateProductResponse,
  GetProductListRequest,
  GetProductListResponse,
  Product,
  UpdateProductRequest,
  UpdateProductResponse,
} from 'src/modules/Products/models';

import { PRODUCTS_ENDPOINTS } from './endpoints';

export async function getProductList(
  payload: GetProductListRequest,
): Promise<GetProductListResponse> {
  return request.get(PRODUCTS_ENDPOINTS.GET_PRODUCT_LIST, {
    params: payload,
  });
}

export async function getProductDetail(id: string): Promise<Product> {
  const url = PRODUCTS_ENDPOINTS.GET_PRODUCT_DETAIL.replace(
    ':id',
    id.trim(),
  );

  return request.get(url);
}

export async function createProduct(
  payload: CreateProductRequest,
): Promise<CreateProductResponse> {
  return request.post(PRODUCTS_ENDPOINTS.CREATE_PRODUCT, payload);
}

export async function updateProduct(
  id: string,
  payload: UpdateProductRequest,
): Promise<UpdateProductResponse> {
  const url = PRODUCTS_ENDPOINTS.UPDATE_PRODUCT.replace(
    ':id',
    id.trim(),
  );

  return request.put(url, payload);
}

export async function deleteProduct(id: string): Promise<void> {
  const url = PRODUCTS_ENDPOINTS.DELETE_PRODUCT.replace(
    ':id',
    id.trim(),
  );

  return request.delete(url);
}
```

Rules:

- API client is typed
- API client has no UI logic
- API client has no toast
- API client has no React Query logic

---

# Query Keys

## src/modules/Products/constants/product-query.constant.ts

```ts
export const PRODUCT_QUERY_KEYS = {
  GET_PRODUCT_LIST: 'GET_PRODUCT_LIST',
  GET_PRODUCT_DETAIL: 'GET_PRODUCT_DETAIL',
};
```

Use the same keys in:

- query hooks
- invalidation logic

---

# Query Hook

## useGetProductList.ts

```ts
import { getProductList } from 'src/apis/products';
import { useAppQuery } from 'src/hooks/useAppQuery';

import { PRODUCT_QUERY_KEYS } from '../constants/product-query.constant';
import { GetProductListRequest } from '../models';

type Params = {
  payload: GetProductListRequest;
};

export function useGetProductList({ payload }: Params) {
  return useAppQuery({
    queryKey: [PRODUCT_QUERY_KEYS.GET_PRODUCT_LIST, payload],
    queryFn: () => getProductList(payload),
  });
}
```

---

# Detail Query Hook

## useGetProductDetail.ts

```ts
import { getProductDetail } from 'src/apis/products';
import { useAppQuery } from 'src/hooks/useAppQuery';

import { PRODUCT_QUERY_KEYS } from '../constants/product-query.constant';

type Params = {
  id?: string;
};

export function useGetProductDetail({ id }: Params) {
  return useAppQuery({
    queryKey: [PRODUCT_QUERY_KEYS.GET_PRODUCT_DETAIL, id],
    queryFn: () => getProductDetail(id ?? ''),
    options: {
      enabled: Boolean(id),
    },
  });
}
```

---

# Create Mutation Hook

## useCreateProduct.ts

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createProduct } from 'src/apis/products';

import { PRODUCT_QUERY_KEYS } from '../constants/product-query.constant';
import { CreateProductRequest } from '../models';

export function useCreateProduct(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  const { mutate, status, error, isPending } = useMutation({
    mutationFn: (payload: CreateProductRequest) => createProduct(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [PRODUCT_QUERY_KEYS.GET_PRODUCT_LIST],
      });

      onSuccess?.();
    },
  });

  return {
    mutate,
    status,
    error,
    isLoading: isPending,
  };
}
```

---

# Update Mutation Hook

## useUpdateProduct.ts

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateProduct } from 'src/apis/products';

import { PRODUCT_QUERY_KEYS } from '../constants/product-query.constant';
import { UpdateProductRequest } from '../models';

type Params = {
  id: string;
  payload: UpdateProductRequest;
};

export function useUpdateProduct(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  const { mutate, status, error, isPending } = useMutation({
    mutationFn: ({ id, payload }: Params) => updateProduct(id, payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [PRODUCT_QUERY_KEYS.GET_PRODUCT_LIST],
      });

      queryClient.invalidateQueries({
        queryKey: [
          PRODUCT_QUERY_KEYS.GET_PRODUCT_DETAIL,
          variables.id,
        ],
      });

      onSuccess?.();
    },
  });

  return {
    mutate,
    status,
    error,
    isLoading: isPending,
  };
}
```

---

# Delete Mutation Hook

## useDeleteProduct.ts

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteProduct } from 'src/apis/products';

import { PRODUCT_QUERY_KEYS } from '../constants/product-query.constant';

export function useDeleteProduct(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  const { mutate, status, error, isPending } = useMutation({
    mutationFn: (id: string) => deleteProduct(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [PRODUCT_QUERY_KEYS.GET_PRODUCT_LIST],
      });

      onSuccess?.();
    },
  });

  return {
    mutate,
    status,
    error,
    isLoading: isPending,
  };
}
```

---

# Create Product Schema

## create-product.schema.ts

```ts
import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  price: z.coerce.number().min(0, 'Price must be 0 or greater'),
  categoryId: z.string().min(1, 'Category is required'),
  isActive: z.boolean(),
});
```

---

# Update Product Schema

## update-product.schema.ts

```ts
import { createProductSchema } from './create-product.schema';

export const updateProductSchema = createProductSchema;
```

---

# Form Hook

## useCreateProductForm.ts

```ts
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { createProductSchema } from '../schema/create-product.schema';
import { CreateProductRequest } from '../models';

export const initialCreateProductData: CreateProductRequest = {
  name: '',
  sku: '',
  price: 0,
  categoryId: '',
  isActive: true,
};

export function useCreateProductForm() {
  const form = useForm<CreateProductRequest>({
    resolver: zodResolver(createProductSchema),
    defaultValues: initialCreateProductData,
  });

  return {
    form,
    control: form.control,
    formHandleSubmit: form.handleSubmit,
    reset: form.reset,
    formState: form.formState,
  };
}
```

---

# Create Product Modal

## CreateProductModal.tsx

```tsx
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

import { ControlTextField } from 'src/components/Form';

import { useCreateProduct, useCreateProductForm } from '../../hooks';
import { CreateProductRequest } from '../../models';

type Props = {
  open: boolean;
  onClose: () => void;
};

export function CreateProductModal({ open, onClose }: Props) {
  const { control, formHandleSubmit, reset } = useCreateProductForm();

  const handleSuccess = () => {
    reset();
    onClose();
  };

  const { mutate, isLoading } = useCreateProduct(handleSuccess);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (payload: CreateProductRequest) => {
    mutate(payload);
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth>
      <form onSubmit={formHandleSubmit(onSubmit)} noValidate>
        <DialogTitle>Create Product</DialogTitle>

        <DialogContent>
          <ControlTextField<CreateProductRequest>
            control={control}
            name="name"
            label="Product name"
            fullWidth
          />

          <ControlTextField<CreateProductRequest>
            control={control}
            name="sku"
            label="SKU"
            fullWidth
          />

          <ControlTextField<CreateProductRequest>
            control={control}
            name="price"
            label="Price"
            type="number"
            fullWidth
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>
            Cancel
          </Button>

          <Button type="submit" disabled={isLoading}>
            Create
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
```

Rules:

- modal owns open/close UI flow
- form hook owns RHF state
- mutation hook owns server write
- modal does not call API directly

---

# Products Module Root

## Products.tsx

```tsx
import * as React from 'react';
import { Button } from '@mui/material';

import { LoadingState, ErrorState, EmptyState } from 'src/components';

import { useGetProductList } from './hooks';
import { ProductTable } from './components/ProductTable';
import { CreateProductModal } from './components/CreateProductModal';
import classes from './Products.module.scss';

export function Products(): React.ReactElement {
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  const { data, isLoading, error } = useGetProductList({
    payload: {
      page: 1,
      pageSize: 10,
    },
  });

  const handleOpenCreate = () => {
    setIsCreateOpen(true);
  };

  const handleCloseCreate = () => {
    setIsCreateOpen(false);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState />;
  }

  return (
    <section className={classes['products-wrapper']}>
      <div className={classes['products-header']}>
        <h1>Products</h1>

        <Button onClick={handleOpenCreate}>
          Create Product
        </Button>
      </div>

      {!data?.data?.length ? (
        <EmptyState />
      ) : (
        <ProductTable products={data.data} />
      )}

      <CreateProductModal
        open={isCreateOpen}
        onClose={handleCloseCreate}
      />
    </section>
  );
}
```

---

# Product Table

## ProductTable.tsx

```tsx
import { Button } from '@mui/material';

import { Product } from '../../models';

type Props = {
  products: Product[];
};

export function ProductTable({ products }: Props) {
  return (
    <div>
      {products.map((product) => (
        <div key={product.id}>
          <span>{product.name}</span>
          <span>{product.sku}</span>
          <span>{product.price}</span>

          <Button>Edit</Button>
          <Button color="error">Delete</Button>
        </div>
      ))}
    </div>
  );
}
```

Rules:

- table receives data as props
- table does not fetch
- table uses stable IDs as keys
- edit/delete flows can be handled by parent or table callbacks

---

# Responsive Styling

## Products.module.scss

```scss
.products-wrapper {
  @apply flex flex-col gap-4 px-4 py-6 md:px-6 lg:px-8;
}

.products-header {
  @apply flex flex-col gap-3 md:flex-row md:items-center md:justify-between;
}
```

Rules:

- mobile-first
- no fixed desktop width
- layout styles stay in module SCSS
- use Tailwind `@apply`

---

# CRUD Flow Summary

## List

```txt
Products.tsx
    ↓
useGetProductList
    ↓
getProductList
    ↓
request.get
```

---

## Create

```txt
CreateProductModal
    ↓
useCreateProductForm
    ↓
formHandleSubmit
    ↓
useCreateProduct
    ↓
createProduct API
    ↓
invalidate product list
```

---

## Update

```txt
UpdateProductModal
    ↓
useGetProductDetail
    ↓
reset form with mapped data
    ↓
useUpdateProduct
    ↓
invalidate list + detail
```

---

## Delete

```txt
DeleteProductDialog
    ↓
useDeleteProduct
    ↓
deleteProduct API
    ↓
invalidate product list
```

---

# Cache Invalidation Rules

| Mutation    | Invalidate                      |
|-------------|---------------------------------|
| Create      | product list                    |
| Update      | product list + product detail   |
| Delete      | product list                    |
| Bulk update | product list + affected details |

Avoid invalidating every query globally.

---

# Loading / Error / Empty Rules

Every CRUD screen should handle:

- loading
- error
- empty
- success flow

Recommended reusable components:

```txt
LoadingState
ErrorState
EmptyState
```

---

# Anti-patterns

Do NOT:

- call APIs inside components
- put CRUD logic in pages
- use raw `useQuery`
- bypass `useAppQuery`
- put forms directly in pages
- use Formik
- hardcode endpoint strings
- hardcode route strings
- skip loading/error/empty states
- use index as list key
- blindly reset server data into edit forms without mapping

---

# Strict Rules

1. CRUD pages stay thin.
2. CRUD module owns feature composition.
3. API clients live in `src/apis`.
4. Query hooks use `useAppQuery`.
5. Mutation hooks use `useMutation`.
6. Forms use RHF + zod.
7. Components do not call APIs.
8. Mutations invalidate relevant queries.
9. UI is mobile-first.
10. Loading/error/empty states are required.

---

# AI Agent Notes

When generating a CRUD feature:

1. Create the page route.
2. Create the module root.
3. Create API endpoints.
4. Create request/response models.
5. Create list query hook.
6. Create detail query hook if needed.
7. Create create/update/delete mutation hooks.
8. Create zod schemas.
9. Create form hooks.
10. Create modal/dialog components.
11. Add loading/error/empty states.
12. Add responsive module styling.
13. Keep pages thin.
14. Keep components API-free.
15. Keep cache invalidation scoped.

The final CRUD feature should be:

- typed
- responsive
- predictable
- cache-aware
- maintainable
- production-grade
- AI-agent-friendly
