import {
  type CSSProperties,
  createContext,
  type KeyboardEvent,
  type ReactNode,
  useContext,
  useState,
} from "react";
import type { Size } from "../../tokens/schema.js";
import { Disclosure } from "../Disclosure/Disclosure.js";

interface Shared {
  variant?: "plain" | "line" | "card";
  size?: Size;
  /** Heading level wrapping each header (default 3). */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Expose each open section as a labelled region. Turn off for long lists (more than about six sections). */
  regions?: boolean;
  className?: string;
  /** Layout only. */
  style?: CSSProperties;
  children?: ReactNode;
}

export interface AccordionSingleProps extends Shared {
  /** One section open at a time. */
  type?: "single";
  value?: string | undefined;
  defaultValue?: string;
  onValueChange?: (value: string | undefined) => void;
  /** The open section can be closed, leaving none open. */
  collapsible?: boolean;
}

export interface AccordionMultipleProps extends Shared {
  /** Any number of sections open. */
  type: "multiple";
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  collapsible?: never;
}

export type AccordionProps = AccordionSingleProps | AccordionMultipleProps;

interface Ctx {
  isOpen: (value: string) => boolean;
  toggle: (value: string) => void;
  locked: (value: string) => boolean;
  variant: "plain" | "line" | "card";
  size: Size;
  headingLevel: 2 | 3 | 4 | 5 | 6;
  regions: boolean;
}

const Context = createContext<Ctx | null>(null);

/** Stacked Disclosures with shared state: single or multiple open, collapsible, arrow keys between headers. */
export function Accordion(props: AccordionProps) {
  const {
    variant = "line",
    size = "md",
    headingLevel = 3,
    regions = true,
    className,
    style,
    children,
  } = props;
  const multiple = props.type === "multiple";
  const [inner, setInner] = useState<string[]>(() =>
    multiple
      ? ((props as AccordionMultipleProps).defaultValue ?? [])
      : (props as AccordionSingleProps).defaultValue
        ? [(props as AccordionSingleProps).defaultValue as string]
        : [],
  );
  const controlled = props.value !== undefined;
  const open: string[] = controlled
    ? multiple
      ? ((props as AccordionMultipleProps).value ?? [])
      : [(props as AccordionSingleProps).value as string]
    : inner;
  const collapsible = !multiple && (props as AccordionSingleProps).collapsible === true;

  const commit = (next: string[]) => {
    if (!controlled) setInner(next);
    if (multiple) (props as AccordionMultipleProps).onValueChange?.(next);
    else (props as AccordionSingleProps).onValueChange?.(next[0]);
  };
  const ctx: Ctx = {
    isOpen: (v) => open.includes(v),
    locked: (v) => !multiple && !collapsible && open.includes(v),
    toggle: (v) => {
      if (multiple) commit(open.includes(v) ? open.filter((x) => x !== v) : [...open, v]);
      else if (open.includes(v)) {
        if (collapsible) commit([]);
      } else commit([v]);
    },
    variant,
    size,
    headingLevel,
    regions,
  };
  return (
    <Context.Provider value={ctx}>
      <div
        className={className ? `cy-accordion ${className}` : "cy-accordion"}
        data-variant={variant}
        style={style}
      >
        {children}
      </div>
    </Context.Provider>
  );
}

/** APG: Up and Down move between headers (wrapping), Home and End jump. Headers stay ordinary Tab stops. */
function moveFocus(event: KeyboardEvent<HTMLButtonElement>) {
  const keys = ["ArrowDown", "ArrowUp", "Home", "End"];
  if (!keys.includes(event.key)) return;
  const root = event.currentTarget.closest(".cy-accordion");
  if (!root) return;
  const triggers = [...root.querySelectorAll<HTMLButtonElement>(".cy-disclosure-trigger")].filter(
    (t) => t.closest(".cy-accordion") === root && !t.disabled,
  );
  const at = triggers.indexOf(event.currentTarget);
  const last = triggers.length - 1;
  const next =
    event.key === "Home"
      ? 0
      : event.key === "End"
        ? last
        : event.key === "ArrowDown"
          ? (at + 1) % triggers.length
          : (at - 1 + triggers.length) % triggers.length;
  event.preventDefault();
  triggers[next]?.focus();
}

export interface AccordionItemProps {
  value: string;
  summary: ReactNode;
  children?: ReactNode;
}

export function AccordionItem({ value, summary, children }: AccordionItemProps) {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("<AccordionItem> must be inside <Accordion>");
  return (
    <Disclosure
      summary={summary}
      open={ctx.isOpen(value)}
      onOpenChange={() => ctx.toggle(value)}
      locked={ctx.locked(value)}
      variant={ctx.variant}
      size={ctx.size}
      headingLevel={ctx.headingLevel}
      region={ctx.regions}
      onTriggerKeyDown={moveFocus}
    >
      {children}
    </Disclosure>
  );
}
