Read all files inside `.ai/templates/`.

Strictly follow:

- architecture
- folder structure
- naming conventions
- styling conventions
- query patterns
- auth flow
- component ownership
- routing/layout conventions
- form handling conventions
- code style conventions

Create a new feature module.

Requirements:

- follow feature/module-first structure
- use thin pages
- use named exports
- use `src/` imports
- keep components mobile-first
- use MUI + Tailwind + SCSS Modules
- use reusable shared components first
- keep business logic inside hooks/modules
- use RHF + zod for forms
- use `useAppQuery` for queries
- use `useMutation` for writes

Before creating new files:

- search for reusable existing implementations
- reuse existing hooks/components/utilities first

Do NOT:

- introduce new architecture patterns
- create unnecessary abstractions
- call APIs inside components
- use raw `useQuery` directly in components
- use Formik
- use `@/` imports
- create giant components
- create desktop-only UI

Generate:

- module structure
- components
- hooks
- models
- schemas
- constants
- API integration
- routing integration
- responsive UI
- loading/error states
