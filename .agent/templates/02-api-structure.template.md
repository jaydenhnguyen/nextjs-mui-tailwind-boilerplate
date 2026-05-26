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

| Concern                         | Location                                                        |
|---------------------------------|-----------------------------------------------------------------|
| API client functions            | `src/apis/<domain>/`                                            |
| Endpoint constants              | `src/apis/<domain>/endpoints.ts`                                |
| Shared HTTP client              | `src/configs/request.ts`                                        |
| Token manager                   | `src/configs/tokenManager.ts`                                   |
| Query client config             | `src/configs/queryClient.ts`                                    |
| Feature hooks                   | `src/modules/<Feature>/hooks/`                                  |
| Feature request/response models | `src/modules/<Feature>/models/`                                 |
| Shared API types                | `src/shared/types/`                                             |
| Shared API helpers              | `src/shared/utils/`                                             |
| Shared React Query wrapper      | `src/shared/hooks/useAppQuery.ts` or `src/hooks/useAppQuery.ts` |

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
request.get(BOOK_ENDPOINTS.GET_BOOK_LIST);
```

Incorrect:

```ts
request.get('/books');
```

---

# 7. Shared Request Client

All API functions must use the shared request client.

Expected location:

```txt
src/configs/request.ts
```

The request client is responsible for:

- base URL
- auth token injection
- request interceptors
- response interceptors
- global error normalization
- handling `401 Unauthorized`
- clearing session when needed
- redirecting to login when needed

API functions must not create their own Axios/fetch instance.

Correct:

```ts
import {request} from 'src/configs/request';
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
export const getCurrentUser = async (): Promise<GetCurrentUserResponse> => {
  return await request.get(AUTH_ENDPOINTS.ME);
};
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
- use the shared request client
- stay thin
- contain no UI logic
- contain no toast logic
- contain no navigation logic
- contain no React Query logic
- contain no component state logic

Example:

```ts
import {request} from 'src/configs/request';
import {buildListingRequestPayload} from 'src/shared/utils';
import {
  GetBookListRequest,
  GetBookListResponse,
  CreateBookRequest,
  CreateBookResponse,
} from 'src/modules/Books/models';
import {BOOK_ENDPOINTS} from './endpoints';

export const getBookList = async (
  payload: GetBookListRequest,
): Promise<GetBookListResponse> => {
  const query = buildListingRequestPayload(payload);
  const url = `${BOOK_ENDPOINTS.GET_BOOK_LIST}?${query}`;

  return await request.get(url);
};

export const getBookDetail = async (
  id: string,
): Promise<GetBookDetailResponse> => {
  const url = `${BOOK_ENDPOINTS.GET_BOOK_DETAIL}/${id.trim()}`;

  return await request.get(url);
};

export const createBook = async (
  payload: CreateBookRequest,
): Promise<CreateBookResponse> => {
  return await request.post(BOOK_ENDPOINTS.CREATE_BOOK, payload);
};
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

- query string builder
- pagination mapper
- error normalizer
- object cleaner
- search param serializer

Example:

```ts
export function buildListingRequestPayload(payload: ListingRequest): string {
  const params = new URLSearchParams();

  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });

  return params.toString();
}
```

List endpoints must use the shared helper when available.

---

# 14. useAppQuery Rule

This boilerplate uses a shared `useAppQuery` wrapper.

All feature query hooks must use `useAppQuery`.

Do not call TanStack `useQuery` directly inside feature hooks unless explicitly requested.

Correct:

```ts
import {useAppQuery} from 'src/shared/hooks/useAppQuery';
```

or, if the project places shared hooks globally:

```ts
import {useAppQuery} from 'src/hooks/useAppQuery';
```

Follow the existing repo location first.

Incorrect:

```ts
import {useQuery} from '@tanstack/react-query';
```

---

# 15. useAppQuery Expected API

The wrapper should use a single object parameter.

Expected usage:

```ts
useAppQuery<TData>({
  queryKey,
  queryFn,
  options,
});
```

Example implementation style:

```ts
import {
  QueryKey,
  UseQueryOptions,
  useQuery,
} from '@tanstack/react-query';

type UseAppQueryParams<TData> = {
  queryKey: QueryKey;
  queryFn: () => Promise<TData>;
  options?: Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'>;
};

export function useAppQuery<TData>({
                                     queryKey,
                                     queryFn,
                                     options,
                                   }: UseAppQueryParams<TData>) {
  const query = useQuery<TData>({
    queryKey,
    queryFn,
    ...options,
  });

  return {
    data: query.data,
    status: query.status,
    error: query.error,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
  };
}
```

The exact implementation may follow the existing boilerplate, but the feature hook usage must stay consistent.

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
import {getBookList} from 'src/apis/books';
import {useAppQuery} from 'src/shared/hooks/useAppQuery';
import {GetBookListRequest} from '../models';

export function useGetBookList({
                                 payload,
                               }: {
  payload: GetBookListRequest;
}) {
  return useAppQuery({
    queryKey: ['getBookList', payload],
    queryFn: () => getBookList(payload),
  });
}
```

