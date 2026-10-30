import * as React from 'react';

const subscribe = () => () => {};

// False during server render and hydration, true after. Use it for anything that reads browser-only state.
export function useIsClient() {
  return React.useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
