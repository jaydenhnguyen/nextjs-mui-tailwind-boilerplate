import * as React from 'react';
import { localStore, sessionStore, StorageKind } from 'src/shared/utils/webStorage';

type Options = {
  storage?: StorageKind;
};

export function useStoredState<T>(key: string, initialValue: T, { storage = 'local' }: Options = {}) {
  const store = storage === 'session' ? sessionStore : localStore;

  // Only the first initialValue counts, same as useState, so an inline object/array doesn't cause re-parsing.
  const [fallback] = React.useState(initialValue);

  const subscribe = React.useCallback((onChange: () => void) => store.subscribe(key, onChange), [store, key]);
  // The server can't see storage, so it (and hydration) renders the initial value first.
  const raw = React.useSyncExternalStore(
    subscribe,
    () => store.getRaw(key),
    () => null,
  );

  const value = React.useMemo(() => {
    if (raw === null) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }, [raw, fallback]);

  const setValue = React.useCallback(
    (next: T | ((previous: T) => T)) => {
      const previous = store.get(key, fallback);
      store.set(key, next instanceof Function ? next(previous) : next);
    },
    [store, key, fallback],
  );

  const removeValue = React.useCallback(() => store.remove(key), [store, key]);

  return [value, setValue, removeValue] as const;
}
