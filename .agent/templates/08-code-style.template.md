# 08 Code Style Template

This file is the source of truth for:

- coding style
- naming conventions
- TypeScript conventions
- imports/exports
- folder/file naming
- utility rules
- state ownership
- error handling
- general engineering consistency

The goal is:

```txt
Code written by humans and AI agents should look like it came from the same engineering team.
```

---

# 1. Code Style Philosophy

This boilerplate prioritizes:

| Principle     | Meaning                                 |
|---------------|-----------------------------------------|
| Predictable   | Same problem → same solution pattern    |
| Typed         | Strong TypeScript boundaries            |
| Layered       | UI, hooks, APIs, configs stay separated |
| Deterministic | AI agents generate consistent structure |
| Readable      | Explicit names over clever shortcuts    |
| Scalable      | Works for small and large projects      |
| Mobile-first  | Responsive by default                   |
| Feature-owned | Logic stays near the owning feature     |

---

# 2. Deterministic Code Rule

Every artifact should have:

- one predictable location
- one predictable naming style
- one predictable implementation pattern

When adding a new artifact:

| Need              | Location                            | Convention       |
|-------------------|-------------------------------------|------------------|
| Page              | `src/pages/`                        | thin wrapper     |
| Feature screen    | `src/modules/<Feature>/`            | `Feature.tsx`    |
| Feature component | `src/modules/<Feature>/components/` | `PascalCase.tsx` |
| Shared component  | `src/components/`                   | `PascalCase.tsx` |
| Query hook        | `src/modules/<Feature>/hooks/`      | `useGetX.ts`     |
| Mutation hook     | `src/modules/<Feature>/hooks/`      | `useCreateX.ts`  |
| API client        | `src/apis/<domain>/`                | `getX.ts`        |
| Schema            | `src/modules/<Feature>/schema/`     | `x.schema.ts`    |
| Utility           | `shared/util` or feature util       | `camelCase.ts`   |
| Mapper            | feature util                        | `mapXToY.ts`     |
| Constants         | feature/shared constants            | `*.constant.ts`  |

Do not invent new structures unless the existing architecture truly cannot support the requirement.

---

# 3. State Ownership Philosophy

State must live in the correct owner.

| State Type               | Owner                     |
|--------------------------|---------------------------|
| Server state             | TanStack Query            |
| Form state               | react-hook-form           |
| Local UI state           | `useState`                |
| Cross-feature app state  | Context / Zustand         |
| Auth/token state         | token manager + auth flow |
| Theme/UI app shell state | Context                   |

---

## Preferred order

```txt
Local state
    ↓
Feature state
    ↓
Context
    ↓
Zustand
    ↓
Redux
```

Do not introduce global state too early.

---

# 4. TypeScript Rules

The project uses strict TypeScript.

Expected:

```json
{
  "strict": true
}
```

Rules:

- avoid `any`
- use proper models/types
- use `unknown` when needed
- use type guards
- prefer typed boundaries
- avoid unsafe casts

---

## Prefer `type`

Preferred:

```ts
type Product = {
  id: string;
  name: string;
};
```

Use `interface` only when:

- extension is needed
- declaration merging is required

---

## Public boundaries must be typed

Examples:

- component props
- API params
- API responses
- hook returns
- utility params

Bad:

```ts
function update(data: any) {
}
```

Good:

```ts
function update(data: UpdateProductRequest) {
}
```

---

# 5. File Naming Rules

| Type           | Convention     | Example                     |
|----------------|----------------|-----------------------------|
| Component      | PascalCase     | `ProductCard.tsx`           |
| Hook           | `useCamelCase` | `useGetProducts.ts`         |
| Utility        | camelCase      | `formatCurrency.ts`         |
| Mapper         | camelCase      | `mapProductToTable.ts`      |
| Schema         | kebab-case     | `create-product.schema.ts`  |
| Request model  | kebab-case     | `create-product.request.ts` |
| Response model | kebab-case     | `get-products.response.ts`  |
| SCSS module    | PascalCase     | `ProductCard.module.scss`   |
| Barrel export  | `index.ts`     | `hooks/index.ts`            |
| Constants      | kebab-case     | `routes.constant.ts`        |

