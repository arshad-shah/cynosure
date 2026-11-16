import { useCallback, useEffect, useRef, useState } from "react";
import { useClientLayoutEffect } from "../foundations/client-layout-effect.js";
import { useMediaQuery } from "../foundations/media-query.js";
import type { ThemeMode } from "../tokens/schema.js";

const CHANGE = "cy-color-mode-change";

export type ColorMode = ThemeMode | "system";

export interface ColorModeStorage {
  get(key: string): string | null | Promise<string | null>;
  set(key: string, value: string): void | Promise<void>;
  /**
   * Optional: call `onChange` with the new stored value whenever `key` changes elsewhere (another tab, window or
   * extension page: `chrome.storage.onChanged`, a `BroadcastChannel`), and return a function that stops. Every
   * `useColorMode` and ThemeToggle on that key then follows. The default localStorage storage follows other tabs
   * through the `storage` event.
   */
  subscribe?(key: string, onChange: (value: string | null) => void): () => void;
}

const MODES: readonly ColorMode[] = ["light", "dark", "system"];
const isMode = (v: unknown): v is ColorMode => MODES.includes(v as ColorMode);

const localStorageAdapter: ColorModeStorage = {
  get: (k) => globalThis.localStorage?.getItem(k) ?? null,
  set: (k, v) => globalThis.localStorage?.setItem(k, v),
  // Another tab of the same origin wrote the key (or cleared all keys: `key` is null).
  subscribe: (k, onChange) => {
    const follow = (e: StorageEvent) => {
      if (e.key !== k && e.key !== null) return;
      try {
        if (e.storageArea && e.storageArea !== globalThis.localStorage) return;
      } catch {
        return;
      }
      onChange(e.key === null ? null : e.newValue);
    };
    window.addEventListener("storage", follow);
    return () => window.removeEventListener("storage", follow);
  },
};

function read(storage: ColorModeStorage, key: string): ColorMode | Promise<ColorMode> {
  try {
    const value = storage.get(key);
    if (value instanceof Promise) return value.then((v) => (isMode(v) ? v : "system")).catch(() => "system");
    return isMode(value) ? value : "system";
  } catch {
    return "system";
  }
}

/** The user's colour mode, persisted through `storage` (localStorage by default). Never throws. */
export function useColorMode(options: { storage?: ColorModeStorage; key?: string } = {}) {
  const { key = "cy-color-mode" } = options;
  // The storage object may be recreated on every render (inline literal); keep the latest without re-reading.
  const storageRef = useRef(options.storage ?? localStorageAdapter);
  storageRef.current = options.storage ?? localStorageAdapter;
  const touched = useRef(false);
  // Server and first client render agree on "system"; storage is read after mount (hydration-safe).
  const [mode, setState] = useState<ColorMode>("system");
  const systemDark = useMediaQuery("(prefers-color-scheme: dark)");

  useClientLayoutEffect(() => {
    touched.current = false;
    const initial = read(storageRef.current, key);
    if (!(initial instanceof Promise)) setState(initial);
    else {
      let live = true;
      // A user choice made while the read was pending always wins.
      initial.then((m) => live && !touched.current && setState(m));
      return () => {
        live = false;
      };
    }
  }, [key]);

  // Other hooks on the page (e.g. an uncontrolled ThemeToggle) announce changes; follow them.
  useEffect(() => {
    const follow = (e: Event) => {
      const detail = (e as CustomEvent<{ key: string; mode: ColorMode }>).detail;
      if (detail.key !== key) return;
      touched.current = true;
      setState(detail.mode);
    };
    window.addEventListener(CHANGE, follow);
    return () => window.removeEventListener(CHANGE, follow);
  }, [key]);

  // Another tab or window (through the storage's `subscribe`): follow it, as a choice made here would be.
  const custom = options.storage !== undefined;
  useEffect(() => {
    const storage = storageRef.current;
    if (!storage.subscribe) return;
    try {
      return storage.subscribe(key, (value) => {
        touched.current = true;
        setState(isMode(value) ? value : "system");
      });
    } catch {
      return;
    }
    // A new storage object each render must not resubscribe; a switch between custom and default storage does.
  }, [key, custom]);

  const setMode = useCallback(
    (next: ColorMode) => {
      touched.current = true;
      setState(next);
      window.dispatchEvent(new CustomEvent(CHANGE, { detail: { key, mode: next } }));
      try {
        void Promise.resolve(storageRef.current.set(key, next)).catch(() => {});
      } catch {
        /* storage unavailable: keep the in-memory value */
      }
    },
    [key],
  );

  const resolved: ThemeMode = mode === "system" ? (systemDark ? "dark" : "light") : mode;
  return { mode, setMode, resolved };
}
