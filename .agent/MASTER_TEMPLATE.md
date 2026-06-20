# AI Agent Master Template

This folder is the source of truth for how this boilerplate should be used, extended, and refactored.

Before making any implementation, the AI agent must:

1. Read this `MASTER_TEMPLATE.md`
2. Read the relevant files inside `.agent/templates`
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
2. Rules inside `.agent/templates`
3. Existing examples inside `.agent/examples`
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

Reusable utilities, domain services, and app context live outside modules — see `01-project-structure.template.md` §3.6, §3.11, §9.

Example:

```txt
src/modules/Books/
├── components/
├── hooks/
├── models/
├── constants/
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

## 3.2 Routing & layouts

This boilerplate uses **Next.js Pages Router** and standard layouts **`PublicLayout`** / **`PrivateLayout`** (plus optional **`AdminLayout`**).

**Canonical rules:** `01-project-structure.template.md` §1.1 (routing), §3.8 (layouts). **Examples:** `examples/layout-example.md`.

Summary:

- Routes in `src/pages/` with `_app.tsx`, `_document.tsx`, and `Page.getLayout`
- No `src/app/` or App Router route files unless explicitly requested
- Layout folders: exactly 3 files each; header/footer/sidebar chrome in `src/components/`
- With auth: `PublicLayout` + `PrivateLayout`; without auth: `PublicLayout` only

---

## 3.3 Shared vs feature ownership

**Canonical rules:** `01-project-structure.template.md` §3.6 (`context/`), §3.10–§3.11 (`services/`, `shared/`), §9 (decision rules).

Summary:

- Modules own UI, hooks, models, constants
- `src/shared/utils/`, `src/shared/services/`, `src/context/` hold reusable or app-level logic
- Do not nest `context/`, domain `services/`, or promotable `utils/` inside modules

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

## 3.4 API flow

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

## 3.5 Styling (summary)

MUI + Tailwind + SCSS Modules. Full rules: `04-mui-theme.template.md`, `05-tailwind-style.template.md`.

---

# 4. Current Expected Project Structure

Example (see `01-project-structure.template.md` for ownership rules):

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
├── providers/
├── shared/
│   ├── constants/
│   ├── utils/
│   └── services/
├── styles/
└── theme/
```

---

# 5. Required Template Files

Always read the relevant template files before implementation.

| Concern                  | Template                           |
|--------------------------|------------------------------------|
| Project structure, routing, layouts | `01-project-structure.template.md` |
| API architecture         | `02-api-structure.template.md`     |
| Authentication           | `03-auth-flow.template.md`         |
| MUI theme usage          | `04-mui-theme.template.md`         |
| Tailwind/SCSS usage      | `05-tailwind-style.template.md`    |
| Component architecture   | `06-component-rules.template.md`   |
| Forms & validation       | `07-form-handling.template.md`     |
| Naming/import/code style | `08-code-style.template.md`        |
| Layout `getLayout` examples | `examples/layout-example.md`    |

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

See §3.5 and `04-mui-theme.template.md`, `05-tailwind-style.template.md`.

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
- Use App Router (`src/app/`, `layout.tsx`, `page.tsx` as route files)
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

