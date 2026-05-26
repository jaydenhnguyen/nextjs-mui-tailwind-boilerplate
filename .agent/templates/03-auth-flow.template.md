# 03 Auth Flow Template

This file defines the standard authentication architecture for this boilerplate.

It is the source of truth for:

- login flow
- logout flow
- protected routes
- public routes
- token storage
- request interceptor behavior
- refresh-token behavior
- current user/session loading

---

# 1. Auth Architecture

Authentication must follow this flow:

```txt
Login Form
  ↓
useLogin / useLoginForm
  ↓
auth API client
  ↓
shared request client
  ↓
backend
  ↓
tokenManager stores tokens
  ↓
route redirects
```

For authenticated API requests:

```txt
Feature Hook
  ↓
API Client
  ↓
request interceptor attaches access token
  ↓
backend
```

Components must not manually attach tokens to requests.

---

# 2. Folder Ownership

Expected auth-related structure:

```txt
src/
├── apis/
│   └── auth/
│       ├── endpoints.ts
│       ├── auth.ts
│       └── index.ts
│
├── configs/
│   ├── cookies.ts
│   ├── request.ts
│   ├── tokenManager.ts
│   └── environment.ts
│
├── modules/
│   └── Authentication/
│       ├── Login/
│       │   ├── hooks/
│       │   ├── models/
│       │   ├── Login.tsx
│       │   ├── login.module.scss
│       │   └── index.ts
│       └── index.ts
│
├── context/
│   └── AuthContext.tsx
│
├── layouts/
│   ├── PublicLayout/
│   └── PrivateLayout/
│
└── shared/
    └── constants/
        ├── auth.constant.ts
        └── routes.constant.ts
```

Follow the existing repo structure first.

If the project does not use `AuthContext`, do not create it unless needed.

---

# 3. Layer Responsibilities

## Components / Pages

Allowed:

- render auth UI
- call auth hooks
- display loading/error states
- redirect through hook/layout behavior

Not allowed:

- call `request` directly
- call `axios` or `fetch` directly
- manually set Authorization headers
- directly manipulate cookies/tokens except in approved layout/bootstrap cases
- duplicate route guard logic

---

## Hooks

Auth hooks may:

- call API clients
- use `useMutation`
- use `useAppQuery` for current user/session queries
- show toast/notification
- call tokenManager on login/logout success
- perform navigation after auth actions
- update auth context/store

Auth hooks must not:

- create raw HTTP requests
- create new Axios instances
- hardcode endpoint strings

---

## API Clients

Auth API clients live in:

```txt
src/apis/auth/
```

API clients may:

- call the shared request client
- use auth endpoint constants
- return typed responses

API clients must not:

- access cookies directly
- access localStorage/sessionStorage directly
- show toast
- redirect
- update React state
- manipulate auth context

---

## Configs

Auth infrastructure lives in:

```txt
src/configs/
```

This includes:

- shared request client
- token manager
- cookie helpers
- environment configuration
- refresh-token retry logic

---

# 4. Endpoint Constants

Auth endpoint constants must live in:

```txt
src/apis/auth/endpoints.ts
```

Example:

```ts
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
  REFRESH: '/auth/refresh',
};
```

Rules:

- use path strings only
- do not include base URL
- do not hardcode endpoint strings inside hooks/components
- add only endpoints supported by the backend

---

# 5. Auth API Client

Expected file:

```txt
src/apis/auth/auth.ts
```

Example:

```ts
import {request} from 'src/configs/request';
import {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  GetCurrentUserResponse,
} from 'src/modules/Authentication/Login/models';
import {AUTH_ENDPOINTS} from './endpoints';

export const login = async (
  payload: LoginRequest,
): Promise<LoginResponse> => {
  return await request.post(AUTH_ENDPOINTS.LOGIN, payload);
};

export const getCurrentUser = async (): Promise<GetCurrentUserResponse> => {
  return await request.get(AUTH_ENDPOINTS.ME);
};

export const refreshToken = async (
  payload: RefreshTokenRequest,
): Promise<RefreshTokenResponse> => {
  return await request.post(AUTH_ENDPOINTS.REFRESH, payload);
};
```

If auth models are shared across multiple auth modules, place them in:

```txt
src/modules/Authentication/models/
```

instead of:

```txt
src/modules/Authentication/Login/models/
```

---

# 6. Token Storage

