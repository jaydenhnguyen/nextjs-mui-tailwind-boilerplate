# Agent guide

A Next.js (Pages Router) + MUI + Tailwind boilerplate with removable packs, a code generator and a mock backend.

## Read first

1. `.agent/MASTER_TEMPLATE.md`: the rules, the workflow, and which template to read for your task.
2. Only the templates in `.agent/templates/` your task needs, plus the README of any folder you work in (`src/components`, `src/hooks`, `src/mocks`, `src/test`).
3. The nearest existing code doing something similar. Match it.

## Commands

```bash
npm run dev:mock                 # dev server with the fake backend (admin@example.com / password)
npm run gen crud|page|component|hook <Name>   # scaffold; add -- --dry-run to preview
npm run features list            # which optional packs exist in this project
npm run check                    # type-check, lint, test, build: must pass before you're done
```

## Rules you'll most often need

- Generate with `npm run gen` instead of hand-writing modules, pages, routes and menu entries.
- Pages are thin (SEO + layout + one module). Components never call the API; hooks in the module do.
- Every data view handles loading, error and empty states (`QueryState`).
- Theme tokens only, mobile first, light and dark mode.
- Anything that appears, disappears or changes size animates with `motion` (`FadeIn`, `m.*`) and never jumps the layout.
- Comments only explain why, in plain English. No JSDoc on everything.
- Imports start with `src/`, never `@/`. No new libraries or top-level folders without asking.
- Code you add for a removable pack goes in that pack's list in `scripts/features.mjs`.
- If a doc in `.agent/` disagrees with the code, the code wins; fix the doc.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
