# Auth Flow Example

This example demonstrates the standard authentication flow used in this boilerplate.

It teaches:

- login flow
- logout flow
- token storage
- request interceptor behavior
- protected routes
- public routes
- current user loading
- refresh token architecture
- auth ownership boundaries

---

# Core Philosophy

Authentication must be centralized and predictable.

The standard flow is:

```txt
Login Form
    ↓
useLoginForm
    ↓
useLogin mutation hook
    ↓
login API client
    ↓
request client
    ↓
backend
    ↓
tokenManager stores tokens
    ↓
redirect user
```

For protected API calls:

```txt
Feature hook
    ↓
API client
    ↓
request interceptor attaches access token
    ↓
backend
```

Components must not manually attach tokens.

---

# Folder Structure Example

```txt
src/
├── apis/
│   └── auth/
│       ├── endpoints.ts
│       ├── auth.ts
│       └── index.ts
│
├── configs/
│   ├── request.ts
│   ├── tokenManager.ts
│   ├── cookies.ts
│   └── environment.ts
│
├── modules/
│   └── Authentication/
│       └── Login/
│           ├── Login.tsx
│           ├── Login.module.scss
│           ├── hooks/
│           │   ├── useLogin.ts
│           │   ├── useLoginForm.ts
│           │   └── index.ts
│           ├── models/
│           │   ├── login.request.ts
│           │   ├── login.response.ts
│           │   └── index.ts
│           ├── schema/
│           │   └── login.schema.ts
│           └── constants/
│               └── login-form.constant.ts
│
├── layouts/
│   ├── PublicLayout/
│   ├── PrivateLayout/
│   └── AdminLayout/
│
└── shared/
    └── constants/
        ├── routes.constant.ts
        └── auth.constant.ts
```

---

# Ownership Rules

| Concern          | Owner                                     |
|------------------|-------------------------------------------|
| Login UI         | `src/modules/Authentication/Login`        |
| Login form state | `useLoginForm`                            |
| Login mutation   | `useLogin`                                |
| Auth API calls   | `src/apis/auth`                           |
| Token storage    | `src/configs/tokenManager.ts`             |
| Cookie helpers   | `src/configs/cookies.ts`                  |
| Auth headers     | `src/configs/request.ts`                  |
| Route guarding   | `src/layouts`                             |
| Route constants  | `src/shared/constants/routes.constant.ts` |

---

# Auth Endpoints

## src/apis/auth/endpoints.ts

```ts
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
  REFRESH: '/auth/refresh',
};
```

Rules:

- keep endpoint paths centralized
- do not hardcode auth paths in hooks/components
- only include endpoints supported by the backend

---

# Auth API Client

## src/apis/auth/auth.ts

```ts
import { request } from 'src/configs/request';

import {
  LoginRequest,
  LoginResponse,
  GetCurrentUserResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from 'src/modules/Authentication/Login/models';

import { AUTH_ENDPOINTS } from './endpoints';

export async function login(
  payload: LoginRequest,
): Promise<LoginResponse> {
  return request.post(AUTH_ENDPOINTS.LOGIN, payload);
}

export async function getCurrentUser(): Promise<GetCurrentUserResponse> {
  return request.get(AUTH_ENDPOINTS.ME);
}

export async function refreshToken(
  payload: RefreshTokenRequest,
): Promise<RefreshTokenResponse> {
  return request.post(AUTH_ENDPOINTS.REFRESH, payload);
}
```

API clients must not:

- store tokens
- redirect users
- show toast
- access cookies directly

---

# Login Models

## login.request.ts

```ts
export type LoginRequest = {
  email: string;
  password: string;
};
```

---

## login.response.ts

```ts
export type LoginResponse = {
  accessToken: string;
  expireIn: number;
  refreshToken?: string;
  refreshExpireIn?: number;
};
```

---

# Login Schema

## login.schema.ts

```ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Email is invalid'),
  password: z.string().min(1, 'Password is required'),
});
```

---

# Login Form Hook

## useLoginForm.ts

```ts
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { loginSchema } from '../schema/login.schema';
import { LoginRequest } from '../models';

export function useLoginForm() {
  const form = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onSubmit',
  });

  return {
    form,
    control: form.control,
    formHandleSubmit: form.handleSubmit,
    formState: form.formState,
  };
}
```

---

# Login Mutation Hook

## useLogin.ts

