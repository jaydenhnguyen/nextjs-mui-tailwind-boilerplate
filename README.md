# Frontend Boilerplate

A scalable frontend boilerplate built with:

- Next.js Pages Router
- TypeScript
- MUI
- Tailwind CSS
- SCSS Modules
- TanStack Query
- react-hook-form + zod

Designed for:

- e-commerce platforms
- booking systems
- admin portals
- content websites
- hybrid mobile-web applications

---

# Features

- Feature/module-first architecture
- Mobile-first responsive UI
- Reusable UI component system
- Centralized API layer
- TanStack Query integration
- MUI design system
- Tailwind + SCSS Modules styling architecture
- RHF + zod form handling
- Authentication-ready architecture
- Layout-based route structure
- AI-agent-friendly engineering standards

---

# Tech Stack

## Core

- Next.js Pages Router
- React
- TypeScript

---

## UI

- MUI
- Tailwind CSS
- SCSS Modules
- Framer Motion

---

## Data & Forms

- TanStack Query
- react-hook-form
- zod

---

## Utilities

- classnames / clsx
- date-fns / dayjs (project-dependent)

---

# Quick Start

## Install dependencies

```bash
npm install
```

---

## Start development server

```bash
npm run dev
```

---

## Build production

```bash
npm run build
```

---

## Start production server

```bash
npm run start
```

---

# Project Structure

```txt
src/
├── apis/
├── components/
├── configs/
├── contexts/
├── hooks/
├── layouts/
├── models/
├── modules/
├── pages/
├── shared/
├── styles/
├── theme/
└── utils/
```

---

# Architecture Philosophy

## Thin Pages

Pages inside:

```txt
src/pages/
```

should remain thin wrappers.

Pages should:

- define route entry
- optionally define SEO
- optionally define `getLayout`
- render feature module root

Business logic should stay inside feature modules.

---

## Feature-first Structure

Feature/domain logic belongs inside:

```txt
src/modules/<Feature>
```

Example:

```txt
src/modules/
├── Authentication/
├── Products/
├── Orders/
├── Booking/
```

Each feature owns:

- components
- hooks
- forms
- schemas
- models
- constants
- utilities

---

## Shared Reusable UI

Reusable generic UI belongs in:

```txt
src/components
```

Examples:

```txt
Button
Card
Modal
Table
Form
LoadingState
ErrorState
```

Feature-specific UI should remain inside feature modules.

---

## API Layer

API clients belong in:

```txt
src/apis/
```

Components should NEVER call APIs directly.

Query hooks:

- use `useAppQuery`

Mutation hooks:

- use `useMutation`

---

# Styling System

This boilerplate uses:

```txt
MUI            → design system + UI primitives
Tailwind       → layout + utility classes
SCSS Modules   → scoped styling
MUI sx         → theme-aware one-off styling
```

Preferred styling pattern:

```txt
SCSS Modules + Tailwind @apply
```

---

# Routing Strategy

- Next.js Pages Router
- thin pages
- `getLayout` pattern
- centralized `APP_ROUTES`
- layout-based auth structure

Layouts live in:

```txt
src/layouts/
```

---

# State Management Strategy

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

Use the simplest solution first.

---

# Responsive Design

All UI should be:

- mobile-first
- responsive by default
- tablet-friendly
- desktop-enhanced

Avoid:

- fixed desktop layouts
- non-responsive components
- desktop-only assumptions

---

# Engineering Standards

## Components

- reusable UI → `src/components`
- feature UI → `src/modules/<Feature>/components`
- named exports only
- avoid giant components

---

## Forms

- RHF + zod
- schemas outside TSX
- mutation-based submission
- reusable `Control*` fields

---

## APIs

- centralized API clients
- endpoint constants
- typed requests/responses
- normalized error handling

---

## Styling

- SCSS Modules + Tailwind `@apply`
- MUI theme tokens
- avoid raw hex colors
- avoid feature global CSS

---

## TypeScript

- strict typing
- avoid `any`
- typed boundaries everywhere
- feature-local ownership first

---

# Environment Variables

Environment access should be centralized.

Recommended:

```txt
src/configs/environment.ts
```

Client variables must use:

```txt
NEXT_PUBLIC_
```

---

# Available Scripts

| Script               | Description              |
|----------------------|--------------------------|
| `npm run dev`        | Start development server |
| `npm run build`      | Build production app     |
| `npm run start`      | Start production server  |
| `npm run lint`       | Run ESLint               |
| `npm run type-check` | Run TypeScript checks    |

---

# AI Agent Support

This boilerplate includes:

```txt
.ai/
```

which contains:

- architecture templates
- engineering conventions
- AI generation rules
- deterministic frontend patterns

Recommended for:

- Cursor
- Claude Code
- OpenAI agents
- Copilot Workspace

---

# Contributing

Before contributing:

1. Follow existing architecture patterns.
2. Reuse existing components/hooks/utilities when possible.
3. Keep feature logic inside modules.
4. Avoid introducing new conventions unnecessarily.
5. Keep components mobile-first and responsive.

---

# Golden Rules

- Components never call APIs directly
- Pages stay thin
- Feature logic stays inside modules
- Shared UI remains generic
- Prefer explicit architecture over hidden abstractions
- Mobile-first by default

---

# Anti-patterns

Do NOT:

- use `@/` imports
- call APIs inside components
- use raw `useQuery` in components
- use Formik
- create giant components
- duplicate styling systems
- create unnecessary Context
- hardcode routes repeatedly
- introduce new architecture patterns casually

---

# Future AI System Extensions

```txt
.ai/
├── templates/
├── prompts/
└── context/
```

Potential future additions:

```txt
.ai/prompts/
├── create-feature.prompt.md
├── create-page.prompt.md
├── create-crud.prompt.md
└── create-admin-module.prompt.md
```

---

# Goal

This boilerplate is designed to remain:

- scalable
- predictable
- reusable
- mobile-friendly
- production-grade
- AI-agent-friendly
- easy to extend across many projects
