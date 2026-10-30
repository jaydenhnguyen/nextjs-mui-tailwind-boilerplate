# Next.js + MUI + Tailwind Boilerplate

A starting point for web apps and sites. The infrastructure is done (data fetching, auth, forms, theming, motion, SEO, tests, tooling), so a new project only needs its own UI, colors and business logic. Optional parts are packs you can remove with one command.

**Stack:** Next.js 16 (Pages Router) · React 19 · TypeScript · MUI 7 · Tailwind 3 + SCSS modules · motion · TanStack Query 5 · axios · react-hook-form + zod · MSW · Vitest

---

## What's inside

| Area           | You get                                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Data           | axios client, React Query defaults, one `ApiError` type, automatic error/success toasts, retries                          |
| Auth           | bearer or httpOnly-cookie sessions, token refresh, guarded layout, roles and permissions, login page                      |
| UI             | MUI theme with light/dark mode, Tailwind colors that follow the theme, loading/empty/error states, confirm dialog, toasts |
| Forms          | `useZodForm` + `Control*` fields: validation, server errors on fields, no layout jumps                                    |
| Motion         | `motion` with shared timing tokens, smooth enter/exit, reduced-motion support                                             |
| SEO            | `<Seo />`, sitemap, robots.txt, web manifest, Open Graph                                                                  |
| Dev experience | mock backend (`dev:mock`), code generator (`gen`), removable packs (`features`), tests, git hooks, CI, Docker             |
| AI agents      | `AGENTS.md` / `CLAUDE.md` and `.agent/`: rules, examples and prompts that match the code                                  |

---

## Quick start

Needs Node 22.22+ or 24.15+ (`nvm use` reads `.nvmrc`).

```bash
npm ci
cp .env.example .env.local     # optional: everything has a default
npm run dev:mock               # runs with the fake backend
```

Open http://localhost:3000 and sign in as `admin@example.com` / `password` (or `viewer@example.com`, read-only).

With a real backend, set `NEXT_PUBLIC_API_URL` in `.env.local` and run `npm run dev`.

---

## Start a new project from this boilerplate

Copy it (GitHub "Use this template", or clone and delete `.git`), then:

