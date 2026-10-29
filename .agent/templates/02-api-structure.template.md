# 02 API Structure Template

This file defines the standard API architecture for this boilerplate.

All projects generated from this boilerplate must follow these conventions unless explicitly overridden.

The API architecture is based on:

```txt
UI Component / Page
    ↓ calls
Feature Hook
    ↓ uses
useAppQuery / useMutation
    ↓ calls
API Client Function (getXList, createX, ...)
    ↓ uses
Shared Request Client (request / apiClient)
    ↓
Backend API
```

---

# 1. Deterministic Rule

When multiple valid approaches exist, always follow the existing repo pattern first.

Do not introduce a new API pattern unless explicitly requested.

---

# 2. Folder Ownership

| Concern                                               | Location                                                        |
|-------------------------------------------------------|-----------------------------------------------------------------|
| API client functions                                  | `src/apis/<domain>/`                                            |
| Endpoint constants                                    | `src/apis/<domain>/endpoints.ts`                                |
| Shared HTTP client + `http` helpers                   | `src/configs/request.ts`                                        |
| API settings (auth strategy, refresh path, camelCase) | `src/configs/api.config.ts`                                     |
| Token manager                                         | `src/configs/tokenManager.ts`                                   |
| Cookies                                               | `src/configs/cookies.ts`                                        |
| Query client config (defaults, global toasts)         | `src/configs/queryClient.ts`                                    |
| `ApiError`, error messages, `applyApiErrorToForm`     | `src/shared/utils/apiError.ts`                                  |
| localStorage / sessionStorage                         | `src/shared/utils/webStorage.ts`, `src/hooks/useStoredState.ts` |
| Feature hooks                                         | `src/modules/<Feature>/hooks/`                                  |
| Feature request/response models                       | `src/modules/<Feature>/models/`                                 |
| Shared API types                                      | `src/shared/types/`                                             |
| Shared API helpers                                    | `src/shared/utils/`                                             |
| Shared React Query wrappers                           | `src/hooks/useAppQuery.ts`, `src/hooks/useAppMutation.ts`       |

---

# 3. API Flow Rules

All API calls must follow this flow:

```txt
Component
  ↓
Feature Hook
  ↓
useAppQuery / useMutation
  ↓
API Client
  ↓
request client
```

Components must never call:

- `request.get`
- `request.post`
- `axios`
- `fetch`
- API client functions directly

Correct:

```tsx
const {data, isLoading} = useGetBooks({payload});
```

Incorrect:

```tsx
const data = await request.get('/books');
```

Incorrect:

```tsx
const data = await getBooks(payload);
```

---

# 4. Top-Level API Structure

API clients are centralized inside `src/apis`.

Example:

```txt
src/apis/
├── auth/
│   ├── endpoints.ts
│   ├── auth.ts
│   └── index.ts
├── books/
│   ├── endpoints.ts
│   ├── books.ts
│   └── index.ts
└── index.ts
```

Do not place API client functions inside modules.

Correct:

```txt
src/apis/books/books.ts
```

Incorrect:

```txt
src/modules/Books/apis/books.ts
```

---

# 5. Domain API Folder Convention

Each API domain should follow this structure:

```txt
src/apis/<domain>/
├── endpoints.ts
├── <domain>.ts
└── index.ts
```

Example:

```txt
src/apis/books/
├── endpoints.ts
├── books.ts
└── index.ts
```

For small domains, keep all API functions in `<domain>.ts`.

For large domains, splitting by action is allowed:

```txt
src/apis/books/
├── endpoints.ts
├── getBooks.ts
├── getBookDetail.ts
├── createBook.ts
└── index.ts
```

However, follow the existing repo pattern first.

---

# 6. Endpoint Constants

Endpoint constants must live inside the API domain folder.

Example:

```ts
// src/apis/books/endpoints.ts

export const BOOK_ENDPOINTS = {
  GET_BOOK_LIST: '/books',
  GET_BOOK_DETAIL: '/books/detail',
  CREATE_BOOK: '/books',
  UPDATE_BOOK: '/books',
  DELETE_BOOK: '/books',
};
```

