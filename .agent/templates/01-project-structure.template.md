# 01 Project Structure Template

This file defines the official folder structure and ownership rules for this boilerplate.

It is the source of truth for:

- where files should be placed
- how modules are organized
- what belongs in shared folders
- what belongs in feature modules
- import direction
- barrel export rules
- responsive/mobile-first expectations

---

# 1. Architecture Philosophy

This boilerplate uses a feature-first architecture.

The goal is to keep each feature/module easy to understand, easy to extend, and consistent across projects.

The structure should support different types of projects, including:

- e-commerce
- booking platforms
- admin portals
- content websites
- mobile-friendly web apps
- hybrid mobile-web experiences

The project must always be responsive and mobile-friendly by default.

---

# 2. Top-Level Structure

Expected structure:

```txt
src/
├── apis/
├── components/
├── configs/
├── context/
├── hooks/
├── layouts/
├── modules/
├── pages/
├── services/
├── shared/
├── styles/
├── theme/
└── types/
```

Some folders are optional depending on project size.

Do not create unnecessary folders if they are not needed.

---

# 3. Folder Responsibilities

## 3.1 `src/apis`

Contains centralized API client functions grouped by domain.

Example:

```txt
src/apis/
├── auth/
├── books/
├── orders/
└── index.ts
```

Use this folder for:

- endpoint constants
- API functions
- domain API barrels

Do not place API clients inside modules.

Correct:

```txt
src/apis/books/getBooks.ts
src/apis/books/endpoints.ts
```

Incorrect:

```txt
src/modules/Books/apis/getBooks.ts
```

All API functions must use the shared request client from `src/configs`.

---

## 3.2 `src/modules`

Contains feature-level modules.

Each module should own its own:

- screen component
- module-only components
- hooks
- models
- SCSS module file

Recommended module structure:

```txt
src/modules/Books/
├── components/
├── hooks/
├── models/
├── Books.tsx
├── books.module.scss
└── index.ts
```

The module should be lean but self-contained.

Do not move things to global folders unless they are truly reused outside this module.

---

## 3.3 `src/modules/<Module>/components`

Contains components that are only used by this module.

Example:

```txt
src/modules/Books/components/
├── BookCard/
├── BookFilters/
└── BookList/
```

Use module components for domain-specific UI.

Example:

- `BookCard`
- `BookingSummary`
- `UserRoleTable`
- `ProductFilterPanel`

If a component becomes reused by multiple modules, consider moving the reusable base version to:

```txt
src/components/
```

Example:

```txt
src/components/Card/
```

Then module-specific components can reuse it:

```tsx
import {Card} from 'src/components/Card';

export function BookCard() {
  return <Card>{/* book-specific content */}</Card>;
}
```

---

## 3.4 `src/components`

Contains reusable UI components shared across modules.

Examples:

```txt
src/components/
├── Button/
├── Card/
├── Modal/
├── Table/
├── Form/
├── EmptyState/
└── LoadingState/
```

Use this folder for generic UI only.

Allowed:

- reusable card
- reusable button
- reusable modal
- reusable table
- reusable form input
- reusable loading state
- reusable empty state

Not allowed:

- `BookCard`
- `OrderSummary`
- `AdminUserTable`
- feature-specific business components

Feature-specific components must stay inside their module first.

---

## 3.5 `src/configs`

Contains app-level configuration and infrastructure setup.

Examples:

```txt
src/configs/
├── request.ts
├── environment.ts
├── tokenManager.ts
└── queryClient.ts
```

Use this folder for:

- HTTP request client
- environment variables
- token manager
- app configuration
- query client configuration
- third-party config objects

Do not place UI components or feature logic here.

---

## 3.6 `src/context`

Contains React Context definitions and providers when Context is the selected state solution.

Example:

```txt
src/context/
├── UIContext.tsx
├── AuthContext.tsx
└── CartContext.tsx
```

Context is preferred for simple or medium app-level state.

Use Context for:

- UI state
- auth user/session state
- theme-related runtime state
- simple cart state
- layout state

Example:

```tsx
const UIContext = React.createContext<UIContextValue | undefined>(undefined);

export function UIProvider({children}: { children: React.ReactNode }) {
  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const context = React.useContext(UIContext);

  if (!context) throw new Error('useUI must be used inside UIProvider');

  return context;
}
```

