import { useCallback, useEffect, useState } from 'react';

type StorageType = 'localStorage' | 'sessionStorage';

export interface UseStorageOptions<T> {
  /** Serialiser — defaults to `JSON.stringify`. */
  serialize?: (value: T) => string;
  /** Deserialiser — defaults to `JSON.parse`. */
  deserialize?: (raw: string) => T;
  /**
   * Subscribe to `storage` events from other tabs. Only meaningful for
   * `localStorage` (sessionStorage isn't shared cross-tab). Default true.
   */
  syncAcrossTabs?: boolean;
}

type Updater<T> = T | ((prev: T) => T);
const isUpdaterFn = <T>(v: Updater<T>): v is (prev: T) => T => typeof v === 'function';

const getStorage = (type: StorageType): Storage | null => {
  if (typeof window === 'undefined') return null;
  try {
    return window[type];
  } catch {
    return null;
  }
};

/**
 * State hook that persists to `window.localStorage` / `sessionStorage` and
 * (optionally) mirrors changes across tabs. Gracefully degrades to in-memory
 * state when storage is blocked (private mode, disabled cookies, SSR).
 */
function createStorageHook(type: StorageType) {
  return function useStorage<T>(
    key: string,
    initialValue: T | (() => T),
    options: UseStorageOptions<T> = {},
  ): readonly [T, (next: Updater<T>) => void, () => void] {
    const {
      serialize = JSON.stringify,
      deserialize = JSON.parse as (raw: string) => T,
      syncAcrossTabs = true,
    } = options;

    const readInitial = (): T => {
      const base = typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue;
      const storage = getStorage(type);
      if (!storage) return base;
      try {
        const raw = storage.getItem(key);
        if (raw === null) return base;
        return deserialize(raw);
      } catch {
        return base;
      }
    };

    const [value, setValue] = useState<T>(readInitial);

    const write = useCallback(
      (next: Updater<T>) => {
        setValue((prev) => {
          const resolved = isUpdaterFn(next) ? next(prev) : next;
          const storage = getStorage(type);
          if (storage) {
            try {
              storage.setItem(key, serialize(resolved));
            } catch {
              // ignore quota / denied writes
            }
          }
          return resolved;
        });
      },
      [key, serialize, type],
    );

    const remove = useCallback(() => {
      const storage = getStorage(type);
      if (storage) {
        try {
          storage.removeItem(key);
        } catch {
          // ignore
        }
      }
      setValue(typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue);
    }, [key, initialValue, type]);

    useEffect(() => {
      if (!syncAcrossTabs || type !== 'localStorage') return;
      if (typeof window === 'undefined') return;
      const handler = (event: StorageEvent) => {
        if (event.key !== key || event.storageArea !== window.localStorage) return;
        if (event.newValue === null) {
          setValue(typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue);
          return;
        }
        try {
          setValue(deserialize(event.newValue));
        } catch {
          // ignore malformed updates
        }
      };
      window.addEventListener('storage', handler);
      return () => window.removeEventListener('storage', handler);
    }, [key, deserialize, syncAcrossTabs, initialValue, type]);

    return [value, write, remove] as const;
  };
}

export const useLocalStorage = createStorageHook('localStorage');
export const useSessionStorage = createStorageHook('sessionStorage');
