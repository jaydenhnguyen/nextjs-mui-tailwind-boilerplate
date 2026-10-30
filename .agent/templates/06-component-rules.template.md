# 06 Component Rules

How to build components so every screen looks and behaves like the rest of the app.

---

## 1. Where a component goes

| It is                                                | Put it in                                  |
| ---------------------------------------------------- | ------------------------------------------ |
| Used by one feature (`ProductTable`, `OrderSummary`) | `src/modules/<Feature>/components/<Name>/` |
| Generic, no business knowledge (`StatCard`, `Seo`)   | `src/components/<Name>/`                   |
| Layout chrome (header, footer, skip link)            | `src/layouts/components/<Name>/`           |
| The screen a page renders                            | `src/modules/<Feature>/<Feature>.tsx`      |

Start in the module. Move to `src/components` only when a second feature needs it, and strip the feature knowledge on the way (props in, events out).

`npm run gen component <Name>` (or `-- --module <Feature>`) creates the folder:

```txt
StatCard/
├── StatCard.tsx
├── StatCard.module.scss   (only if it has styles)
└── index.ts               export * from './StatCard';
```

---

## 2. Before writing a new one, check what exists

| Need                                  | Already there                                            |
| ------------------------------------- | -------------------------------------------------------- |
| Loading / error / empty / data states | `QueryState`, `LoadingState`, `ErrorState`, `EmptyState` |
| Confirm before a destructive action   | `useConfirm()`                                           |
| Toast                                 | `notify.success / error / info / warning`                |
| Page title and meta                   | `Seo`                                                    |
| 404 / 403 / maintenance screen        | `StatusPage`                                             |
| Form fields                           | `src/components/Form` (`Control*`)                       |
| Fade in on mount                      | `FadeIn`                                                 |
| Show only with a permission           | `Can` (auth pack)                                        |

Full list with props: `src/components/README.md`. Hooks: `src/hooks/README.md`.

---

## 3. Writing a component

```tsx
import clsx from 'clsx';
import { Typography } from '@mui/material';
import classes from './StatCard.module.scss';

type Props = {
  label: string;
  value: React.ReactNode;
  trend?: 'up' | 'down';
  onSelect?: () => void;
  className?: string;
};

export function StatCard({ label, value, trend, onSelect, className }: Props) {
  return (
    <button type="button" onClick={onSelect} className={clsx(classes['root'], className)}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h5" component="p">
        {value}
      </Typography>
      {trend && <span className={classes[trend]}>{trend === 'up' ? '▲' : '▼'}</span>}
    </button>
  );
}
```

- Named function export, no default export (pages are the only default exports).
- Props as a `type Props` above the component. Optional props have sensible defaults in the destructuring.
- Accept `className` on anything that can be placed in a layout.
- Callback props are `onX` (`onSelect`, `onClose`); handlers inside are `handleX` (`handleSubmit`).
- Booleans read as questions: `isOpen`, `hasError`, `canEdit`.
- Conditional rendering with `&&` for one branch, a ternary for two. More than two: an early return or a small map.

---

## 4. Screens and data

- The module screen (`Products.tsx`) wires hooks to UI: it reads URL params, calls query and mutation hooks, and passes data and callbacks down.
- Child components get plain data and callbacks. They don't call query hooks for data their parent already has.
- No API calls, `fetch` or axios in components. Ever.
- Every data view handles loading, error and empty. `QueryState` does all three.
- Keep the previous page visible while the next loads (`keepPreviousData`) and dim it, instead of swapping in a spinner.

Split a component when it passes ~150 lines, has more than one reason to change, or when a section has its own state. Don't split a 40-line component into five files.

---

## 5. Dialogs, lists and tables

- Dialog open state: `useOpenState()`. Pass `open` and `onClose` to the dialog component.
- A form in a dialog: the form has an `id`, the submit button in `DialogActions` uses `form={formId}`, and the form resets in the transition's `onExited` (or `onEnter` for edit dialogs) so it doesn't visibly clear while closing.
- Focus the first field with `setFocus` in the transition's `onEntered`, not `autoFocus`: `autoFocus` runs before the dialog's focus trap, so the field blurs and shows its error before anyone typed.
- Don't close a dialog while its mutation is pending (`onClose={isPending ? undefined : onClose}`).
- Destructive actions ask first: `await confirm({ ..., destructive: true })`.
- Lists use a stable `key` from the data (`item.id`), never the index.
- Tables sit in a container with `overflow-x-auto`; secondary columns hide on small screens.

---

## 6. Accessibility

- Semantic elements first: `button` for actions, `a`/`Link` for navigation, real headings in order.
- Icon-only buttons have `aria-label`; decorative icons have `aria-hidden`.
- Form fields always have a label (the `Control*` fields handle it).
- Live updates that matter (errors, loading) use `role="alert"` / `role="status"` (the state components already do).
- Everything works with the keyboard and keeps a visible focus.

---

## 7. Performance

- Don't sprinkle `useMemo` / `useCallback` / `React.memo` by default. Add them when a value is a dependency of an effect or hook, or a measured re-render is slow.
- Images: `next/image` with width and height (or `fill` in a sized box).
- Heavy, rarely shown parts (charts, editors): `next/dynamic`.

---

## 8. Motion

Anything that appears, disappears or changes size animates smoothly and never makes the layout jump. Use `FadeIn` or `m.*` with the tokens in `src/theme/motion.ts`. Rules: `09-motion.template.md`.
