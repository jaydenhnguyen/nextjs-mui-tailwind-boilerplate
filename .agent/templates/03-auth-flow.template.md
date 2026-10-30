# 03 Auth Flow Template

How authentication works in this boilerplate. This describes the code that exists in the repo; extend it rather than building a parallel system.

**Apps without authentication:** delete `src/modules/Authentication`, `src/apis/auth`, `src/pages/login.tsx` and `PrivateLayout`, remove `SessionWatcher` from `AppProviders` and `AuthActions` from `PublicLayout`, and use `PublicLayout` only.

---

# 1. Overview

```txt
Login form ──▶ useLogin ──▶ POST /auth/login ──▶ store tokens (bearer) ──▶ set current user
                                                                              │
PrivateLayout ◀── useAuth ◀── useCurrentUser (GET /auth/me, React Query) ◀────┘
     │
     ├─ checking ─────────▶ full-screen loader
     ├─ not signed in ────▶ /login?redirect=<current path>
     ├─ network/5xx error ▶ ErrorState with retry (no redirect)
     └─ signed in ────────▶ page

Any request ─401─▶ refresh once (shared) ─▶ retry ─fail─▶ onSessionExpired ─▶ SessionWatcher ─▶ clearSession ─▶ guard redirects
```

The signed-in user is **server state** in React Query (`['currentUser']`). There is no auth context or store.

---

# 2. Where Things Live

| Concern                                                                                      | Location                                                         |
| -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Auth API calls (`login`, `logout`, `getCurrentUser`)                                         | `src/apis/auth/`                                                 |
| Auth strategy, refresh path                                                                  | `src/configs/api.config.ts`                                      |
| Token storage (bearer only)                                                                  | `src/configs/auth/tokenManager.ts` (cookie names too)            |
| 401 → refresh → retry → expire                                                               | `src/configs/request.ts` (see `02-api-structure.template.md` §7) |
| `User`, `LoginRequest`, `LoginResponse`                                                      | `src/modules/Authentication/models/`                             |
| Login schema                                                                                 | `src/modules/Authentication/schema/login.schema.ts`              |
| Hooks: `useAuth`, `useCurrentUser`, `useLogin`, `useLogout`, `useLoginForm`, `usePermission` | `src/modules/Authentication/hooks/`                              |
| Components: `Can`, `UserMenu`, `AuthActions`, `SessionWatcher`                               | `src/modules/Authentication/components/`                         |
| `clearSession`, `getSafeRedirect`                                                            | `src/modules/Authentication/utils/session.ts`                    |
| Roles                                                                                        | `src/shared/enums` (`ROLES`)                                     |
| Permissions and role → permission map                                                        | `src/modules/Authentication/constants/auth.constant.ts`          |
| Login screen                                                                                 | `src/modules/Authentication/Login/`, page `src/pages/login.tsx`  |
| Route guard                                                                                  | `src/layouts/PrivateLayout`                                      |
| Routes                                                                                       | `APP_ROUTES` in `src/shared/constants/routes.constant.ts`        |

Import from `src/modules/Authentication`.

---

# 3. Auth Strategy

Set once in `authConfig.strategy` (`src/configs/auth/auth.config.ts`):

| Strategy           | Backend                                         | Tokens                                                                           | Requests                        |
| ------------------ | ----------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------- |
| `bearer` (default) | returns `{ accessToken, refreshToken?, user? }` | `tokenManager` keeps them in JS-readable cookies (sameSite=lax, secure on https) | `Authorization: Bearer <token>` |
| `cookie`           | sets httpOnly cookies itself                    | the app never sees them                                                          | `withCredentials: true`         |

`authConfig.refreshPath` (default `/auth/refresh`) is called on a 401. Set it to `null` if the backend has no refresh endpoint; a 401 then ends the session immediately.

Backend contract expected by the default code:

| Endpoint             | Request                                     | Response                                 |
| -------------------- | ------------------------------------------- | ---------------------------------------- |
| `POST /auth/login`   | `{ email, password }`                       | `{ accessToken?, refreshToken?, user? }` |
| `GET /auth/me`       |                                             | `User`                                   |
| `POST /auth/refresh` | bearer: `{ refreshToken }`; cookie: no body | bearer: `{ accessToken, refreshToken? }` |
| `POST /auth/logout`  |                                             | anything                                 |

Different backend? Change `src/apis/auth/auth.ts`, the models, and (for refresh) `refreshSession` in `request.ts`. Nothing else needs to know.

---

# 4. Reading the Session

```ts
const { user, isAuthenticated, isChecking, sessionError, retry } = useAuth();
```

| Field             | Meaning                                                     |
| ----------------- | ----------------------------------------------------------- |
| `user`            | `User \| null`                                              |
| `isAuthenticated` | `!!user`                                                    |
| `isChecking`      | the first `/auth/me` check hasn't finished                  |
| `sessionError`    | the check failed for a reason other than 401 (offline, 5xx) |
| `retry`           | runs the check again                                        |

