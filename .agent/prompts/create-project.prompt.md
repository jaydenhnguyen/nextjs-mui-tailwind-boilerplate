# Create a new project from this boilerplate

You are turning a fresh copy of this boilerplate into a new product. Read `.agent/MASTER_TEMPLATE.md` first. Work through the steps in order, commit after each step, and stop to ask whenever the brief doesn't answer a question below. Don't guess brand decisions.

The project brief from the user:

```txt
<paste the brief: what the product is, who it's for, pages/features, backend, brand>
```

---

## Step 0. Collect what you need

Ask only for what the brief doesn't already say. Offer a sensible default for each.

| Question                                                                   | Default if they don't care                |
| -------------------------------------------------------------------------- | ----------------------------------------- |
| Product name, short name, one-line description                             | none; must ask                            |
| Public URL                                                                 | `http://localhost:3000` until known       |
| Brand colors (at least primary), fonts, radius                             | keep the boilerplate's                    |
| Light, dark or follow the system by default                                | system                                    |
| Pages and features (public and signed-in)                                  | none; must ask                            |
| Does it talk to a backend? Base URL?                                       | must ask                                  |
| Does it need sign-in? Bearer tokens or httpOnly cookies? Refresh endpoint? | bearer, `/auth/refresh`                   |
| Error response shape of the backend                                        | the shapes `parseErrorBody` already reads |
| Hosting: Vercel or Docker                                                  | Vercel                                    |
| Tests, CI, git hooks wanted                                                | keep all                                  |

---

## Step 1. Remove what the product doesn't need

```bash
npm run features list
npm run features remove <packs> -- --dry-run   # show the plan to the user
npm run features remove <packs>
npm run check
```

| If the product…                                | Remove                                                       |
| ---------------------------------------------- | ------------------------------------------------------------ |
| has no sign-in                                 | `examples auth`                                              |
| has no backend at all (static or content site) | `examples auth mock-api tests api` (tests need the mock API) |
| doesn't want a fake backend for dev/tests      | `tests mock-api`                                             |
| won't use GitHub                               | `ci`                                                         |
| won't run in Docker                            | `docker`                                                     |
| doesn't want commit checks                     | `git-hooks`                                                  |

Keep `examples` until the first real feature exists, as a reference, then remove it.

Commit: `:fire: remove unused packs`.

---

## Step 2. Identity

- `package.json`: `name`, `version` (`0.1.0`).
- `src/configs/site.config.ts`: `name`, `shortName`, `description`, `url`, `locale`, `ogImage` (a 1200×630 image in `/public`), `icons` (PWA icons in `/public`), `faviconEmoji` or a real favicon, `author`, `contact`, `socials`.
- `.env.example` and `.env.local`: `NEXT_PUBLIC_APP_KEY` (short, unique: it prefixes cookies and storage), `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_API_URL`.
- `README.md`: replace the boilerplate intro with the product's name and purpose; keep the setup and scripts sections.

Commit: `:tada: set up <product> identity`.

---

## Step 3. Brand

Follow `templates/04-mui-theme.template.md` §2:

- colors (all brand shades + light/dark tokens), radius in `src/theme/core/_config.ts`
- fonts in `src/theme/fonts/index.ts`
- type scale in `src/theme/core/typography.ts` if the brand needs it
- default mode in `src/theme/theme.ts`
- component defaults in `src/theme/components/` (button shape, input style)

Check contrast: text on `primary.main` must be readable with `contrastText`.

Commit: `:lipstick: apply <product> brand`.

---

## Step 4. Backend (only with the api pack)

Follow `templates/02-api-structure.template.md` and, with auth, `templates/03-auth-flow.template.md` §3 and §11:

- `src/configs/auth/auth.config.ts`: `strategy`, `refreshPath`
- `src/apis/auth/*` and the `User` / `LoginResponse` types to match the real contract
- `ROLES`, `PERMISSIONS`, `ROLE_PERMISSIONS`
- `parseErrorBody` in `src/shared/utils/apiError.ts` if the error shape differs
- `apiConfig.camelCaseResponse` off if the backend already sends camelCase
- mock handlers mirror the real responses, so `npm run dev:mock` and tests stay honest

Commit: `:wrench: connect to <backend>`.

---

## Step 5. Features

For each page or resource in the brief, smallest first:

1. Generate: `npm run gen crud <Name>` for resources, `npm run gen page <Name>` for screens (`-- --public` for public pages).
2. Make it real: fields, copy, layout (`examples/crud-flow-example.md` §2).
3. Menu order and labels in `src/configs/navigation.config.ts`; footer links there too.
4. `<Seo title description />` on every page; `noIndex` on private ones.
5. The landing page (`src/modules/Landing`) and `Home` (signed-in start page) get real content.
6. A test for each screen with real logic (tests pack).
7. `npm run check`, then commit: `:sparkles: add <feature>`.

Once the product has its own features: `npm run features remove examples`.

---

## Step 6. Verify like a user

- `npm run check` passes.
- `npm run dev` (and `npm run dev:mock` with the mock API): click through every page.
- At 360px, 768px and desktop width: nothing overflows or overlaps.
- Light and dark mode both look right.
- Keyboard only: every action reachable, focus visible, dialogs trap and return focus.
- Slow network (DevTools throttling): loaders don't flash, nothing jumps, errors show a retry.
- `npm run analyze` if pages feel heavy.

---

## Step 7. Deploy

- Vercel: import the repo, set the `NEXT_PUBLIC_*` env vars, deploy.
- Docker: `docker build` with the `--build-arg NEXT_PUBLIC_...` values shown at the top of the `Dockerfile`.
- After the first deploy, set `NEXT_PUBLIC_SITE_URL` to the real domain and check `/robots.txt`, `/sitemap.xml` and link previews (Open Graph).
- When every outside origin the app uses is known, consider turning on `ENABLE_CSP` in `next.config.ts` and test with the browser console open.

---

## Report

After each step, report what changed, `npm run check` results, and any open questions, using the format in `MASTER_TEMPLATE.md` §5.