Naming rules:

- Context file: `UIContext.tsx`
- Provider: `UIProvider`
- Hook: `useUI`

Do not create both `context/` and `providers/` unless the project clearly needs a separate provider composition layer.

Default recommendation:

- keep `src/context`
- optionally create `src/providers/AppProvider.tsx` only when many providers need to be composed together

Example optional provider composition:

```txt
src/providers/
└── AppProvider.tsx
```

```tsx
export function AppProvider({children}: { children: React.ReactNode }) {
  return (
    <UIProvider>
      <AuthProvider>{children}</AuthProvider>
    </UIProvider>
  );
}
```

---

## 3.7 `src/hooks`

Contains only generic reusable hooks used across multiple modules.

Allowed examples:

```txt
src/hooks/
├── useDebounce.ts
├── useDisclosure.ts
├── usePagination.ts
├── useWindowSize.ts
└── index.ts
```

Do not place feature-specific hooks here.

Correct:

```txt
src/modules/Books/hooks/useGetBooks.ts
```

Incorrect:

```txt
src/hooks/useGetBooks.ts
```

Feature-specific hooks must stay inside their module.

---

## 3.8 `src/layouts`

Contains reusable page layouts.

Example:

```txt
src/layouts/
├── PublicLayout/
├── PrivateLayout/
├── AdminLayout/
└── index.ts
```

Use this folder for:

- public site layout
- authenticated layout
- admin layout
- dashboard layout
- mobile layout wrapper

Layouts may contain:

- header
- footer
- sidebar
- navigation
- layout-level responsive behavior

Layouts must not:

- contain feature business logic
- call APIs directly
- own module state

---

## 3.9 `src/pages`

Contains Next.js Pages Router files.

Pages should be thin wrappers.

Pages may:

- read route params
- attach layout
- render modules
- handle page-level metadata if needed

Pages must not:

- contain large UI logic
- call API clients directly
- contain business rules
- duplicate module logic

Example:

```tsx
import {Books} from 'src/modules/Books';

export default function BooksPage() {
  return <Books/>;
}
```

If using layouts:

```tsx
BooksPage.getLayout = function getLayout(page: React.ReactElement) {
  return <PrivateLayout>{page}</PrivateLayout>;
};
```

---

## 3.10 `src/services`

Contains external service integrations only.

Examples:

- Firebase
- Stripe
- analytics
- websocket clients
- third-party SDK wrappers
- payment providers
- maps services
- notification services

Example:

```txt
src/services/
├── firebase/
├── stripe/
├── analytics/
└── socket/
```

Do not use `services` for normal API calls.

Normal backend API calls belong in:

```txt
src/apis/
```

If the project does not use external services, remove this folder.

---

## 3.11 `src/shared`

Contains reusable non-UI logic shared between modules/components.

Shared may contain:

- constants
- enums
- models
- types
- utils
- hooks if they are not placed in `src/hooks`
- form helpers
- API helpers
- validation schemas shared by multiple modules

Recommended:

```txt
src/shared/
├── constants/
├── enums/
├── models/
├── types/
├── utils/
├── validations/
└── helpers/
```

Do not place shared UI components here because shared UI components belong in:

```txt
src/components/
```

Do not move logic into `shared` too early.

Only move something to `shared` when:

- it is used by at least two modules
- it is not strongly tied to one domain
- it has a stable reusable purpose
- it does not create circular dependencies

---

## 3.12 `src/styles`

Contains global SCSS and Tailwind setup.

Example:

```txt
src/styles/
├── _app.scss
├── _core.scss
└── tailwind.scss
```

Use this folder for:

- global styles
- Tailwind imports
- reset/base styles
- app-wide SCSS variables/mixins if needed

Feature/module-specific styles should stay inside the module.

Example:

```txt
src/modules/Books/books.module.scss
```

---

## 3.13 `src/theme`

Contains MUI theme configuration.

Example:

```txt
src/theme/
├── core/
├── fonts/
├── helpers/
├── types/
└── AppThemeProvider.tsx
```

Use this folder for:

- palette
- typography
- breakpoints
- component overrides
- theme helpers
- custom MUI types
- theme provider

Do not hardcode colors, spacing, or typography if theme values already exist.

---

## 3.14 `src/types`

Contains global TypeScript declaration files and global-only types.

Examples:

```txt
src/types/
├── global.d.ts
├── next.d.ts
└── assets.d.ts
```

Most domain models should not go here.

Feature-specific models belong in:

```txt
src/modules/<Module>/models/
```

Reusable shared types belong in:

```txt
src/shared/types/
```

---

# 4. Module Anatomy

Each module should usually follow this structure:

```txt
src/modules/<ModuleName>/
├── components/
├── hooks/
├── models/
├── constants/
├── utils/
├── <ModuleName>.tsx
├── <module-name>.module.scss
└── index.ts
```

Example:

```txt
src/modules/Books/
├── components/
│   ├── BookCard/
│   ├── BookFilters/
│   └── BookList/
├── hooks/
│   ├── useGetBooks.ts
│   ├── useCreateBook.ts
│   └── index.ts
├── models/
│   ├── book.model.ts
│   ├── get-books.request.ts
│   ├── get-books.response.ts
│   └── index.ts
├── constants/
│   └── books.constants.ts
├── utils/
│   └── books.mapper.ts
├── Books.tsx
├── books.module.scss
└── index.ts
```

The main module component should:

- orchestrate hooks
- manage feature-level UI composition
- render module components
- avoid becoming too large

If the main module component becomes too large, split UI sections into module components.

---

# 5. Module SCSS Convention

Each module should use a module-level SCSS file.

Pattern:

```txt
<module-name>.module.scss
```

Example:

```txt
books.module.scss
admin.module.scss
checkout.module.scss
```

SCSS should commonly use Tailwind through `@apply`.

Example:

```scss
.books-wrapper {
  @apply flex flex-col gap-y-4;
}

.top-page-wrapper {
  @apply flex bg-white border shadow-md rounded-lg p-6 items-center justify-end;

  .add-product-btn {
    @apply flex items-center text-white font-bold py-2 px-4;
  }
}
```

Rules:

- use Tailwind for layout and spacing
- use SCSS nesting for module-specific styling
- keep styles scoped to the module
- avoid global class leakage
- use MUI theme values when styling MUI components
- keep mobile responsiveness in mind from the start

---

# 6. Responsive / Mobile-First Rule

All modules and components must be responsive by default.

When creating UI:

- design mobile layout first
- then enhance for tablet/desktop
- avoid fixed widths unless necessary
- use responsive Tailwind utilities
- use MUI breakpoints when styling MUI components
- test common mobile widths mentally during implementation

Examples:

```scss
.books-wrapper {
  @apply flex flex-col gap-y-4 px-4 md:px-6 lg:px-8;
}

.top-page-wrapper {
  @apply flex flex-col gap-4 md:flex-row md:items-center md:justify-between;
}
```

Do not build desktop-only layouts unless explicitly requested.

---

# 7. Import Rules

This project does not use `@` import alias by default.

Use imports from `src/`.

Correct:

```tsx
import {Card} from 'src/components/Card';
import {Books} from 'src/modules/Books';
import {APP_ROUTES} from 'src/shared/constants';
```

Incorrect:

```tsx
import {Card} from '@/components/Card';
```

Avoid long deep imports when a local barrel exists.

Preferred:

```tsx
import {useGetBooks} from './hooks';
import {BookCard} from './components';
```

Avoid:

```tsx
import {useGetBooks} from './hooks/useGetBooks';
import {BookCard} from './components/BookCard/BookCard';
```

---

# 8. Import Direction Rules

Follow this general dependency direction:

```txt
pages
  ↓
layouts
  ↓
modules
  ↓
components / hooks / shared / apis
  ↓
configs / theme
```

Allowed:

- pages import modules
- pages import layouts
- modules import their own hooks/components/models
- modules import shared components from `src/components`
- modules import reusable helpers from `src/shared`
- hooks import API functions from `src/apis`
- API functions import request client from `src/configs`

Not allowed:

- `src/apis` importing from `src/modules` components/hooks
- `src/shared` importing from `src/modules`
- `src/components` importing from feature modules
- `src/pages` containing API logic
- circular dependencies between modules

Important:

- Feature models may be imported by API clients only when needed for request/response typing.
- Models must never import API clients or hooks.

---

# 9. Shared vs Local Decision Rules

Keep code local first.

Move to `src/shared`, `src/components`, or `src/hooks` only when it is clearly reusable.

Before moving something global, ask:

1. Is it used by at least two modules?
2. Is it generic and not domain-specific?
3. Can it be reused without importing business logic?
4. Does moving it global make the project simpler?
5. Will it avoid duplication without creating confusion?

If the answer is no, keep it inside the module.

Examples:

Keep local:

```txt
modules/Books/components/BookCard
modules/Books/hooks/useGetBooks
modules/Books/utils/bookMapper.ts
```

Move global:

```txt
components/Card
hooks/useDebounce
shared/utils/formatCurrency.ts
shared/constants/appRoutes.ts
```

---

# 10. State Management Decision Rule

Default preference:

```txt
Context → Zustand → Redux Toolkit
```

Use Context when:

- state is simple
- state is app-level
- updates are not extremely frequent
- project is small or medium

Use Zustand when:

- state is shared across many modules
- Context becomes too nested or noisy
- state updates are frequent
- app needs a lightweight global store

Use Redux Toolkit only when:

- the app is large
- state flow is complex
- strong devtools/debugging structure is needed
- team/project specifically benefits from Redux conventions

Do not introduce Zustand or Redux unless the project clearly needs it.

---

# 11. Forms Standard

Default form stack:

```txt
react-hook-form + zod
```

Rules:

- form state should be inside form hooks
- validation schema should be close to the form if feature-specific
- shared schemas may live in `src/shared/validations`
- form submission should call mutation hooks
- form components should not call APIs directly

Example module structure:

```txt
src/modules/Login/
├── hooks/
│   ├── useLogin.ts
│   ├── useLoginForm.ts
│   └── index.ts
├── models/
├── login.schema.ts
├── Login.tsx
└── index.ts
```

---

# 12. Barrel Export Rules

Use local barrels to simplify imports.

Recommended:

```txt
src/modules/Books/hooks/index.ts
src/modules/Books/components/index.ts
src/modules/Books/models/index.ts
src/modules/Books/index.ts
```

Allowed:

```ts
export * from './useGetBooks';
export * from './useCreateBook';
```

Avoid giant global wildcard barrels that export unrelated domains.

Good:

```ts
// src/modules/Books/index.ts
export * from './Books';
```

Good:

```ts
// src/apis/books/index.ts
export * from './books';
export * from './endpoints';
```

Be careful with:

```ts
// src/apis/index.ts
export * from './books';
export * from './orders';
```

This is allowed only if the project already uses it and it does not create circular imports.

Do not create barrels that hide unclear ownership.

---

# 13. File Creation Rules

Before creating a new file:

1. Check if a similar file already exists
2. Follow the nearest existing pattern
3. Keep feature-specific files inside the module
4. Use shared/global folders only for reusable logic
5. Do not create empty folders preemptively

When adding a new module:

1. Create only the folders needed now
2. Add `components/` if module-specific components exist
3. Add `hooks/` if hooks exist
4. Add `models/` if request/response/domain types exist
5. Add `constants/` only if constants exist
6. Add `utils/` only if utilities/mappers exist

---

# 14. Example: New Books Module

Recommended structure:

```txt
src/modules/Books/
├── components/
│   ├── BookCard/
│   │   ├── BookCard.tsx
│   │   └── index.ts
│   └── index.ts
├── hooks/
│   ├── useGetBooks.ts
│   └── index.ts
├── models/
│   ├── book.model.ts
│   ├── get-books.request.ts
│   ├── get-books.response.ts
│   └── index.ts
├── Books.tsx
├── books.module.scss
└── index.ts
```

Associated API structure:

```txt
src/apis/books/
├── endpoints.ts
├── books.ts
└── index.ts
```

Associated page:

```txt
src/pages/books/index.tsx
```

Page example:

```tsx
import {Books} from 'src/modules/Books';

export default function BooksPage() {
  return <Books/>;
}
```

---

# 15. AI Agent Notes

When unsure:

- prefer module-local implementation
- avoid creating shared abstractions too early
- follow nearby patterns first
- do not create new architecture
- do not bypass existing folder conventions
- keep mobile responsiveness in mind
- use `src/` imports, not `@/`
- keep API functions in `src/apis`
- keep reusable UI in `src/components`
- keep shared non-UI logic in `src/shared`
- keep external integrations in `src/services`
- remove `src/services` if no external integrations exist

The final result should feel consistent, predictable, and easy for another developer or AI agent to extend.
