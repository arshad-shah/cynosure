import { type CSSProperties, type KeyboardEvent, type ReactNode, useId } from "react";
import { ButtonBase } from "../../foundations/ButtonBase/ButtonBase.js";
import { useControllableState } from "../../foundations/controllable.js";
import { Icon } from "../../foundations/Icon/Icon.js";
import { chevronDown } from "../../icons/chevron-down.js";
import type { Size } from "../../tokens/schema.js";

export interface DisclosureTokens {
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
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** `plain` no chrome, `line` bottom divider, `card` bordered surface. */
  variant?: "plain" | "line" | "card";
  size?: Size;
  /** Wrap the trigger in a heading of this level (accordion sections in a document outline). */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Expose the content as a labelled region (for a few large sections). */
  region?: boolean;
  /** The trigger cannot close the content right now (non-collapsible accordion). Sets aria-disabled. */
  locked?: boolean;
  /** Keyboard handler on the trigger (Accordion uses it for arrow navigation). */
  onTriggerKeyDown?: (event: KeyboardEvent<HTMLButtonElement>) => void;
  className?: string;
  /** Layout only. */
  style?: CSSProperties;
  children?: ReactNode;
  "data-testid"?: string;
}

/** Show and hide a section behind a button. Replaces native <details> with an animated, themeable version. */
export function Disclosure({
  summary,
  open,
  defaultOpen = false,
  onOpenChange,
  variant = "plain",
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
  return (
    <div
      {...rest}
      className={className ? `cy-disclosure ${className}` : "cy-disclosure"}
      data-variant={variant}
      data-size={size}
      data-open={isOpen ? "" : undefined}
      style={style}
    >
      {Heading ? <Heading className="cy-disclosure-heading">{trigger}</Heading> : trigger}
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
