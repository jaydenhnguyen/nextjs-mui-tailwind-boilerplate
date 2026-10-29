// Stand-in for 'msw/browser' in the server build (see next.config.ts), which has no browser worker.
export function setupWorker(): never {
  throw new Error('The mock service worker only runs in the browser.');
}
