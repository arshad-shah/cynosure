import { useCallback, useEffect, useState } from "react";

export type ColorMode = "light" | "dark" | "system";

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

const prefersDark = () => globalThis.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;

/** The user's colour mode, persisted through `storage` (localStorage by default). Never throws. */
export function useColorMode(options: { storage?: ColorModeStorage; key?: string } = {}) {
  const { storage = localStorageAdapter, key = "cy-color-mode" } = options;
  const [mode, setState] = useState<ColorMode>(() => {
    const initial = read(storage, key);
    return initial instanceof Promise ? "system" : initial;
  });
  const [systemDark, setSystemDark] = useState(prefersDark);

  useEffect(() => {
    const initial = read(storage, key);
    if (initial instanceof Promise) {
      let live = true;
      initial.then((m) => live && setState(m));
      return () => {
        live = false;
      };
    }
  }, [storage, key]);

  useEffect(() => {
    const query = globalThis.matchMedia?.("(prefers-color-scheme: dark)");
    const update = () => setSystemDark(query?.matches ?? false);
    query?.addEventListener("change", update);
    return () => query?.removeEventListener("change", update);
  }, []);

  const setMode = useCallback(
    (next: ColorMode) => {
      setState(next);
      try {
        void Promise.resolve(storage.set(key, next)).catch(() => {});
      } catch {
        /* storage unavailable: keep the in-memory value */
      }
    },
    [storage, key],
  );

  const resolved: "light" | "dark" = mode === "system" ? (systemDark ? "dark" : "light") : mode;
  return { mode, setMode, resolved };
}
