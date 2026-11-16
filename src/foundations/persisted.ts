import { useCallback, useEffect, useRef } from "react";
import { useControllableState } from "./controllable.js";

/** Where a component keeps a value between visits: sync or async (`localStorage`, `chrome.storage`). */
export interface PersistStorage {
  get(key: string): string | null | Promise<string | null>;
  set(key: string, value: string): void | Promise<void>;
}

/** localStorage, or nothing where it is missing. */
export const localPersistStorage: PersistStorage = {
  get: (k) => globalThis.localStorage?.getItem(k) ?? null,
  set: (k, v) => globalThis.localStorage?.setItem(k, v),
};

export interface PersistOptions<T> {
  /** The storage key; without it nothing is read or written. */
  key: string | undefined;
  /** Default: localStorage. */
  storage?: PersistStorage | undefined;
  /** The stored text as a value, or `undefined` for text that is not one (it is then ignored). */
  parse: (raw: string) => T | undefined;
  serialize: (value: T) => string;
}

/**
 * `useControllableState` that, uncontrolled and with a `key`, reads its value from storage after mount (without
 * telling `onChange`) and writes each change back. A change made while an async read is pending wins over the read.
 * Storage that is missing, throws or rejects is ignored, so it never throws. CommandPalette's recent commands and
 * AppShell's rail use it.
 */
export function usePersistedState<T>(
  value: T | undefined,
  defaultValue: T,
  onChange: ((next: T) => void) | undefined,
  { key, storage, parse, serialize }: PersistOptions<T>,
): readonly [T, (next: T) => void] {
  const [current, set, reset] = useControllableState(value, defaultValue, onChange);
  const latest = useRef({ storage: storage ?? localPersistStorage, parse, serialize });
  latest.current = { storage: storage ?? localPersistStorage, parse, serialize };
  const touched = useRef(false);
  const persist = key !== undefined && value === undefined;
  useEffect(() => {
    if (!persist) return;
    touched.current = false;
    let live = true;
    const apply = (raw: string | null) => {
      const parsed = raw === null ? undefined : latest.current.parse(raw);
      if (live && parsed !== undefined && !touched.current) reset(parsed);
    };
    try {
      const raw = latest.current.storage.get(key);
      if (raw instanceof Promise) raw.then(apply, () => {});
      else apply(raw);
    } catch {}
    return () => {
      live = false;
    };
  }, [persist, key, reset]);
  const update = useCallback(
    (next: T) => {
      touched.current = true;
      set(next);
      if (!persist) return;
      try {
        const done = latest.current.storage.set(key, latest.current.serialize(next));
        if (done instanceof Promise) done.catch(() => {});
      } catch {}
    },
    [set, persist, key],
  );
  return [current, update] as const;
}
