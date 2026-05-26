# API Structure Template

Use this file as the **single source of truth** for how to handle API calling in a web application.
It is **project-agnostic** — adapt paths, names, and stack details to each repo.

**Typical stack assumed:** TypeScript + typed API clients + React hooks (often TanStack React Query) + shared HTTP
client (Axios or fetch wrapper).

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Coding Style Rules](#2-coding-style-rules)
3. [Folder Structure & File Separation](#3-folder-structure--file-separation)
4. [Shared API Infrastructure](#4-shared-api-infrastructure)
5. [API Client Layer Conventions](#5-api-client-layer-conventions)
6. [Models & Types Conventions](#6-models--types-conventions)
7. [Hooks Conventions](#7-hooks-conventions)
8. [Constants Conventions](#8-constants-conventions)
9. [Error Handling](#9-error-handling)
10. [Pages vs Modules vs Components](#10-pages-vs-modules-vs-components)
11. [Agent Checklist: Add New API + Hook](#11-agent-checklist-add-new-api--hook)
12. [Code Templates](#12-code-templates)
13. [Repo Documentation Format (for AI agents)](#13-repo-documentation-format-for-ai-agents)
14. [Adaptation Notes (fill per repo)](#14-adaptation-notes-fill-per-repo)

---

## 1. Architecture Overview

### 1.1 Data flow

```
UI Component / Page
    ↓ calls
Feature Hook (useQuery / useMutation)
    ↓ calls
API Client Function (getXList, createX, ...)
    ↓ uses
Shared HTTP Client (request / apiClient)
    ↓
Backend API
```

### 1.2 Layer responsibilities

| Layer          | Location                                          | Responsibility                                          |
|----------------|---------------------------------------------------|---------------------------------------------------------|
| HTTP transport | `<root>/configs/` or `<root>/api/client/`         | Axios/fetch instance, auth, interceptors, global errors |
| API clients    | `<root>/apis/<domain>/`                           | Typed HTTP calls per domain; no UI logic                |
| Models/types   | `<root>/modules/<Feature>/models/`                | Request/response/UI types                               |
| Hooks          | `<root>/modules/<Feature>/hooks/`                 | React Query wrappers; side effects (toasts, callbacks)  |
| UI             | `<root>/modules/<Feature>/`, `<root>/components/` | Render UI; orchestrate hooks only                       |
| Pages/routes   | `<root>/pages/` or `app/`                         | Thin wrappers; delegate to modules                      |

### 1.3 Core rules

- **Never call HTTP directly from components.** Always go through hooks → API clients → shared HTTP client.
- **Never duplicate HTTP logic in hooks.** Hooks wrap API functions; they do not build URLs or raw fetch calls.
- **Keep API client files thin.** Only HTTP + typed request/response mapping.
- **Use one shared HTTP client** for all API calls.

---

## 2. Coding Style Rules

### 2.1 Language & formatting

- Follow the repo's existing linter/formatter (ESLint, Prettier, etc.).
- Prefer `async/await` over promise chains.
- Avoid implicit `any`; keep types explicit at API boundaries (params and return types).
- Avoid formatting-only diffs in commits.

### 2.2 Naming conventions

#### API functions

| Action      | Pattern                       | Examples                        |
|-------------|-------------------------------|---------------------------------|
| List/read   | `getXList`, `fetchX`, `listX` | `getUserList`, `getEventDetail` |
| Create      | `createX`                     | `createEvent`, `registerUser`   |
| Update      | `updateX`                     | `updateProfile`                 |
| Delete      | `deleteX`                     | `deleteEvent`                   |
| Auth/action | verb-based                    | `login`, `logout`, `submitX`    |

#### React hooks

| Type           | Pattern                                  | Examples                                  |
|----------------|------------------------------------------|-------------------------------------------|
| Read (list)    | `useGetXList`, `useGetX`                 | `useGetEvents`, `useGetUserList`          |
| Read (detail)  | `useGetXDetail`                          | `useGetEventDetail`, `useGetClientDetail` |
| Read (current) | `useGetCurrentXInfo`                     | `useGetCurrentUserInfo`                   |
| Write          | `useCreateX`, `useUpdateX`, `useDeleteX` | `useCreateEvent`, `useRegisterUser`       |
| Auth           | `useLogin`, `useLogout`                  | —                                         |
| Form           | `useXForm`                               | `useLoginForm`, `useCreateEventForm`      |
| UI/table       | `useXTable`, `useBuildXTableColumns`     | `useEventTable`                           |

#### Constants

- Endpoint objects: `<DOMAIN>_ENDPOINTS` (SCREAMING_SNAKE_CASE)
- Keys inside endpoint objects: `camelCase` (e.g. `GET_USER_LIST`)
- Route constants: `APP_ROUTES`
- Domain status enums: `EVENT_STATUS`, `CLIENT_STATUS`

#### Files

- Endpoint paths: `endpoints.ts` (or `endpoint.ts`)
- API functions: `<domain>.ts`, `<action>.ts` (e.g. `users.ts`, `login.ts`, `getMe.ts`)
- Barrels: `index.ts` within each domain/module folder
- Request types: `*.request.ts` or `get-x-list.request.ts`
- Response types: `*.response.ts` or `get-x-list.response.ts`
- UI models: `*.model.ts`

### 2.3 Exports & barrels

- Use `index.ts` barrels to reduce deep imports, but keep them intentional.
- Barrels re-export only from sibling files/directories — not from unrelated paths.
- Global API barrel (optional): `<root>/apis/index.ts` re-exports all domains.

### 2.4 Import conventions

- API hooks import API functions from `<root>/apis` or `<root>/apis/<domain>`.
- API client functions import types from `<root>/modules/<Feature>/models`.
- API client functions import HTTP client from `<root>/configs` (or equivalent).
- Avoid circular imports: models should not import from API clients or hooks.

---

## 3. Folder Structure & File Separation

Use `<root>` as the source root placeholder (commonly `src/`).

### 3.1 Top-level layout

```
<root>/
├── apis/                  # HTTP client functions (domain-based)
│   ├── auth/
│   ├── users/
│   ├── <domain>/
│   └── index.ts           # optional global barrel
├── configs/               # HTTP client, env, token management
│   ├── request.ts
│   ├── environment.ts
│   └── tokensManager.ts
├── modules/               # feature modules
│   └── <Feature>/
│       ├── hooks/
│       ├── models/        # or model/
│       ├── constants/
│       ├── util/
│       ├── <Feature>.tsx
│       └── index.ts
├── shared/
│   ├── util/              # shared helpers (request, form, table, pagination)
│   ├── models/            # shared types (pagination, sorting, errors)
│   ├── constants/
│   └── context/           # app-level providers (QueryClient, auth context)
├── components/            # shared UI (popups, tables, form controls)
├── pages/                 # route pages (thin wrappers)
└── layouts/               # layout wrappers
```

### 3.2 API domain folder (`<root>/apis/<domain>/`)

```
<domain>/
├── endpoints.ts           # URL path constants
├── <domain>.ts            # main API functions
├── <action>.ts            # optional split (e.g. getMe.ts, login.ts)
└── index.ts               # barrel re-export
```

### 3.3 Feature module folder (`<root>/modules/<Feature>/`)

```
<Feature>/
├── hooks/
│   ├── useGetXList.ts
│   ├── useGetXDetail.ts
│   ├── useCreateX.ts
│   ├── useXForm.ts
│   └── index.ts
├── models/                # or model/
│   ├── get-x-list.request.ts
│   ├── get-x-list.response.ts
│   ├── create-x.request.ts
│   ├── create-x.response.ts
│   ├── x-table.model.ts
│   └── index.ts
├── constants/             # optional
├── util/                  # optional mappers/transformers
│   └── mappers.ts
├── <Feature>.tsx          # main screen component
└── index.ts
```

**Agent rule:** Keep TanStack Query hooks inside the feature’s `<root>/modules/<Feature>/hooks/` folder. Prefer
module-local hooks.

### 3.4 What goes where (strict separation)

| Concern                  | Belongs in                      | Does NOT belong in            |
|--------------------------|---------------------------------|-------------------------------|
| HTTP calls               | `<root>/apis/`                  | hooks, components, pages      |
| Caching/fetch state      | hooks                           | API clients, components       |
| Request/response types   | `models/`                       | API clients (import only)     |
| UI/toast/navigation      | hooks (callbacks) or components | API clients                   |
| URL path strings         | `endpoints.ts`                  | inline in hooks or components |
| Query string building    | shared util or API client       | hooks                         |
| Table column definitions | `useBuildXTableColumns` hook    | API clients                   |
| Form state/validation    | `useXForm` hook                 | API clients                   |

---

## 4. Shared API Infrastructure

Before adding API calls, identify these contracts in the target repo.

### 4.1 HTTP client instance

**Find:** the shared export (`request`, `apiClient`, `http`, etc.) and its location.

**Typical responsibilities:**

- Set `baseURL` from environment/config
- Inject auth token (`Authorization: Bearer ...`) via request interceptor
- Serialize query params (array format, bracket notation, etc.)
- Normalize response keys (e.g. snake_case → camelCase)
- Normalize and reject errors globally
- Handle `401 Unauthorized`: clear session, redirect to login/intro route

**Agent rule:** All new API functions must use this shared client. Do not create one-off Axios/fetch instances.

### 4.2 List query-string helper

**Find:** shared helper for building list endpoint query strings (if present).

**Typical input fields:**

| Field         | Query param   | Description               |
|---------------|---------------|---------------------------|
| `page`        | `page`        | Page number               |
| `pageSize`    | `pageSize`    | Items per page            |
| `sortBy`      | `sortBy`      | Sort field                |
| `sortType`    | `order`       | Sort direction (asc/desc) |
| `searchBy`    | `searchBy`    | Search field              |
| `searchValue` | `searchValue` | Search term               |

**Agent rule:** Use the shared helper for all list endpoints to keep query behavior consistent.

### 4.3 Query/data layer provider

**Find:** where the query library provider is configured (e.g. `QueryClientProvider`).

**Typical defaults to document:**

- `refetchOnWindowFocus`: usually `false`
- `retry`: usually `0`
- `staleTime` / `gcTime`: project-specific
- `refetchOnReconnect`: project-specific

**Agent rule:** Hooks assume these defaults. Do not override globally unless intentional.

### 4.4 Shared error type

**Find:** normalized error shape used across the app.

**Typical shape:**

```typescript
export type ErrorResponse = {
  message: string;
  error: string;
  statusCode: number;
};
```

### 4.5 React Query wrapper: `useAppQuery`

Some repos wrap TanStack React Query to enforce consistent query defaults and to keep hook code readable.

**Common wrapper conventions:**

- **Signature:** `useAppQuery({ queryKey, queryFn, options })` (single params object)
- **Return shape:** a normalized subset used by UI/components, e.g.
  `{ data, status, error, isLoading, isFetching, isError, refetch }`
- **Agent rule:** feature-level hooks should usually be one-liners that just return `useAppQuery(...)` rather than
  destructuring the query result.

---

## 5. API Client Layer Conventions

### 5.1 Endpoint constants

One object per domain:

```typescript
// <root>/apis/<domain>/endpoints.ts
export const USER_ENDPOINTS = {
  GET_USER_LIST: '/users',
  GET_USER_DETAIL: '/users/detail',
  ME: '/users/me',
  REGISTER: '/users/register',
};
```

Rules:

- Keys describe route meaning (not HTTP method).
- Values are path strings only (no base URL).
- Group by domain, not by HTTP method.

### 5.2 API function patterns

#### List endpoint

```typescript
export const getXList = async (payload: GetXListRequest): Promise<GetXListResponse> => {
  const url = `${X_ENDPOINTS.GET_X_LIST}?${buildListingRequestPayload(payload)}`;
  return await request.get(url);
};
```

#### Detail endpoint

```typescript
export const getXDetail = async (id: string): Promise<GetXDetailResponse> => {
  const url = `${X_ENDPOINTS.GET_X_DETAIL}/${id.trim()}`;
  return await request.get(url);
};
```

#### Create endpoint

```typescript
export const createX = async (payload: CreateXRequest): Promise<CreateXResponse> => {
  return await request.post(X_ENDPOINTS.MAIN, payload);
};
```

#### Auth/action endpoint

```typescript
export const login = async (payload: LoginRequest): Promise<LoginResponse> => {
  return await request.post(AUTH_ENDPOINTS.LOGIN, payload);
};
```

### 5.3 API function rules

- Always typed parameters and return type.
- Always use endpoint constants (no hardcoded paths).
- Trim IDs before interpolating into URLs.
- For list endpoints, use the shared query-string helper.
- Import types from feature module models, not inline.
- No UI logic (no toasts, no redirects except via HTTP client interceptors).
- One function = one endpoint call.

### 5.4 Domain barrel & global barrel

```typescript
// <root>/apis/<domain>/index.ts
export * from './users';
export * from './getMe';

// <root>/apis/index.ts (optional)
export * from './auth';
export * from './users';
export * from './event';
```

---

## 6. Models & Types Conventions

### 6.1 File naming

| Type           | Pattern                   | Example                     |
|----------------|---------------------------|-----------------------------|
| Request        | `<action>.request.ts`     | `get-user-list.request.ts`  |
| Response       | `<action>.response.ts`    | `get-user-list.response.ts` |
| UI/table model | `<entity>-table.model.ts` | `event-table.model.ts`      |
| Domain entity  | `<entity>.model.ts`       | `user.model.ts`             |

### 6.2 Shared model patterns

Reusable across features:

```typescript
// Pagination
export type PaginateRequest = {
  page: number;
  pageSize: number;
};

// Sorting
export type SortingRequest = {
  sortBy?: string;
  sortType?: 'asc' | 'desc';
};

// Searching
export type SearchingRequest = {
  searchBy?: string;
  searchValue?: string;
};
```

Feature list requests typically extend shared types:

```typescript
export type GetXListRequest = PaginateRequest & SortingRequest & SearchingRequest & {
  // feature-specific filters
};
```

### 6.3 Model location rules

- Feature-specific types: `<root>/modules/<Feature>/models/` (even if they started out in shared during an MVP, move
  them into the owning feature)
- Shared/reusable types: `<root>/shared/models/`
- API clients import from models; models never import from API clients.

---

## 7. Hooks Conventions

Assumes React + TanStack React Query. Adapt terminology if using SWR or another library.

### 7.0 If a wrapper exists: `useAppQuery`

If your repo uses a wrapper like `useAppQuery`, feature hooks should usually be simple one-liners:

```typescript
export function useGetXList({payload}: { payload: GetXListRequest }) {
  return useAppQuery<GetXListResponse>({
    queryKey: ['getXList', payload],
    queryFn: () => getXList(payload),
  });
}
```

This keeps hook usage readable and ensures UI components always receive the same query shape.

### 7.1 Query hooks (reads)

#### List hook

```typescript
export function useGetXList({payload}: { payload: GetXListRequest }) {
  const {data, status, error, isLoading, isFetching, refetch} = useQuery({
    queryKey: ['getXList', payload],
    queryFn: () => getXList(payload),
  });

  return {data, status, error, isLoading, isFetching, refetch};
}
```

#### Detail hook (fetch on demand)

```typescript
export function useGetXDetail(id: string) {
  const {data, status, error, isLoading, isFetching, refetch} = useQuery({
    queryKey: ['getXDetail', id],
    queryFn: () => getXDetail(id),
    enabled: false,
  });

  return {data: data?.data, status, error, isLoading, isFetching, refetch};
}
```

#### Dual-source hook (same UI, different API)

```typescript
export function useGetXList({payload, variant}: { payload: GetXRequest; variant?: 'a' | 'b' }) {
  const {data, status, error, isLoading, isFetching, refetch} = useQuery({
    queryKey: [variant === 'b' ? 'getBList' : 'getAList', payload],
    queryFn: () => (variant === 'b' ? getBList(payload) : getAList(payload)),
  });

  return {data, status, error, isLoading, isFetching, refetch};
}
```

### 7.2 Mutation hooks (writes)

```typescript
export function useCreateX(onSuccess?: () => void) {
  const {mutate, status, error, isPending} = useMutation({
    mutationFn: (data: CreateXRequest) => createX(data),
    onSuccess: () => {
      notify({message: 'Create Success', type: ToastType.success});
      onSuccess?.();
    },
    onError: (error: ErrorResponse) => {
      notify({message: error.message || 'Failed', type: ToastType.error});
    },
  });

  return {mutate, status, error, isLoading: isPending};
}
```

### 7.3 Auth mutation hook

```typescript
export function useLogin(
  onLoginSuccess: (response: LoginResponse) => void,
  onError?: (error: unknown) => void,
) {
  const {mutate, data, error, isPending} = useMutation({
    mutationFn: (payload: LoginRequest) => login(payload),
    onSuccess: (data) => onLoginSuccess(data),
    onError,
  });

  return {mutate, data, error, isPending};
}
```

### 7.4 Form hooks

- Manage form state and validation only.
- Do NOT contain raw HTTP calls.
- Call mutation hooks for submission.

```typescript
// useXForm.ts — manages react-hook-form state, calls useCreateX internally
```

### 7.5 Hook rules summary

| Rule                    | Detail                                                                   |
|-------------------------|--------------------------------------------------------------------------|
| `queryKey`              | Stable, descriptive: `['getXList', payload]`, `['getXDetail', id]`       |
| On-demand fetch         | `enabled: false` + expose `refetch`                                      |
| Return shape (query)    | `{ data, status, error, isLoading, isFetching, refetch }`                |
| Return shape (mutation) | `{ mutate, status, error, isLoading: isPending }`                        |
| Data unwrapping         | Unwrap envelope in hook if API returns `{ data: T }`: `data: data?.data` |
| Side effects            | Toasts/navigation in `onSuccess`/`onError`, not in API clients           |
| Location                | Always in `<root>/modules/<Feature>/hooks/`                              |
| One hook                | One API function (or one conditional pair for dual-source)               |

---

## 8. Constants Conventions

### 8.1 Types of constants

| Type           | Pattern                   | Location                            |
|----------------|---------------------------|-------------------------------------|
| Endpoint paths | `<DOMAIN>_ENDPOINTS`      | `<root>/apis/<domain>/endpoints.ts` |
| App routes     | `APP_ROUTES`              | `<root>/shared/constants/`          |
| Auth/roles     | `AUTH_*`, `ROLES_*`       | `<root>/shared/constants/`          |
| Domain status  | `<ENTITY>_STATUS`         | feature or shared constants         |
| UI defaults    | table page size, debounce | feature or shared constants         |

### 8.2 Rules

- Endpoint constants live with their API domain, not in shared constants.
- Route/navigation constants are shared.
- Feature-specific business constants stay in the feature module.

---

## 9. Error Handling

### 9.1 Layer responsibilities

| Layer       | Responsibility                                                      |
|-------------|---------------------------------------------------------------------|
| HTTP client | Normalize error shape; handle 401 globally; reject with typed error |
| API client  | Pass through; do not catch/swallow                                  |
| Hook        | Handle user-facing errors (toasts, callbacks); check status codes   |
| Component   | Display error state from hook; no direct error parsing              |

### 9.2 Hook error handling pattern

```typescript
onError: (error: ErrorResponse) => {
  if (error.statusCode === 409 || error.statusCode === 400) {
    notify({message: error.message, type: ToastType.error});
    return;
  }
  notify({message: 'Operation failed', type: ToastType.error});
},
```

---

## 10. Pages vs Modules vs Components

### 10.1 Pages/routes

- Thin wrappers: import and render a module component.
- No API calls, no hooks with business logic.
- Only routing params, layout, and module composition.

```typescript
// <root>/pages/x/index.tsx
export default function XPage() {
  return <XModule / >;
}
```

### 10.2 Modules

- Contain feature screens, hooks, models, constants, utils.
- Main component orchestrates hooks and renders UI.

### 10.3 Shared components

- Reusable UI (popups, tables, form controls).
- May accept hooks' return values as props.
- Must NOT call API clients directly.

---

## 11. Agent Checklist: Add New API + Hook

1. **Define types** in `<root>/modules/<Feature>/models/`:

- `<action>.request.ts`, `<action>.response.ts`
- Export via `models/index.ts`

2. **Add endpoint constant** in `<root>/apis/<domain>/endpoints.ts`

3. **Implement API function** in `<root>/apis/<domain>/<file>.ts`:

- Use shared HTTP client
- Use shared list query helper for list endpoints
- Import types from models

4. **Export API function** from `<root>/apis/<domain>/index.ts`

- Optionally from `<root>/apis/index.ts`

5. **Create hook** in `<root>/modules/<Feature>/hooks/`:

- `useQuery` for reads, `useMutation` for writes
- Follow naming, queryKey, and return shape conventions
- Export via `hooks/index.ts`

6. **Create form hook** (if needed) in same `hooks/` folder

7. **Add mapper** (if needed) in `<root>/modules/<Feature>/util/`

8. **Consume hook** in feature component or popup

9. **Add page** (if new route) as thin wrapper in `<root>/pages/`

---

## 12. Code Templates

### 12.1 New domain API folder

```
<root>/apis/<domain>/
├── endpoints.ts
├── <domain>.ts
└── index.ts
```

### 12.2 New feature module (API-related parts)

```
<root>/modules/<Feature>/
├── hooks/
│   ├── useGetXList.ts
│   ├── useGetXDetail.ts
│   ├── useCreateX.ts
│   ├── useXForm.ts
│   └── index.ts
├── models/
│   ├── get-x-list.request.ts
│   ├── get-x-list.response.ts
│   ├── create-x.request.ts
│   ├── create-x.response.ts
│   └── index.ts
├── util/
│   └── mappers.ts
└── index.ts
```

### 12.3 Full example: adding a "Products" feature

**Step 1 — endpoints.ts**

```typescript
export const PRODUCT_ENDPOINTS = {
  GET_PRODUCT_LIST: '/products',
  GET_PRODUCT_DETAIL: '/products/detail',
  CREATE_PRODUCT: '/products',
};
```

**Step 2 — products.ts**

```typescript
import {request} from '<root>/configs';
import {buildListingRequestPayload} from '<root>/shared/util';
import {
  GetProductListRequest,
  GetProductListResponse,
  CreateProductRequest,
  CreateProductResponse
} from '<root>/modules/Products';
import {PRODUCT_ENDPOINTS} from './endpoints';

export const getProductList = async (payload: GetProductListRequest): Promise<GetProductListResponse> => {
  const url = `${PRODUCT_ENDPOINTS.GET_PRODUCT_LIST}?${buildListingRequestPayload(payload)}`;
  return await request.get(url);
};

export const getProductDetail = async (id: string) => {
  const url = `${PRODUCT_ENDPOINTS.GET_PRODUCT_DETAIL}/${id.trim()}`;
  return await request.get(url);
};

export const createProduct = async (payload: CreateProductRequest): Promise<CreateProductResponse> => {
  return await request.post(PRODUCT_ENDPOINTS.CREATE_PRODUCT, payload);
};
```

**Step 3 — useGetProductList.ts**

```typescript
import {useQuery} from '@tanstack/react-query';
import {getProductList} from '<root>/apis';
import {GetProductListRequest} from '../models';

export function useGetProductList({payload}: { payload: GetProductListRequest }) {
  const {data, status, error, isLoading, isFetching, refetch} = useQuery({
    queryKey: ['getProductList', payload],
    queryFn: () => getProductList(payload),
  });

  return {data, status, error, isLoading, isFetching, refetch};
}
```

**Step 4 — useCreateProduct.ts**

```typescript
import {useMutation} from '@tanstack/react-query';
import {createProduct} from '<root>/apis';
import {CreateProductRequest} from '../models';

export function useCreateProduct(onSuccess?: () => void) {
  const {mutate, status, error, isPending} = useMutation({
    mutationFn: (data: CreateProductRequest) => createProduct(data),
    onSuccess: () => onSuccess?.(),
  });

  return {mutate, status, error, isLoading: isPending};
}
```

---

## 13. Repo Documentation Format (for AI agents)

When applying this template to a specific repo, generate a repo-specific doc with these sections:

1. **Overview** — app purpose, how features are organized
2. **Shared HTTP infrastructure** — client export, auth, error handling, interceptors
3. **Shared helpers** — list query builder, pagination/sorting types
4. **Query provider setup** — location, default options
5. **Domain API clients** — per domain: endpoints, functions, barrel exports
6. **Feature modules** — per feature: hooks, which API functions they call
7. **Hook conventions** — naming, queryKey patterns, on-demand fetch rules
8. **Adaptation notes** — deviations from this template
