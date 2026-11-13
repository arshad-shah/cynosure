import { useCallback, useSyncExternalStore } from "react";

/**
 * Whether a media query matches, following changes. False on the server, during hydration and where the environment
 * has no `matchMedia` (a test DOM).
 */
export function useMediaQuery(query: string): boolean {
  // Client-only: on the server useSyncExternalStore uses the server snapshot and never subscribes.
  const subscribe = useCallback(
    (callback: () => void) => {
      const list = globalThis.matchMedia?.(query);
      list?.addEventListener("change", callback);
      return () => list?.removeEventListener("change", callback);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => globalThis.matchMedia?.(query).matches ?? false,
    () => false,
  );
}
