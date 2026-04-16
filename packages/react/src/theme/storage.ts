import type { StorageAdapter } from './types.js';

const noopAdapter: StorageAdapter = {
  get: () => null,
  set: () => {},
};

const fromWebStorage = (getStorage: () => Storage | null): StorageAdapter => ({
  get: (key) => {
    try {
      return getStorage()?.getItem(key) ?? null;
    } catch {
      return null;
    }
  },
  set: (key, value) => {
    try {
      getStorage()?.setItem(key, value);
    } catch {
      // Quota exceeded, private mode, etc. Persistence is best-effort.
    }
  },
});

export const resolveStorage = (
  storage: 'localStorage' | 'sessionStorage' | StorageAdapter | null | undefined,
): StorageAdapter => {
  if (storage === null) return noopAdapter;
  if (typeof storage === 'object') return storage;
  if (typeof window === 'undefined') return noopAdapter;
  if (storage === 'sessionStorage') {
    return fromWebStorage(() => window.sessionStorage);
  }
  return fromWebStorage(() => window.localStorage);
};
