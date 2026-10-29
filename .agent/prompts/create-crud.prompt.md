Read all files inside `.agent/templates/`.

Generate a full CRUD feature module.

Start by running `npm run gen crud <Name>` (see `.agent/examples/crud-flow-example.md`), then replace the placeholder `name`/`description` fields with the real ones and add what the generator leaves out (permissions, detail view, extra filters).

Requirements:

- feature/module-first architecture
- centralized API layer
- typed request/response models
- useAppQuery for queries
- useAppMutation for mutations
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