---

# 6. Folder Naming Rules

## Modules

Always use PascalCase.

Correct:

```txt
src/modules/
├── Authentication/
├── Products/
├── Orders/
├── Booking/
```

Incorrect:

```txt
authentication/
products/
```

---

## Route folders

Use kebab-case.

Correct:

```txt
src/pages/
├── contact-us/
├── reset-password/
├── order-history/
```

Incorrect:

```txt
contact_us/
reset_password/
```

---

## Shared folders

Use lowercase.

Correct:

```txt
shared/
hooks/
util/
models/
constants/
```

---

# 7. Component Naming Rules

Component names must describe responsibility clearly.

Correct:

```txt
ProductCard
ProductList
ProductTable
ProductFilters
ProductDetailPopup
CheckoutSummary
BookingCalendar
```

Avoid generic names:

```txt
List
Table
Popup
Card
Item
```

unless inside reusable shared UI folder.

---

## Naming collision rule

Always include domain context.

Good:

```txt
ProductTable
OrderTable
ClientTable
```

Bad:

```txt
Table
```

This is VERY important for AI-generated projects.

---

# 8. Hook Naming Rules

Hooks must start with `use`.

---

## Query hooks

```txt
useGetProducts
useGetProductDetail
useSearchProducts
```

Must use:

```txt
useAppQuery
```

internally.

---

## Mutation hooks

```txt
useCreateProduct
useUpdateProduct
useDeleteProduct
```

Must use:

```txt
useMutation
```

internally.

---

## Form hooks

```txt
useLoginForm
useCreateProductForm
```

---

## UI hooks

```txt
usePagination
useDebounce
useModal
```

---

# 9. API Function Naming Rules

API functions live in:

```txt
src/apis/<domain>/
```

Examples:

```txt
getProducts
getProductDetail
createProduct
updateProduct
deleteProduct
login
logout
refreshToken
```

Avoid:

```txt
fetchProducts
callProductsApi
```

---

## Endpoint constants

Always use endpoint constants.

Correct:

```ts
PRODUCTS_ENDPOINTS.GET_PRODUCTS
```

Incorrect:

```ts
'/products'
```

hardcoded repeatedly.

---

# 10. Model / Type Naming Rules

| Type       | Convention           |
|------------|----------------------|
| Request    | `CreateXRequest`     |
| Response   | `GetXResponse`       |
| Entity     | `Product`            |
| Table row  | `ProductTableRow`    |
| Filters    | `GetProductsFilters` |
| Pagination | `PaginationResponse` |
| Error      | `ErrorResponse`      |

---

## zod inferred types

Preferred:

```ts
export type CreateProductRequest =
  z.infer<typeof createProductSchema>;
```

---

# 11. Constant Naming Rules

Use:

```ts
export const APP_ROUTES = {};
export const PRODUCTS_ENDPOINTS = {};
export const NOTIFY_MESSAGES = {};
```

---

## Constant keys

Use:

```txt
SCREAMING_SNAKE_CASE
```

Example:

```ts
APP_ROUTES.PRODUCTS
NOTIFY_MESSAGES.CREATE_SUCCESS
```

---

# 12. Enum Naming Rules

Use enum only for stable backend-owned sets.

Example:

```ts
export enum USER_ROLE {
  ADMIN = 'admin',
  STAFF = 'staff',
}
```

Prefer `as const` for UI-only constants.

---

# 13. Event Handler Naming Rules

## Internal handlers

Use:

```txt
handleSubmit
handleClose
handleOpenModal
handleDelete
```

---

## Callback props

Use:

```txt
onSubmit
onClose
onDelete
```

Avoid:

