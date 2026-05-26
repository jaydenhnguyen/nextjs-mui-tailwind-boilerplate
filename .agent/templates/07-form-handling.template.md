# 07 Form Handling Template

This file defines the standard form architecture and form handling conventions for this boilerplate.

It is the source of truth for:

- form ownership
- form folder structure
- react-hook-form usage
- zod validation
- MUI form components
- controlled fields
- mutation submission flow
- reusable form fields
- error handling
- responsive form layout

---

# 1. Form Architecture Philosophy

Forms are feature-owned, typed, validated, and submitted through mutation hooks.

Standard flow:

```txt
Form Component
    ↓ uses
useXForm
    ↓ validates with
zod schema
    ↓ submits through
useCreateX / useUpdateX mutation hook
    ↓ calls
API client from src/apis
    ↓ uses
shared request client
```

Forms must stay:

- predictable
- typed end-to-end
- mobile-friendly
- easy to reuse
- easy for AI agents to extend

Default form stack:

```txt
react-hook-form + zod + MUI
```

Do not use Formik.

---

# 2. Deterministic Form Rule

Every feature form should follow one predictable recipe.

For a feature action like:

```txt
CreateProduct
```

create these artifacts:

```txt
src/modules/Products/
├── schema/
│   └── create-product.schema.ts
├── models/
│   ├── create-product.request.ts
│   ├── create-product.response.ts
│   └── index.ts
├── hooks/
│   ├── useCreateProductForm.ts
│   ├── useCreateProduct.ts
│   └── index.ts
└── components/
    └── CreateProductForm/
```

Submission must always go through:

```txt
formHandleSubmit(onSubmit)
    ↓
mutation.mutate(validatedPayload)
```

Never submit with raw `getValues()` unless there is a very specific reason.

---

# 3. Form Folder Ownership

| Concern                         | Location                             |
|---------------------------------|--------------------------------------|
| Feature form UI                 | `src/modules/<Feature>/components/`  |
| Feature form hook               | `src/modules/<Feature>/hooks/`       |
| Feature schema                  | `src/modules/<Feature>/schema/`      |
| Feature validations alternative | `src/modules/<Feature>/validations/` |
| Feature models                  | `src/modules/<Feature>/models/`      |
| Reusable field components       | `src/components/Form/`               |
| Shared form utilities           | `src/shared/utils/`                  |
| API clients                     | `src/apis/<domain>/`                 |

Preferred reusable form folder:

```txt
src/components/Form/
├── ControlTextField/
├── ControlSelect/
├── ControlCheckbox/
├── ControlRadioGroup/
├── ControlDatePicker/
├── ControlFileUpload/
├── ControlErrorMessage/
└── index.ts
```

Do not use feature-specific code inside `src/components/Form`.

---

# 4. Feature Form Structure

Example:

```txt
src/modules/Products/
├── Products.tsx
├── Products.module.scss
├── schema/
│   └── create-product.schema.ts
├── models/
│   ├── product.model.ts
│   ├── create-product.request.ts
│   ├── create-product.response.ts
│   └── index.ts
├── hooks/
│   ├── useCreateProductForm.ts
│   ├── useCreateProduct.ts
│   └── index.ts
├── components/
│   └── CreateProductForm/
│       ├── CreateProductForm.tsx
│       ├── CreateProductForm.module.scss
│       └── index.ts
└── index.ts
```

Rules:

- schema stays outside TSX
- form hook owns `useForm`
- mutation hook owns server write
- form component renders fields
- API client stays in `src/apis`

---

# 5. Reusable Form Component Structure

Reusable form controls belong in:

```txt
src/components/Form/
```

Example:

```txt
src/components/Form/ControlTextField/
├── ControlTextField.tsx
├── ControlTextField.module.scss
└── index.ts
```

Every reusable `Control*` component must:

- be generic
- accept `control`
- accept typed `name`
- use `useController` or `Controller`
- render MUI input
- show validation error
- remain feature-agnostic
- not call APIs
- not import zod schemas
- not import feature models

Example:

```tsx
import {TextField, TextFieldProps} from '@mui/material';
import {Control, FieldValues, Path, useController} from 'react-hook-form';

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
    fieldState: {error},
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

---

# 6. react-hook-form + zod Standard

Every feature form should use:

```txt
react-hook-form
zod
@hookform/resolvers/zod
```

Example:

```ts
import {zodResolver} from '@hookform/resolvers/zod';
import {useForm} from 'react-hook-form';
import {createProductSchema} from '../schema/create-product.schema';
import {CreateProductRequest} from '../models';

export function useCreateProductForm() {
  const form = useForm<CreateProductRequest>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: '',
      sku: '',
      price: 0,
      categoryId: '',
      isActive: true,
    },
    mode: 'onSubmit',
    shouldFocusError: true,
  });

  return {
    form,
    control: form.control,
    formHandleSubmit: form.handleSubmit,
    reset: form.reset,
    setError: form.setError,
    setValue: form.setValue,
    watch: form.watch,
    formState: form.formState,
  };
}
```

Do not use:

- Formik
- uncontrolled `useState`-only forms for CRUD
- schema inside TSX
- duplicate manual validation

---

# 7. Form Schema Rules

Schemas belong in:

```txt
src/modules/<Feature>/schema/
```

Example:

```ts
import {z} from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  price: z.coerce.number().min(0, 'Price must be 0 or greater'),
  categoryId: z.string().min(1, 'Category is required'),
  isActive: z.boolean(),
});
```

Rules:

- one schema per form action
- schema names use camelCase
- error messages must be user-friendly
- use `.refine()` or `.superRefine()` for cross-field validation
- use `z.coerce.number()` for number inputs if needed
- do not put schemas in TSX files

Important:

```txt
Form schema represents UI validation rules,
not always the exact backend entity shape.
```

If backend payload differs from form shape, use a mapper before mutation or inside mutation hook.

---

# 8. Form Model / Type Rules

Form request types should usually come from zod:

```ts
import {z} from 'zod';
import {createProductSchema} from '../schema/create-product.schema';

export type CreateProductRequest = z.infer<typeof createProductSchema>;
```

Rules:

- never use `any`
- keep request and response types separate
- response type is not form type
- avoid unsafe casts
- form values may differ from API payload

Example when API payload differs:

```ts
type RegisterFormValues = {
  email: string;
  password: string;
  confirmPassword: string;
};

type RegisterRequest = {
  email: string;
  password: string;
};
```

Map before submission:

```ts
const onSubmit = (values: RegisterFormValues) => {
  const {confirmPassword, ...payload} = values;

  mutate(payload);
};
```

---

# 9. Form Hook Rules

Form hooks live in:

```txt
src/modules/<Feature>/hooks/
```

Naming:

| Action | Hook             |
|--------|------------------|
| Create | `useCreateXForm` |
| Update | `useUpdateXForm` |
| Login  | `useLoginForm`   |
| Search | `useSearchXForm` |
| Filter | `useFilterXForm` |

Form hooks may:

- initialize `useForm`
- connect zod resolver
- define default values
- expose `control`
- expose `formHandleSubmit`
- expose `reset`, `setValue`, `watch`, `setError`
- expose form state

Form hooks must not:

- call API clients
- call `request`
- call `axios`
- show toast
- navigate
- store tokens

Server writes belong in mutation hooks.

---

# 10. Mutation Hook Relationship

Keep form hooks and mutation hooks separate.

```txt
useCreateProductForm
    → form state + validation

useCreateProduct
    → server write + toast + cache invalidation
```

Example mutation hook:

```ts
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {createProduct} from 'src/apis/products';
import {CreateProductRequest} from '../models';

