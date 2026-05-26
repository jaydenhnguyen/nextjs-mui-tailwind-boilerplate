# Form Example

This example demonstrates the standard form architecture used in this boilerplate.

It teaches:

- react-hook-form + zod setup
- form schema ownership
- form hook ownership
- mutation hook relationship
- reusable Control* fields
- modal form flow
- field validation
- server error handling
- responsive form layout

---

# Example Form

This example uses:

```txt
CreateProductForm
```

as the feature form.

The same pattern applies to:

- login form
- checkout form
- booking form
- contact form
- create/edit admin forms
- filter forms
- modal forms

---

# Core Philosophy

Forms follow this flow:

```txt
Form Component
    ↓
useCreateProductForm
    ↓
zod validation
    ↓
useCreateProduct mutation
    ↓
createProduct API client
    ↓
request client
```

Form components should render UI only.

Form hooks own form state.

Mutation hooks own server submission.

---

# Folder Structure

```txt
src/
├── components/
│   └── Form/
│       ├── ControlTextField/
│       ├── ControlSelect/
│       ├── ControlCheckbox/
│       ├── ControlDatePicker/
│       └── index.ts
│
└── modules/
    └── Products/
        ├── components/
        │   └── CreateProductForm/
        │       ├── CreateProductForm.tsx
        │       ├── CreateProductForm.module.scss
        │       └── index.ts
        │
        ├── hooks/
        │   ├── useCreateProductForm.ts
        │   ├── useCreateProduct.ts
        │   └── index.ts
        │
        ├── schema/
        │   └── create-product.schema.ts
        │
        ├── models/
        │   ├── create-product.request.ts
        │   ├── create-product.response.ts
        │   └── index.ts
        │
        ├── constants/
        │   └── product-form.constant.ts
        │
        └── index.ts
```

---

# Ownership Rules

| Concern         | Owner                               |
|-----------------|-------------------------------------|
| Form UI         | `src/modules/<Feature>/components/` |
| Form state      | `useXForm`                          |
| Validation      | zod schema                          |
| Server write    | mutation hook                       |
| API request     | `src/apis/<domain>/`                |
| Reusable fields | `src/components/Form/`              |
| Field names     | feature constants                   |

---

# Schema Example

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

Rules:

- schema lives outside TSX
- schema is the validation source of truth
- messages are user-facing
- no duplicate manual validation in submit handler

---

# Request Model

## create-product.request.ts

```ts
import { z } from 'zod';

import { createProductSchema } from '../schema/create-product.schema';

export type CreateProductRequest = z.infer<typeof createProductSchema>;
```

Rules:

- form values are typed from schema
- no `any`
- request model stays in feature models

---

# Response Model

## create-product.response.ts

```ts
import { Product } from './product.model';

export type CreateProductResponse = {
  data: Product;
};
```

---

# Field Constants

## product-form.constant.ts

```ts
export const CREATE_PRODUCT_FIELD_NAMES = {
  name: 'name',
  sku: 'sku',
  price: 'price',
  categoryId: 'categoryId',
  isActive: 'isActive',
} as const;
```

If the project has `createFieldNames`, use it:

```ts
export const CREATE_PRODUCT_FIELD_NAMES =
  createFieldNames<CreateProductRequest>()({
    name: 'name',
    sku: 'sku',
    price: 'price',
    categoryId: 'categoryId',
    isActive: 'isActive',
  });
```

Rules:

- avoid repeated string field names
- keep form constants inside feature constants

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
    mode: 'onSubmit',
    shouldFocusError: true,
  });

  return {
    form,
    control: form.control,
    formHandleSubmit: form.handleSubmit,
    reset: form.reset,
    setValue: form.setValue,
    setError: form.setError,
    watch: form.watch,
    formState: form.formState,
  };
}
```

Rules:

- form hook owns RHF setup
- form hook does not call API
- form hook does not show toast
- form hook does not navigate

---

# Mutation Hook

## useCreateProduct.ts

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createProduct } from 'src/apis/products';

import { PRODUCT_QUERY_KEYS } from '../constants';
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

Rules:

- mutation hook owns server write
- mutation hook owns invalidation
- mutation hook may show toast
- mutation hook may execute success callback

---

# Reusable Control Field Example

## ControlTextField.tsx

```tsx
import { TextField, TextFieldProps } from '@mui/material';
import {
  Control,
  FieldValues,
  Path,
  useController,
} from 'react-hook-form';

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
} & TextFieldProps;

