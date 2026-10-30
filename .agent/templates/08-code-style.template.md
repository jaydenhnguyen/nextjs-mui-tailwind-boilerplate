# 08 Code Style

Naming, TypeScript, comments and the small habits that make code from different people (and agents) look the same. ESLint and Prettier enforce part of this; the rest is on you.

---

## 1. Naming

| Thing                  | Style                                 | Examples                                                                                           |
| ---------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Component + its folder | PascalCase                            | `ProductTable/ProductTable.tsx`                                                                    |
| Module folder          | PascalCase                            | `src/modules/Products`                                                                             |
| Hook                   | `useX`, camelCase file                | `useGetProductList.ts`, `useOpenState.ts`                                                          |
| Other files            | camelCase or kebab + kind suffix      | `request.ts`, `product.model.ts`, `product.schema.ts`, `products.constant.ts`, `users.handlers.ts` |
| Route folders          | kebab-case                            | `src/pages/order-history/index.tsx`                                                                |
| Types                  | PascalCase, no `I` prefix             | `Product`, `GetProductListRequest`, `ProductFormValues`                                            |
| Constants              | SCREAMING_SNAKE_CASE                  | `APP_ROUTES`, `PRODUCT_QUERY_KEYS`, `MAX_RETRIES`                                                  |
| Enums                  | SCREAMING_SNAKE_CASE name and members | `ROLES.ADMIN`                                                                                      |
| Booleans               | `is` / `has` / `can` / `should`       | `isPending`, `hasFieldErrors`, `canEdit`                                                           |
| Event props / handlers | `onX` / `handleX`                     | `onClose`, `handleSubmit`                                                                          |
| SCSS classes           | kebab-case                            | `.empty-hint`, `.drawer-header`                                                                    |

Hook names by kind:

| Kind     | Pattern                                      |
| -------- | -------------------------------------------- |
| Query    | `useGetXList`, `useGetX`                     |
| Mutation | `useCreateX`, `useUpdateX`, `useDeleteX`     |
| Form     | `useXForm`                                   |
| UI       | what it gives: `useOpenState`, `useDebounce` |

---

## 2. TypeScript

- `strict`, `noUncheckedIndexedAccess`, `noPropertyAccessFromIndexSignature` are on. Index access returns `T | undefined`; read index-signature objects with brackets (`classes['root']`, `process.env['X']` unless declared).
- `type` over `interface`, except for module augmentation.
- No `any` (ESLint error). Use `unknown` and narrow.
- Types at boundaries: props, hook parameters, API requests and responses. Let TypeScript infer the rest.
- Derive instead of repeating: form values from the zod schema, `Permission` from `PERMISSIONS`, request types with `Omit` / `&`.
- No non-null `!` unless the line above proves it (e.g. `enabled: !!id` before `getProduct(id!)`).
- `??` over `||` for defaults (ESLint enforces it), `?.` over `&&` chains.

---

## 3. Imports and exports

- `src/...` absolute imports, relative inside a module, never `@/`.
- Named exports everywhere. Default exports only where Next.js needs them (pages, `_app`, `_document`, config files).
- Each folder that others import from has an `index.ts` barrel with `export * from './X';`.
- Import order is sorted by Prettier; don't fight it.

---

## 4. Comments

Write a comment only when the code can't say it: why something is done, a constraint, a trap. Plain, casual English, short.

```ts
// Parallel 401s share one refresh call, so the session-expired handler also runs only once.
// Keeps the current page on screen while the next one loads, instead of flashing a spinner.
```

Don't write:

- comments that repeat the code (`// set loading to true`, `// Product table component`)
- JSDoc blocks describing every function and parameter
- section banners, commented-out code, or notes about what you changed ("updated to use X")
- `TODO` without a clear reason and owner; prefer an issue

The one exception: props of the shared `Form` components have short `/** */` descriptions, because they show up in editor tooltips for everyone using them.

---

## 5. Functions and logic

- Small functions with early returns, not nested `if` pyramids.
- Arrow functions for short helpers and callbacks; `function` declarations for components and hooks.
- `async` / `await` over `.then` chains. Don't wrap in `try/catch` just to rethrow.
- No `console.log`. Use `reportError` (`src/shared/utils/telemetry.ts`) for errors worth tracking; `console.warn` / `console.error` only for developer warnings.
- Dates and numbers through `formatDate`, `formatCurrency`, ... (`src/shared/utils/format.ts`), never inline `toLocaleString`.
- Env vars only through `env` (`src/configs/env.ts`), which validates them. New `NEXT_PUBLIC_*` vars go in `env.ts`, `src/types/env.d.ts` and `.env.example`.
- Never put secrets in `NEXT_PUBLIC_*` vars: they end up in the browser.

---

## 6. Keep it simple

- Solve the problem in front of you. No generic "manager", "factory" or config-driven abstraction until there are three real uses.
- Reuse what exists before writing a new component, hook or util.
- Follow the nearest existing code over a pattern from another project.
- Generated code (`npm run gen`) is the reference shape; match it.

---

## 7. Tooling

| Command              | Does                                                        |
| -------------------- | ----------------------------------------------------------- |
| `npm run format`     | Prettier on everything (sorts imports and Tailwind classes) |
| `npm run lint`       | ESLint                                                      |
| `npm run type-check` | Next route types + `tsc`                                    |
| `npm run check`      | type-check, lint, test, build: must pass before you finish  |

The git-hooks pack runs ESLint and Prettier on staged files and requires a gitmoji at the start of every commit message (`:sparkles: add product filters`).
