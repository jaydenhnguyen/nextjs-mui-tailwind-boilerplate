# AI Agent Documentation

Reusable architecture docs and prompts for Next.js + TypeScript projects using this boilerplate.

**Start here:** [`MASTER_TEMPLATE.md`](./MASTER_TEMPLATE.md)

---

## Canonical sources (do not duplicate elsewhere)

| Topic | Source |
|-------|--------|
| Folder structure, routing, layouts, shared ownership | `templates/01-project-structure.template.md` |
| API / hooks / HTTP clients | `templates/02-api-structure.template.md`, `API_STRUCTURE_TEMPLATE.md` |
| Auth + layout guards | `templates/03-auth-flow.template.md` |
| MUI theme | `templates/04-mui-theme.template.md` |
| Tailwind + SCSS | `templates/05-tailwind-style.template.md` |
| Components | `templates/06-component-rules.template.md` |
| Forms (RHF + zod) | `templates/07-form-handling.template.md` |
| Naming + code style | `templates/08-code-style.template.md` |
| Layout `getLayout` examples | `examples/layout-example.md` |

**Project-specific deviations** (auth stack, no API, single route, etc.) belong in that repo's `.cursor/` docs — not in `.agent/`.

---

## Usage

Before using any prompt:

1. Read `MASTER_TEMPLATE.md`
2. Read relevant files in `templates/`
3. Inspect the target repo's existing code and `.cursor/` adaptation notes
4. Reuse existing components, hooks, layouts, and utilities before creating new ones

---

## Prompts

| Prompt | Purpose |
|--------|---------|
| `prompts/create-feature.prompt.md` | New feature module |
| `prompts/create-page.prompt.md` | New route/page |
| `prompts/create-crud.prompt.md` | CRUD module |
| `prompts/create-form.prompt.md` | RHF + zod form |
| `prompts/create-project.prompt.md` | Scaffold full project |
| `prompts/refactor-feature.prompt.md` | Refactor existing feature |

Recommended flow:

```txt
1. Read .agent/templates/*
2. Read related existing feature/module
3. Reuse existing patterns
4. Generate minimal consistent implementation
```
