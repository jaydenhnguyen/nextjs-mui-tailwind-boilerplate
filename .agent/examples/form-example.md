# Form Example

This example demonstrates the standard form architecture used in this boilerplate.

Component API reference (every prop, default and recipe): `src/components/Form/README.md`.

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
│       ├── README.md
│       ├── useZodForm.ts
│       ├── Form.tsx
│       ├── ControlTextField/
│       ├── ControlSelect/
│       ├── ControlCheckbox/
│       ├── ...
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
| --------------- | ----------------------------------- |
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
  price: z.coerce.number<string>().min(0, 'Price must be 0 or greater'),
  categoryId: z.string().min(1, 'Category is required'),
  isActive: z.boolean(),
});
```

Rules:

- schema lives outside TSX
- schema is the validation source of truth
- messages are user-facing; generic ones can be left out because `setupZod()` provides defaults
- number inputs use `z.coerce.number<string>()` (inputs always give strings)
- no duplicate manual validation in submit handler

---

# Request Model

## create-product.request.ts

```ts
import { z } from 'zod';
import { createProductSchema } from '../schema/create-product.schema';

// what onSubmit receives (price: number)
export type CreateProductRequest = z.output<typeof createProductSchema>;
// what the inputs hold (price: string)
export type CreateProductFormValues = z.input<typeof createProductSchema>;
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
export const CREATE_PRODUCT_FIELD_NAMES = createFieldNames<CreateProductRequest>()({
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
import { useZodForm } from 'src/components/Form';
import { CreateProductFormValues } from '../models';
import { createProductSchema } from '../schema/create-product.schema';

export const initialCreateProductData: CreateProductFormValues = {
  name: '',
  sku: '',
  price: '',
  categoryId: '',
  isActive: true,
};

export function useCreateProductForm() {
  return useZodForm(createProductSchema, {
    defaultValues: initialCreateProductData,
  });
}
```

Rules:

- form hook owns form setup through `useZodForm` (never `useForm` + `zodResolver` directly)
- it returns the whole form object; the component passes it to `<Form form={form}>`
- form hook does not call API
- form hook does not show toast
- form hook does not navigate

---

# Mutation Hook

## useCreateProduct.ts

```ts
import { useQueryClient } from '@tanstack/react-query';
import { createProduct } from 'src/apis/products';
import { useAppMutation } from 'src/hooks';
import { PRODUCT_QUERY_KEYS } from '../constants';
import { CreateProductRequest } from '../models';

export function useCreateProduct(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: (payload: CreateProductRequest) => createProduct(payload),
    meta: { successMessage: 'Product created' },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [PRODUCT_QUERY_KEYS.GET_PRODUCT_LIST] });
      onSuccess?.();
    },
  });
}
```

Rules:

- mutation hook owns server write
- mutation hook owns invalidation
- error toasts are automatic; success toast via `meta: { successMessage }`
- mutation hook may execute success callback
- the component uses `isPending` from the result

---

# Reusable Control Fields

The boilerplate already ships `ControlTextField`, `ControlPasswordField`, `ControlSelect`, `ControlCheckbox`, `ControlSwitch`, `ControlRadioGroup` and `ControlErrorMessage` in `src/components/Form`. Use them; don't re-implement them in features.

Their props are documented in `src/components/Form/README.md`. The reference implementation for writing a new one is in `07-form-handling.template.md` §5.

---

# Form Component

## CreateProductForm.tsx

```tsx
import * as React from 'react';
import { Button } from '@mui/material';
import { ControlErrorMessage, ControlSelect, ControlSwitch, ControlTextField, Form } from 'src/components/Form';
import { CATEGORY_OPTIONS, CREATE_PRODUCT_FIELD_NAMES } from '../../constants';
import { useCreateProduct, useCreateProductForm } from '../../hooks';
import { CreateProductRequest } from '../../models';
import classes from './CreateProductForm.module.scss';

type Props = {
  onSuccess?: () => void;
};

