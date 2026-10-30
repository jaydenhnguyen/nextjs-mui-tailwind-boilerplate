import { env } from 'src/configs/env';

export type StorageKind = 'local' | 'session';

const SAME_TAB_EVENT = 'app-storage';

type SameTabDetail = { kind: StorageKind; key: string };

// Storage is missing during server render and can throw (private mode, blocked site data, full quota).
function getStore(kind: StorageKind): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

function createWebStorage(kind: StorageKind) {
  // Prefixed so two apps on the same localhost port don't read each other's values.
  const fullKey = (key: string) => `${env.APP_KEY}:${key}`;

  const notify = (key: string) => {
    window.dispatchEvent(new CustomEvent<SameTabDetail>(SAME_TAB_EVENT, { detail: { kind, key } }));
  };

  const getRaw = (key: string): string | null => {
    try {
      return getStore(kind)?.getItem(fullKey(key)) ?? null;
    } catch {
      return null;
    }
  };

  return {
    getRaw,

    get<T>(key: string, fallback: T): T {
      const raw = getRaw(key);
      if (raw === null) return fallback;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return fallback;
      }
    },

    set<T>(key: string, value: T) {
      try {
        getStore(kind)?.setItem(fullKey(key), JSON.stringify(value));
        notify(key);
      } catch {}
    },

    remove(key: string) {
      try {
        getStore(kind)?.removeItem(fullKey(key));
        notify(key);
      } catch {}
    },

    subscribe(key: string, onChange: () => void) {
      if (typeof window === 'undefined') return () => {};

      const handleOtherTab = (event: StorageEvent) => {
        if (event.key === fullKey(key) || event.key === null) onChange();
      };
      const handleSameTab = (event: Event) => {
        const { detail } = event as CustomEvent<SameTabDetail>;
        if (detail.kind === kind && detail.key === key) onChange();
      };

      window.addEventListener('storage', handleOtherTab);
      window.addEventListener(SAME_TAB_EVENT, handleSameTab);
      return () => {
        window.removeEventListener('storage', handleOtherTab);
        window.removeEventListener(SAME_TAB_EVENT, handleSameTab);
      };
    },
  };
}

export const localStore = createWebStorage('local');
export const sessionStore = createWebStorage('session');
