import { type RefObject, useState } from "react";
import { useClientLayoutEffect } from "./client-layout-effect.js";

/** Whether a picture is still on its way, arrived, or could not be shown. */
export type ImageOutcome = "loading" | "loaded" | "error";

/**
 * Follows one `<img>` from loading to loaded or failed. `key` names the picture (its `src`, with `srcSet` if any): a
 * new key starts again from "loading", whatever happened to the last one. Give the img a React `key` of the same
 * value, so `complete` never describes the picture before, and call `loaded` and `failed` from its `onLoad` and
 * `onError`. A picture that finished before React attached (cached, or sent in the server's HTML) fires neither
 * event, so it is also read from the element when the key changes. Image and Avatar use it.
 */
export function useImageOutcome(img: RefObject<HTMLImageElement | null>, key: string) {
  const [settled, setSettled] = useState<{ key: string; outcome: ImageOutcome }>();
  useClientLayoutEffect(() => {
    const el = img.current;
    if (!el?.complete) return;
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
    outcome: settled?.key === key ? settled.outcome : ("loading" as ImageOutcome),
    loaded: () => setSettled({ key, outcome: "loaded" }),
    failed: () => setSettled({ key, outcome: "error" }),
  };
}
