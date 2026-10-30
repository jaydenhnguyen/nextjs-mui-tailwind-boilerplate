# 02 API Structure

How the app talks to the backend. Part of the `api` pack. If the project has no backend, `npm run features remove api` (with the packs that need it) and skip this file.

```txt
Component ──▶ feature hook (useAppQuery / useAppMutation) ──▶ API function (src/apis) ──▶ http (src/configs/request.ts) ──▶ backend
```

Components and pages never call API functions or axios. They call hooks.

`npm run gen crud <Name>` writes every layer below for a resource. Read its output before writing one by hand.

---

## 1. API functions: `src/apis/<domain>/`

```txt
src/apis/products/
├── endpoints.ts   export const PRODUCT_ENDPOINTS = { PRODUCTS: '/products' };
├── products.ts    the functions
└── index.ts       export * from './products'; export * from './endpoints';
```

```ts
import { http } from 'src/configs/request';
import {
  GetProductListRequest,
  GetProductListResponse,
  Product,
  UpdateProductRequest,
} from 'src/modules/Products/models';
import { PRODUCT_ENDPOINTS } from './endpoints';

const productUrl = (id: string) => `${PRODUCT_ENDPOINTS.PRODUCTS}/${encodeURIComponent(id)}`;

export const getProductList = (params: GetProductListRequest, signal?: AbortSignal) =>
  http.get<GetProductListResponse>(PRODUCT_ENDPOINTS.PRODUCTS, { params, signal });

export const updateProduct = (id: string, payload: UpdateProductRequest) =>
  http.put<Product, UpdateProductRequest>(productUrl(id), payload);

export const deleteProduct = (id: string) => http.delete(productUrl(id));
```

Rules:

- One function per endpoint, named verb + noun: `getProductList`, `getProduct`, `createProduct`, `updateProduct`, `deleteProduct`.
- Paths come from `<DOMAIN>_ENDPOINTS`, never inline strings. Encode ids with `encodeURIComponent`.
- Reads take `signal` and pass it on, so leaving a page cancels its requests.
- Query strings go in `params` (arrays become `ids[]=1&ids[]=2`). Don't build URLs by hand.
- API functions only call `http`. No toasts, redirects, cache work, `try/catch` or token handling.
- Request/response types live in the module's `models/` (`src/modules/Products/models`). Shared shapes: `PaginationRequest`, `PaginatedResponse<T>` from `src/shared/types`.

---

## 2. The request client: `src/configs/request.ts`

`http.get / post / put / patch / delete` return the response body (already typed) and always reject with `ApiError`. The client:

- uses `apiConfig.baseURL` (`NEXT_PUBLIC_API_URL`) and a 15s timeout
- deep camelCases response bodies (`apiConfig.camelCaseResponse`), except blobs
- turns every failure into an `ApiError` (§5)
- with the `auth` pack: adds the bearer token or sends cookies, and on a 401 refreshes once and retries (`src/configs/auth/interceptors.ts`, see `03-auth-flow.template.md`). `{ skipAuthRefresh: true }` turns that off for one request.

Uploads: pass `FormData` as the body. Downloads: `{ responseType: 'blob' }`. Never create another axios instance or use `fetch` for the backend.

---

## 3. Queries