Rules:

- use `SCREAMING_SNAKE_CASE` for endpoint object names
- use descriptive keys
- values must be path strings only
- do not include base URL
- do not hardcode endpoint strings inside API functions
- do not hardcode endpoint strings inside hooks/components

Correct:

```ts
http.get<GetBookListResponse>(BOOK_ENDPOINTS.GET_BOOK_LIST);
```

Incorrect:

```ts
http.get<GetBookListResponse>('/books');
```

---

# 7. Shared Request Client

All API functions must use the shared request client.

Expected location:

```txt
src/configs/request.ts
```

The request client already handles:

- base URL and timeout (`apiConfig` in `src/configs/api.config.ts`)
- auth: `Authorization: Bearer` header (`authStrategy: 'bearer'`) or httpOnly cookies via `withCredentials` (`authStrategy: 'cookie'`)
- deep camelCase of response bodies (`camelCaseResponse`)
- turning **every** failure into an `ApiError` (see §24)
- `401`: refreshes the session once (parallel requests share one refresh call), retries the request once, and if that fails calls the handler registered with `onSessionExpired()`
- `skipAuthRefresh: true` on a request config turns that off (use it for the login call)

API functions call the typed `http` helpers. They return the response body directly and always throw `ApiError`:

```ts
import { http } from 'src/configs/request';

http.get<Book[]>(BOOK_ENDPOINTS.LIST, { params, signal });
http.post<Book, CreateBookRequest>(BOOK_ENDPOINTS.CREATE, payload);
http.put / http.patch / http.delete
```

Use `params` for query strings (arrays become `tags[]=a&tags[]=b`) instead of building URLs by hand, and pass React Query's `signal` so leaving a page cancels its requests.

Uploads: pass a `FormData` body; the content type is set automatically. Downloads: `responseType: 'blob'` (blobs are not camelCased).

API functions must not create their own Axios/fetch instance.

Correct:

```ts
import { http } from 'src/configs/request';
```

Incorrect:

```ts
import axios from 'axios';

const client = axios.create();
```

---

# 8. Auth Token Rule

Authenticated APIs must rely on the shared request client.

Token injection must happen in request interceptors only.

Do not manually attach tokens inside every API function.

Correct:

```ts
export const getCurrentUser = (signal?: AbortSignal) =>
  http.get<GetCurrentUserResponse>(AUTH_ENDPOINTS.ME, { signal });
```

Incorrect:

```ts
export const getCurrentUser = async () => {
  const token = localStorage.getItem('token');

  return await request.get('/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
```

## 8.1 Browser Storage

Never call `localStorage` / `sessionStorage` / `document.cookie` directly. They're missing during server render and can throw (private mode, blocked site data, full quota).

| Need | Use |
|------|-----|
| Auth tokens (`bearer` strategy) | `tokenManager` |
| Other cookies | `cookieStorage` from `src/configs/cookies.ts` (sameSite=lax, secure on https, host-only) |
| Read/write a value outside React | `localStore` / `sessionStore` from `src/shared/utils/webStorage.ts` |
| State that should survive reloads (UI prefs, drafts, last filter) | `useStoredState(key, initialValue, { storage })` from `src/hooks` |

Keys are prefixed with `NEXT_PUBLIC_APP_KEY` automatically. `useStoredState` syncs across components and tabs and renders `initialValue` first, so there's no hydration mismatch.

Do not store secrets or personal data in web storage: any script on the page can read it.

---

# 9. API Function Naming

Use verb-based names.

| Action | Pattern              | Example                       |
|--------|----------------------|-------------------------------|
| List   | `getXList` / `getXs` | `getBookList`, `getBooks`     |
| Detail | `getXDetail`         | `getBookDetail`               |
| Create | `createX`            | `createBook`                  |
| Update | `updateX`            | `updateBook`                  |
| Delete | `deleteX`            | `deleteBook`                  |
| Auth   | action verb          | `login`, `logout`, `register` |

