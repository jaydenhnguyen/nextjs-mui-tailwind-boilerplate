# 06 Component Rules Template

This file defines the standard React component architecture and UI engineering conventions for this boilerplate.

It is the source of truth for:

- component ownership
- reusable UI philosophy
- module composition
- component structure
- styling boundaries
- MUI usage
- responsive behavior
- accessibility
- component abstraction rules

---

# 1. Component Architecture Philosophy

This boilerplate follows a:

```txt
feature/module-first architecture
```

with:

```txt
Reusable UI
    ↓
Feature composition
    ↓
Module screen
    ↓
Page route
```

The goal is:

- deterministic file placement
- predictable composition
- scalable UI architecture
- AI-agent-friendly structure
- mobile-first UI
- minimal duplication

---

# 2. Deterministic Component Rule

When creating a component, decide ownership in this order:

```txt
Is it reusable across multiple features/modules?
├─ YES → src/components/
└─ NO  → src/modules/<Feature>/components/
```

If the component belongs to app shell/chrome:

```txt
src/layouts/
```

Examples:

| Component         | Correct Location                                  |
|-------------------|---------------------------------------------------|
| `Card`            | `src/components/Card`                             |
| `Modal`           | `src/components/Modal`                            |
| `ProductCard`     | `src/modules/Products/components/ProductCard`     |
| `CheckoutSummary` | `src/modules/Checkout/components/CheckoutSummary` |
| `Header`          | `src/layouts/PublicLayout/components/Header`      |
| `Sidebar`         | `src/layouts/AdminLayout/components/Sidebar`      |

Do NOT create:

```txt
src/components/products/ProductCard
```

Feature-specific UI belongs in modules.

---

# 3. Global vs Feature Component Ownership

## Global reusable components

Location:

```txt
src/components/
```

Use for:

- reusable UI primitives
- cross-feature UI
- design-system wrappers
- reusable forms
- reusable states
- reusable layouts
- reusable dialogs/modals
- reusable table/list primitives

Examples:

```txt
src/components/
├── Button/
├── Card/
├── Modal/
├── Table/
├── EmptyState/
├── ErrorState/
├── LoadingState/
├── SectionTitle/
└── Form/
```

---

## Feature-specific components

Location:

```txt
src/modules/<Feature>/components/
```

Use for:

- feature-specific sections
- feature-specific composition
- domain-specific cards/items
- feature-only filters/forms
- feature-only dialogs
- feature-specific lists/tables

Examples:

```txt
src/modules/Products/components/
├── ProductCard/
├── ProductFilters/
├── ProductList/
└── ProductDetailsSection/
```

---

## Layout components

Location:

```txt
src/layouts/
```

Use for:

- app shell
- header
- footer
- sidebar
- navigation
- route wrappers
- layout-specific providers

---

# 4. Expected Component Folder Structure

## Reusable component

```txt
src/components/Card/
├── Card.tsx
├── Card.module.scss
└── index.ts
```

---

## Feature component

```txt
src/modules/Products/components/ProductCard/
├── ProductCard.tsx
├── ProductCard.module.scss
└── index.ts
```

---

## Complex feature component

```txt
src/modules/Checkout/components/CheckoutSummary/
├── CheckoutSummary.tsx
├── CheckoutSummary.module.scss
├── CheckoutSummaryItem.tsx
├── CheckoutSummaryItem.module.scss
└── index.ts
```

Only export the public component.

Example:

```ts
export * from './CheckoutSummary';
```

Do not export private internal sub-components.

---

# 5. Reusable Primitive → Feature Composition Philosophy

The UI architecture should flow like this:

```txt
MUI primitives
    ↓
Reusable UI components
    ↓
Feature components
    ↓
Module screen
    ↓
Page route
```

Example:

```txt
MUI Card
    ↓
src/components/Card
    ↓
src/modules/Products/components/ProductCard
    ↓
src/modules/Products/Products.tsx
    ↓
src/pages/products/index.tsx
```

Reusable UI should wrap MUI primitives instead of reimplementing them.

Correct:

```tsx
import {Card} from 'src/components/Card';

<ProductCard>
  ...
</ProductCard>
```