export function CreateProductForm({ onSuccess }: Props): React.ReactElement {
  const form = useCreateProductForm();
  const { control, reset } = form;

  const handleSuccess = React.useCallback(() => {
    reset();
    onSuccess?.();
  }, [reset, onSuccess]);

  const { mutate, isPending } = useCreateProduct(handleSuccess);

  const handleSubmit = React.useCallback(
    (payload: CreateProductRequest) => {
      mutate(payload);
    },
    [mutate],
  );

  return (
    <Form form={form} onSubmit={handleSubmit} className={classes['create-product-form']}>
      <div className={classes['form-grid']}>
        <ControlTextField control={control} name={CREATE_PRODUCT_FIELD_NAMES.name} label="Product name" fullWidth />
        <ControlTextField control={control} name={CREATE_PRODUCT_FIELD_NAMES.sku} label="SKU" fullWidth />
        <ControlTextField
          control={control}
          name={CREATE_PRODUCT_FIELD_NAMES.price}
          label="Price"
          type="number"
          fullWidth
        />
        <ControlSelect
          control={control}
          name={CREATE_PRODUCT_FIELD_NAMES.categoryId}
          label="Category"
          options={CATEGORY_OPTIONS}
          fullWidth
        />
        <ControlSwitch control={control} name={CREATE_PRODUCT_FIELD_NAMES.isActive} label="Active" />
      </div>

      <ControlErrorMessage control={control} name="root.server" />

      <div className={classes['form-actions']}>
        <Button type="submit" variant="contained" loading={isPending}>
          Create Product
        </Button>
      </div>
    </Form>
  );
}
```

`CATEGORY_OPTIONS` is a `FieldOption[]` (`{ label, value }[]`) in the feature constants.

Rules:

- component renders UI
- component calls form hook
- component calls mutation hook
- component does not call API directly
- submit goes through `<Form>` (validation runs first, the first invalid field gets focus)
- no generic argument on fields: types come from `control`
- loading state on the submit button
- errors appear in each field's reserved line; form-level errors in `ControlErrorMessage`

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

export function CreateProductModal({ open, onClose }: Props): React.ReactElement {
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

Every API error is an `ApiError` whose `fieldErrors` are already parsed and camelCased. Map it with one call:

```tsx
import { applyApiErrorToForm } from 'src/shared/utils';

const form = useCreateProductForm();
const { mutate } = useCreateProduct();

const handleSubmit = (payload: CreateProductRequest) => {
  mutate(payload, {
    onError: (error) => applyApiErrorToForm(form.setError, error),
  });
};
```

Rules:

- zod handles client validation
- server field errors map into RHF and show under their field automatically
- form-level errors go to `root.server` and show in `<ControlErrorMessage name="root.server" />`
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
export function mapProductToUpdateProductForm(product: Product): UpdateProductRequest {
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
{
  fields.map((field, index) => (
    <div key={field.id}>
      <ControlTextField control={control} name={`variants.${index}.name`} label="Variant name" />

      <Button onClick={() => remove(index)}>Remove</Button>
    </div>
  ));
}
```

Rules:

- use `field.id` as key
- do not duplicate array state
- schema validates nested fields

---

# Async Select Example

There's no `ControlAutocomplete` yet. If a project needs autocomplete in more than one form, add it to `src/components/Form` (README §4) instead of repeating the `Controller` below. For a one-off, the pattern below is fine, but show the error through `FieldMessage` so it animates like the other fields.

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
/>;
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
    .refine((files) => files?.[0]?.size <= 5_000_000, 'Maximum file size is 5MB'),
});
```

Field (a one-off; add a reusable `ControlFileUpload` when more than one form needs it):

```tsx
<Controller
  control={control}
  name="image"
  render={({ field: { onChange }, fieldState }) => (
    <>
      <Button component="label" variant="outlined">
        Upload image
        <input hidden type="file" accept="image/*" onChange={(event) => onChange(event.target.files)} />
      </Button>

      <FormHelperText error>
        <FieldMessage message={fieldState.error?.message} />
      </FormHelperText>
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
useZodForm(createProductSchema)
    ↓
<Form form onSubmit={handleSubmit}>
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
6. Form submits through `<Form form onSubmit>`.
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
4. Create form hook with `useZodForm`.
5. Create mutation hook.
6. Create form component.
7. Use reusable Control fields (props: `src/components/Form/README.md`).
8. Submit via `<Form form={form} onSubmit={onSubmit}>`.
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