export function useCreateProduct(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  const {mutate, status, error, isPending} = useMutation({
    mutationFn: (payload: CreateProductRequest) => createProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['getProductList'],
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

- mutation hook calls API client
- form component calls mutation hook
- API client stays in `src/apis`
- mutation hook may show toast
- mutation hook may invalidate cache
- mutation hook may execute callback

---

# 11. API Submission Flow

Canonical form component:

```tsx
import {Button} from '@mui/material';
import {useCreateProduct, useCreateProductForm} from '../../hooks';
import {CreateProductRequest} from '../../models';

export function CreateProductForm() {
  const {control, formHandleSubmit, reset} = useCreateProductForm();

  const handleSuccess = () => {
    reset();
  };

  const {mutate, isLoading} = useCreateProduct(handleSuccess);

  const onSubmit = (payload: CreateProductRequest) => {
    mutate(payload);
  };

  return (
    <form onSubmit={formHandleSubmit(onSubmit)} noValidate>
      {/* fields */}

      <Button type="submit" disabled={isLoading}>
        Save
      </Button>
    </form>
  );
}
```

Do not do this:

```tsx
const onSubmit = () => {
  mutate(getValues());
};
```

because it can bypass validation.

---

# 12. MUI Form Component Usage

Prefer MUI components:

- `TextField`
- `Select`
- `Checkbox`
- `RadioGroup`
- `Switch`
- `Button`
- `Dialog`
- `Autocomplete`
- MUI X Date Pickers if installed

Reusable controls should wrap MUI.

Example:

```tsx
<ControlTextField<CreateProductRequest>
  control={control}
  name="name"
  label="Product name"
  fullWidth
/>
```

Use:

- MUI for form controls
- SCSS modules + Tailwind for layout
- `sx` for theme-aware one-off styling

---

# 13. Controlled Component Rules

Use `Controller` or `useController` for:

- MUI Select
- MUI Autocomplete
- Date Picker
- Checkbox
- Radio Group
- File input
- custom inputs

Example Select:

```tsx
import {MenuItem, TextField} from '@mui/material';
import {Controller} from 'react-hook-form';

<Controller
  control={control}
  name="categoryId"
  render={({field, fieldState}) => (
    <TextField
      {...field}
      select
      label="Category"
      error={Boolean(fieldState.error)}
      helperText={fieldState.error?.message}
      fullWidth
    >
      {categories.map((category) => (
        <MenuItem key={category.id} value={category.id}>
          {category.name}
        </MenuItem>
      ))}
    </TextField>
  )}
/>
```

Do not mix uncontrolled local state and RHF state for the same field.

---

# 14. Form Error Handling

There are three error layers:

| Error Type            | Source       | Handled By                           |
|-----------------------|--------------|--------------------------------------|
| Client validation     | zod          | field helper text                    |
| Server field errors   | API response | `setError`                           |
| Global request errors | API response | mutation `onError` toast/error state |

Example server field error mapping:

```ts
onError: (error: ErrorResponse & { fieldErrors?: Record<string, string> }) => {
  if (error.fieldErrors) {
    Object.entries(error.fieldErrors).forEach(([field, message]) => {
      setError(field as Path<CreateProductRequest>, {
        type: 'server',
        message,
      });
    });

    return;
  }

  notify({
    message: error.message || 'Something went wrong',
    type: ToastType.error,
  });
};
```

Rules:

- zod handles client validation
- API handles backend validation
- mutation hook handles global errors
- form hook/component may map server field errors through `setError`

---

# 15. Loading / Disabled State Rules

Use mutation loading state for submit buttons.

```tsx
<Button type="submit" disabled={isLoading}>
  Save
</Button>
```

Rules:

- prevent double submit
- disable submit while mutation is pending
- show loading indicator when possible
- do not disable every input unless necessary
- keep user experience responsive

For option queries:

- disable select while options are loading
- show loading state in Autocomplete if needed

---

# 16. Default Values Rules

Every form must define default values.

Correct:

```ts
const initialCreateProductData: CreateProductRequest = {
  name: '',
  sku: '',
  price: 0,
  categoryId: '',
  isActive: true,
};
```

Rules:

- string defaults: `''`
- number defaults: `0` or meaningful value
- boolean defaults: `false` or meaningful value
- arrays: `[]`
- optional fields: `undefined` only when intentional
- dates: `null` or controlled project convention

Do not rely on undefined values accidentally.

---

# 17. Form Reset Rules

Use `reset()` when:

- modal closes
- create succeeds
- edit target changes
- server data loads into edit form

Example:

```ts
const handleClose = () => {
  reset();
  onClose();
};
```

For edit forms:

```ts
useEffect(() => {
  if (product) {
    reset(mapProductToFormValues(product));
  }
}, [product, reset]);
```

Do not mutate `defaultValues` after mount.

Use `reset()`.

---

# 18. Form Field Naming Rules

Field names should be consistent and typed.

Preferred constants:

```ts
export const CREATE_PRODUCT_FIELD_NAMES = {
  name: 'name',
  sku: 'sku',
  price: 'price',
  categoryId: 'categoryId',
} as const;
```

If the project has a helper like `createFieldNames`, use it.

Example:

```ts
export const CREATE_PRODUCT_FIELD_NAMES =
  createFieldNames<CreateProductRequest>()({
    name: 'name',
    sku: 'sku',
    price: 'price',
    categoryId: 'categoryId',
  });
```

Use:

```tsx
<ControlTextField
  control={control}
  name={CREATE_PRODUCT_FIELD_NAMES.name}
/>
```

Avoid repeating string field names in many places.

---

# 19. Form Layout and Responsive Rules

Forms must be mobile-first.

Rules:

- single column by default
- two columns only on larger screens
- inputs should usually be `fullWidth`
- buttons should be full width on mobile if appropriate
- avoid fixed widths
- use SCSS modules + Tailwind `@apply` for layout

Example:

```scss
.form-wrapper {
  @apply flex flex-col gap-4;
}

.form-row {
  @apply grid grid-cols-1 gap-4 md:grid-cols-2;
}

.actions {
  @apply flex flex-col gap-3 md:flex-row md:justify-end;
}
```

---

# 20. Multi-step Form Rules

Use multi-step forms only when the UX needs a wizard.

Rules:

- one `useForm` instance at the root
- one schema or step schemas composed clearly
- step components receive `control`
- validate current step before going next
- do not duplicate field state in `useState`

Example:

```ts
const STEP_ONE_FIELDS: Path<CreateProductRequest>[] = [
  'name',
  'categoryId',
];

const handleNext = async () => {
  const isValid = await trigger(STEP_ONE_FIELDS);

  if (isValid) {
    setStep((current) => current + 1);
  }
};
```

Final step submits with:

```tsx
formHandleSubmit(onSubmit)
```

---

# 21. Modal Form Rules

Modal forms should:

- reset on close
- reset on successful create if needed
- disable save while loading
- use MUI Dialog or shared modal component
- call `formHandleSubmit` from save action

Example:

```tsx
<Dialog open={open} onClose={handleClose}>
  <form onSubmit={formHandleSubmit(onSubmit)} noValidate>
    {/* fields */}

    <Button onClick={handleClose}>Cancel</Button>
    <Button type="submit" disabled={isLoading}>
      Save
    </Button>
  </form>
</Dialog>
```

If using shared modal with `onSave`:

```tsx
<AppModal
  open={open}
  onClose={handleClose}
  onSave={formHandleSubmit(onSubmit)}
  isLoading={isLoading}
/>
```

Do not call:

```tsx
onSave = {()
=>
mutate(getValues())
}
```

---

# 22. Search / Filter Form Rules

Not every search/filter UI needs RHF.

## Simple filters

Use local state when:

- few fields
- no validation
- simple table search
- immediate query payload update

Example:

```tsx
const [filters, setFilters] = useState<ProductFilters>({
  searchValue: '',
});
```

## Complex filters

Use RHF + zod when:

- many fields
- validation needed
- date range
- dependent fields
- reusable filter drawer

Query hook should use payload in query key:

```ts
useGetProductList({
  payload: {
    page,
    pageSize,
    ...filters,
  },
});
```

Search/filter component must not call API directly.

---

# 23. File Upload Form Rules

File upload fields need controlled handling.

Schema example:

```ts
import {z} from 'zod';

export const uploadFileSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  file: z
    .custom<FileList>()
    .refine((files) => files?.length === 1, 'File is required')
    .refine((files) => files?.[0]?.size <= 5_000_000, 'Maximum file size is 5MB'),
});
```

Input example:

```tsx
<Controller
  control={control}
  name="file"
  render={({field: {onChange}, fieldState}) => (
    <>
      <Button component="label" variant="outlined">
        Choose file
        <input
          hidden
          type="file"
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

- validate size and type
- build `FormData` in API client or mapper
- do not upload directly from field component
- show selected file name
- support mobile file picker

---

# 24. Auth Form Rules

Auth forms follow the same stack.

Examples:

- login
- register
- forgot password
- reset password

Rules:

- schema validates credentials
- login uses mutation hook
- token storage happens in auth success flow
- password fields use `type="password"`
- never log passwords
- do not store password in global state
- do not call auth API directly inside component

Example login flow:

```txt
Login.tsx
    ↓
useLoginForm
    ↓
useLogin
    ↓
login API client
    ↓
tokenManager on success
```

---

# 25. Reusable Field Component Rules

Create reusable `Control*` components only when:

- used by multiple forms
- generic enough
- not tied to one feature
- stable props API

Examples:

```txt
ControlTextField
ControlSelect
ControlCheckbox
ControlDatePicker
ControlFileUpload
```

Do not create global fields like:

```txt
ProductNameField
BookingDateField
```

Those belong in feature modules if needed.

---

# 26. Dynamic Array Fields

Use `useFieldArray` for dynamic arrays.

Examples:

- product variants
- phone numbers
- guest list
- booking guests
- tags
- schedule rows

Example:

```ts
const {fields, append, remove} = useFieldArray({
  control,
  name: 'variants',
});
```

Render:

```tsx
{
  fields.map((field, index) => (
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
  ))
}

<Button onClick={() => append({name: '', price: 0})}>
  Add variant
</Button>
```

Rules:

- use `field.id` as key
- do not use array index as React key
- define nested schema in zod
- keep add/remove buttons accessible
- avoid duplicating array state in `useState`

Schema example:

```ts
const variantSchema = z.object({
  name: z.string().min(1, 'Variant name is required'),
  price: z.coerce.number().min(0, 'Price must be 0 or greater'),
});

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  variants: z.array(variantSchema).min(1, 'At least one variant is required'),
});
```

---

# 27. Async Select / Autocomplete Rules

Use async selects for:

- remote search
- large option lists
- user/product/category lookup
- location search

Pattern:

```txt
Autocomplete component
    ↓ receives control/name
    ↓ search term state/debounce
    ↓ query hook using useAppQuery
    ↓ options rendered from query data
```

Example:

```tsx
const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 300);

