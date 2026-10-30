# Auth Flow Example

The working auth flow is in the repo. Read the code instead of re-creating it:

| What                                         | File                                                    |
| -------------------------------------------- | ------------------------------------------------------- |
| Rules and architecture                       | `.agent/templates/03-auth-flow.template.md`             |
| Login screen (form, error mapping, redirect) | `src/modules/Authentication/Login/Login.tsx`            |
| Session hooks                                | `src/modules/Authentication/hooks/`                     |
| Route guard                                  | `src/layouts/PrivateLayout/PrivateLayout.tsx`           |
| Session expiry                               | `src/modules/Authentication/components/SessionWatcher/` |
| 401 → refresh → retry                        | `src/configs/request.ts`                                |

Below are the recipes people need most often.

---

## Show something only to signed-in users

```tsx
import { useAuth } from 'src/modules/Authentication';

const { user, isAuthenticated, isChecking } = useAuth();

if (isChecking) return <LoadingState />;
return isAuthenticated ? <Typography>Hi {user?.firstName}</Typography> : <Button href="/login">Sign in</Button>;
```

## Protect a page

```tsx
import { PrivateLayout } from 'src/layouts';

export default function BillingPage() {
  return (
    <>
      <Seo title="Billing" noIndex />
      <Billing />
    </>
  );
}

BillingPage.getLayout = (page: React.ReactElement) => <PrivateLayout>{page}</PrivateLayout>;
```

## Protect part of a page by permission

```tsx
import { Can, PERMISSIONS } from 'src/modules/Authentication';

<Can permission={PERMISSIONS.USERS_WRITE}>
  <Button onClick={openCreateUser}>New user</Button>
</Can>;
```

## Protect a whole page by role

```tsx
import { StatusPage } from 'src/components/StatusPage';
import { Can } from 'src/modules/Authentication';
import { ROLES } from 'src/shared/enums';

<Can role={[ROLES.ADMIN, ROLES.SUPER_ADMIN]} fallback={<StatusPage code={403} title="No access" />}>
  <AdminSettings />
</Can>;
```

## Add a new permission

```ts
// src/modules/Authentication/constants/auth.constant.ts
export const PERMISSIONS = {
  USERS_READ: 'users:read',
  USERS_WRITE: 'users:write',
  INVOICES_READ: 'invoices:read',
} as const;

export const ROLE_PERMISSIONS: Record<ROLES, Permission[]> = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
  [ROLES.EMPLOYEE]: [PERMISSIONS.USERS_READ, PERMISSIONS.INVOICES_READ],
};
```

## Update the signed-in user after editing their profile

```ts
const queryClient = useQueryClient();

useAppMutation({
  mutationFn: updateProfile,
  meta: { successMessage: 'Profile updated' },
  onSuccess: (updatedUser) => queryClient.setQueryData(AUTH_QUERY_KEYS.CURRENT_USER, updatedUser),
});
```

## Sign out from somewhere other than the user menu

```tsx
const { mutate: logout } = useLogout();

<Button onClick={() => logout()}>Sign out</Button>;
```
