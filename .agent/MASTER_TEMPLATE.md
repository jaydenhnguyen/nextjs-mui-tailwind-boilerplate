# AI Agent Master Template

This folder is the source of truth for how this boilerplate should be used, extended, and refactored.

Before making any implementation, the AI agent must:

1. Read this `MASTER_TEMPLATE.md`
2. Read the relevant files inside `.ai/templates`
3. Inspect the existing codebase patterns before introducing new patterns

---

# 1. Main Goal

The purpose of this boilerplate is to maintain:

- Consistent architecture
- Predictable folder structure
- Scalable feature organization
- Reusable patterns
- Strict separation of concerns
- AI-agent-friendly conventions

Every new feature should feel like it belongs to the same codebase.

---

# 2. Priority Order

When making decisions, follow this order strictly:

1. Existing codebase conventions
2. Rules inside `.ai/templates`
3. Existing examples inside `.ai/examples`
4. General best practices

Do not introduce a new architecture unless explicitly requested.

---

# 3. Core Architecture Rules

## 3.1 Feature-first architecture

The app uses a feature/module-based structure.

Each feature owns:

- hooks
- models
- feature components
- constants
- utilities

Example:

```txt
src/modules/Books/
├── components/
├── hooks/
├── models/
├── constants/
├── utils/
├── Books.tsx
└── index.ts
```

Avoid placing feature-specific logic in global folders.

---

## 3.2 Thin pages

Pages are routing wrappers only.

Pages should:

- handle route params
- attach layouts
- render module components

Pages must NOT:

- call APIs directly
- contain business logic
- contain large UI logic

Example:

```tsx
export default function BooksPage() {
  return <Books/>;
}
```

---

## 3.3 API flow

All API calls must follow this flow:

```txt
Component/Page
    ↓
Feature Hook
    ↓
API Client
    ↓
Shared Request Client
    ↓
Backend
```

Components and pages must never call HTTP directly.

---

## 3.4 Shared vs Feature ownership

### Global folders are ONLY for reusable logic

Examples:

```txt
src/components/
src/hooks/
src/shared/
```

These should contain generic reusable logic only.

### Feature-specific logic belongs inside modules

Example:

```txt
modules/Books/components/BookCard
modules/Books/hooks/useGetBooks
```

NOT:

```txt
components/BookCard
hooks/useGetBooks
```

unless truly reusable across multiple features.

---

# 4. Current Expected Project Structure

Example:

```txt
src/
├── apis/
│   ├── auth/
│   ├── books/
│   ├── orders/
│   └── index.ts
│
├── components/
│   ├── Button/
│   ├── Modal/
│   ├── Table/
│   └── Form/
│
├── configs/
│   ├── request.ts
│   ├── environment.ts
│   └── tokenManager.ts
│
├── hooks/
│   ├── useDebounce.ts
│   ├── useDisclosure.ts
│   └── useWindowSize.ts
│
├── layouts/
│   ├── PrivateLayout/
│   ├── PublicLayout/
│   └── index.ts
│
├── modules/
│   ├── Books/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── models/
│   │   ├── constants/
│   │   ├── utils/
│   │   ├── Books.tsx
│   │   └── index.ts
│   │
│   ├── Cart/
│   ├── Users/
│   └── Admin/
│
├── pages/
│
├── providers/
│   ├── AppProvider.tsx
│   ├── AuthProvider.tsx
│   └── QueryProvider.tsx
│
├── shared/
│   ├── constants/
│   ├── enums/
│   ├── models/
│   ├── types/
│   └── utils/
│
├── styles/
│   ├── _app.scss
│   ├── _core.scss
│   └── tailwind.scss
│
├── theme/
│   ├── core/
│   ├── fonts/
│   ├── helpers/
│   ├── types/
│   └── AppThemeProvider.tsx
│
└── types/
```

---

# 5. Required Template Files

Always read the relevant template files before implementation.

