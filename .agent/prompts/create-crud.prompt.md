Read all files inside `.ai/templates/`.

Generate a full CRUD feature module.

Requirements:

- feature/module-first architecture
- centralized API layer
- typed request/response models
- useAppQuery for queries
- useMutation for mutations
- RHF + zod forms
- responsive mobile-first UI
- reusable table/list structure
- reusable modal/form structure

Generate:

- list page
- create form
- update form
- delete flow
- detail view if appropriate
- query hooks
- mutation hooks
- schemas
- models
- constants
- loading/error/empty states

Architecture:

- pages stay thin
- business logic inside hooks
- reusable UI in src/components
- feature-specific UI in module components

Use:

- MUI
- Tailwind
- SCSS Modules

Do NOT:

- call APIs inside components
- use raw fetch/axios in components
- duplicate logic
- create giant files
- use desktop-only layouts