Follow the existing repo naming style first.

---

# 10. API Function Rules

Every API function must:

- use explicit request type
- use explicit response type
- use endpoint constants
- use the `http` helpers
- accept an optional `signal` for GET requests
- stay thin
- contain no UI logic
- contain no toast logic
- contain no navigation logic
- contain no React Query logic
- contain no component state logic

Example:

```ts
import { http } from 'src/configs/request';
import {
  GetBookListRequest,
  GetBookListResponse,
  GetBookDetailResponse,
  CreateBookRequest,
  CreateBookResponse,
} from 'src/modules/Books/models';
import { BOOK_ENDPOINTS } from './endpoints';

export const getBookList = (params: GetBookListRequest, signal?: AbortSignal) =>
  http.get<GetBookListResponse>(BOOK_ENDPOINTS.GET_BOOK_LIST, { params, signal });

export const getBookDetail = (id: string, signal?: AbortSignal) =>
  http.get<GetBookDetailResponse>(`${BOOK_ENDPOINTS.GET_BOOK_DETAIL}/${encodeURIComponent(id)}`, { signal });

export const createBook = (payload: CreateBookRequest) =>
  http.post<CreateBookResponse, CreateBookRequest>(BOOK_ENDPOINTS.CREATE_BOOK, payload);
```

---

# 11. Models and Types

Feature-specific API models must live inside:

```txt
src/modules/<Feature>/models/
```

Example:

```txt
src/modules/Books/models/
├── book.model.ts
├── get-book-list.request.ts
├── get-book-list.response.ts
├── create-book.request.ts
├── create-book.response.ts
└── index.ts
```

Shared API types should live inside:

```txt
src/shared/types/
```

Examples:

- pagination types
- sorting types
- searching types
- common API response wrappers
- error response types

Example:

```ts
export type PaginateRequest = {
  page: number;
  pageSize: number;
};

export type SortingRequest = {
  sortBy?: string;
  sortType?: 'asc' | 'desc';
};

export type SearchingRequest = {
  searchBy?: string;
  searchValue?: string;
};
```

Feature list request example:

```ts
import {
  PaginateRequest,
  SortingRequest,
  SearchingRequest,
} from 'src/shared/types';

export type GetBookListRequest = PaginateRequest &
  SortingRequest &
  SearchingRequest & {
  categoryId?: string;
};
```

---

# 12. Model Import Rules

API clients may import request/response models from feature modules.

Allowed:

```ts
import {GetBookListRequest} from 'src/modules/Books/models';
```

Models must never import:

- API clients
- hooks
- components
- pages

Do not create circular dependencies.

---

# 13. Shared API Helpers

Reusable API helpers should live in:

```txt
src/shared/utils/
```

Examples:

- pagination mapper
- object cleaner
- mappers between server and form shapes

Already provided:

- `ApiError`, `toApiError`, `isApiError`, `applyApiErrorToForm`, `API_ERROR_MESSAGES` (`apiError.ts`)
- `localStore`, `sessionStore` (`webStorage.ts`)

Query strings don't need a helper: pass an object as `params` to the `http` helpers (empty values are skipped).

---

# 14. useAppQuery Rule

This boilerplate uses a shared `useAppQuery` wrapper.

All feature query hooks must use `useAppQuery`.

Do not call TanStack `useQuery` directly inside feature hooks unless explicitly requested.

Correct:

```ts
import { useAppQuery } from 'src/hooks';
```

Incorrect:

```ts
import { useQuery } from '@tanstack/react-query';
```

---

# 15. useAppQuery / useAppMutation API

Both take **exactly the same options object as TanStack's `useQuery` / `useMutation`** and return the same result, so the [TanStack Query docs](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery) apply as-is. They exist so app-wide behaviour lives in one place.

```ts
useAppQuery({ queryKey, queryFn, enabled, select, staleTime, meta, ... });
useAppMutation({ mutationFn, onSuccess, onError, meta, ... });
```

App-wide defaults (`src/configs/queryClient.ts`):

