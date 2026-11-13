import { useCallback, useEffect, useRef, useState } from "react";
import { useClientLayoutEffect } from "../foundations/client-layout-effect.js";
import { useMediaQuery } from "../foundations/media-query.js";
import type { ThemeMode } from "../tokens/schema.js";

const CHANGE = "cy-color-mode-change";

export type ColorMode = ThemeMode | "system";

export interface ColorModeStorage {
  get(key: string): string | null | Promise<string | null>;
  set(key: string, value: string): void | Promise<void>;
}

const MODES: readonly ColorMode[] = ["light", "dark", "system"];
const isMode = (v: unknown): v is ColorMode => MODES.includes(v as ColorMode);

const localStorageAdapter: ColorModeStorage = {
  get: (k) => globalThis.localStorage?.getItem(k) ?? null,
  set: (k, v) => globalThis.localStorage?.setItem(k, v),
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