```ts
import { useMutation } from '@tanstack/react-query';

import { login } from 'src/apis/auth';
import { tokenManager } from 'src/configs/tokenManager';

import { LoginRequest, LoginResponse } from '../models';

type Params = {
  onSuccess?: (response: LoginResponse) => void;
  onError?: () => void;
};

export function useLogin({
  onSuccess,
  onError,
}: Params = {}) {
  const { mutate, status, error, isPending } = useMutation({
    mutationFn: (payload: LoginRequest) => login(payload),

    onSuccess: (response) => {
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

      onSuccess?.(response);
    },

    onError: () => {
      onError?.();
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

# Login Component

## Login.tsx

```tsx
import { useRouter } from 'next/router';
import { Button, Stack, TextField } from '@mui/material';
import { Controller } from 'react-hook-form';

import { APP_ROUTES } from 'src/shared/constants';

import { useLogin, useLoginForm } from './hooks';
import { LoginRequest } from './models';

export function Login() {
  const router = useRouter();

  const {
    control,
    formHandleSubmit,
  } = useLoginForm();

  const { mutate, isLoading } = useLogin({
    onSuccess: () => {
      const redirectPath =
        typeof router.query.redirect === 'string'
          ? router.query.redirect
          : APP_ROUTES.HOME;

      router.replace(redirectPath);
    },
  });

  const onSubmit = (payload: LoginRequest) => {
    mutate(payload);
  };

  return (
    <form onSubmit={formHandleSubmit(onSubmit)} noValidate>
      <Stack spacing={2}>
        <Controller
          control={control}
          name="email"
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Email"
              type="email"
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message}
              fullWidth
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Password"
              type="password"
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message}
              fullWidth
            />
          )}
        />

        <Button type="submit" disabled={isLoading}>
          Log in
        </Button>
      </Stack>
    </form>
  );
}
```

Rules:

- component renders fields only
- login mutation stores tokens
- component handles redirect callback
- no direct API calls in component

---

# Token Manager Example

## src/configs/tokenManager.ts

```ts
import { cookiesStorage } from './cookies';
import { CookieKey } from 'src/shared/constants';

type SetTokenParams = {
  accessToken?: string;
  refreshToken?: string;
  expireIn?: number;
};

export const tokenManager = {
  setAccessToken({ accessToken, expireIn }: SetTokenParams) {
    if (!accessToken) return;

    cookiesStorage.setCookieData(
      CookieKey.AccessToken,
      accessToken,
      expireIn,
    );
  },

  setRefreshToken({ refreshToken, expireIn }: SetTokenParams) {
    if (!refreshToken) return;

    cookiesStorage.setCookieData(
      CookieKey.RefreshToken,
      refreshToken,
      expireIn,
    );
  },

  getAccessToken() {
    return cookiesStorage.getCookieData(CookieKey.AccessToken);
  },

  getRefreshToken() {
    return cookiesStorage.getCookieData(CookieKey.RefreshToken);
  },

  clearSession() {
    cookiesStorage.clearCookieData(CookieKey.AccessToken);
  },

  removeAllCredentials() {
    cookiesStorage.clearCookieData(CookieKey.AccessToken);
    cookiesStorage.clearCookieData(CookieKey.RefreshToken);
  },

  isAuthenticated() {
    return Boolean(
      this.getAccessToken() || this.getRefreshToken(),
    );
  },
};
```

Rules:

- tokens are centralized here
- components do not manually write cookies
- logout clears all credentials
- refresh flow may use refresh token if supported

---

# Request Interceptor Example

## src/configs/request.ts

```ts
import axios from 'axios';

import { tokenManager } from './tokenManager';
import { envVariables } from './environment';

export const request = axios.create({
  baseURL: envVariables.BASE_API_URL,
  timeout: 10000,
});

request.interceptors.request.use((config) => {
  const accessToken = tokenManager.getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});
```

Rules:

- access token is attached globally
- feature APIs do not manually attach token
- refresh token is not attached to normal API calls

---

# Protected Route Example

## PrivateLayout.tsx

```tsx
import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/router';

import { tokenManager } from 'src/configs/tokenManager';
import { APP_ROUTES } from 'src/shared/constants';

type Props = {
  children: ReactNode;
};

