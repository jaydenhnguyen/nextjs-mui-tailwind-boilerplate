# Form components

Typed form fields built on **react-hook-form + zod + MUI**. Every field is an MUI component wired to the form for you: value, change, blur, focus-on-error, error message and accessibility are already handled.

You write the zod schema and lay out the fields. That's it.

```txt
zod schema ──▶ useZodForm(schema) ──▶ <Form form onSubmit> ──▶ <Control* control name />
```

- Field names are type-checked against the schema (a typo is a compile error).
- `onSubmit` receives the **parsed** values (`z.coerce`, `.transform()` already applied).
- On a failed submit, the first invalid field gets focus.
- Errors fade in under the field in a reserved line, so the layout never jumps.

Everything here is generic. Nothing in this folder may import feature code, call APIs, or know about a specific schema.

---

## 1. Quick start

```ts
// src/modules/Products/schema/create-product.schema.ts
import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  price: z.coerce.number<string>().min(0, 'Price must be 0 or more'),
  categoryId: z.string().min(1, 'Pick a category'),
  isActive: z.boolean(),
});
```

```ts
// src/modules/Products/hooks/useCreateProductForm.ts
import { useZodForm } from 'src/components/Form';
import { createProductSchema } from '../schema/create-product.schema';

export function useCreateProductForm() {
  return useZodForm(createProductSchema, {
    defaultValues: { name: '', price: '', categoryId: '', isActive: true },
  });
}
```

```tsx
// src/modules/Products/components/CreateProductForm/CreateProductForm.tsx
import { z } from 'zod';
import { Button } from '@mui/material';
import { ControlSelect, ControlSwitch, ControlTextField, Form } from 'src/components/Form';
import { useCreateProduct, useCreateProductForm } from '../../hooks';
import { createProductSchema } from '../../schema/create-product.schema';

export function CreateProductForm() {
  const form = useCreateProductForm();
  const { control } = form;
  const { mutate, isPending } = useCreateProduct();

  const onSubmit = (values: z.output<typeof createProductSchema>) => mutate(values);

  return (
    <Form form={form} onSubmit={onSubmit} className="flex flex-col gap-2">
      <ControlTextField control={control} name="name" label="Name" required fullWidth />
      <ControlTextField control={control} name="price" label="Price" type="number" fullWidth />
      <ControlSelect
        control={control}
        name="categoryId"
        label="Category"
        options={[
          { label: 'Books', value: 'books' },
          { label: 'Games', value: 'games' },
        ]}
        fullWidth
      />
      <ControlSwitch control={control} name="isActive" label="Active" />
      <Button type="submit" variant="contained" loading={isPending}>
        Save
      </Button>
    </Form>
  );
}
```

Import everything from `src/components/Form` (or `src/components`).

---

## 2. Building blocks

### `useZodForm(schema, options?)`

Wraps react-hook-form's `useForm` with the zod resolver.