Incorrect:

```tsx
<Box
  sx={{
    borderRadius: '12px',
    boxShadow: '...',
    padding: '16px',
  }}
>
```

repeated everywhere.

---

# 6. Smart vs Presentational Components

## Presentational components

Usually:

- reusable UI
- pure rendering
- receive props
- minimal state
- no business logic
- no API logic

Examples:

```txt
Card
Button
Modal
EmptyState
ProductCard
```

Presentational components must never:

- call APIs
- use raw `useQuery`
- use raw `useMutation`
- use `axios`
- use `fetch`

---

## Smart components

Usually:

- feature sections
- feature containers
- orchestrate hooks
- manage feature UI state
- compose child components

Examples:

```txt
ProductsSection
CheckoutSection
OrdersTableSection
```

Smart components may:

- use feature hooks
- use form hooks
- use context
- manage local UI state

Smart components still must not:

- call APIs directly
- use axios/fetch directly

---

# 7. Module Screen Composition

The module root should orchestrate feature sections only.

Example:

```txt
src/modules/Products/
├── Products.tsx
├── Products.module.scss
└── components/
```

Example:

```tsx
import classes from './Products.module.scss';
import {ProductFilters} from './components/ProductFilters';
import {ProductList} from './components/ProductList';

export function Products() {
  return (
    <section className={classes['products-wrapper']}>
      <ProductFilters/>
      <ProductList/>
    </section>
  );
}
```

The page route should stay thin.

Correct:

```tsx
import {Products} from 'src/modules/Products';

export default function ProductsPage() {
  return <Products/>;
}
```

Incorrect:

```tsx
export default function ProductsPage() {
  return (
    <>
      <ProductFilters/>
      <ProductList/>
    </>
  );
}
```

---

# 8. Component Size / Splitting Rules

Target:

- under ~150 lines preferred
- split at ~200-300+ lines
- one primary responsibility per component

Split when:

- multiple visual regions exist
- multiple responsibilities exist
- repeated JSX appears
- nested render logic grows large
- multiple loading/error states exist
- file becomes difficult to scan quickly

Good split:

```txt
CheckoutSection
├── CheckoutSummary
├── CheckoutForm
└── CheckoutActions
```

Avoid over-splitting tiny pieces.

Do NOT create:

```txt
CheckoutTitle.tsx
CheckoutSubtitle.tsx
CheckoutDivider.tsx
```

for trivial markup.

---

# 9. Component File Naming Rules

| Type             | Convention                  |
|------------------|-----------------------------|
| Component folder | PascalCase                  |
| Component file   | Same as folder              |
| SCSS module      | `ComponentName.module.scss` |
| Barrel export    | `index.ts`                  |
| Types file       | `ComponentName.types.ts`    |

Correct:

```txt
ProductCard/
├── ProductCard.tsx
├── ProductCard.module.scss
└── index.ts
```

Incorrect:

```txt
product-card.tsx
styles.scss
index.module.scss
```

---

# 10. Component Export Rules

Use named exports.

Correct:

```ts
export function ProductCard() {
}
```

Incorrect:

```ts
export default function ProductCard() {
}
```

Exception:

- Next.js page files

Each component folder should export through:

```ts
// index.ts

export * from './ProductCard';
```

---

# 11. Props API Philosophy

Props should be:

- explicit
- typed
- minimal
- predictable

Avoid:

- giant config objects
- excessive optional booleans
- vague prop names

Bad:

```tsx
<Card
  isDark
  isCompact
  isBorderless
  isHorizontal
/>
```

Good:

```tsx
<Card
  variant="compact"
  orientation="horizontal"
/>
```

---

## Props Type Pattern

Example:

```ts
type Props = {
  product: Product;
  onClick?: () => void;
};
```

Use `children` only when appropriate.

Avoid passing entire huge objects when only a few fields are needed.

---

# 12. Event Handler Naming Conventions

Use:

| Type             | Convention |
|------------------|------------|
| Internal handler | `handleX`  |
| Callback prop    | `onX`      |

Examples:

```ts
handleSubmit
handleClose
handleOpenModal
handleToggleMenu
```

Callback props:

```ts
onSubmit
onClose
onChange
onSelect
```

Avoid vague names:

```ts
submit
click
change
```

---

# 13. Conditional Rendering Conventions

Prefer:

- early return
- extracted render functions
- reusable state components

Correct:

```tsx
if (isLoading) return <LoadingState/>;
if (isError) return <ErrorState/>;
if (!data?.length) return <EmptyState/>;

return <ProductList data={data}/>;
```

Avoid nested ternaries:

```tsx
isLoading
  ?
...
:
isError
  ?
...
: ...
```

Use reusable state components whenever possible.

---

# 14. Responsive / Mobile-first Component Rules

All components must be:

- mobile-friendly
- responsive-first
- usable on small screens

Preferred approach:

1. mobile layout first
2. enhance for tablet/desktop
3. use responsive Tailwind utilities
4. use MUI responsive `sx` only when theme-aware

Correct:

```scss
.products-wrapper {
  @apply flex flex-col gap-4 md:flex-row;
}
```

Avoid fixed widths:

```scss
width:

1200
px

;
```

unless truly required.

---

# 15. MUI Component Usage Rules

Use MUI for:

- layout primitives
- forms
- dialogs
- menus
- typography
- buttons
- cards
- tables
- feedback components

Prefer reusable wrappers over repeating MUI config.

Correct:

```tsx
import {Button} from 'src/components/Button';
```

instead of:

```tsx
<MuiButton
  variant="contained"
  sx={{
    borderRadius: '999px',
    textTransform: 'none',
  }}
>
```

repeated everywhere.

---

## `sx` Usage Rules

Use `sx` when:

- theme-aware
- responsive MUI styling
- one-off dynamic values

Do not build giant UI entirely with `sx`.

Prefer:

- SCSS modules
- reusable components
- theme overrides

---

# 16. Styling Ownership Rules

| Concern                   | Owner        |
|---------------------------|--------------|
| Global button style       | MUI theme    |
| Card radius               | MUI theme    |
| Feature layout spacing    | module SCSS  |
| Hero section background   | module SCSS  |
| Theme colors              | theme tokens |
| Responsive utility layout | Tailwind     |
| Dynamic theme styling     | `sx`         |

Do not hardcode raw hex colors inside components.

Use:

- theme palette
- Tailwind mapped tokens
- reusable theme values

---

# 17. Tailwind + SCSS Module Usage

Default pattern:

```txt
SCSS module + Tailwind @apply
```

Example:

```scss
.product-card {
  @apply flex flex-col gap-4 rounded-lg border bg-common-white p-4 shadow-sm;
}
```

Use:

- `@apply`
- nested selectors
- modifiers
- responsive utilities

Prefer SCSS modules over giant JSX class strings.

---

# 18. Accessibility Rules

Components should:

- use semantic elements
- support keyboard navigation
- preserve visible focus
- use accessible labels
- support screen readers

Examples:

```tsx
<Button aria-label="Close modal">
```

```tsx
<Box component="section">
```

Avoid:

- clickable divs
- removing focus outline without replacement
- hover-only interactions

---

# 19. Loading / Empty / Error State Conventions

Prefer reusable state components.

Recommended:

```txt
src/components/
├── LoadingState/
├── ErrorState/
└── EmptyState/
```

Correct:

```tsx
if (isLoading) return <LoadingState/>;
if (isError) return <ErrorState/>;
if (!data?.length) return <EmptyState/>;
```

Avoid:

- returning `null`
- inconsistent loaders
- copy-pasted error UI

---

# 20. Reusable Component Creation Rules

Create reusable component only when:

- reused 2+ times
- API is stable
- generic enough
- not tightly coupled to one feature

Do NOT prematurely abstract.

Keep feature-specific UI inside modules until true reuse appears.

Bad premature abstraction:

```txt
src/components/ProductHero
```

when only Products page uses it.

---

# 21. Form Component Rules

Preferred stack:

```txt
react-hook-form + zod
```

Responsibility split:

| Concern        | Location           |
|----------------|--------------------|
| schema         | module form/schema |
| form hook      | module hooks       |
| form fields UI | component          |

Example:

```txt
src/modules/Checkout/
├── hooks/
│   └── useCheckoutForm.ts
├── schema/
│   └── checkout.schema.ts
└── components/
    └── CheckoutForm/
```

Form component should render fields only.

Form hooks handle:

- validation
- mutation
- submission
- transformation

---

# 22. Modal / Dialog Rules

Use:

- MUI Dialog
- MUI Drawer

Do not build raw modals manually.

Control flow:

```txt
Parent owns open state
    ↓
Dialog receives:
- open
- onClose
```

Example:

```tsx
<ConfirmDialog
  open={open}
  onClose={handleClose}
/>
```

Avoid nested dialogs unless explicitly required.

---

# 23. Table / List Rendering Rules

Use:

- reusable list/table components when possible
- stable entity IDs as keys

Correct:

```tsx
products.map((product) => (
  <ProductCard
    key={product.id}
    product={product}
  />
))
```

Avoid:

```tsx
key = {index}
```

unless list is static and never reordered.

List parent owns:

- data fetching
- loading
- error
- pagination

Leaf item receives props only.

---

# 24. Performance / Memoization Rules

Default:

- no premature optimization
- no unnecessary memoization

Avoid:

- wrapping everything in `React.memo`
- random `useMemo`
- random `useCallback`

Use memoization only when:

- measurable rerender issues
- expensive computation
- stable callback identity matters

---

# 25. Hooks Usage Rules Inside Components

Allowed:

- feature hooks
- form hooks
- UI hooks
- context hooks

Not allowed:

- raw API calls
- raw axios/fetch
- raw TanStack Query in components

Components should use:

- feature hooks
- `useAppQuery` wrappers indirectly through hooks
- mutation hooks indirectly through feature hooks

Correct:

```tsx
const {data} = useGetProducts();
```

Incorrect:

```tsx
useQuery(...)
axios.get(...)
fetch(...)
```

---

# 26. Import Rules

Use:

```txt
src/
```

imports only.

Correct:

```ts
import {Card} from 'src/components/Card';
```

Incorrect:

```ts
import {Card} from '@/components/Card';
```

Import order:

1. React/Next
2. external libraries
3. `src/*`
4. relative imports
5. styles

---

# 27. Barrel Export Rules

Use barrel exports intentionally.

Component folder:

```ts
export * from './ProductCard';
```

Global components barrel:

```ts
export * from './Card';
export * from './Modal';
```

Do not export private internal feature components globally.

---

# 28. Component Testing Philosophy

High-level philosophy:

- test behavior
- test accessibility
- test rendering states
- test forms
- test hooks separately

Avoid testing implementation details.

---

# 29. Anti-patterns

Do NOT:

- call APIs inside components
- create giant components
- duplicate MUI styling everywhere
- put feature components in `src/components`
- default export reusable components
- use raw hex colors
- create desktop-only layouts
- over-abstract too early
- use long inline Tailwind everywhere
- create circular imports

Bad:

```tsx
useEffect(() => {
  fetch('/api/products');
}, []);
```

Correct:

- move to feature hook

---

# 30. Strict Rules

Do NOT:

- use `@/` imports
- use raw axios/fetch in components
- use raw `useQuery` in components
- default export shared components
- put feature-specific UI in `src/components`
- put reusable UI in feature modules
- hardcode colors repeatedly
- create giant `sx` trees
- build custom modal systems
- use array index as key for dynamic lists
- create desktop-only UI by default

---

# 31. AI Agent Notes

When generating components:

- decide ownership first
- reuse `src/components` before creating new UI
- keep feature UI inside modules
- keep pages thin
- keep business logic inside hooks
- use `useAppQuery` indirectly through feature hooks
- use SCSS modules + Tailwind `@apply`
- use MUI primitives
- keep components mobile-first
- avoid premature abstraction
- avoid giant files
- avoid raw API logic in UI

The final UI architecture should remain:

- predictable
- scalable
- reusable
- responsive
- AI-agent-friendly
- consistent across all projects