export function ControlTextField<T extends FieldValues>({
                                                          control,
                                                          name,
                                                          ...props
                                                        }: Props<T>) {
  const {
    field,
    fieldState: { error },
  } = useController({
    control,
    name,
  });

  return (
    <TextField
      {...field}
      {...props}
      error={Boolean(error)}
      helperText={error?.message}
    />
  );
}
```

Rules:

- generic
- feature-agnostic
- no zod import
- no API import
- uses MUI
- displays error

---

# Form Component

## CreateProductForm.tsx

```tsx
import * as React from 'react';
import { Button, MenuItem } from '@mui/material';

import {
  ControlCheckbox,
  ControlSelect,
  ControlTextField,
} from 'src/components/Form';

import { CREATE_PRODUCT_FIELD_NAMES } from '../../constants';
import {
  useCreateProduct,
  useCreateProductForm,
} from '../../hooks';
import { CreateProductRequest } from '../../models';

import classes from './CreateProductForm.module.scss';

type Props = {
  onSuccess?: () => void;
};

export function CreateProductForm({
                                    onSuccess,
                                  }: Props): React.ReactElement {
  const {
    control,
    formHandleSubmit,
    reset,
  } = useCreateProductForm();

  const handleSuccess = React.useCallback(() => {
    reset();
    onSuccess?.();
  }, [reset, onSuccess]);

  const { mutate, isLoading } = useCreateProduct(handleSuccess);

  const handleSubmit = React.useCallback(
    (payload: CreateProductRequest) => {
      mutate(payload);
    },
    [mutate],
  );

  return (
    <form
      className={classes['create-product-form']}
      onSubmit={formHandleSubmit(handleSubmit)}
      noValidate
    >
      <div className={classes['form-grid']}>
        <ControlTextField<CreateProductRequest>
          control={control}
          name={CREATE_PRODUCT_FIELD_NAMES.name}
          label="Product name"
          fullWidth
        />

        <ControlTextField<CreateProductRequest>
          control={control}
          name={CREATE_PRODUCT_FIELD_NAMES.sku}
          label="SKU"
          fullWidth
        />

        <ControlTextField<CreateProductRequest>
          control={control}
          name={CREATE_PRODUCT_FIELD_NAMES.price}
          label="Price"
          type="number"
          fullWidth
        />

        <ControlSelect<CreateProductRequest>
          control={control}
          name={CREATE_PRODUCT_FIELD_NAMES.categoryId}
          label="Category"
          fullWidth
        >
          <MenuItem value="books">Books</MenuItem>
          <MenuItem value="electronics">Electronics</MenuItem>
        </ControlSelect>

        <ControlCheckbox<CreateProductRequest>
          control={control}
          name={CREATE_PRODUCT_FIELD_NAMES.isActive}
          label="Active"
        />
      </div>

      <div className={classes['form-actions']}>
        <Button type="submit" variant="contained" disabled={isLoading}>
          Create Product
        </Button>
      </div>
    </form>
  );
}
```

Rules:

- component renders UI
- component calls form hook
- component calls mutation hook
- component does not call API directly
- submit uses `formHandleSubmit`
- loading state disables submit

---

# Form Styling

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

- mobile-first
- no fixed width
- SCSS modules + Tailwind `@apply`
- layout stays scoped

---

# Modal Form Example

## CreateProductModal.tsx

```tsx
import * as React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';

import { CreateProductForm } from '../CreateProductForm';

type Props = {
  open: boolean;
  onClose: () => void;
};