export function PrivateLayout({
  children,
}: Props) {
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

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
```

Rules:

- private routes redirect unauthenticated users
- intended destination is preserved
- layout owns route protection

---

# Public Route Example

## PublicLayout.tsx

```tsx
import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/router';

import { tokenManager } from 'src/configs/tokenManager';
import { APP_ROUTES } from 'src/shared/constants';

type Props = {
  children: ReactNode;
};

export function PublicLayout({
  children,
}: Props) {
  const router = useRouter();

  const isAuthenticated = tokenManager.isAuthenticated();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(APP_ROUTES.HOME);
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
```

Rules:

- public auth pages redirect authenticated users away
- public layout owns this behavior
- login page does not duplicate auth redirect logic

---

# Page Usage Example

## src/pages/login/index.tsx

```tsx
import { PublicLayout } from 'src/layouts/PublicLayout';
import { Login } from 'src/modules/Authentication/Login';

export default function LoginPage() {
  return <Login />;
}

LoginPage.getLayout = function getLayout(page: React.ReactNode) {
  return <PublicLayout>{page}</PublicLayout>;
};
```

---

## src/pages/products/index.tsx

```tsx
import { PrivateLayout } from 'src/layouts/PrivateLayout';
import { Products } from 'src/modules/Products';

export default function ProductsPage() {
  return <Products />;
}

ProductsPage.getLayout = function getLayout(page: React.ReactNode) {
  return <PrivateLayout>{page}</PrivateLayout>;
};
```

---

# Current User Query Example

If backend supports current user endpoint:

## useGetCurrentUser.ts

```ts
import { getCurrentUser } from 'src/apis/auth';
import { useAppQuery } from 'src/hooks/useAppQuery';

export function useGetCurrentUser({
  enabled = true,
}: {
  enabled?: boolean;
}) {
  return useAppQuery({
    queryKey: ['GET_CURRENT_USER'],
    queryFn: getCurrentUser,
    enabled,
  });
}
```

Use this in:

- AuthContext
- PrivateLayout
- AppProvider

Do not fetch current user separately in many components.

---

# Logout Example

## useLogout.ts

```ts
import { useRouter } from 'next/router';

import { tokenManager } from 'src/configs/tokenManager';
import { APP_ROUTES } from 'src/shared/constants';

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

Rules:

- logout clears all credentials
- logout redirects to login
- if auth context exists, clear user state too

---

# Refresh Token Flow

Refresh token flow should only be implemented if backend supports it.

If backend does not support refresh tokens:

- remove credentials on `401`
- redirect to login

If backend supports refresh tokens:

- store refresh token on login
- attempt refresh on `401`
- retry original request once
- redirect only if refresh fails

---

# Refresh Token Interceptor Example

```ts
import axios, { AxiosError, AxiosRequestConfig } from 'axios';

import { AUTH_ENDPOINTS } from 'src/apis/auth/endpoints';
import { APP_ROUTES } from 'src/shared/constants';

import { tokenManager } from './tokenManager';
import { request } from './request';

type RetryConfig = AxiosRequestConfig & {
  _retry?: boolean;
};

let refreshPromise: Promise<void> | null = null;

const refreshRequest = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_API_URL,
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

Important:

- retry only once
- prevent infinite loops
- use one refresh promise
- clear credentials on refresh failure
- do not log tokens

---

# Auth Flow Summary

```txt
Login
    ↓
validate form
    ↓
login mutation
    ↓
store tokens
    ↓
redirect

Private route
    ↓
check tokenManager.isAuthenticated()
    ↓
load current user if needed
    ↓
render children

API request
    ↓
request interceptor attaches access token
    ↓
backend

401 response
    ↓
refresh if supported
    ↓
retry original request
    ↓
or clear credentials + redirect
```

---

# Anti-patterns

Do NOT:

- store tokens inside React component state
- attach Authorization header manually in API clients
- call login API directly inside component
- duplicate route guards in every page
- hardcode `/login` repeatedly
- log access tokens
- log refresh tokens
- create refresh flow if backend does not support it
- redirect on first 401 if refresh token is available
- call tokenManager randomly from many components

---

# Strict Rules

1. Auth APIs live in `src/apis/auth`.
2. Tokens are managed by `tokenManager`.
3. Request interceptor attaches access token.
4. Components never attach tokens manually.
5. Login uses `useMutation`.
6. Current user uses `useAppQuery`.
7. Protected routes use `PrivateLayout`.
8. Public auth pages use `PublicLayout`.
9. Logout clears all credentials.
10. Refresh flow retries original request only once.
11. Do not log tokens.
12. Do not scatter auth logic across components.

---

# AI Agent Notes

When implementing auth:

1. Create auth endpoints.
2. Create typed auth API clients.
3. Create login schema and models.
4. Create `useLoginForm`.
5. Create `useLogin`.
6. Store tokens only after login success.
7. Use `PrivateLayout` for protected routes.
8. Use `PublicLayout` for public auth routes.
9. Use `APP_ROUTES` for redirects.
10. Use refresh flow only when backend supports it.
11. Keep auth centralized.
12. Keep components free from token/request logic.

The auth architecture should remain:

- centralized
- secure
- predictable
- typed
- refresh-ready
- AI-agent-friendly