| Setting | Value | Why |
|---------|-------|-----|
| `staleTime` | 1 minute | data is reused across pages without refetching instantly |
| `gcTime` | 5 minutes | unused data is kept for quick back-navigation |
| `retry` (queries) | up to 2 times, only for network / timeout / 5xx | a 4xx will fail the same way again |
| `retry` (mutations) | off | never repeat a write automatically |
| `refetchOnWindowFocus` | off | |
| `error` type | `ApiError` | registered globally in `src/types/react-query.d.ts` |

`meta` options:

| Option | Where | Effect |
|--------|-------|--------|
| `meta: { silent: true }` | query or mutation | no automatic error toast |
| `meta: { successMessage: 'Saved' }` | mutation | success toast |

Automatic toasts:

- **Mutations**: error toast with `error.message`, except 401 (session flow handles it) and canceled requests.
- **Queries**: error toast only when a **background refetch** fails while old data is on screen. A failed first load is shown by the page itself.

---

# 16. Query Hook Location

Feature query hooks must live inside:

```txt
src/modules/<Feature>/hooks/
```

Correct:

```txt
src/modules/Books/hooks/useGetBookList.ts
```

Incorrect:

```txt
src/hooks/useGetBookList.ts
```

Global `src/hooks` or `src/shared/hooks` is only for reusable generic hooks.

---

# 17. Query Hook Naming

Use this naming pattern:

| Query Type   | Pattern                    | Example                         |
|--------------|----------------------------|---------------------------------|
| List         | `useGetXList` / `useGetXs` | `useGetBookList`, `useGetBooks` |
| Detail       | `useGetXDetail`            | `useGetBookDetail`              |
| Current user | `useGetCurrentX`           | `useGetCurrentUser`             |
| Search       | `useSearchX`               | `useSearchBooks`                |

Follow the existing repo naming style first.

---

# 18. Query Key Rules

Query keys must be stable and descriptive.

Recommended patterns:

```ts
['getBookList', payload]
  ['getBookDetail', id]
  ['getCurrentUser']
  ['searchBooks', payload]
```

Rules:

- use array query keys
- first item should describe the API action
- include payload for list/search queries
- include id for detail queries
- keep names consistent with hook/API names

List example:

```ts
queryKey: ['getBookList', payload]
```

Detail example:

```ts
queryKey: ['getBookDetail', id]
```

Current user example:

```ts
queryKey: ['getCurrentUser']
```

---

# 19. Query Hook Pattern

Query hooks should be thin wrappers around `useAppQuery`.

Example:

```ts
import { getBookList } from 'src/apis/books';
import { useAppQuery } from 'src/hooks';
import { GetBookListRequest } from '../models';

export function useGetBookList({ payload }: { payload: GetBookListRequest }) {
  return useAppQuery({
    queryKey: ['getBookList', payload],
    queryFn: ({ signal }) => getBookList(payload, signal),
  });
}
```

Detail example:

```ts
import { getBookDetail } from 'src/apis/books';
import { useAppQuery } from 'src/hooks';

export function useGetBookDetail({ id }: { id: string }) {
  return useAppQuery({
    queryKey: ['getBookDetail', id],
    queryFn: ({ signal }) => getBookDetail(id, signal),
    enabled: Boolean(id),
  });
}
```

On-demand query example:

```ts
export function useGetBookDetailOnDemand({ id }: { id: string }) {
  return useAppQuery({
    queryKey: ['getBookDetail', id],
    queryFn: ({ signal }) => getBookDetail(id, signal),
    enabled: false,
  });
}
```

Options go directly in the object (TanStack style). There is no nested `options` key.

---

# 20. Query Hook Return Shape

Query hooks return the `useAppQuery` result as-is (`data`, `error`, `isPending`, `isFetching`, `isError`, `refetch`, …). Do not destructure and rebuild it.

If the backend wraps payloads (e.g. `{ data: [...] }`), unwrap with `select`, consistently across the project:

```ts
return useAppQuery({
  queryKey: ['getBookList', payload],
  queryFn: ({ signal }) => getBookList(payload, signal),
  select: (response) => response.data,
});
```

---

# 21. Mutation Hook Rule

Mutation hooks use `useAppMutation`.

Mutation hooks must live inside:

```txt
src/modules/<Feature>/hooks/
```

Example:

```ts
import { useQueryClient } from '@tanstack/react-query';
import { createBook } from 'src/apis/books';
import { useAppMutation } from 'src/hooks';
import { CreateBookRequest } from '../models';

export function useCreateBook(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: (payload: CreateBookRequest) => createBook(payload),
    meta: { successMessage: 'Book created' },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['getBookList'] });
      onSuccess?.();
    },
  });
}
```

Use `isPending` from the result for the submit button's loading state.

---

# 22. Mutation Side Effect Rules

Mutation hooks may:

- show a success toast with `meta: { successMessage }` (error toasts are automatic)
- invalidate query cache
- redirect after success
- call success/error callbacks

API clients must not:

- show toast
- redirect
- invalidate cache
- manipulate UI state

Components may:

- call mutation hooks
- pass callbacks
- render loading/error state

Components must not:

- call API clients directly
- manually handle raw HTTP logic

---

# 23. Cache Invalidation Rules

Mutation hooks should invalidate related query keys after successful writes.

Examples:

After creating a book:

```ts
queryClient.invalidateQueries({
  queryKey: ['getBookList'],
});
```

After updating a book:

```ts
queryClient.invalidateQueries({
  queryKey: ['getBookList'],
});

queryClient.invalidateQueries({
  queryKey: ['getBookDetail', id],
});
```

After deleting a book:

```ts
queryClient.invalidateQueries({
  queryKey: ['getBookList'],
});
```

Rules:

- invalidate list queries after create/update/delete
- invalidate detail query after update
- avoid invalidating unrelated queries
- use query keys that match hook query keys
- do not refetch manually if invalidation is enough

---

# 24. Error Handling

Layer responsibility:

| Layer          | Responsibility                                                    |
|----------------|-------------------------------------------------------------------|
| Request client | turn every failure into `ApiError`, refresh on `401`              |
| API client     | pass errors through                                               |
| Query client   | retry temporary failures, show automatic toasts                   |
| Query hook     | expose `error` / `isError`                                        |
| Mutation hook  | add `meta` (`silent`, `successMessage`) or extra `onError` if needed |
| Component      | render error UI for failed first loads; map form errors           |
| Error boundary | `ErrorFallback` with "Try again" for render crashes               |

Every error from the API layer is an `ApiError` (`src/shared/utils/apiError.ts`):

| Field | Meaning |
|-------|---------|
| `kind` | `'http' \| 'network' \| 'timeout' \| 'canceled' \| 'unknown'` |
| `status` | HTTP status for `kind: 'http'` |
| `message` | user-facing text: the server's message for 4xx, a friendly fallback for 5xx/network/timeout |
| `code` | machine-readable code from the server, if any |
| `fieldErrors` | `{ [fieldPath]: message }` from validation responses (camelCased) |
| `data` | the raw response body |
| `isServerError`, `hasFieldErrors` | shortcuts |

The server body is read by one function, `parseErrorBody` in `apiError.ts`. It understands `{ message }`, `{ message: string[] }`, `{ error }`, `{ code }`, `{ errors | fieldErrors: { field: msg | msg[] } }` and `{ errors: [{ field, message }] }`. If your backend differs, change that function only. Fallback messages live in `API_ERROR_MESSAGES` next to it.

Status handling:

| Status | What happens |
|--------|--------------|
| 401 | refresh once → retry; if that fails, `onSessionExpired` handler (clears tokens; the auth flow redirects to login). No toast. |
| 403 / 404 / 409 / 429 | `ApiError` with the server message or a friendly fallback; mutation toast |
| 422 / 400 with field errors | `error.fieldErrors`; map onto the form with `applyApiErrorToForm(form.setError, error)` |
| 5xx | retried twice for queries; friendly message (server text is hidden) |
| network / timeout | retried twice for queries; friendly message |
| canceled | ignored, no toast |