1. **Remove what you don't need.** `npm run features list`, then e.g. `npm run features remove examples auth` for a site without sign-in. [Packs](#packs) below.
2. **Name it.** `package.json` name, `src/configs/site.config.ts` (name, description, URL, socials, icons), `NEXT_PUBLIC_APP_KEY` in `.env.local`.
3. **Brand it.** Colors and radius in `src/theme/core/_config.ts`, fonts in `src/theme/fonts/index.ts`.
4. **Connect the backend** (if any). `NEXT_PUBLIC_API_URL`; auth strategy in `src/configs/auth/auth.config.ts`; the error body parser in `src/shared/utils/apiError.ts`.
5. **Build features.** `npm run gen crud Products` or `npm run gen page About`, then replace the placeholder fields and copy.
6. **Check.** `npm run check` before every commit you care about.
7. **Deploy.** [Below](#deploy).

Using an AI agent? Give it `.agent/prompts/create-project.prompt.md` with your brief. It walks through the same steps and asks what it needs.

---

## Scripts

| Script               | Does                                                                            |
| -------------------- | ------------------------------------------------------------------------------- |
| `npm run dev`        | Dev server                                                                      |
| `npm run dev:mock`   | Dev server with the mock API (`src/mocks`)                                      |
| `npm run build`      | Production build                                                                |
| `npm run start`      | Serve the production build                                                      |
| `npm run check`      | Type-check, lint, test and build: what CI runs                                  |
| `npm run type-check` | TypeScript                                                                      |
| `npm run lint`       | ESLint                                                                          |
| `npm test`           | Tests once (`npm run test:watch` to rerun on save), see `src/test`              |
| `npm run format`     | Prettier on everything (also sorts imports and Tailwind classes)                |
| `npm run analyze`    | Interactive bundle analyzer                                                     |
| `npm run gen`        | Scaffold a CRUD resource, page, component or hook (`npm run gen crud Products`) |
| `npm run features`   | List or remove optional packs (`npm run features remove examples docker`)       |

---

## Packs

```bash
npm run features list                              # what's installed
npm run features remove docker -- --dry-run        # preview
npm run features remove examples auth              # remove (needs a clean git tree)
```

| Pack        | What it is                                                      | Needs     |
| ----------- | --------------------------------------------------------------- | --------- |
| `api`       | axios client, React Query, `ApiError`, `QueryState`, `src/apis` |           |
| `auth`      | sign-in, token refresh, `PrivateLayout`, roles/permissions      | api       |
| `mock-api`  | MSW fake backend for `dev:mock` and tests                       | api       |
| `examples`  | the Users CRUD demo                                             | api, auth |
| `tests`     | Vitest + Testing Library, `src/test`, `*.test.tsx`              | mock-api  |
| `ci`        | GitHub Actions and Dependabot                                   |           |
| `git-hooks` | Husky + lint-staged, gitmoji commit messages                    |           |
| `docker`    | `Dockerfile` with standalone output                             |           |

Removing a pack deletes its files, edits the shared files that mention it, drops its scripts and npm packages, and refuses to break a pack that depends on it.

---

## Project structure

```txt
src/
├── apis/         HTTP functions per backend domain
├── components/   shared UI (see src/components/README.md)
├── configs/      env, site, navigation, request client, query client, auth
├── hooks/        shared hooks (see src/hooks/README.md)
├── layouts/      PublicLayout, PrivateLayout, header/footer
├── mocks/        mock backend
├── modules/      features: screens, their components, hooks, models, schemas
├── pages/        thin route files
├── providers/    app-wide providers
├── shared/       constants (routes), types, utils
├── styles/       global SCSS + Tailwind
├── test/         test setup and helpers
└── theme/        MUI theme, fonts, motion tokens
```

Details and rules: `.agent/templates/01-project-structure.template.md`.

---

## Environment variables

All optional, validated at startup in `src/configs/env.ts`. They end up in the browser, so never put secrets in them.

| Variable                                                         | Default                        | Used for                                   |
| ---------------------------------------------------------------- | ------------------------------ | ------------------------------------------ |
| `NEXT_PUBLIC_APP_KEY`                                            | `app`                          | prefix for cookies and storage keys        |
| `NEXT_PUBLIC_SITE_URL`                                           | `http://localhost:3000`        | canonical URLs, sitemap, Open Graph        |
| `NEXT_PUBLIC_API_URL`                                            | `http://localhost:3001/api/v1` | backend base URL                           |
| `NEXT_PUBLIC_ACCESS_TOKEN_TTL` / `NEXT_PUBLIC_REFRESH_TOKEN_TTL` | `3600` / `604800`              | token cookie lifetimes in seconds          |
| `NEXT_PUBLIC_API_MOCKING`                                        | `disabled`                     | `enabled` answers API calls with the mocks |

---

## Deploy

**Vercel:** import the repo, add the env vars above, deploy. Nothing else to configure.

**Docker:**

```bash
docker build -t my-app --build-arg NEXT_PUBLIC_SITE_URL=https://example.com --build-arg NEXT_PUBLIC_API_URL=https://api.example.com .
docker run -p 3000:3000 my-app
```

Security headers are set in `next.config.ts`. A starter Content-Security-Policy is there too, off until you list the outside origins your app uses (`ENABLE_CSP`).

---

## Conventions

The short version (the full rules are in `.agent/`):

- Pages are thin; features live in `src/modules/<Feature>`; components never call the API directly.
- Every data view handles loading, error and empty states.
- Theme tokens only, mobile first, light and dark mode both work.
- Anything that appears or disappears animates smoothly without jumping the layout.
- Comments explain why, not what.
- Commits start with a gitmoji: `:sparkles: add product filters`.

## Working with AI agents

`AGENTS.md` (and `CLAUDE.md`, which points to it) is what Claude Code, Cursor, Codex and similar tools read first. It sends them to `.agent/MASTER_TEMPLATE.md`, which lists the rules, the generator, the packs and the checks to run. Keep the docs in `.agent/` true to the code: when a pattern changes, update its template in the same commit.