Feature hooks live in `src/modules/<Feature>/hooks/` and use `useAppQuery` (same options and result as TanStack's `useQuery`).

```ts
// constants/products.constant.ts
export const PRODUCT_QUERY_KEYS = {
  GET_PRODUCT_LIST: 'getProductList',
  GET_PRODUCT: 'getProduct',
} as const;
```

```ts
export function useGetProductList(params: GetProductListRequest, { enabled = true }: { enabled?: boolean } = {}) {
  return useAppQuery({
    queryKey: [PRODUCT_QUERY_KEYS.GET_PRODUCT_LIST, params],
    queryFn: ({ signal }) => getProductList(params, signal),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useGetProduct(id: string | undefined) {
  return useAppQuery({
    queryKey: [PRODUCT_QUERY_KEYS.GET_PRODUCT, id],
    queryFn: ({ signal }) => getProduct(id!, signal),
    enabled: !!id,
  });
}
```

- Names: `useGetXList`, `useGetX`; keys `[KEYS.GET_X_LIST, params]`, `[KEYS.GET_X, id]`. The key holds everything the request depends on.
- Lists with pages or filters use `placeholderData: keepPreviousData`, so the old page stays on screen (dimmed) while the next loads.
- Return the query result as-is. Unwrap or reshape with `select`.
- Render it with `<QueryState query={...}>` (loading, error with retry, empty, data). `isPending` = first load, `isFetching` = any fetch, `isPlaceholderData` = showing the previous page.

---

## 4. Mutations

```ts
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProductRequest }) => updateProduct(id, payload),
    meta: { successMessage: 'Product saved', silent: true },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PRODUCT_QUERY_KEYS.GET_PRODUCT_LIST] }),
  });
}
```

- Names: `useCreateX`, `useUpdateX`, `useDeleteX`.
- Invalidate the list after any write, and the detail key after an update. Invalidating `[KEYS.GET_X_LIST]` hits every page and filter.
- `meta.successMessage` shows a success toast. `meta.silent` turns off the automatic error toast; use it when a form shows the error itself.
- Components get `mutate` and `isPending` (submit button `loading={isPending}`) and pass per-call `onSuccess` / `onError` (close a dialog, map form errors).

Defaults in `src/configs/queryClient.ts`:

| Setting                | Value                                                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `staleTime` / `gcTime` | 1 min / 5 min                                                                                                      |
| query `retry`          | twice, only for network, timeout and 5xx                                                                           |
| mutation `retry`       | never                                                                                                              |
| `refetchOnWindowFocus` | off                                                                                                                |
| error toast            | failed mutations, and failed background refetches of queries already on screen; never for 401 or canceled requests |
| `reportError`          | called for 5xx and unexpected errors                                                                               |

---

## 5. Errors: `ApiError`

Every failure from the API layer is an `ApiError` (`src/shared/utils/apiError.ts`), typed globally as React Query's error type.

| Field                             | Meaning                                                                                 |
| --------------------------------- | --------------------------------------------------------------------------------------- |
| `kind`                            | `'http' \| 'network' \| 'timeout' \| 'canceled' \| 'unknown'`                           |
| `status`                          | HTTP status (for `http`)                                                                |
| `message`                         | safe to show: the server's text for 4xx, a friendly fallback for 5xx and network errors |
| `code`, `data`                    | the server's error code and raw body                                                    |
| `fieldErrors`                     | `{ fieldPath: message }` from validation responses                                      |
| `isServerError`, `hasFieldErrors` | shortcuts                                                                               |

- The server's error body is read in one place, `parseErrorBody`. It understands `{ message }`, `{ error }`, `{ code }`, `{ errors | fieldErrors: {...} }` and `{ errors: [{ field, message }] }`. A different backend shape means changing that function only. Fallback texts are in `API_ERROR_MESSAGES`.
- Forms: `onError: (error) => applyApiErrorToForm(form.setError, error)` puts field errors under their fields and anything else in `root.server` (shown by `<ControlErrorMessage name="root.server" />`).
- Don't catch and swallow errors in API functions or hooks, and don't invent per-feature error types.

---

## 6. Browser storage

Never touch `localStorage`, `sessionStorage` or `document.cookie` directly: they don't exist during server render and can throw.

| Need                        | Use                                                |
| --------------------------- | -------------------------------------------------- |
| Auth tokens                 | `tokenManager` (`src/configs/auth`)                |
| Other cookies               | `cookieStorage` (`src/configs/cookies.ts`)         |
| A value outside React       | `localStore` / `sessionStore` (`src/shared/utils`) |
| State that survives reloads | `useStoredState(key, initial)` (`src/hooks`)       |

Keys are prefixed with `NEXT_PUBLIC_APP_KEY`. Never store secrets or personal data in web storage.

---

## 7. Checklist: a new endpoint

1. Types in the module's `models/`.
2. Path in `<DOMAIN>_ENDPOINTS`, function in `src/apis/<domain>/`.
3. Query key in the module's constants, hook in `hooks/` with `useAppQuery` or `useAppMutation`.
4. Mutations invalidate what they change and set `meta.successMessage`.
5. A mock handler in `src/mocks/handlers/` (mock-api pack), so `npm run dev:mock` and tests keep working.
6. The screen uses the hook and `QueryState`.