Token storage must be centralized in:

```txt
src/configs/tokenManager.ts
```

Cookie helpers may live in:

```txt
src/configs/cookies.ts
```

The app should not scatter token logic across components.

---

## 6.1 Token Types

Common tokens:

```txt
accessToken
refreshToken
```

Access token:

- short-lived
- attached to API requests
- used in Authorization header

Refresh token:

- longer-lived
- used only to request a new access token
- should not be attached to normal API requests

---

## 6.2 Cookie Keys

Cookie keys should be constants.

Example:

```ts
export enum CookieKey {
  AccessToken = 'app_accessToken',
  RefreshToken = 'app_refreshToken',
}
```

Do not hardcode cookie keys in multiple files.

---

## 6.3 tokenManager Expected API

Expected helper functions:

```ts
export const tokenManager = {
  setAccessToken,
  getAccessToken,
  setRefreshToken,
  getRefreshToken,
  clearSession,
  removeAllCredentials,
  isAuthenticated,
};
```

Expected behavior:

```ts
setAccessToken({accessToken, expireIn})
```

Stores access token.

```ts
setRefreshToken({refreshToken, expireIn})
```

Stores refresh token if backend supports refresh tokens.

```ts
getAccessToken()
```

Returns current access token.

```ts
getRefreshToken()
```

Returns current refresh token.

```ts
clearSession()
```

Clears temporary session access.

```ts
removeAllCredentials()
```

Clears all auth credentials.

```ts
isAuthenticated()
```

Returns whether the user has an active auth session.

If refresh tokens are supported:

```ts
isAuthenticated()
```

may return true when either access token or refresh token exists.

If refresh tokens are not supported:

```ts
isAuthenticated()
```

should depend on access token only.

---

# 7. Shared Request Client

Expected file:

```txt
src/configs/request.ts
```

The request client should handle:

- base URL
- timeout
- default headers
- query params serialization
- request interceptor
- response interceptor
- response normalization
- error normalization
- auth failure behavior

---

## 7.1 Request Interceptor

The request interceptor must:

- read access token from `tokenManager.getAccessToken()`
- attach `Authorization: Bearer <accessToken>` when token exists

Example:

```ts
request.interceptors.request.use((config) => {
  const accessToken = tokenManager.getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});
```

Do not attach refresh token to normal API requests.

---

## 7.2 Response Interceptor

The response interceptor should:

- normalize successful response data if the project uses response normalization
- normalize backend errors
- handle `401 Unauthorized`
- attempt refresh-token flow if supported
- redirect to login/introduction only after session is invalid

---

# 8. Login Flow

Login should be implemented with:

```txt
Login.tsx
  ↓
useLoginForm
  ↓
useLogin
  ↓
login API client
```

---

## 8.1 Login Models

Expected location:

```txt
src/modules/Authentication/Login/models/
```

Example:

```ts
export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  expireIn: number;
  refreshToken?: string;
  refreshExpireIn?: number;
};
```

If backend uses different names, models should reflect normalized camelCase response data.

---

## 8.2 useLogin Hook

Login must use `useMutation`.

Example:

```ts
import {useMutation} from '@tanstack/react-query';
import {useRouter} from 'next/router';
import {login} from 'src/apis/auth';
import {tokenManager} from 'src/configs/tokenManager';
import {APP_ROUTES} from 'src/shared/constants';
import {LoginRequest, LoginResponse} from '../models';

export function useLogin() {
  const router = useRouter();

  const {mutate, status, error, isPending} = useMutation({
    mutationFn: (payload: LoginRequest) => login(payload),
    onSuccess: (response: LoginResponse) => {
      tokenManager.setAccessToken({
        accessToken: response.accessToken,
        expireIn: response.expireIn,
      });

      if (response.refreshToken) {
        tokenManager.setRefreshToken({
          refreshToken: response.refreshToken,
          expireIn: response.refreshExpireIn,
        });
      }

      const redirectPath =
        typeof router.query.redirect === 'string'
          ? router.query.redirect
          : APP_ROUTES.HOME;

      router.replace(redirectPath);
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

- login success stores tokens
- login success redirects user
- login failure should show user-facing error through hook/form handling
- API client does not store tokens
- component does not store tokens

---

## 8.3 useLoginForm Hook

Form logic should live in a form hook.

Standard form stack:

```txt
react-hook-form + zod
```

Example:

```ts
import {zodResolver} from '@hookform/resolvers/zod';
import {useForm} from 'react-hook-form';
import {useLogin} from './useLogin';
import {loginSchema} from '../login.schema';
import {LoginRequest} from '../models';

