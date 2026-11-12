import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type Politeness = "polite" | "assertive";

export interface AnnounceOptions {
  /** `polite` (default) waits for the screen reader to finish; `assertive` interrupts. Keep assertive for errors. */
  politeness?: Politeness;
}

export type Announce = (message: string, options?: AnnounceOptions) => void;

export interface AnnouncerProps {
  /** Milliseconds before an announcement is cleared from the hidden region. Default: 5000. */
  clearAfter?: number;
  /** Your app. Anything inside can announce through `useAnnounce()`. */
  children?: ReactNode;
}

interface Said {
  text: string;
  /** Changes on every announcement, so the same text twice is a new node and is read again. */
  n: number;
}

const AnnounceContext = createContext<Announce | null>(null);
let warned = false;

/**
 * Hidden live regions for screen reader announcements, rendered where you put it (inside your app, never in `<body>`).
 * Render one near the root; `useAnnounce()` below it speaks through it.
 */
export function Announcer({ clearAfter = 5000, children }: AnnouncerProps) {
  const [polite, setPolite] = useState<Said>({ text: "", n: 0 });
  const [assertive, setAssertive] = useState<Said>({ text: "", n: 0 });
  const timers = useRef<Partial<Record<Politeness, ReturnType<typeof setTimeout>>>>({});

  const announce = useCallback<Announce>(
    (message, options) => {
      const politeness = options?.politeness ?? "polite";
      const set = politeness === "assertive" ? setAssertive : setPolite;
      set((said) => ({ text: message, n: said.n + 1 }));
      clearTimeout(timers.current[politeness]);
      timers.current[politeness] = setTimeout(() => set((said) => ({ ...said, text: "" })), clearAfter);
    },
    [clearAfter],
  );

  useEffect(() => {
    const pending = timers.current;
    return () => {
      clearTimeout(pending.polite);
      clearTimeout(pending.assertive);
    };
  }, []);

  return (
    <AnnounceContext.Provider value={announce}>
      {children}
      <div className="cy-announcer cy-visually-hidden">
        <div className="cy-announcer-region cy-reset" role="status" aria-live="polite" aria-atomic="true">
          {polite.text && <span key={polite.n}>{polite.text}</span>}
        </div>
        <div className="cy-announcer-region cy-reset" role="alert" aria-live="assertive" aria-atomic="true">
          {assertive.text && <span key={assertive.n}>{assertive.text}</span>}
        </div>
      </div>
    </AnnounceContext.Provider>
  );
}

/** Returns `announce(message, { politeness })`, spoken through the nearest `<Announcer>`. */
export function useAnnounce(): Announce {
  const announce = useContext(AnnounceContext);
  return useMemo(
    () =>
      announce ??
      (() => {
        if (warned) return;
        warned = true;
        console.warn("Cynosure: useAnnounce() needs an <Announcer> above it; nothing was announced.");
      }),
    [announce],
  );
}