Form example:

```ts
const { mutate } = useCreateBook();

const onSubmit = (values: CreateBookRequest) =>
  mutate(values, {
    onError: (error) => applyApiErrorToForm(form.setError, error),
  });
```

Field errors show under their fields; anything else lands in `root.server` (render it with `<ControlErrorMessage name="root.server" />`).

Do not catch and swallow errors inside API functions. Do not define per-feature error types for HTTP errors; use `ApiError`.

---

# 25. Loading State Rules

Hooks expose loading state.

Components decide how to render loading UI.

Use:

- `isPending` for first load (no data yet)
- `isFetching` for background refetch
- `isPending` from mutation hooks during submit/create/update/delete

Components should not create their own duplicate loading state for API calls unless there is a clear UI reason.

---

# 26. Form Hook Relationship

Form hooks may call mutation hooks.

Form hooks must not call API clients directly.

Correct:

```ts
export function useCreateBookForm() {
  const createBookMutation = useCreateBook();

  const onSubmit = (values: CreateBookFormValues) => {
    createBookMutation.mutate(values);
  };

  return {
    onSubmit,
    isLoading: createBookMutation.isLoading,
  };
}
```

Incorrect:

```ts
export function useCreateBookForm() {
  const onSubmit = async (values: CreateBookFormValues) => {
    await createBook(values);
  };
}
```

---

# 27. Page and Component Rules

Pages must follow `01-project-structure.template.md` §3.9 (thin pages, `getLayout`).

Pages must not call:

- API clients
- request client
- mutation functions directly
- TanStack Query directly

Components should normally call feature hooks.

Example:

```tsx
import {useGetBookList} from './hooks';

export function Books() {
  const {data, isLoading} = useGetBookList({
    payload: {
      page: 1,
      pageSize: 10,
    },
  });

  return <div>{/* render */}</div>;
}
```

---

# 28. Barrels

Each API domain should have an `index.ts`.

Example:

```ts
// src/apis/books/index.ts

export * from './books';
export * from './endpoints';
```

Each module hook folder should have an `index.ts`.

Example:

```ts
// src/modules/Books/hooks/index.ts

export * from './useGetBookList';
export * from './useCreateBook';
```

Avoid giant wildcard barrels unless the repo already uses them safely.

---

# 29. Add New API + Hook Checklist

When adding a new API flow:

1. Create request/response models in:

```txt
src/modules/<Feature>/models/
```

2. Export models from:

```txt
src/modules/<Feature>/models/index.ts
```

3. Add endpoint constants in:

```txt
src/apis/<domain>/endpoints.ts
```

4. Add API function in:

```txt
src/apis/<domain>/<domain>.ts
```

5. Export API function from:

```txt
src/apis/<domain>/index.ts
```

6. Create query/mutation hook in:

```txt
src/modules/<Feature>/hooks/
```

7. Query hooks must use:

```txt
useAppQuery
```

8. Mutation hooks must use:

```txt
useMutation
```

9. Export hooks from:

```txt
src/modules/<Feature>/hooks/index.ts
```

10. Use the hook inside the module/component.

---

# 30. Full Example: Books API

## 30.1 Models

```txt
src/modules/Books/models/
├── book.model.ts
├── get-book-list.request.ts
├── get-book-list.response.ts
├── create-book.request.ts
├── create-book.response.ts
└── index.ts
```

```ts
// book.model.ts

export type Book = {
  id: string;
  title: string;
  author: string;
  price: number;
};
```

```ts
// get-book-list.request.ts

import {
  PaginateRequest,
  SortingRequest,
  SearchingRequest,
} from 'src/shared/types';

export type GetBookListRequest = PaginateRequest &
  SortingRequest &
  SearchingRequest & {
  categoryId?: string;
};
```

```ts
// get-book-list.response.ts

import {Book} from './book.model';

export type GetBookListResponse = {
  data: Book[];
  total: number;
};
```

