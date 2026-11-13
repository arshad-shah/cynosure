import { type CSSProperties, createContext, type KeyboardEvent, type ReactNode, useContext } from "react";
import { useControllableState } from "../../foundations/controllable.js";
import type { Size } from "../../tokens/schema.js";
import { Disclosure } from "../Disclosure/Disclosure.js";

interface Shared {
  /** `plain` no chrome, `line` a divider under each section, `card` bordered surfaces. Default "line". */
  variant?: "plain" | "line" | "card";
  /** Size of every section's header and content. Default "md". */
  size?: Size;
  /** Heading level wrapping each header (default 3). */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Expose each open section as a labelled region. Turn off for long lists (more than about six sections). */
  regions?: boolean;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. */
  style?: CSSProperties;
  /** The sections: one `AccordionItem` each. */
  children?: ReactNode;
}

export interface AccordionSingleProps extends Shared {
  /** One section open at a time. */
  type?: "single";
  /** Controlled: the `value` of the open section, or undefined for none (passing the prop at all makes it controlled). */
  value?: string | undefined;
  /** The section open at first, when uncontrolled. */
  defaultValue?: string;
  /** Called when a section opens or closes, with the open section's `value` (undefined when none is open). */
  onValueChange?: (value: string | undefined) => void;
  /** The open section can be closed, leaving none open. */
  collapsible?: boolean;
}

export interface AccordionMultipleProps extends Shared {
  /** Any number of sections open. */
  type: "multiple";
  /** Controlled: the `value` of every open section. */
  value?: string[];
  /** The sections open at first, when uncontrolled. */
  defaultValue?: string[];
  /** Called when a section opens or closes, with the `value` of every open section. */
  onValueChange?: (value: string[]) => void;
  /** Not used here: with `type="multiple"` every section can always be closed. */
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
  // Single mode holds one value (or none); both modes are kept as a list here.
  const asList = (v: string | string[] | undefined) =>
    v === undefined ? undefined : Array.isArray(v) ? v : [v];
  // In single mode a `value` prop that is present makes it controlled, even when undefined: that means none open.
  const controlledNone = !multiple && "value" in props && props.value === undefined;
  const [open, commit] = useControllableState<string[]>(
    controlledNone ? [] : asList(props.value),
    () => asList(props.defaultValue) ?? [],
    (next) =>
      multiple
        ? (props as AccordionMultipleProps).onValueChange?.(next)
        : (props as AccordionSingleProps).onValueChange?.(next[0]),
  );
  const collapsible = !multiple && (props as AccordionSingleProps).collapsible === true;

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
  /** Identifies the section in the Accordion's `value`. Unique among its items. */
  value: string;
  /** The header: what people press to open or close the section. */
  summary: ReactNode;
  /** The section's content, shown while it is open. */
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