export function useLoginForm() {
  const loginMutation = useLogin();

  const form = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    loginMutation.mutate(values);
  });

  return {
    form,
    onSubmit,
    isLoading: loginMutation.isLoading,
    error: loginMutation.error,
  };
}
```

---

# 9. Current User / Session Loading

If the backend provides a current user endpoint, use:

```txt
useGetCurrentUser
```

Expected flow:

```txt
PrivateLayout/AuthContext
  ↓
useGetCurrentUser
  ↓
useAppQuery
  ↓
getCurrentUser API
```

Example:

```ts
import {getCurrentUser} from 'src/apis/auth';
import {useAppQuery} from 'src/shared/hooks/useAppQuery';

export function useGetCurrentUser({enabled = true}: { enabled?: boolean }) {
  return useAppQuery({
    queryKey: ['getCurrentUser'],
    queryFn: getCurrentUser,
    options: {
      enabled,
    },
  });
}
```

Rules:

- current user query must use `useAppQuery`
- do not use raw `useQuery` directly
- do not duplicate current user fetching in multiple layouts
- centralize current user state in context/store if multiple modules need it

---

# 10. Route Guarding

Auth route guarding usually belongs in layouts.

Expected layouts:

```txt
src/layouts/PublicLayout/
src/layouts/PrivateLayout/
```

---

## 10.1 PublicLayout

Public layout is for pages like:

- login
- register
- forgot password
- landing/intro pages

Behavior:

- if user is authenticated, redirect to home/dashboard
- otherwise render public page

Example:

```tsx
import {useRouter} from 'next/router';
import {ReactNode, useEffect} from 'react';
import {tokenManager} from 'src/configs/tokenManager';
import {APP_ROUTES} from 'src/shared/constants';

export function PublicLayout({children}: { children: ReactNode }) {
  const router = useRouter();
  const isAuthenticated = tokenManager.isAuthenticated();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(APP_ROUTES.HOME);
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) return null;

  return <>{children}</>;
}
```

---

## 10.2 PrivateLayout

Private layout is for authenticated pages.

Behavior:

- if user is not authenticated, redirect to login/introduction
- preserve intended destination using `redirect`
- optionally load current user before rendering children

Example:

```tsx
import {useRouter} from 'next/router';
import {ReactNode, useEffect} from 'react';
import {tokenManager} from 'src/configs/tokenManager';
import {APP_ROUTES} from 'src/shared/constants';