- `click`
- `doAction`
- `submitHandler`

---

# 14. Boolean Naming Rules

| Prefix | Usage         |
|--------|---------------|
| is     | boolean state |
| has    | existence     |
| can    | permission    |
| should | behavior      |

Examples:

```ts
isLoading
isOpen
hasPermission
canEdit
shouldRefetch
```

---

# 15. Import Rules

Use:

```txt
src/
```

imports only.

Correct:

```ts
import {ProductCard} from 'src/modules/Products/components';
```

Incorrect:

```ts
import {ProductCard} from '@/modules/Products/components';
```

---

## Import order

1. React / Next
2. external libraries
3. `src/shared`
4. `src/components`
5. `src/layouts`
6. `src/modules`
7. relative imports
8. styles

---

## Avoid deep relative imports

Bad:

```ts
..
/../..
/shared/u
til
```

Good:

```ts
src / shared / util
```

---

# 16. Export Rules

Use named exports.

Correct:

```ts
export function ProductCard() {
}
```

Incorrect:

```ts
export default ProductCard;
```

---

## Default export allowed only for

```txt
src/pages/**
```

and Next.js required files.

---

# 17. Barrel Export Rules

Each folder should expose public API through:

```txt
index.ts
```

Example:

```ts
export * from './ProductCard';
```

Do not export internal-only files.

---

# 18. Function Rules

Prefer:

- small functions
- pure functions
- explicit params
- early returns
- single responsibility

Bad:

```ts
function process(data) {
  // 500 lines
}
```

Good:

```ts
function mapProductsToTableRows() {
}

function calculateOrderTotal() {
}

function validateCheckoutStep() {
}
```

---

# 19. Async / Await Rules

Use:

- `async/await`
- mutation callbacks
- typed promises

Avoid:

- `.then()` chains
- nested async callbacks

Correct:

```ts
export async function createProduct(
  payload: CreateProductRequest,
): Promise<CreateProductResponse> {
  return await request.post(
    PRODUCTS_ENDPOINTS.CREATE_PRODUCT,
    payload,
  );
}
```

---

# 20. Error Handling Rules

## Ownership

| Layer          | Responsibility       |
|----------------|----------------------|
| request client | normalize errors     |
| mutation hook  | toast + invalidation |
| query hook     | expose error         |
| component      | render error state   |

---

## Rules

Do not:

- swallow errors
- `console.log` only
- parse Axios errors inside UI repeatedly

Use:

- shared error model
- normalized error handling
- reusable error states

---

# 21. Environment Variable Rules

Centralize env access.

Correct:

```txt
src/configs/environment.ts
```

Avoid:

- scattered `process.env`
- magic env names everywhere

---

## Client envs

Must use:

```txt
NEXT_PUBLIC_
```

prefix.

---

# 22. Comments Rules

Prefer:

- self-documenting code
- descriptive naming

Comment:

- WHY
- business constraints
- architecture constraints

Avoid:

```ts
// increment count
count++;
```

---

# 23. TODO Rules

Use:

```ts
// TODO(ENG-123): implement refresh retry
```

Avoid:

```ts
// TODO fix later
```

---

# 24. Utility Function Rules

Utility belongs in:

- `src/shared/util`
- feature `util`

Do not create utility too early.

Create utility only when:

- reused
- meaningful abstraction
- improves readability

Avoid:

- one-line wrapper utils
- duplicated helpers
- random formatting utilities

---

# 25. Mapper Function Rules

Use mapper when:

- API shape differs from UI
- table rows differ from entity
- form values differ from payload

Naming:

```txt
mapProductToTableRow
mapBookingToCalendarEvent
mapProductResponseToFormValues
```

Mappers must:

- be pure
- not call APIs
- not mutate input

---

# 26. Classname Rules

Preferred styling:

```txt
SCSS modules + Tailwind @apply
```

---

## SCSS class naming

Use:

- kebab-case
- descriptive names

Example:

