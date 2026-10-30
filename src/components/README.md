# Shared components

Generic UI used across the app. Nothing here may import feature code from `src/modules` or call APIs.
Import from `src/components` (or the component's folder).

| Need                                                    | Use                                                           | Where                      |
| ------------------------------------------------------- | ------------------------------------------------------------- | -------------------------- |
| Page title, description, Open Graph, canonical, noindex | `<Seo title description image noIndex />`                     | `Seo/`                     |
| Show a query's loading / error / empty / data states    | `<QueryState query={...}>{(data) => ...}</QueryState>`        | `QueryState/`              |
| Spinner while something loads                           | `<LoadingState />`, `<LoadingState fullScreen />`             | `LoadingState/`            |
| "Nothing here yet"                                      | `<EmptyState title description icon action />`                | `EmptyState/`              |
| A failed load with retry                                | `<ErrorState error={error} onRetry={refetch} />`              | `ErrorState/`              |
| Ask before a destructive action                         | `const confirm = useConfirm(); if (await confirm({...})) ...` | `ConfirmDialog/`           |
| Toast                                                   | `notify.success('Saved')` (from `src/shared/utils`)           | `AppToaster/` renders them |
| Big status page (404, 500, maintenance)                 | `<StatusPage code title description action />`                | `StatusPage/`              |
| Light/dark switch                                       | `<ThemeModeToggle />`                                         | `ThemeModeToggle/`         |
| Forms                                                   | see `Form/README.md`                                          | `Form/`                    |
| Render crash screen                                     | `ErrorFallback` (already wired in `AppProviders`)             | `ErrorFallback/`           |
| Fade something in when it mounts                        | `<FadeIn y={4} delay={0.1}>...</FadeIn>`                      | `Motion/`                  |
| Report an error or an analytics event                   | `reportError(error, context)`, `track('signed_up', props)`    | `src/shared/utils`         |

`AppToaster`, `ConfirmProvider`, `MotionProvider` and `ErrorFallback` are mounted once in `src/providers/AppProviders.tsx`. Don't mount them again.

---

## Seo

Put one `<Seo />` at the top of every page component. `_app` renders a default one; a page's `<Seo>` replaces it tag by tag.

```tsx
<Seo title="Pricing" description="Plans for every team size" />
<Seo title="Dashboard" noIndex />
```

- `title` becomes `Title | Site name`.
- `image` is a path in `/public` or a full URL; it falls back to `siteConfig.ogImage`.
- Private pages should pass `noIndex` and be listed in `NO_INDEX_ROUTES` (`src/shared/constants/routes.constant.ts`), which also feeds `robots.txt`.
- Public pages that should be indexed go in `SITEMAP_ROUTES`, which feeds `sitemap.xml`.

Never use `next/head` for titles or meta tags directly.

## QueryState

```tsx
const usersQuery = useGetUserList(params);

<QueryState
  query={usersQuery}
  isEmpty={(response) => response.data.length === 0}
  empty={<EmptyState title="No users yet" action={<Button>Invite someone</Button>} />}
>
  {(response) => <UserTable users={response.data} />}
</QueryState>;
```

| Prop                      | Default                                                          |
| ------------------------- | ---------------------------------------------------------------- |
| `loading`                 | `<LoadingState />`                                               |
| `error`                   | `(error, retry) => <ErrorState error={error} onRetry={retry} />` |
| `empty` (needs `isEmpty`) | `<EmptyState title="Nothing here yet" />`                        |

Content fades in when it arrives. `LoadingState` waits 200ms before showing, so fast loads never flash a spinner.

## Motion

Animations use [`motion`](https://motion.dev) through `m.*` components (`import { m, AnimatePresence } from 'motion/react'`). `MotionProvider` loads only the DOM animation features and is `strict`, so `motion.div` throws: always write `m.div`. Timing comes from `src/theme/motion.ts` (`DURATION`, `EASE`, `enterTransition()`, `exitTransition()`, `moveTransition()`). Rules: `.agent/templates/09-motion.template.md`.

`FadeIn` covers the common case:

```tsx
<FadeIn>{content}</FadeIn>                      // fade
<FadeIn y={8} duration={DURATION.medium}>...</FadeIn> // fade + slide up
<FadeIn animateOnLoad delay={0.2}>...</FadeIn>  // also animate on the first page load
```

Content in the server HTML shows instantly on the first load (no waiting for JavaScript), and anything mounted after that fades in. Both layouts already fade each page in on navigation, so pages don't need their own `FadeIn`.

## useConfirm

```tsx
const confirm = useConfirm();

const handleDelete = async () => {
  const confirmed = await confirm({
    title: 'Delete this user?',
    description: "This can't be undone.",
    confirmText: 'Delete',
    destructive: true,
  });
  if (confirmed) deleteUser.mutate(id);
};
```

`destructive` makes the confirm button red and puts focus on Cancel.

## notify

```ts
import { notify } from 'src/shared/utils';

notify.success('Profile updated');
notify.error('Could not upload the file');
```

API errors already show a toast automatically (see `02-api-structure.template.md` §15), so don't call `notify.error` for them. For a mutation's success toast, prefer `meta: { successMessage }`. The same message shown twice in a row only appears once. Toasts follow light/dark mode.

---

## Layouts and navigation

Layouts live in `src/layouts` and are picked per page with `Page.getLayout`.

| Layout          | Has                                                            | Use for                    |
| --------------- | -------------------------------------------------------------- | -------------------------- |
| `PublicLayout`  | header, footer, skip link                                      | marketing and public pages |
| `PrivateLayout` | header, skip link; redirects to the login page when signed out | signed-in app pages        |

Nav links come from `src/configs/navigation.config.ts` (`public`, `private`, `footer`). Add a page to the menu there, not in the header. Social links in the footer come from `siteConfig.socials`. The header switches to a drawer menu below the `md` breakpoint.

Site-wide values (name, description, URL, locale, OG image, manifest icons) are in `src/configs/site.config.ts`.

---

## Rules for AI agents

Do:

- Add `<Seo />` to every new page; `noIndex` for private ones.
- Use `QueryState` (or `LoadingState` / `ErrorState` / `EmptyState`) for every data-driven view.
- Use `useConfirm` before delete or other irreversible actions.
- Use `notify` for non-API toasts.
- Add menu entries in `navigation.config.ts`.

Don't:

- Use `next/head` for titles/meta, `window.confirm`, or `react-toastify`'s `toast` directly.
- Render your own spinners, empty or error blocks when these components fit.
- Mount another `ToastContainer`, `Dialog`-based confirm or error boundary at the app level.
- Make content pop in without a transition (see `.agent/templates/09-motion.template.md`).
- Write CSS keyframes or `transition` classes for things that appear, disappear or move. Use `FadeIn` or `m.*` with the tokens in `src/theme/motion.ts`. CSS transitions are only for hover/focus color changes.
