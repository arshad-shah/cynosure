import { useEffect, useState } from "react";
import { flushSync } from "react-dom";

/**
 * True while the page is being printed (from the browser's `beforeprint` to `afterprint`). The update is flushed
 * synchronously, so content rendered for print is in the page before the browser lays it out. Tabs uses it to print
 * every panel.
 */
export function usePrinting(): boolean {
  const [printing, setPrinting] = useState(false);
  useEffect(() => {
    const start = () => flushSync(() => setPrinting(true));
    const end = () => setPrinting(false);
    addEventListener("beforeprint", start);
    addEventListener("afterprint", end);
    return () => {
      removeEventListener("beforeprint", start);
      removeEventListener("afterprint", end);
    };
  }, []);
  return printing;
}