```scss
.product-card {
}

.product-card--featured {
}
```

---

## Conditional classes

Use:

- `classnames`
- `clsx`

Example:

```tsx
className = {
  cn(
    classes['product-card'],
  isFeatured && classes['product-card--featured'],
)
}
```

---

# 27. Type Guard Rules

Use type guards for:

- unknown API response
- union narrowing
- external integrations

Example:

```ts
export function isErrorResponse(
  value: unknown,
): value is ErrorResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value
  );
}
```

Avoid:

- unsafe casts
- `as any`

---

# 28. Null / Undefined Rules

Use:

- optional chaining
- nullish coalescing

Correct:

```ts
data?.pagination?.page ?? 1
```

Avoid:

- non-null assertion (`!`)
- unsafe nested access

---

# 29. Date / Number / Currency Formatting Rules

Formatting belongs in:

- shared util
- formatter helpers

Do not format inline repeatedly.

Correct:

```ts
formatCurrency(price)
formatDate(date)
```

Avoid:

```tsx
$
{
  price.toFixed(2)
}
```

everywhere.

---

# 30. Context Rules

Context should be used intentionally.

Good use cases:

- auth state
- theme state
- UI shell state
- app-wide preferences

Bad use cases:

- modal open state
- table filters
- component-local state

Prefer:

- local state
- prop composition

before Context.

---

# 31. Composition vs Config Philosophy

Prefer:

- component composition
- explicit JSX

over giant config objects.

Good:

```tsx
<Table>
  <TableToolbar/>
  <TableFilters/>
  <ProductTableRows/>
</Table>
```

Bad:

```tsx
<Table
  filters={...}
  actions={...}
  config={...}
  permissions={...}
/>
```

unless truly reusable.

---

# 32. Avoid Over-engineering

Do not introduce:

- repository pattern
- service layer explosion
- unnecessary abstractions
- over-generic components
- premature reusable systems

Prefer:

- simple
- explicit
- feature-owned code

---

# 33. Feature Ownership Priority

Preferred ownership order:

```txt
feature-local
    ↓
shared
    ↓
global reusable
```

Do not globalize feature logic too early.

---

# 34. Linting / Formatting Rules

Use:

- ESLint
- Prettier
- strict TS

Do not:

- disable lint silently
- use `@ts-ignore` casually
- commit inconsistent formatting

---

# 35. Anti-patterns

Do NOT:

- use `any`
- use `@/`
- call APIs in components
- use raw `useQuery` in features
- hardcode routes repeatedly
- duplicate utilities
- create giant components
- create unnecessary Context
- over-abstract
- create circular imports
- use global CSS for feature styles
- create desktop-only UI

---

# 36. Strict Rules

1. Use strict TypeScript.
2. Use named exports.
3. Use `src/` imports.
4. Pages stay thin.
5. Components never call APIs directly.
6. Query hooks use `useAppQuery`.
7. Mutation hooks use `useMutation`.
8. Forms use RHF + zod.
9. Shared UI belongs in `src/components`.
10. Feature logic belongs in modules.
11. Avoid premature abstractions.
12. Keep code mobile-first.
13. Use SCSS modules + Tailwind `@apply`.
14. Use MUI `sx` only when theme-aware.
15. Do not introduce new architecture patterns casually.

---

# 37. AI Agent Notes

Before creating code:

1. Identify ownership layer.
2. Search for reusable existing implementation.
3. Follow naming conventions exactly.
4. Keep feature logic inside module.
5. Use existing hooks/utilities/components first.
6. Use typed boundaries everywhere.
7. Keep pages thin.
8. Use mobile-first responsive patterns.
9. Avoid over-engineering.
10. Avoid creating new architecture patterns.

When uncertain:

- prefer feature-local
- prefer explicit
- prefer simpler architecture
- follow existing project conventions first

The final codebase should feel:

- consistent
- scalable
- predictable
- AI-agent-friendly
- production-grade
- easy to navigate