const {data, isFetching} = useSearchCategories({
  payload: {
    searchValue: debouncedSearch,
  },
});

<Controller
  control={control}
  name="categoryId"
  render={({field, fieldState}) => (
    <Autocomplete
      options={data?.data ?? []}
      loading={isFetching}
      onInputChange={(_, value) => setSearch(value)}
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

- debounce remote search
- do not fetch on every keystroke without debounce
- query hook must use `useAppQuery`
- options loading state must be visible
- form value should usually store ID, not whole object
- map selected option carefully for edit forms

---

# 28. Date / Time / Timezone Rules

Date handling must be intentional.

Rules:

- do not blindly send local display date to API
- understand backend expected timezone format
- convert dates at boundary
- keep UI date format separate from API format
- use consistent date library if project has one

Examples:

- UI may use `Date`
- API may expect ISO string
- booking systems may need local timezone preservation

Mapper example:

```ts
export function mapBookingFormToPayload(values: BookingFormValues) {
  return {
    ...values,
    checkIn: values.checkIn?.toISOString(),
    checkOut: values.checkOut?.toISOString(),
  };
}
```

Do not hide timezone conversion inside random components.

Use mapper/helper.

---

# 29. Derived Form Values

Do not duplicate derived values in local state.

Use:

- `watch`
- `useWatch`
- computed values
- memoization only when needed

Example:

```ts
const quantity = useWatch({ control, name: 'quantity' });
const price = useWatch({ control, name: 'price' });

const total = Number(quantity || 0) * Number(price || 0);
```

Rules:

- do not store `total` separately unless user can edit it
- do not use `useEffect + setValue` for simple derived display
- use `setValue` only when derived value must be submitted

---

# 30. Edit Form Mapping Rules

Edit forms often receive server data in a different shape.

Do not blindly do:

```ts
reset(response.data);
```

unless the server shape exactly matches form values.

Preferred:

```ts
useEffect(() => {
  if (product) {
    reset(mapProductToUpdateProductForm(product));
  }
}, [product, reset]);
```

Mapper location:

```txt
src/modules/<Feature>/utils/
```

Example:

```ts
export function mapProductToUpdateProductForm(
  product: Product,
): UpdateProductRequest {
  return {
    name: product.name ?? '',
    sku: product.sku ?? '',
    price: product.price ?? 0,
    categoryId: product.category?.id ?? '',
    isActive: Boolean(product.isActive),
  };
}
```

Rules:

- map nullable values
- format date values
- convert nested objects to IDs
- keep mapper outside TSX when non-trivial

---

# 31. Optimistic Update Rules

Default:

```txt
Prefer server-confirmed updates.
```

Use optimistic updates only when:

- UX strongly benefits
- rollback is simple
- mutation failure can be recovered
- cache keys are well-defined

If optimistic update is used:

- implement rollback
- keep cache invalidation consistent
- do not mutate unrelated queries

For most forms:

- submit
- wait for success
- invalidate queries
- close/reset form

---

# 32. Accessibility Rules

Forms must be accessible.

Rules:

- every input has label
- every error message is visible and screen-reader friendly
- submit button is keyboard accessible
- modal forms use focus trap
- required fields are clear
- error state uses `error` + `helperText`
- use `noValidate` to rely on zod/RHF
- do not rely on color only

Example:

```tsx
<form onSubmit={formHandleSubmit(onSubmit)} noValidate>
```

---

# 33. Validation Message Rules

Validation messages should be:

- user-facing
- specific
- short
- consistent
- not technical

Good:

```txt
Email is required
Password must be at least 8 characters
Price must be 0 or greater
```

Bad:

```txt
invalid_type
Required
Error 400
```

Use feature constants for repeated messages.

---

# 34. Import Rules

Use `src/` imports.

Correct:

```ts
import { ControlTextField } from 'src/components/Form';
import { createProduct } from 'src/apis/products';
```

Incorrect:

```ts
import { ControlTextField } from '@/components/Form';
```

Import order:

1. React/Next
2. external libraries
3. `src/*`
4. relative feature imports
5. styles

---

# 35. Anti-patterns

Do NOT:

- use Formik
- put schema inside TSX
- call API directly from form component
- use `getValues()` to bypass validation
- duplicate validation manually
- use `any` for form values
- store field values in both RHF and local state
- hardcode field names everywhere
- return inconsistent error UI
- create feature-specific global form controls
- ignore reset behavior in modals
- blindly reset server data into edit forms
- fetch async options without debounce

---

# 36. Strict Rules

Do NOT:

- use `@/` imports
- use Formik
- use `any` for form values
- place zod schemas in TSX
- call `request`, `axios`, or `fetch` inside form components
- call API clients directly inside form components
- submit with unvalidated values
- mix local state and RHF for the same field
- create desktop-only form layout
- create global field components tied to one feature
- ignore loading state
- ignore server field errors when supported
- hardcode repeated field names
- create refresh/query logic inside form components

---

# 37. AI Agent Notes

When creating a form:

1. Identify the feature module.
2. Create schema in `src/modules/<Feature>/schema`.
3. Create request/response models in `models`.
4. Create field constants in `constants`.
5. Create `useXForm` hook.
6. Create mutation hook if missing.
7. Create or reuse API client in `src/apis`.
8. Build UI with MUI + reusable `Control*` fields.
9. Submit with `formHandleSubmit(onSubmit)`.
10. Use mutation loading state.
11. Reset form on success/close when needed.
12. Keep layout mobile-first.
13. Use mappers for edit forms when server shape differs.
14. Use `useFieldArray` for dynamic arrays.
15. Use async select pattern for remote options.
16. Never call API directly in TSX.

The final form should be typed, validated, responsive, and consistent with the rest of the boilerplate.
