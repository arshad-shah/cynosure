import { type ReactNode, useCallback, useState } from "react";

/** `polite` waits for the screen reader to finish; `assertive` interrupts. Keep assertive for errors. */
export type Politeness = "polite" | "assertive";

export interface LiveRegionProps {
  /** What screen readers announce: text or elements (a `Kbd`). Empty (`""`, null, false) says nothing. */
  children?: ReactNode;
  /**
   * Changes with every announcement, so the same words twice in a row are read twice (`useLiveMessage` gives it).
   * Omit it to announce only when the words change.
   */
  sequence?: number;
  /** `polite` (default, `role="status"`) or `assertive` (`role="alert"`, for errors). */
  politeness?: Politeness;
  /** Added to the region, for the owning component's own rules (a reset, a hidden-host fix). */
  className?: string | undefined;
}

/** What `useLiveMessage` hands to `<LiveRegion {...message} />`: the words and their sequence number. */
export interface LiveMessage {
  /** The words last said, or "" after a clear. */
  children: ReactNode;
  /** Goes up by one with every `say`, so the same words again are a new node and read again. */
  sequence: number;
}

const empty = (node: ReactNode) =>
  node === "" || node === null || node === undefined || typeof node === "boolean";

/**
 * Foundation: a hidden live region. Screen readers announce what it holds whenever that changes; a new `sequence`
 * re-reads the same words. Out of sight (`.cy-visually-hidden`) but always in the page, so the first message is heard.
 */
export function LiveRegion({ children, sequence = 0, politeness = "polite", className }: LiveRegionProps) {
  return (
    <span
      className={`cy-visually-hidden${className ? ` ${className}` : ""}`}
      role={politeness === "assertive" ? "alert" : "status"}
      aria-live={politeness}
      aria-atomic="true"
    >
      {/* A new key on each announcement makes the words a new node, which screen readers read even when unchanged. */}
      {!empty(children) && <span key={sequence}>{children}</span>}
    </span>
  );
}

/**
 * The message of a `LiveRegion`: returns `[message, say]`. `say(words)` announces them, again if they are the same as
 * last time; `say("")` clears the region silently. Render `<LiveRegion {...message} />`.
 */
export function useLiveMessage(): [LiveMessage, (words: ReactNode) => void] {
  const [message, setMessage] = useState<LiveMessage>({ children: "", sequence: 0 });
  const say = useCallback(
    (words: ReactNode) => setMessage((last) => ({ children: words, sequence: last.sequence + 1 })),
    [],
  );
  return [message, say];
}