Detail example:

```ts
import {getBookDetail} from 'src/apis/books';
import {useAppQuery} from 'src/shared/hooks/useAppQuery';

export function useGetBookDetail({id}: { id: string }) {
  return useAppQuery({
    queryKey: ['getBookDetail', id],
    queryFn: () => getBookDetail(id),
    options: {
      enabled: Boolean(id),
    },
  });
}
```

On-demand query example:

```ts
export function useGetBookDetailOnDemand({id}: { id: string }) {
  return useAppQuery({
    queryKey: ['getBookDetail', id],
    queryFn: () => getBookDetail(id),
    options: {
      enabled: false,
    },
  });
}
```

---

# 20. Query Hook Return Shape

Query hooks should return the normalized shape from `useAppQuery`.

Expected return shape:

```ts
{
  data,
    status,
    error,
    isLoading,
    isFetching,
    isError,
    isSuccess,
    refetch,
}
```

Do not create inconsistent return shapes per hook.

If data unwrapping is needed, do it consistently.

Example:

```ts
return {
  ...query,
  data: query.data?.data,
};
```

Only unwrap response data if the project convention does this consistently.

---

# 21. Mutation Hook Rule

Mutation hooks should use TanStack `useMutation` directly.

Mutation hooks must live inside:

```txt
src/modules/<Feature>/hooks/
```

Example:

```ts
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {createBook} from 'src/apis/books';
import {CreateBookRequest} from '../models';

export function useCreateBook(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  const {mutate, status, error, isPending} = useMutation({
    mutationFn: (payload: CreateBookRequest) => createBook(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['getBookList'],
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

# 22. Mutation Side Effect Rules

Mutation hooks may:

- show success toast
- show error toast
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

| Layer          | Responsibility                         |
|----------------|----------------------------------------|
| Request client | normalize errors, handle global `401`  |
| API client     | pass through errors                    |
| Query hook     | expose error state                     |
| Mutation hook  | show user-facing error toast if needed |
| Component      | render error UI if needed              |

Shared error type example:

```ts
export type ErrorResponse = {
  message: string;
  error?: string;
  statusCode?: number;
};
```

Mutation error example:

```ts
onError: (error: ErrorResponse) => {
  notify({
    message: error.message || 'Something went wrong',
    type: ToastType.error,
  });
};
```

Do not catch and swallow errors inside API functions.

---

# 25. Loading State Rules

Hooks expose loading state.

Components decide how to render loading UI.

Use:

- `isLoading` for first load
- `isFetching` for background refetch
- `isLoading` from mutation hooks during submit/create/update/delete

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

import {request} from 'src/configs/request';
import {buildListingRequestPayload} from 'src/shared/utils';
import {
  CreateBookRequest,
  CreateBookResponse,
  GetBookListRequest,
  GetBookListResponse,
} from 'src/modules/Books/models';
import {BOOK_ENDPOINTS} from './endpoints';

export const getBookList = async (
  payload: GetBookListRequest,
): Promise<GetBookListResponse> => {
  const query = buildListingRequestPayload(payload);
  const url = `${BOOK_ENDPOINTS.GET_BOOK_LIST}?${query}`;

  return await request.get(url);
};

export const createBook = async (
  payload: CreateBookRequest,
): Promise<CreateBookResponse> => {
  return await request.post(BOOK_ENDPOINTS.CREATE_BOOK, payload);
};
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

import {getBookList} from 'src/apis/books';
import {useAppQuery} from 'src/shared/hooks/useAppQuery';
import {GetBookListRequest} from '../models';

export function useGetBookList({
                                 payload,
                               }: {
  payload: GetBookListRequest;
}) {
  return useAppQuery({
    queryKey: ['getBookList', payload],
    queryFn: () => getBookList(payload),
  });
}
```

---

## 30.6 Mutation Hook

```ts
// src/modules/Books/hooks/useCreateBook.ts

import {useMutation, useQueryClient} from '@tanstack/react-query';
import {createBook} from 'src/apis/books';
import {CreateBookRequest} from '../models';

export function useCreateBook(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  const {mutate, status, error, isPending} = useMutation({
    mutationFn: (payload: CreateBookRequest) => createBook(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['getBookList'],
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

# 31. Strict Rules

Do NOT:

- call API clients directly inside components
- call request client directly inside components
- call request client directly inside hooks
- use `useQuery` directly in feature hooks
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
- use `useAppQuery` for all query hooks
- use `useMutation` for mutation hooks
- use `src/modules/<Feature>/models` for request/response types
- use endpoint constants
- use the shared request client
- keep API clients thin
- keep hooks predictable
- keep components free from raw API logic

The final API flow must be consistent, typed, and easy to extend.