| Concern                  | Template                           |
|--------------------------|------------------------------------|
| Project structure        | `01-project-structure.template.md` |
| API architecture         | `02-api-structure.template.md`     |
| Authentication           | `03-auth-flow.template.md`         |
| MUI theme usage          | `04-mui-theme.template.md`         |
| Tailwind/SCSS usage      | `05-tailwind-style.template.md`    |
| Component architecture   | `06-component-rules.template.md`   |
| Forms & validation       | `07-form-handling.template.md`     |
| Routing/layout rules     | `08-routing-layout.template.md`    |
| Naming/import/code style | `09-code-style.template.md`        |

---

# 6. Naming Rules

## Components

Use PascalCase.

Example:

```txt
BookCard.tsx
UserProfileModal.tsx
```

---

## Hooks

Use:

```txt
useX.ts
```

Examples:

```txt
useGetBooks.ts
useCreateOrder.ts
useLoginForm.ts
```

---

## API functions

Use verb-based naming.

Examples:

```txt
getBooks
getBookDetail
createOrder
updateProfile
login
logout
```

---

## Constants

Use:

```txt
SCREAMING_SNAKE_CASE
```

Examples:

```txt
BOOK_ENDPOINTS
APP_ROUTES
USER_STATUS
```

---

# 7. Shared Hook Rules

Global hooks inside `src/hooks` must be generic and reusable.

Allowed examples:

```txt
useDebounce
useDisclosure
usePagination
useWindowSize
```

Feature-specific hooks must stay inside modules.

---

# 8. Styling Rules

The project uses:

- MUI
- Tailwind
- SCSS

Rules:

- Reuse theme values before hardcoding
- Prefer existing spacing and typography scale
- Prefer Tailwind utility classes for layout
- Use SCSS for complex styling only
- Reuse shared components before creating new UI
- Do not introduce another styling system

---

# 9. AI Agent Workflow

## Before coding

The AI agent must:

1. Read `MASTER_TEMPLATE.md`
2. Read all relevant templates
3. Inspect existing implementation patterns
4. Identify reusable hooks/components/utils/constants
5. Explain the planned structure briefly

---

## During coding

The AI agent must:

1. Follow existing patterns
2. Keep files small and focused
3. Avoid duplicate abstractions
4. Reuse shared infrastructure
5. Keep business logic inside modules/hooks
6. Use explicit TypeScript types at API boundaries

---

## After coding

The AI agent must verify:

1. No component calls HTTP directly
2. Pages remain thin wrappers
3. API calls follow the correct architecture
4. Imports do not create circular dependencies
5. Styling follows MUI/Tailwind conventions
6. New files follow naming conventions
7. Feature ownership is respected

---

# 10. Strict Rules

Do NOT:

- Call APIs directly inside components/pages
- Put business logic inside pages
- Create one-off HTTP clients
- Create duplicate hooks/utilities
- Hardcode API paths
- Hardcode colors if theme values exist
- Ignore existing MUI theme configuration
- Put feature logic into shared folders unnecessarily
- Use `any` without justification
- Create inconsistent folder structures
- Introduce a different architecture style

---

# 11. Preferred Engineering Style

Prefer:

- readable code
- predictable patterns
- composition over complexity
- reusable abstractions
- explicit naming
- small focused files
- strict ownership boundaries

Avoid:

- over-engineering
- deeply nested logic
- giant components
- giant hooks
- magic abstractions
- premature genericization

---

# 12. Completion Output Format

When completing a task, respond with:

```md
## Summary

Brief explanation of what was implemented.

## Files Created

- ...

## Files Modified

- ...

## Reused Existing Patterns

- ...

## Template Rules Followed

- ...

## Notes / Assumptions

- ...
```

---

# 13. Final Instruction

This boilerplate prioritizes:

- consistency
- scalability
- maintainability
- deterministic AI generation

Every implementation should look like it was written by the same engineering team.