```ts
// create-book.request.ts

export type CreateBookRequest = {
  title: string;
  author: string;
  price: number;
};
```

```ts
// create-book.response.ts

import {Book} from './book.model';

export type CreateBookResponse = {
  data: Book;
};
```

```ts
// index.ts

export * from './book.model';
export * from './get-book-list.request';
export * from './get-book-list.response';
export * from './create-book.request';
export * from './create-book.response';
```

---

## 30.2 Endpoints

```ts
// src/apis/books/endpoints.ts

export const BOOK_ENDPOINTS = {
  GET_BOOK_LIST: '/books',
  GET_BOOK_DETAIL: '/books/detail',
  CREATE_BOOK: '/books',
};
```

---

## 30.3 API Client

```ts
// src/apis/books/books.ts

import { http } from 'src/configs/request';
import {
  CreateBookRequest,
  CreateBookResponse,
  GetBookListRequest,
  GetBookListResponse,
} from 'src/modules/Books/models';
import { BOOK_ENDPOINTS } from './endpoints';

export const getBookList = (params: GetBookListRequest, signal?: AbortSignal) =>
  http.get<GetBookListResponse>(BOOK_ENDPOINTS.GET_BOOK_LIST, { params, signal });

export const createBook = (payload: CreateBookRequest) =>
  http.post<CreateBookResponse, CreateBookRequest>(BOOK_ENDPOINTS.CREATE_BOOK, payload);
```

---

## 30.4 API Barrel

```ts
// src/apis/books/index.ts

export * from './books';
export * from './endpoints';
```

---

## 30.5 Query Hook

```ts
// src/modules/Books/hooks/useGetBookList.ts

import { getBookList } from 'src/apis/books';
import { useAppQuery } from 'src/hooks';
import { GetBookListRequest } from '../models';

export function useGetBookList({ payload }: { payload: GetBookListRequest }) {
  return useAppQuery({
    queryKey: ['getBookList', payload],
    queryFn: ({ signal }) => getBookList(payload, signal),
  });
}
```

---

## 30.6 Mutation Hook

```ts
// src/modules/Books/hooks/useCreateBook.ts

import { useQueryClient } from '@tanstack/react-query';
import { createBook } from 'src/apis/books';
import { useAppMutation } from 'src/hooks';
import { CreateBookRequest } from '../models';

export function useCreateBook(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: (payload: CreateBookRequest) => createBook(payload),
    meta: { successMessage: 'Book created' },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['getBookList'] });
      onSuccess?.();
    },
  });
}
```

---

# 31. Strict Rules

Do NOT:

- call API clients directly inside components
- call request client directly inside components
- call request client directly inside hooks
- use `useQuery` / `useMutation` directly in feature hooks (use `useAppQuery` / `useAppMutation`)
- use `axios`, `fetch` or `request` in API functions (use `http`)
- touch `localStorage`, `sessionStorage` or `document.cookie` directly (see §8.1)
- show error toasts manually for API errors (they're automatic)
- invent per-feature HTTP error types (use `ApiError`)
- create feature hooks inside `src/hooks`
- create endpoint strings inside components
- create endpoint strings inside hooks
- create new Axios/fetch clients
- put UI logic inside API clients
- put React Query logic inside API clients
- swallow errors inside API clients
- put feature-specific models in `src/types`
- create circular imports
- use `@/` imports

---

# 32. AI Agent Notes

When creating or updating API logic:

- use `src/apis/<domain>` for API client functions
- use `src/modules/<Feature>/hooks` for feature hooks
- use `useAppQuery` for all query hooks, passing `signal` to the API function
- use `useAppMutation` for mutation hooks
- use `http` helpers from `src/configs/request`
- map form errors with `applyApiErrorToForm`
- use `src/modules/<Feature>/models` for request/response types
- use endpoint constants
- use the shared request client
- keep API clients thin
- keep hooks predictable
- keep components free from raw API logic

The final API flow must be consistent, typed, and easy to extend.
