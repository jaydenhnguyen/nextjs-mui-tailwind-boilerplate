# CRUD Flow Example

How to add a resource with a list, create, edit and delete. Needs the `api` pack (and `auth` for private pages).

---

## 1. Generate it

```bash
npm run gen crud Products                       # private page, in the menu
npm run gen crud People -- --singular Person    # when the singular guess is wrong
npm run gen crud Posts -- --public --no-nav     # public, indexable, not in the menu
npm run gen crud Products -- --dry-run          # just show the files
```

It writes, all wired together, type-checked and linted:

```txt
src/apis/products/                 endpoints.ts, products.ts (getProductList, createProduct, updateProduct, deleteProduct)
src/modules/Products/
├── Products.tsx                   screen: header, search, list, pagination, dialog
├── schema/product.schema.ts       zod schema (name, description to start with)
├── models/product.model.ts        Product, GetProductListRequest/Response, ProductFormValues, Create/UpdateProductRequest
├── constants/products.constant.ts PRODUCT_QUERY_KEYS, PRODUCT_LIST_PAGE_SIZE
├── hooks/                         useGetProductList, useCreateProduct, useUpdateProduct, useDeleteProduct, useProductForm
└── components/                    ProductTable, ProductFormDialog (create + edit), DeleteProductButton
src/pages/products/index.tsx       Seo + layout
src/mocks/handlers/products.handlers.ts   seed data + list/create/update/delete (mock-api pack)
+ APP_ROUTES, NO_INDEX_ROUTES or SITEMAP_ROUTES, menu entry, barrels
```

Try it right away with `npm run dev:mock`.

---

## 2. Make it real

1. **Fields.** Replace `name` / `description` with the real fields in: the schema, `Product` model, `useProductForm` (initial values + `toProductFormValues`), `ProductTable` columns, `ProductFormDialog` fields, and the mock handler's seed data and validation.
2. **Backend shape.** Check `products.ts` against the real API (paths, PUT vs PATCH, list response shape). If the list comes back differently, adjust `GetProductListResponse` or unwrap with `select` in `useGetProductList`.
3. **Permissions** (auth pack). Add `PRODUCTS_READ` / `PRODUCTS_WRITE` to `PERMISSIONS` and `ROLE_PERMISSIONS`, wrap the write buttons in `<Can permission={PERMISSIONS.PRODUCTS_WRITE}>`, and check it in the mock handler with `hasPermission`.
4. **Extras the generator doesn't make:** a detail page (`npm run gen page ProductDetail`, `useGetProduct(id)`), more filters (more keys in `useQueryParams`), bulk actions.
5. **Tests** (tests pack). Copy the shape of an existing screen test: render the screen, find rows, search, create through the dialog. See `src/test/README.md`.

---

## 3. Patterns it uses (keep them when editing)

List: search and page live in the URL, the search writes after typing stops, and the old page stays visible (dimmed) while the next loads.

```tsx
const { params, setParams, isReady } = useQueryParams<'search' | 'page'>();
const [searchInput, setSearchInput] = React.useState<string | null>(null);
const debouncedSearch = useDebounce(searchInput);

React.useEffect(() => {
  if (debouncedSearch !== null) void setParams({ search: debouncedSearch, page: undefined });
}, [debouncedSearch, setParams]);

const page = Math.max(1, Number(params.page) || 1);
const productsQuery = useGetProductList(
  { page, pageSize: PRODUCT_LIST_PAGE_SIZE, search: params.search },
  { enabled: isReady },
);
```

```tsx
<QueryState query={productsQuery} isEmpty={(response) => response.data.length === 0} empty={...}>
  {(response) => (
    <m.div initial={false} animate={{ opacity: productsQuery.isPlaceholderData ? 0.6 : 1 }} transition={moveTransition()}>
      <ProductTable products={response.data} onEdit={...} />
    </m.div>
  )}
</QueryState>
```

Create and edit share one dialog. The form resets when the dialog opens, and server field errors land on the fields:

```tsx
<Dialog open={open} onClose={isPending ? undefined : onClose}
  slotProps={{ transition: { onEnter: () => reset(product ? toProductFormValues(product) : initialProductValues) } }}>
```

```tsx
createProduct(values, { onSuccess: onClose, onError: (error) => applyApiErrorToForm(setError, error) });
```

Delete asks first:

```tsx
if (await confirm({ title: `Delete ${product.name}?`, confirmText: 'Delete', destructive: true }))
  deleteProduct(product.id);
```

Mutations invalidate the list (`[PRODUCT_QUERY_KEYS.GET_PRODUCT_LIST]`) and set `meta.successMessage`; create and update are `silent` because the dialog shows their errors.

---

## 4. A finished example

The `examples` pack ships **Users** (`src/modules/Users`, `/users`), built the same way plus permissions, a role select, a viewer account that can't write, and tests. Sign in with `npm run dev:mock` as `admin@example.com` / `password`. Remove it with `npm run features remove examples` once the project has its own features.
