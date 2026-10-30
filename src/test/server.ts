import { setupServer } from 'msw/node';
import { handlers } from 'src/mocks/handlers';

// The same handlers as `npm run dev:mock`, so tests and the mock API never drift apart.
export const server = setupServer(...handlers);
