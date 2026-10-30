# Shared hooks

Generic hooks only. Feature hooks (`useGetUserList`, `useLogin`…) live in `src/modules/<Feature>/hooks/`.
Import from `src/hooks`.

| Hook                                        | Returns                                                | Use for                                                        |
| ------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------- |
| `useAppQuery(options)`                      | TanStack `useQuery` result                             | every API read (see `02-api-structure.template.md`)            |
| `useAppMutation(options)`                   | TanStack `useMutation` result                          | every API write                                                |
| `useOpenState(initialOpen?)`                | `{ isOpen, open, close, toggle }`                      | dialogs, drawers, menus                                        |
| `useDebounce(value, delay = 300)`           | the value, updated after `delay` ms of quiet           | search inputs before they hit the API                          |
| `useQueryParams<'page' \| 'search'>()`      | `{ params, setParams, isReady }`                       | filters, search, pagination kept in the URL                    |
| `useBreakpoint()`                           | `{ isMobile, isTablet, isDesktop }`                    | behavior that changes by screen size                           |
| `useCopyToClipboard(resetAfter = 2000)`     | `{ copy(text), isCopied }`                             | copy buttons                                                   |
| `useStoredState(key, initial, { storage })` | `[value, setValue, remove]`                            | state saved in localStorage/sessionStorage, synced across tabs |
| `useThemeMode()`                            | `{ mode, resolvedMode, setMode, toggleMode, isReady }` | light/dark/system                                              |
| `useIsClient()`                             | `boolean`                                              | anything that reads browser-only values during render          |

## Examples

Search with debounce and URL state:

```tsx
const { params, setParams } = useQueryParams<'search' | 'page'>();
const [search, setSearch] = React.useState(params.search ?? '');
const debouncedSearch = useDebounce(search);

React.useEffect(() => {
  void setParams({ search: debouncedSearch, page: 1 });
}, [debouncedSearch, setParams]);

const usersQuery = useGetUserList({ search: params.search, page: Number(params.page ?? 1), pageSize: 20 });
```

`setParams` merges into the current query, drops empty values, and uses a shallow `replace` (pass `{ push: true }` to add a history entry).

Dialog state:

```tsx
const createDialog = useOpenState();

<Button onClick={createDialog.open}>New user</Button>
<Dialog open={createDialog.isOpen} onClose={createDialog.close}>...</Dialog>
```

`useBreakpoint` only knows the real screen size after the first client render. For layout, use Tailwind breakpoints (`md:flex`) or MUI `sx` breakpoints instead.

---

# Formatting

From `src/shared/utils` (`format.ts`). All return `—` for empty or invalid input and use `siteConfig.locale`.

| Function                                  | Example                           |
| ----------------------------------------- | --------------------------------- |
| `formatDate(value, pattern?)`             | `05 Mar 2026` (date-fns patterns) |
| `formatDateTime(value, pattern?)`         | `05 Mar 2026, 14:30`              |
| `formatRelativeTime(value)`               | `3 minutes ago`                   |
| `formatNumber(value, options?)`           | `1,234,567.891`                   |
| `formatCurrency(value, currency = 'USD')` | `$1,234.50`                       |
| `formatPercent(ratio, digits = 0)`        | `0.256` → `26%`                   |
| `formatCompactNumber(value)`              | `15.3K`                           |
| `formatFileSize(bytes)`                   | `1.5 KB`                          |

Never format dates or money inline with `toLocaleString` or manual string building.