export function PrivateLayout({children}: { children: ReactNode }) {
  const router = useRouter();
  const isAuthenticated = tokenManager.isAuthenticated();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace({
        pathname: APP_ROUTES.LOGIN,
        query: {
          redirect: router.asPath,
        },
      });
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
```

If using current user loading:

```tsx
const {isLoading} = useGetCurrentUser({
  enabled: isAuthenticated,
});

if (isLoading) return null;
```

---

# 11. Logout Flow

Logout should be handled through a hook.

Expected flow:

```txt
Logout button
  ↓
useLogout
  ↓
optional logout API
  ↓
remove credentials
  ↓
clear auth context/store
  ↓
redirect to login/introduction
```

Example:

```ts
import {useRouter} from 'next/router';
import {tokenManager} from 'src/configs/tokenManager';
import {APP_ROUTES} from 'src/shared/constants';

export function useLogout() {
  const router = useRouter();

  const logout = () => {
    tokenManager.removeAllCredentials();
    router.replace(APP_ROUTES.LOGIN);
  };

  return {
    logout,
  };
}
```

If backend requires a logout API:

```ts
useMutation({
  mutationFn: logoutApi,
  onSettled: () => {
    tokenManager.removeAllCredentials();
    router.replace(APP_ROUTES.LOGIN);
  },
});
```

Rules:

- logout should clear all credentials
- if refresh tokens exist, logout must clear refresh token too
- do not only clear access token during logout
- clear auth context/store if used

---

# 12. Refresh Token Flow

## 12.0 Backend Capability Rule

Refresh-token flow must only be implemented when the backend supports it.

If the backend does not support refresh tokens:

- do not generate refresh-token infrastructure
- do not generate refresh interceptors
- on `401`, clear credentials and redirect to login/introduction

If the backend supports refresh tokens:

- follow the refresh-token architecture defined below

---

## 12.1 Backend Contract

Backend should provide:

```txt
POST /auth/refresh
```

Expected response:

```ts
export type RefreshTokenResponse = {
  accessToken: string;
  expireIn: number;
  refreshToken?: string;
  refreshExpireIn?: number;
};
```

Refresh token may be:

- sent in request body
- read by backend from cookie
- rotated on refresh

Follow backend contract exactly.

---

## 12.2 Retry Safety

The refresh flow must prevent infinite retries.

Use a retry marker:

```ts
type RetryConfig = AxiosRequestConfig & {
  _retry?: boolean;
};
```

Rules:

- only refresh if `_retry` is not already true
- set `_retry = true` before refresh
- if retry also fails with `401`, remove credentials and redirect

---

## 12.3 Concurrency Safety

Only one refresh request should run at a time.

Use one shared promise:

```ts
let refreshPromise: Promise<void> | null = null;
```

Behavior:

- first failed request starts refresh
- other failed requests wait for same refresh promise
- after refresh succeeds, all retry with new token
- after refresh fails, all reject and session is cleared

---

## 12.4 Refresh Implementation Blueprint

Example:

```ts
import axios, {AxiosError, AxiosRequestConfig} from 'axios';
import {AUTH_ENDPOINTS} from 'src/apis/auth/endpoints';
import {APP_ROUTES} from 'src/shared/constants';
import {tokenManager} from './tokenManager';

type RetryConfig = AxiosRequestConfig & {
  _retry?: boolean;
};

let refreshPromise: Promise<void> | null = null;

const refreshRequest = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

async function refreshAccessToken() {
  const refreshToken = tokenManager.getRefreshToken();

  if (!refreshToken) {
    throw new Error('Missing refresh token');
  }

  const response = await refreshRequest.post(AUTH_ENDPOINTS.REFRESH, {
    refreshToken,
  });

  tokenManager.setAccessToken({
    accessToken: response.data.accessToken,
    expireIn: response.data.expireIn,
  });

  if (response.data.refreshToken) {
    tokenManager.setRefreshToken({
      refreshToken: response.data.refreshToken,
      expireIn: response.data.refreshExpireIn,
    });
  }
}

function redirectToLogin() {
  tokenManager.removeAllCredentials();

  if (typeof window !== 'undefined') {
    window.location.href = APP_ROUTES.LOGIN;
  }
}

request.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const originalConfig = error.config as RetryConfig;

    if (status !== 401 || originalConfig._retry) {
      return Promise.reject(error.response?.data);
    }

    originalConfig._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      await refreshPromise;

      const newAccessToken = tokenManager.getAccessToken();

      originalConfig.headers = originalConfig.headers ?? {};
      originalConfig.headers.Authorization = `Bearer ${newAccessToken}`;

      return request(originalConfig);
    } catch {
      redirectToLogin();

      return Promise.reject(error.response?.data);
    }
  },
);
```

Notes:

- use a separate Axios instance for refresh to avoid interceptor loops
- adapt `baseURL` to your environment config
- adapt response normalization to match the project
- do not refresh when refresh endpoint itself fails
- do not log tokens

---

# 13. Error Handling

Expected backend error shape:

```ts
export type ErrorResponse = {
  code?: string;
  message: string;
  statusCode?: number;
};
```

Request interceptor should reject normalized backend errors.

Hooks should show user-facing messages.

Example:

```ts
onError: (error: ErrorResponse) => {
  notify({
    message: error.message || 'Something went wrong',
    type: ToastType.error,
  });
}
```

Rules:

- API clients do not catch errors unless normalizing
- request client handles global errors
- hooks handle user-facing errors
- components render error state when needed

---

# 14. Auth Context / Store

Use Context first for auth state unless the project size requires Zustand or Redux.

Default preference:

```txt
Context → Zustand → Redux Toolkit
```

Auth context may store:

- current user
- authentication status
- user permissions
- loading state
- helper methods like `setUser`, `clearUser`

Example:

```ts
type AuthContextValue = {
  user: CurrentUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: CurrentUser | null) => void;
  clearUser: () => void;
};
```

Rules:

- do not store access token directly in React state
- token source of truth is `tokenManager`
- current user source of truth may be auth context/store
- avoid duplicating auth state in many places

---

# 15. Role / Permission Guarding

If the app has roles or permissions, implement guards in layouts or dedicated guard components.

Example:

```txt
src/components/PermissionGuard/
```

or module-specific:

```txt
src/modules/Admin/components/AdminGuard/
```

Use shared constants for roles:

```txt
src/shared/constants/roles.constant.ts
```

Example:

```ts
export enum UserRole {
  Admin = 'admin',
  User = 'user',
}
```

Rules:

- route-level access belongs in layouts/guards
- component-level access belongs in guard components
- do not scatter role checks randomly across UI
- keep role constants centralized

---

# 16. APP_ROUTES

All auth redirects must use route constants.

Expected location:

```txt
src/shared/constants/routes.constant.ts
```

Example:

```ts
export const APP_ROUTES = {
  HOME: '/home',
  LOGIN: '/login',
  INTRODUCTION: '/',
  DASHBOARD: '/dashboard',
};
```

Do not hardcode route strings repeatedly.

Correct:

```ts
router.replace(APP_ROUTES.LOGIN);
```

Incorrect:

```ts
router.replace('/login');
```

---

# 17. Security Rules

Do NOT:

- log access tokens
- log refresh tokens
- expose tokens in UI
- store tokens in random components
- attach refresh token to normal requests
- hardcode token names in multiple files
- keep stale credentials after logout
- retry failed auth requests infinitely
- create multiple refresh requests for many simultaneous `401` errors

Prefer:

- centralized token management
- centralized request interceptors
- consistent route guards
- short-lived access tokens
- refresh only when backend supports it

---

# 18. Checklist: Implement Login

When implementing login, confirm:

1. Login API exists in `src/apis/auth`
2. Login endpoint exists in `AUTH_ENDPOINTS`
3. Login request/response models exist
4. `useLogin` uses `useMutation`
5. `useLoginForm` uses `react-hook-form + zod`
6. Login success stores access token
7. Login success stores refresh token if provided
8. Login success redirects using `APP_ROUTES`
9. Login errors are shown in user-facing way
10. Components do not manually call tokenManager

---

# 19. Checklist: Implement Protected Routes

When implementing protected routes, confirm:

1. `PrivateLayout` checks `tokenManager.isAuthenticated()`
2. Unauthenticated users redirect to login/introduction
3. Redirect preserves intended destination when useful
4. Authenticated users can access private content
5. Current user loads once if backend supports `/me`
6. Current user loading uses `useAppQuery`
7. Route strings use `APP_ROUTES`

---

# 20. Checklist: Implement Logout

When implementing logout, confirm:

1. Logout clears all credentials
2. Logout clears auth context/store if used
3. Logout redirects to login/introduction
4. Logout uses `APP_ROUTES`
5. If backend logout API exists, cleanup still happens in `onSettled`

---

# 21. Checklist: Implement Refresh Token

When implementing refresh tokens, confirm:

1. Backend supports refresh endpoint
2. Refresh token is stored on login
3. Request interceptor attempts refresh on `401`
4. Original request retries only once
5. Refresh flow is concurrency-safe
6. Refresh flow uses a separate refresh request/client or avoids interceptor loop
7. Refresh failure clears all credentials
8. Refresh failure redirects to login/introduction
9. Refresh token rotation is handled if backend returns a new refresh token
10. Tokens are never logged

---

# 22. Strict Rules

Do NOT:

- call login API directly inside component
- call request client directly inside component
- attach auth headers manually in API functions
- store tokens in React component state
- scatter token reads/writes across files
- hardcode auth routes repeatedly
- create refresh-token logic if backend does not support it
- redirect on every `401` before attempting refresh when refresh is supported
- use `@/` imports
- put auth API clients inside modules
- put auth business logic inside pages

---

# 23. AI Agent Notes

When implementing auth:

- use `src/apis/auth` for auth API functions
- use `src/configs/tokenManager.ts` for token storage
- use `src/configs/request.ts` for token injection and global auth errors
- use `useMutation` for login/logout actions
- use `useAppQuery` for current user/session queries
- use `react-hook-form + zod` for auth forms
- use layouts for route guarding
- use `APP_ROUTES` for redirects
- keep API clients free from UI logic
- keep components free from raw token/request logic

Auth must stay centralized, predictable, secure, and easy for AI agents to extend.
