# CRUD Flow Example

The repo ships a complete, working CRUD feature: **Users** (`/users`). Copy its shape for any new resource. Run it with `npm run dev:mock` and sign in as `admin@example.com` / `password`.

It covers: list with search and pagination kept in the URL, loading/empty/error states, create in a dialog with validation and server field errors, delete with confirm, permission-based UI, cache invalidation, and success/error toasts.

---

## Files

```txt
src/apis/users/
├── endpoints.ts                 USER_ENDPOINTS
├── users.ts                     getUserList, createUser, deleteUser
└── index.ts

src/modules/Users/
├── Users.tsx                    screen: header, search, QueryState, table, pagination, dialog
├── Users.module.scss
├── index.ts
├── models/user.model.ts         GetUserListRequest/Response, CreateUserFormValues, CreateUserRequest
├── schema/create-user.schema.ts
├── constants/users.constant.ts  query key, page size, role labels/options
├── hooks/
│   ├── useGetUserList.ts        useAppQuery + keepPreviousData
│   ├── useCreateUser.ts         useAppMutation + invalidate
│   ├── useDeleteUser.ts         useAppMutation + invalidate
│   └── useCreateUserForm.ts     useZodForm + defaults
└── components/
    ├── UserTable/               responsive table, permission-gated actions
    ├── CreateUserDialog/        form in a dialog, submit button in the footer
    └── DeleteUserButton/        useConfirm → mutate

src/pages/users/index.tsx        Seo + PrivateLayout
src/mocks/handlers/users.handlers.ts
```

Shared types used: `PaginationRequest`, `PaginatedResponse<T>`, `User` from `src/shared/types`.

---

## Building a new resource, step by step

Say the resource is **Products**.

1. **Types** – `src/modules/Products/models/product.model.ts`: `Product`, `GetProductListRequest = PaginationRequest & { search?: string }`, `GetProductListResponse = PaginatedResponse<Product>`, request types for create/update.
2. **Schema** – `schema/create-product.schema.ts` with zod. Only write messages that need to be more specific than the defaults in `setupZod`.
3. **API** – `src/apis/products/` with `endpoints.ts` and `products.ts` using `http.get/post/put/delete`. GETs take `signal`.
4. **Query keys** – `constants/products.constant.ts`: `PRODUCT_QUERY_KEYS = { GET_PRODUCT_LIST: 'getProductList', GET_PRODUCT_DETAIL: 'getProductDetail' }`.
5. **Hooks** – copy the four Users hooks. List queries use `placeholderData: keepPreviousData` so pagination never flashes a spinner. Mutations invalidate `[PRODUCT_QUERY_KEYS.GET_PRODUCT_LIST]` and set `meta: { successMessage }`.
6. **Screen** – copy `Users.tsx`: `useQueryParams` for search/page, `useDebounce` for the search box, `QueryState` for states, `useOpenState` for the dialog, `<Can>` around write actions.
7. **Page** – `src/pages/products/index.tsx` with `<Seo noIndex />` and `PrivateLayout`; add the route to `APP_ROUTES`, `NO_INDEX_ROUTES` and `navigationConfig.private`.
8. **Permissions** – add `PRODUCTS_READ` / `PRODUCTS_WRITE` to `PERMISSIONS` and `ROLE_PERMISSIONS`.
9. **Mock** – `src/mocks/handlers/products.handlers.ts` + seed data in `db.ts`, so `dev:mock` keeps working.

---

## Key patterns from the Users code

List hook:

```ts
export function useGetUserList(params: GetUserListRequest, { enabled = true }: { enabled?: boolean } = {}) {
  return useAppQuery({
    queryKey: [USER_QUERY_KEYS.GET_USER_LIST, params],
    queryFn: ({ signal }) => getUserList(params, signal),
    placeholderData: keepPreviousData,
    enabled,
  });
}
```

Search + page in the URL (the search box only writes to the URL after typing stops):

```tsx
const { params, setParams, isReady } = useQueryParams<'search' | 'page'>();
const [searchInput, setSearchInput] = React.useState<string | null>(null);
const debouncedSearch = useDebounce(searchInput);

React.useEffect(() => {
  if (debouncedSearch !== null) void setParams({ search: debouncedSearch, page: undefined });
}, [debouncedSearch, setParams]);

const page = Math.max(1, Number(params.page) || 1);
const usersQuery = useGetUserList({ page, pageSize: USER_LIST_PAGE_SIZE, search: params.search }, { enabled: isReady });
```

Create in a dialog, mapping the form shape to the API shape and server errors back onto the form:

```tsx
const handleSubmit = ({ role, ...values }: z.output<typeof createUserSchema>) =>
  createUser(
    { ...values, roles: [role] },
    {
      onSuccess: onClose,
      onError: (error) => applyApiErrorToForm(setError, error),
    },
  );
```

The dialog resets the form after its close animation (`slotProps.transition.onExited`), so the fields don't visibly clear while it fades out.

Delete with confirm:

```tsx
const confirmed = await confirm({
  title: `Delete ${fullName}?`,
  description: "They'll lose access right away. This can't be undone.",
  confirmText: 'Delete',
  destructive: true,
});
if (confirmed) deleteUser(user.id);
```

---

## Rules

- One folder per resource in `src/apis` and one module in `src/modules`.
- Components never call API functions; they use the hooks.
- Lists: `QueryState` + `keepPreviousData`; filters and page in the URL.
- Writes: `useAppMutation`, invalidate the list, `meta.successMessage`; form errors with `applyApiErrorToForm`.
- Destructive actions: `useConfirm` with `destructive: true`.
- Write actions are wrapped in `<Can permission=...>`; the backend still enforces it.
- Every endpoint has a mock handler.
