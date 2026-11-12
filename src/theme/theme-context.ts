import { createContext, useCallback, useSyncExternalStore } from "react";
import type { Theme } from "../tokens/index.js";

/** What the nearest CynosureTheme paints: its theme (or the one it inherits), mode and contrast. */
export interface ThemeState {
  theme: Theme | undefined;
  mode: "light" | "dark" | "system";
  more: boolean;
}

export const ThemeContext = createContext<ThemeState | null>(null);

/** Whether a media query matches, following changes. False on the server and during hydration. */
export function useMediaQuery(query: string): boolean {
  // Client-only: on the server useSyncExternalStore uses the server snapshot and never subscribes.
  const subscribe = useCallback(
    (callback: () => void) => {
      const list = matchMedia(query);
      list.addEventListener("change", callback);
      return () => list.removeEventListener("change", callback);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => matchMedia(query).matches,
    () => false,
  );
}