Rules:

- Never read `tokenManager` in components to decide if someone is signed in. Use `useAuth`.
- `useCurrentUser` skips the request when there's no bearer token, so signed-out visitors don't hit the API.
- After changing the user (e.g. profile update), update or invalidate `AUTH_QUERY_KEYS.CURRENT_USER`.

---

# 5. Login

`useLogin()` is a silent mutation (no automatic toast) that, on success:

1. clears any previous session data (`clearSession`)
2. stores tokens (bearer)
3. sets the current user from the response, or refetches `/auth/me`

The `Login` screen redirects once `isAuthenticated` becomes true, to `?redirect=` (validated by `getSafeRedirect`, same-site paths only) or `APP_ROUTES.HOME`. It maps errors onto the form: 401 → "Incorrect email or password" in `root.server`, field errors via `applyApiErrorToForm`.

Signed-in users who open `/login` are sent straight to the redirect target.

---

# 6. Protecting Pages

Use the layout:

```tsx
DashboardPage.getLayout = (page: React.ReactElement) => <PrivateLayout>{page}</PrivateLayout>;
```

`PrivateLayout` shows a loader while checking, redirects to `/login?redirect=<path>` when signed out, shows `ErrorState` with retry when the check failed for network/server reasons, and renders the header with `UserMenu` once signed in.

Also add the route to `NO_INDEX_ROUTES` and give the page `<Seo noIndex />`.

Do not write per-page `useEffect` redirects for auth.

---

# 7. Roles and Permissions

```tsx
const { can, hasRole } = usePermission();

can(PERMISSIONS.USERS_WRITE);
hasRole([ROLES.ADMIN, ROLES.SUPER_ADMIN]);

<Can permission={PERMISSIONS.USERS_WRITE} fallback={<Typography>Read only</Typography>}>
  <Button>Edit user</Button>
</Can>;
```

- If the backend sends `user.permissions`, those are used as-is.
- Otherwise permissions come from `ROLE_PERMISSIONS[role]`.
- Add new permissions to `PERMISSIONS` and to the roles that should have them.
- A whole page that needs a permission: wrap its content in `<Can permission=... fallback={<StatusPage code={403} title="No access" />}>`.

UI checks are for display only. The backend must enforce every permission too.

---

# 8. Logout and Session Expiry

- `useLogout()` calls `POST /auth/logout`, and **always** (even if that fails) clears the session and goes to `APP_ROUTES.LOGIN`. `UserMenu` already uses it.
- When a refresh fails, `src/configs/auth/interceptors.ts` calls the `onSessionExpired` handler. `SessionWatcher` (mounted once in `AppProviders`) registers it: it clears the session and, if someone was signed in, shows "Your session has expired". `PrivateLayout` then redirects to login with `?redirect=`.
- `clearSession` removes tokens, sets the current user to `null`, and drops every other cached query so the next user never sees the previous user's data.

---

# 9. Header Actions

| Layout          | Right side of header                        |
| --------------- | ------------------------------------------- |
| `PublicLayout`  | `AuthActions`: "Sign in" or "Open app"      |
| `PrivateLayout` | `UserMenu`: avatar, name, email, "Sign out" |

---

# 10. Security Rules

Do NOT:

- log or display tokens
- store tokens anywhere except through `tokenManager`
- put secrets or personal data in web storage
- redirect to an unvalidated `?redirect=` value (always `getSafeRedirect`)
- trust UI permission checks as security
- keep cached data after logout or expiry (use `clearSession`)
- add auth headers in API functions

Prefer the `cookie` strategy when you control the backend: httpOnly cookies can't be read by scripts.

---

# 11. Checklists

Add a protected page:

1. Page in `src/pages/...` with `getLayout` → `PrivateLayout`
2. Route in `APP_ROUTES`, `NO_INDEX_ROUTES`
3. `<Seo title noIndex />`
4. Nav entry in `navigationConfig.private` if it belongs in the menu
5. `<Can>` around parts that need a permission

Adapt to a different backend:

1. `authConfig.strategy`, `authConfig.refreshPath`
2. `src/apis/auth/endpoints.ts` and `auth.ts`
3. `User` / `LoginResponse` models
4. `refreshSession` in `request.ts` if the refresh contract differs
5. `ROLES`, `PERMISSIONS`, `ROLE_PERMISSIONS`

---

# 12. AI Agent Notes

- Read the session with `useAuth`; check access with `usePermission` / `<Can>`.
- Guard pages with `PrivateLayout`, never with ad-hoc effects.
- Login/logout only through `useLogin` / `useLogout`.
- After anything that changes the user, update `AUTH_QUERY_KEYS.CURRENT_USER`.
- Use `getSafeRedirect` for any redirect taken from the URL.
- Don't create an auth context, store, or a second token helper.
