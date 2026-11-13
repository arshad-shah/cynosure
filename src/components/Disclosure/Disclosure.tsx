import { type CSSProperties, type KeyboardEvent, type ReactNode, useId } from "react";
import { ButtonBase } from "../../foundations/ButtonBase/ButtonBase.js";
import { useControllableState } from "../../foundations/controllable.js";
import { type Edge, edgeProps } from "../../foundations/edge.js";
import { Icon } from "../../foundations/Icon/Icon.js";
import { chevronDown } from "../../icons/chevron-down.js";
import type { Size } from "../../tokens/schema.js";

export interface DisclosureTokens {
  /** Thickness of the `edge`. Default 4px, as Card's. */
  edgeWidth: string;
  gap: string;
  radius: string;
  paddingInline: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    disclosure: DisclosureTokens;
  }
}

export interface DisclosureProps {
  /** The always-visible trigger text. */
  summary: ReactNode;
  /** Whether the content is shown, when you control it. */
  open?: boolean;
  /** Shown on first render when uncontrolled. */
  defaultOpen?: boolean;
  /** Called with the new state when the trigger is pressed. */
  onOpenChange?: (open: boolean) => void;
  /** `plain` no chrome, `line` bottom divider, `card` bordered surface. */
  variant?: "plain" | "line" | "card";
  /**
   * A coloured edge on the inline-start side, as Card's `edge`: a tone name uses that tone's colour, any other string
   * is a CSS colour (a log entry's level, a tool call's status). Say the same thing in words too. Default: no edge.
   */
  edge?: Edge;
  /**
   * Content at the end of the summary row, before the chevron and outside the trigger button: a Badge with a count or
   * a status, or a Button of its own. Its text is not part of the trigger's name. Pressing a Badge or text there
   * toggles the section; a control there is its own target.
   */
  trailing?: ReactNode;
  /** Height of the trigger and size of the text. Default "md". */
  size?: Size;
  /** Wrap the trigger in a heading of this level (accordion sections in a document outline). */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Expose the content as a labelled region (for a few large sections). */
  region?: boolean;
  /** The trigger cannot close the content right now (non-collapsible accordion). Sets aria-disabled. */
  locked?: boolean;
  /** Keyboard handler on the trigger (Accordion uses it for arrow navigation). */
  onTriggerKeyDown?: (event: KeyboardEvent<HTMLButtonElement>) => void;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. */
  style?: CSSProperties;
  /** The content that is shown and hidden. */
  children?: ReactNode;
  /** Set on the root element, for tests. */
  "data-testid"?: string;
}

/** Show and hide a section behind a button. Replaces native <details> with an animated, themeable version. */
export function Disclosure({
  summary,
  open,
  defaultOpen = false,
  onOpenChange,
  variant = "plain",
  edge,
  trailing,
  size = "md",
  headingLevel,
  region = false,
  locked = false,
  onTriggerKeyDown,
  className,
  style,
  children,
  ...rest
}: DisclosureProps) {
  const id = useId();
  const [isOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange);
  const toggle = () => {
    if (locked) return;
    setOpen(!isOpen);
  };
  const trigger = (
    <ButtonBase
      id={`${id}-trigger`}
      className="cy-disclosure-trigger"
      aria-expanded={isOpen}
      aria-controls={`${id}-content`}
      aria-disabled={locked || undefined}
      onClick={toggle}
      onKeyDown={onTriggerKeyDown}
    >
      <span className="cy-disclosure-summary">{summary}</span>
      <Icon icon={chevronDown} className="cy-disclosure-chevron" />
    </ButtonBase>
  );
  const Heading = headingLevel ? (`h${headingLevel}` as const) : null;
  const head = Heading ? <Heading className="cy-disclosure-heading">{trigger}</Heading> : trigger;
  return (
    <div
      {...rest}
      className={className ? `cy-disclosure ${className}` : "cy-disclosure"}
      data-variant={variant}
      data-size={size}
      data-open={isOpen ? "" : undefined}
      {...edgeProps(edge, style)}
    >
      {trailing == null ? (
        head
      ) : (
        // The trigger spans the whole row; the end slot is its sibling, laid over the space the trigger keeps free.
        <div className="cy-disclosure-row">
          {head}
          <div className="cy-disclosure-trailing cy-reset">{trailing}</div>
        </div>
      )}
      <div
        id={`${id}-content`}
        className="cy-disclosure-content"
        {...(region ? { role: "region", "aria-labelledby": `${id}-trigger` } : {})}
      >
        <div className="cy-disclosure-clip">
          <div className="cy-disclosure-body">{children}</div>
        </div>
      </div>
    </div>
  );
}
