# 07 Form Handling

Forms use react-hook-form + zod through the components in `src/components/Form`. The full component reference, with every prop, is `src/components/Form/README.md`. Read it before building a form; this file is the architecture around it.

---

## 1. The pieces

```txt
schema/product.schema.ts      zod schema: the single source of field types and validation
models/product.model.ts       ProductFormValues = z.input<typeof productSchema>; request types
hooks/useProductForm.ts       useZodForm(productSchema, { defaultValues }) + initial values + entity → form mapper
hooks/useCreateProduct.ts     the mutation (meta.silent: the form shows its own errors)
components/ProductFormDialog  renders <Form> with Control* fields and submits through the mutation
```

`npm run gen crud <Name>` creates all of these.

---

## 2. Schema

```ts
export const productSchema = z.object({
  name: z.string().trim().min(1).max(120),
  price: z.coerce.number().min(0),
  category: z.enum(CATEGORY_VALUES),
  tags: z.array(z.string()).max(5),
});
```

- Generic messages come from `setupZod()` (`src/configs/zod.ts`): "This field is required", "Enter a valid email address", "Must be at least 8 characters", ... Write a message in the schema only when it needs to say more.
- Use the schema's input type for form values and its output type for submission. `z.coerce` and `.transform()` happen between the two.
- Schemas live in the module's `schema/`, never inside a component file. Shared rules (password strength, phone) go in `src/shared` only once two modules need them.

---

## 3. Form hook and component

```ts
export const initialProductValues: ProductFormValues = { name: '', price: '', category: 'other', tags: [] };

export function useProductForm() {
  return useZodForm(productSchema, { defaultValues: initialProductValues });
}
```

```tsx
const form = useProductForm();
const { control, setError } = form;
const { mutate: createProduct, isPending } = useCreateProduct();

const handleSubmit = (values: CreateProductRequest) =>
  createProduct(values, { onSuccess: onClose, onError: (error) => applyApiErrorToForm(setError, error) });

<Form form={form} onSubmit={handleSubmit} className={classes['form']}>
  <ControlTextField control={control} name="name" label="Name" fullWidth />
  <ControlTextField control={control} name="price" label="Price" type="number" fullWidth />
  <ControlSelect control={control} name="category" label="Category" options={CATEGORY_OPTIONS} fullWidth />
  <ControlErrorMessage control={control} name="root.server" />
  <Button type="submit" variant="contained" loading={isPending}>
    Save
  </Button>
</Form>;
```

- `useZodForm` validates on first blur, then on every change (`mode: 'onTouched'`). On submit it focuses the first invalid field.
- Fields: `ControlTextField`, `ControlPasswordField`, `ControlSelect`, `ControlCheckbox`, `ControlSwitch`, `ControlRadioGroup`. Need another input? Wrap it with `useController` the same way, in `src/components/Form`.
- Every field reserves one line under it for its error, so messages never push content down. Turn it off only in dense layouts (`reserveMessageSpace={false}`); the message then grows in smoothly.
- Server errors: `applyApiErrorToForm(setError, error)` puts field errors under their fields and anything else in `root.server`.
- Submit button: `loading={isPending}`. Don't disable fields while submitting unless the design asks for it.
- Edit forms: map the entity to form values with a `toXFormValues` function and `reset` with it when the dialog opens.

---

## 4. Rules

- Always `useZodForm` + `Form` + `Control*`. No raw `useForm` + `zodResolver`, no uncontrolled MUI inputs, no Formik.
- Don't render error text yourself: the field does it, or `ControlErrorMessage` for non-field errors.
- Don't read values with `getValues()` to skip validation. Submit goes through `onSubmit` with parsed values.
- Field names come from the schema; TypeScript catches typos, so never use string paths that aren't in it.
- Search boxes and filter bars that write to the URL don't need a form: a `TextField` + `useDebounce` + `useQueryParams` (see the generated list screen).
- Forms are single column on phones; side-by-side fields use a grid that collapses (`grid-cols-1 sm:grid-cols-2`).
