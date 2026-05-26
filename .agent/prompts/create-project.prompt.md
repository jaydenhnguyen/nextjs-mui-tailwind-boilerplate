Read all files inside:

```txt
.ai/templates/
```

Then act as a senior frontend engineer and architect.

Your task is to generate a COMPLETE new project that STRICTLY follows this boilerplate architecture and engineering
standards.

The generated project must feel like it was built by the same engineering team that created this boilerplate.

---

# Project Requirements

Before generating anything:

1. Understand the project type.
2. Identify the main features/modules.
3. Design the architecture using the existing boilerplate conventions.
4. Reuse existing patterns before creating new abstractions.

The generated project must:

- be production-grade
- scalable
- mobile-first
- AI-agent-friendly
- feature/module-first
- deterministic
- strongly typed
- responsive
- maintainable

---

# Mandatory Architecture Rules

The project MUST follow ALL conventions inside:

```txt
.ai/templates/
```

including:

- project structure
- API architecture
- auth flow
- MUI theme conventions
- Tailwind conventions
- component rules
- form handling
- routing/layout rules
- code style conventions

---

# Required Stack

Use:

- Next.js Pages Router
- TypeScript
- MUI
- Tailwind CSS
- SCSS Modules
- TanStack Query
- react-hook-form
- zod

---

# Architecture Rules

## Pages

Pages inside:

```txt
src/pages/
```

must remain thin.

Pages should:

- define route entry
- optionally define SEO
- optionally define getLayout
- render feature module root

Pages must NOT:

- contain business logic
- call APIs directly
- contain large JSX composition

---

## Modules

Business/domain logic belongs in:

```txt
src/modules/<Feature>/
```

Each feature owns:

- components
- hooks
- schemas
- forms
- models
- constants
- utilities

---

## Components

Reusable generic UI belongs in:

```txt
src/components/
```

Feature-specific UI belongs in:

```txt
src/modules/<Feature>/components/
```

Components must NEVER:

- call APIs directly
- use raw fetch/axios
- contain server state logic

---

## APIs

API clients belong in:

```txt
src/apis/
```

Query hooks:

- use `useAppQuery`

Mutation hooks:

- use `useMutation`

---

## Forms

Forms must use:

- react-hook-form
- zod
- reusable `Control*` fields

Forms must:

- use schemas outside TSX
- use mutation hooks for submission
- remain responsive/mobile-friendly

---

## Styling

Use:

- MUI for design system
- Tailwind for utilities/layout
- SCSS Modules for scoped styling
- MUI `sx` only for theme-aware one-off styling

Preferred styling pattern:

```txt
SCSS Modules + Tailwind @apply
```

---

## Routing

Use:

- Next.js Pages Router
- getLayout pattern
- centralized APP_ROUTES
- layout-based auth structure

Do NOT use:

- App Router
- layout.tsx
- page.tsx
- server components

---

# State Management Rules

Preferred order:

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

Do NOT introduce global state unnecessarily.

---

# Mobile-first Rules

All UI must:

- work on mobile first
- scale to tablet/desktop
- avoid fixed desktop widths
- support responsive layouts
- support touch interactions

---

# Engineering Standards

The generated project must:

- use strict TypeScript
- avoid any
- use named exports
- use src/ imports
- avoid giant components
- avoid over-engineering
- avoid premature abstractions
- follow deterministic naming conventions

---

# Reusability Rules

Before creating:

- components
- hooks
- utilities
- layouts
- form controls

ALWAYS:

1. search existing reusable implementations
2. reuse existing patterns
3. extend existing architecture first

Do NOT duplicate existing patterns unnecessarily.

---

# Loading / Error Rules

Every async screen should support:

- loading state
- error state
- empty state

Use reusable shared state components whenever possible.

---

# Accessibility Rules

Generated UI should:

- use semantic HTML
- support keyboard navigation
- preserve visible focus
- support screen readers
- use proper labels

---

# Deliverables

Generate:

- project structure
- pages
- layouts
- modules
- components
- hooks
- APIs
- forms
- schemas
- constants
- models
- responsive layouts
- loading/error states
- routing integration
- auth integration if needed

---

# Important Constraints

Do NOT:

- use `@/` imports
- use Formik
- use raw `useQuery` directly in components
- call APIs directly inside components
- hardcode repeated routes
- create giant files
- create desktop-only layouts
- create unnecessary Context
- introduce new architecture patterns casually

---

# AI Behavior Rules

When uncertain:

- follow existing project conventions first
- prefer feature-local ownership
- prefer simpler architecture
- prefer explicit composition
- prefer reusable shared primitives

Avoid:

- over-engineering
- magic abstractions
- generic enterprise patterns
- unnecessary complexity

---

# Expected Output Quality

The generated project should feel:

- production-grade
- scalable
- consistent
- maintainable
- responsive
- deterministic
- senior-engineer-level
- AI-agent-friendly

The final codebase should look like it was built by a disciplined frontend engineering team following one unified
architecture system.
