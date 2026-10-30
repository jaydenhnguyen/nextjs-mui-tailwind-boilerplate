# Tests

Vitest + React Testing Library, with API calls answered by the same MSW handlers as `npm run dev:mock`.

```bash
npm test            # run once (CI, npm run check)
npm run test:watch  # rerun on save
```

## Where tests go

Next to the code, named `*.test.ts` / `*.test.tsx`:

```txt
src/shared/utils/format.test.ts              plain function
src/modules/Authentication/Login/Login.test.tsx  form + API errors + redirect
src/modules/Users/Users.test.tsx             list, search in the URL, API error, create, permissions
```

## Helpers (`src/test`)

| Helper                       | Use                                                                                                              |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `renderWithProviders(<X />)` | Renders with React Query, the MUI theme, motion and `useConfirm`. Returns `user` (user-event) and `queryClient`. |
| `signInAs(email?)`           | Stores a mock token, so API calls run as that mock user (admin by default).                                      |
| `server`                     | The MSW server. Override one endpoint in a test with `server.use(...)`.                                          |

`setup.ts` runs before every test file. It mocks `next/router` with `next-router-mock`, applies the app's zod messages, makes `motion` animations instant, and after each test clears cookies, storage and the router URL.

```tsx
import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import mockRouter from 'next-router-mock';
import { describe, expect, it } from 'vitest';
import { apiUrl } from 'src/mocks/session';
import { renderWithProviders, server, signInAs } from 'src/test';
import { Products } from './Products';

describe('Products', () => {
  it('shows the error state when the API fails', async () => {
    signInAs();
    mockRouter.setCurrentUrl('/products');
    server.use(http.get(apiUrl('/products'), () => HttpResponse.json({}, { status: 500 })));

    renderWithProviders(<Products />);

    expect(await screen.findByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });
});
```

## Rules

- Test what a person sees and does: find elements by role, label or text, not by class names or test ids.
- Use `await screen.findBy...` for anything that shows up after a request.
- Mock data lives in memory per test file: a user created in one test is still there in the next test of the same file. Don't assert exact totals after a test that changes data.
- Requests with no MSW handler fail the test, so add a handler (in `src/mocks/handlers`) for every endpoint a screen calls.
- Pages, `_app` and `next/font` aren't rendered in tests. Test the module component (`<Users />`), not the page.