| Param     | Type                                                                                 | Notes                                                                                                       |
| --------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `schema`  | any zod object schema                                                                | Form input type = `z.input<typeof schema>`, submit type = `z.output<typeof schema>`.                        |
| `options` | every [`useForm` option](https://react-hook-form.com/docs/useform) except `resolver` | Default `mode: 'onTouched'`: errors show after the user leaves a field, then update live while they fix it. |

Returns the normal `useForm` result (`control`, `reset`, `setError`, `setValue`, `watch`, `formState`, …).

`defaultValues` must use the **input** type. For example, a number field fed by a text input starts as `''`, not `0`.

### `<Form form onSubmit onInvalid?>`

A `<form noValidate>` that runs validation, then calls `onSubmit(parsedValues)`. Any other `<form>` prop (`className`, `id`, …) is passed through. Use `id` + `<Button form="that-id">` to submit from outside the form, like a dialog footer.

### Shared field props

Every `Control*` component takes these:

| Prop                  | Type                       | Default  | Notes                                                                                                                                                                            |
| --------------------- | -------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `control`             | `form.control`             | required | Always pass it explicitly. There's no form context.                                                                                                                              |
| `name`                | a field path of the schema | required | Type-checked. Nested paths work: `address.city`, `items.0.name`.                                                                                                                 |
| `helperText`          | `ReactNode`                | none     | Shown when there's no error. The error message replaces it.                                                                                                                      |
| `reserveMessageSpace` | `boolean`                  | `true`   | Keeps one empty line under the field for the message. `false` = no empty line; the message grows in smoothly instead. Use `false` for search boxes, filter bars and table cells. |

### Blocked props

`value`, `defaultValue`, `checked`, `onChange`, `onBlur`, `inputRef`, `name` (on the inner input) and `error` are controlled by the form and can't be passed. Set values with `defaultValues`, `reset()` or `setValue()`. React to changes with `watch()` / `useWatch()`.

---

## 3. Components

For anything not listed in "Own props", follow the linked MUI docs: those props are passed straight through.

### `ControlTextField`

MUI [`TextField`](https://mui.com/material-ui/api/text-field/). Every TextField prop works (`variant`, `size`, `type`, `multiline`, `placeholder`, `slotProps`, `sx`, …).

### `ControlPasswordField`

`ControlTextField` with a show/hide button. Same props, except `type`. `autoComplete` defaults to `current-password`; use `new-password` on sign-up forms.

### `ControlSelect`

MUI [`TextField` with `select`](https://mui.com/material-ui/react-select/), options rendered as [`MenuItem`](https://mui.com/material-ui/api/menu-item/).

| Own prop           | Type                            | Notes                                                                         |
| ------------------ | ------------------------------- | ----------------------------------------------------------------------------- |
| `options`          | `{ label, value, disabled? }[]` | `value` can be a string or a number; the form gets back the same type.        |
| `multiple`         | `boolean`                       | Value becomes an array. Default value should be `[]`.                         |
| `emptyOptionLabel` | `string`                        | Adds a first option with value `''` (e.g. "None", "All"). Single select only. |

Select menu props go in `slotProps.select` ([`Select` API](https://mui.com/material-ui/api/select/)).

### `ControlCheckbox` / `ControlSwitch`

| Own prop                            | Passed to                                                                                                                                           |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `label`                             | the text next to the input (required)                                                                                                               |
| `disabled`, `required`, `className` | the wrapper                                                                                                                                         |
| `checkboxProps` / `switchProps`     | MUI [`Checkbox`](https://mui.com/material-ui/api/checkbox/) / [`Switch`](https://mui.com/material-ui/api/switch/): `color`, `size`, `icon`, `sx`, … |
| `formControlLabelProps`             | MUI [`FormControlLabel`](https://mui.com/material-ui/api/form-control-label/): `labelPlacement`, `sx`, …                                            |
| `formControlProps`                  | MUI [`FormControl`](https://mui.com/material-ui/api/form-control/) wrapper                                                                          |

The value is a `boolean`. For "must be checked" use `z.literal(true, { error: 'You must accept the terms' })`.

### `ControlRadioGroup`

| Own prop                                   | Passed to                                                                                              |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `options`                                  | `{ label, value, disabled? }[]`; number values come back as numbers                                    |
| `label`                                    | the group's `<legend>`                                                                                 |
| `row`, `disabled`, `required`, `className` | layout and wrapper                                                                                     |
| `radioGroupProps`                          | MUI [`RadioGroup`](https://mui.com/material-ui/api/radio-group/)                                       |
| `radioProps`                               | MUI [`Radio`](https://mui.com/material-ui/api/radio/), applied to every option                         |
| `formControlLabelProps`                    | MUI [`FormControlLabel`](https://mui.com/material-ui/api/form-control-label/), applied to every option |
| `formControlProps`                         | MUI [`FormControl`](https://mui.com/material-ui/api/form-control/) wrapper (`<fieldset>`)              |

### `ControlErrorMessage`

Shows one error message on its own. `name` can be a field path or `root` / `root.<key>` for errors that don't belong to a field. Also takes `className` and `reserveMessageSpace`.

---

## 4. Recipes

### Server errors

```ts
// a field error from the API (e.g. 409 / 422)
form.setError('email', { message: 'This email is already taken' });

// an error for the whole form
form.setError('root.server', { message: 'Something went wrong, please try again' });
```

```tsx
<ControlErrorMessage control={control} name="root.server" />
```

Field errors show under the field automatically. `root.*` errors only show where you place a `ControlErrorMessage`.

### Number inputs

Inputs always give strings. Coerce in the schema and start from `''`:

```ts
age: z.coerce.number<string>().int().min(18),
// defaultValues: { age: '' }
```

### Optional select

```ts
categoryId: z.string(), // '' means "none"
```

```tsx
<ControlSelect control={control} name="categoryId" label="Category" emptyOptionLabel="None" options={options} />
```

### Dense layouts (filters, toolbars, tables)

```tsx
<ControlTextField control={control} name="search" placeholder="Search" size="small" reserveMessageSpace={false} />
```

### Style every field at once

Don't repeat props on every field. Set them in the MUI theme instead (`src/theme/components/`):

```ts
// src/theme/components/textField.ts
import { Components, Theme } from '@mui/material/styles';

export const MuiTextField: Components<Theme>['MuiTextField'] = {
  defaultProps: { fullWidth: true, size: 'small' },
};
```

Then add it to the `components` object in `src/theme/components/index.ts`. The same works for `MuiCheckbox`, `MuiSwitch`, `MuiFormHelperText`, etc. See the [MUI theme components docs](https://mui.com/material-ui/customization/theme-components/).

### Change the default validation messages

Messages written in a schema always win. When a schema doesn't set one, the app-wide defaults in `src/configs/zod.ts` (`setupZod`) are used, e.g. "This field is required" or "Must be at least 8 characters". Reword them or plug in translations there.

### A one-off custom input inside a feature

If an input is truly specific to one feature, use `useController` there, but still show its message with `FieldMessage` so it looks and animates like the rest:

```tsx
import { FormHelperText } from '@mui/material';
import { useController } from 'react-hook-form';
import { FieldMessage } from 'src/components/Form';

const { field, fieldState } = useController({ control, name: 'rating' });

<StarRating value={field.value} onChange={field.onChange} onBlur={field.onBlur} ref={field.ref} />
<FormHelperText error>
  <FieldMessage message={fieldState.error?.message} />
</FormHelperText>
```

If a second form needs the same input, move it into `src/components/Form` as a `Control*` component.

### Change the message animation

`FieldMessage/FieldMessage.tsx` controls the error animation for every field: the `slideFade` (reserved line) and `collapse` (no reserved line) objects, built with `motion` and the tokens in `src/theme/motion.ts`. Follow `.agent/templates/09-motion.template.md`.

### Add a new field type (date picker, autocomplete, file upload…)

Create `src/components/Form/ControlX/ControlX.tsx` + `index.ts` and export it from `src/components/Form/index.ts`. Copy the shape of `ControlTextField`:

1. Props = `ControlFieldProps<T, TOut>` & `MessageSpaceProps` & the MUI component's props minus the blocked ones.
2. `const { field, fieldState: { error } } = useController({ control, name })`.
3. Wire `value`, `onChange`, `onBlur`, and `inputRef={field.ref}` (needed for focus-on-error).
4. Show the error through `<FieldMessage message={error?.message ?? helperText} reserveSpace={reserveMessageSpace} />`.
5. Keep it generic: no feature imports, no API calls, no schemas.

---

## 5. Rules for AI agents

Do:

- Build every form with `useZodForm` + `<Form>` + `Control*` fields.
- Put the schema in `src/modules/<Feature>/schema/`, the `useXForm` hook in `src/modules/<Feature>/hooks/`.
- Type submit values as `z.output<typeof schema>`. Use `z.input<typeof schema>` for default values.
- Pass `control={control}` to every field.
- Set field-specific messages in the schema. Leave generic ones to `setupZod`.
- Map API field errors with `form.setError(field, { message })`, and form-level ones with `setError('root.<key>')` + `<ControlErrorMessage>`.
- Pass MUI props straight to the field, and use the `*Props` groups for inner parts (`checkboxProps`, `radioProps`, …).
- Apply app-wide field styling through MUI theme overrides, not by editing these components.

Don't:

- Use raw `TextField`/`Checkbox`/`Controller` in feature forms when a `Control*` component exists.
- Call `useForm` + `zodResolver` directly in feature code. Use `useZodForm`.
- Pass `value`, `onChange`, `onBlur`, `inputRef` or `error` to a `Control*` field.
- Wrap `form.handleSubmit` yourself on a `<form>`. Use `<Form>`.
- Show errors with your own `Typography`/`FormHelperText`. Use the field's built-in message or `ControlErrorMessage`.
- Add feature logic, API calls or schemas inside `src/components/Form`.
- Remove the reserved message space to "save room" in normal forms. Only turn it off for dense layouts.

File map:

```txt
src/components/Form/
├── useZodForm.ts            form hook (schema → typed form)
├── Form.tsx                 <form> wrapper
├── types.ts                 ControlFieldProps, MessageSpaceProps, FieldOption (exported)
├── ControlBooleanField.tsx  shared by checkbox + switch (internal)
├── FieldMessage/            animated error/helper line (exported, for custom fields)
├── ControlTextField/
├── ControlPasswordField/
├── ControlSelect/
├── ControlCheckbox/
├── ControlSwitch/
├── ControlRadioGroup/
├── ControlErrorMessage/
└── index.ts
src/configs/zod.ts           app-wide default validation messages
```
