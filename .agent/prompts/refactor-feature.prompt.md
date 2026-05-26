Read all files inside `.ai/templates/`.

Refactor the target feature to align with the current boilerplate architecture.

Goals:

- improve maintainability
- improve consistency
- reduce duplication
- improve responsiveness
- align naming conventions
- align hook/API structure
- align form architecture

Requirements:

- preserve behavior
- preserve feature functionality
- avoid unnecessary rewrites
- reuse existing shared components/utilities
- split giant components
- move business logic into hooks
- keep pages thin
- keep feature ownership clear

Refactor toward:

- feature/module-first structure
- useAppQuery query hooks
- mutation hook architecture
- RHF + zod forms
- SCSS Modules + Tailwind styling
- reusable UI primitives

Do NOT:

- introduce new architecture patterns
- over-engineer abstractions
- break existing UX
- move feature-specific UI into global shared components unnecessarily
