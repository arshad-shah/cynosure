import { type RefObject, useState } from "react";
import { useClientLayoutEffect } from "./client-layout-effect.js";

/**
 * Whether a picture is still on its way, arrived, or could not be shown. `pending` is before any script has looked at
 * it (the server's HTML, and a page that is never hydrated): the picture is shown as the browser has it.
 */
export type ImageOutcome = "pending" | "loading" | "loaded" | "error";

/**
 * Follows one `<img>` from loading to loaded or failed. `key` names the picture (its `src`, with `srcSet` if any): a
 * new key starts again from "loading", whatever happened to the last one. Give the img a React `key` of the same
 * value, so `complete` never describes the picture before, and call `loaded` and `failed` from its `onLoad` and
 * `onError`. A picture that finished before React attached (cached, or sent in the server's HTML) fires neither
 * event, so it is also read from the element when the key changes. Until script runs the outcome is `pending`, so
 * markup rendered on the server shows its picture even on a page that is never hydrated; on mount an unfinished
 * picture becomes `loading` before the first paint. Image and Avatar use it.
 */
export function useImageOutcome(img: RefObject<HTMLImageElement | null>, key: string) {
  const [settled, setSettled] = useState<{ key: string; outcome: ImageOutcome }>();
  useClientLayoutEffect(() => {
    const el = img.current;
    if (!el) return;
    if (!el.complete) return setSettled({ key, outcome: "loading" });
    if (el.naturalWidth > 0) return setSettled({ key, outcome: "loaded" });
    // Finished with no size: broken, or a picture without one of its own (some SVG). Decoding tells them apart.
    let current = true;
    const settle = (outcome: ImageOutcome) => () => {
      if (current) setSettled({ key, outcome });
    };
    new Promise((resolve) => resolve(el.decode())).then(settle("loaded"), settle("error"));
    return () => {
      current = false;
    };
  }, [key]);
  return {
    outcome: settled?.key === key ? settled.outcome : ("pending" as ImageOutcome),
    loaded: () => setSettled({ key, outcome: "loaded" }),
    failed: () => setSettled({ key, outcome: "error" }),
  };
}
