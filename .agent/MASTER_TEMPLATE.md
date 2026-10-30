# Master Template

The entry point for anyone, person or AI agent, building on this boilerplate. Read this first, then only the templates your task needs.

The stack: Next.js (Pages Router) · React · TypeScript (strict) · MUI · Tailwind 3 + SCSS modules · motion · TanStack Query · axios · react-hook-form + zod · MSW · Vitest.

---

## 1. Before you start

1. Run `npm run features list` to see which packs this project still has. Ignore docs and rules for packs that are removed.
2. Read the templates for your task (table below). Don't read them all.
3. Look at the nearest existing code that does something similar, and match it.
4. If the task needs a new library, a new top-level folder or a different architecture, ask the user first.

---

## 2. Where the rules are

| Topic                                                      | Read                                         |
| ---------------------------------------------------------- | -------------------------------------------- |
| Folders, ownership, pages, layouts, imports, state         | `templates/01-project-structure.template.md` |
| API functions, query and mutation hooks, errors            | `templates/02-api-structure.template.md`     |
| Sign-in, session, guards, permissions                      | `templates/03-auth-flow.template.md`         |
| Theme, colors, fonts, light/dark                           | `templates/04-mui-theme.template.md`         |
| Tailwind, SCSS modules, responsive                         | `templates/05-tailwind-style.template.md`    |
| Components, screens, dialogs, accessibility                | `templates/06-component-rules.template.md`   |
| Forms and validation                                       | `templates/07-form-handling.template.md`     |
| Naming, TypeScript, comments, tooling                      | `templates/08-code-style.template.md`        |
| Animation and transitions                                  | `templates/09-motion.template.md`            |
| Adding a CRUD resource                                     | `examples/crud-flow-example.md`              |
| Auth recipes                                               | `examples/auth-flow-example.md`              |
| Shared components (Seo, QueryState, useConfirm, notify...) | `src/components/README.md`                   |
| Form components and props                                  | `src/components/Form/README.md`              |
| Shared hooks and formatters                                | `src/hooks/README.md`                        |
| Mock API (`npm run dev:mock`)                              | `src/mocks/README.md`                        |
| Tests (`npm test`)                                         | `src/test/README.md`                         |
| Starting a new project from this boilerplate               | `prompts/create-project.prompt.md`           |

---

## 3. How work gets done here

**Generate, then fill in.** Don't hand-write boilerplate the generator already makes:

```bash
npm run gen crud Products          # API, module, hooks, table, dialog, page, mock, route, menu
npm run gen page Settings          # module + page + route + menu
npm run gen component StatCard     # src/components/StatCard (-- --module Home to put it in a module)
npm run gen hook useInterval       # src/hooks/useInterval.ts (or -- --module Home)
npm run gen                        # all options; add -- --dry-run to preview
```

The generator never overwrites files and wires routes, menus, barrels and mocks for you.

**Packs.** Optional parts can be removed in one command:

```bash
npm run features list
npm run features remove examples auth -- --dry-run
```

Packs: `api`, `auth`, `mock-api`, `examples`, `tests`, `ci`, `git-hooks`, `docker`. Each pack's files and edits are listed at the top of `scripts/features.mjs`. When you add code that belongs to a pack (an auth env var, a file only tests use), add it to that pack's list too, so removal stays complete.

**Finish with `npm run check`** (type-check, lint, tests, build). It must pass before you say the work is done.

---

## 4. Non-negotiables

Architecture

- Pages are thin: SEO, layout, one module. No logic, no data fetching.
- Components never call APIs. Data flows component → module hook → `src/apis` → `http`.
- Feature code stays in its module until a second feature needs it.
- Pages Router only. `src/` imports, never `@/`.
- No new state library, styling system, HTTP client or form library.

UI

- Every data view handles loading, error and empty (`QueryState`).
- Mobile first; nothing breaks at 360px wide.
- Theme tokens only: no raw hex colors, no Tailwind default palette.
- Anything that appears, disappears or changes size animates smoothly and never jumps the layout (`09-motion.template.md`). Use `motion` (`FadeIn`, `m.*`), not CSS keyframes.
- Destructive actions ask first (`useConfirm`). Success and failure are visible (toasts or inline).
- Keyboard and screen reader friendly: real buttons and links, labels, visible focus.

Code

- TypeScript strict, no `any`. Types at boundaries; derive the rest.
- Comments only for the why, in plain English. No JSDoc on everything, no commented-out code (`08-code-style.template.md` §4).
- Reuse before writing: check `src/components/README.md` and `src/hooks/README.md`.
- No secrets in `NEXT_PUBLIC_*` vars, no tokens or personal data in web storage.

---

## 5. When you finish

Report back briefly:

```md
## What changed

One or two sentences.

## Files

- created: ...
- changed: ...
- removed: ...

## Checks

`npm run check`: pass / what failed and why

## Notes

Assumptions, anything left for the user, anything you couldn't verify (e.g. not tested in a browser).
```