export function CreateProductModal({
  open,
  onClose,
}: Props): React.ReactElement {
  const handleSuccess = React.useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create Product</DialogTitle>

      <DialogContent>
        <CreateProductForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
```

Rules:

- modal owns open/close
- form owns submit
- success callback closes modal
- avoid duplicating form logic in modal

---

# Server Field Error Example

If backend returns field errors:

```ts
type ServerFieldError = {
  fieldErrors?: Record<string, string>;
  message?: string;
};
```

Handle with `setError`:

```tsx
const { setError } = useCreateProductForm();

const { mutate } = useCreateProduct();

const handleSubmit = (payload: CreateProductRequest) => {
  mutate(payload, {
    onError: (error: ServerFieldError) => {
      if (error.fieldErrors) {
        Object.entries(error.fieldErrors).forEach(([field, message]) => {
          setError(field as keyof CreateProductRequest, {
            type: 'server',
            message,
          });
        });
      }
    },
  });
};
```

Rules:

- zod handles client validation
- server field errors map into RHF
- global errors can show toast

---

# Edit Form Pattern

For edit/update forms:

- fetch detail with `useAppQuery`
- map server data to form values
- call `reset(mappedData)`
- submit with update mutation

Example:

```tsx
React.useEffect(() => {
  if (product) {
    reset(mapProductToUpdateProductForm(product));
  }
}, [product, reset]);
```

Mapper:

```ts
export function mapProductToUpdateProductForm(
  product: Product,
): UpdateProductRequest {
  return {
    name: product.name ?? '',
    sku: product.sku ?? '',
    price: product.price ?? 0,
    categoryId: product.categoryId ?? '',
    isActive: Boolean(product.isActive),
  };
}
```

Do not blindly do:

```ts
reset(product);
```

unless server shape exactly matches form shape.

---

# Dynamic Array Fields Example

Use `useFieldArray` for dynamic arrays.

Example:

- product variants
- guests
- phone numbers
- schedule rows

```ts
const { fields, append, remove } = useFieldArray({
  control,
  name: 'variants',
});
```

Render:

```tsx
{fields.map((field, index) => (
  <div key={field.id}>
    <ControlTextField
      control={control}
      name={`variants.${index}.name`}
      label="Variant name"
    />

    <Button onClick={() => remove(index)}>
      Remove
    </Button>
  </div>
))}
```

Rules:

- use `field.id` as key
- do not duplicate array state
- schema validates nested fields

---

# Async Select Example

For remote select/autocomplete:

- debounce search
- query options using `useAppQuery`
- store ID in form value
- show loading state

Example:

```tsx
const [searchValue, setSearchValue] = React.useState('');
const debouncedSearch = useDebounce(searchValue, 300);

const { data, isFetching } = useSearchCategories({
  payload: {
    searchValue: debouncedSearch,
  },
});

<Controller
  control={control}
  name="categoryId"
  render={({ field, fieldState }) => (
    <Autocomplete
      options={data?.data ?? []}
      loading={isFetching}
      onInputChange={(_, value) => setSearchValue(value)}
      onChange={(_, option) => field.onChange(option?.id ?? '')}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Category"
          error={Boolean(fieldState.error)}
          helperText={fieldState.error?.message}
        />
      )}
    />
  )}
/>
```

Rules:

- do not fetch on every keystroke without debounce
- query hook must use `useAppQuery`
- form value should usually store ID

---

# File Upload Example

Schema:

```ts
export const uploadProductImageSchema = z.object({
  image: z
    .custom<FileList>()
    .refine((files) => files?.length === 1, 'Image is required')
    .refine(
      (files) => files?.[0]?.size <= 5_000_000,
      'Maximum file size is 5MB',
    ),
});
```

Field:

```tsx
<Controller
  control={control}
  name="image"
  render={({ field: { onChange }, fieldState }) => (
    <>
      <Button component="label" variant="outlined">
        Upload image
        <input
          hidden
          type="file"
          accept="image/*"
          onChange={(event) => onChange(event.target.files)}
        />
      </Button>

      {fieldState.error?.message && (
        <span>{fieldState.error.message}</span>
      )}
    </>
  )}
/>
```

Rules:

- validate file size/type
- show selected file name
- build FormData in API layer or mapper
- do not upload from field component directly

---

# Form Flow Summary

```txt
CreateProductForm
    ↓
useCreateProductForm
    ↓
zodResolver(createProductSchema)
    ↓
formHandleSubmit(handleSubmit)
    ↓
useCreateProduct
    ↓
createProduct API
    ↓
invalidate product list
    ↓
reset form / close modal
```

---

# Good Patterns

Use:

- RHF + zod
- typed form values
- reusable Control fields
- mutation hook submission
- schemas outside TSX
- field constants
- mobile-first layout
- server error mapping when needed
- reset after success/close

---

# Anti-patterns

Do NOT:

- use Formik
- put zod schema inside TSX
- call APIs inside form components
- submit with `getValues()` without validation
- duplicate validation manually
- use `any`
- hardcode field names everywhere
- ignore loading state
- ignore reset behavior
- blindly reset server data into edit forms
- create global feature-specific fields

---

# Strict Rules

1. Forms use RHF + zod.
2. Schemas live outside TSX.
3. Form hook owns RHF.
4. Mutation hook owns server write.
5. Form component renders UI only.
6. Form submits through `formHandleSubmit`.
7. Reusable fields live in `src/components/Form`.
8. Feature-specific forms live in modules.
9. Form layout is mobile-first.
10. No API calls in form components.

---

# AI Agent Notes

When creating a form:

1. Create schema.
2. Create request/response models.
3. Create field constants.
4. Create form hook.
5. Create mutation hook.
6. Create form component.
7. Use reusable Control fields.
8. Submit via `formHandleSubmit`.
9. Disable submit while loading.
10. Handle success/reset.
11. Add server field error mapping if backend supports it.
12. Keep layout mobile-first.
13. Do not call APIs inside TSX.
14. Do not duplicate validation.

The final form should be:

- typed
- validated
- reusable
- responsive
- production-grade
- consistent with the boilerplate
