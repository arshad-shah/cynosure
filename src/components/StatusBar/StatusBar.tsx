import {
  type CSSProperties,
  forwardRef,
  type MouseEvent,
  type ReactNode,
  type Ref,
  useImperativeHandle,
  useRef,
} from "react";
import { Icon } from "../../foundations/Icon/Icon.js";
import { mergeRefs } from "../../foundations/refs.js";
import { TOOLBAR_ITEMS, useRovingFocus } from "../../foundations/roving-focus.js";
import type { IconData } from "../../icons/types.js";
import type { Placement } from "../../overlay/position.js";
import type { Tone } from "../../tokens/schema.js";
import { Badge } from "../Badge/Badge.js";
import { Button, type ButtonVariant } from "../Button/Button.js";
import { Popover, type PopoverTriggerProps } from "../Popover/Popover.js";
import { Tooltip } from "../Tooltip/Tooltip.js";

export interface StatusBarTokens {
  softMix: string;
  height: string;
  background: string;
  border: string;
  fontSize: string;
  paddingInline: string;
  segmentMaxWidth: string;
  gap: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    statusBar: StatusBarTokens;
  }
}

export interface StatusBarProps {
  /** Accessible name of the bar, a toolbar ("Status"). Required: a toolbar must be named. */
  label: string;
  /** Segments at the start of the bar (left in left-to-right text): connection, branch, schema. */
  start?: ReactNode;
  /** Segments at the end of the bar (right in left-to-right text): cursor position, encoding, plugin status. */
  end?: ReactNode;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. Restyle through --cy-status-bar-* tokens. */
  style?: CSSProperties;
  /** Test id, set on the bar element. */
  "data-testid"?: string;
}

/**
 * The bar along the bottom of a desktop app or editor: short status segments in a `start` and an `end` cluster. It is
 * an APG toolbar: the clickable segments are one Tab stop, and the arrow keys move between them.
 */
export const StatusBar = forwardRef<HTMLDivElement, StatusBarProps>(function StatusBar(
  { label, start, end, className, style, ...rest },
  ref,
) {
  const root = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => root.current as HTMLDivElement);
  useRovingFocus(root, { orientation: "horizontal", loop: true, selector: TOOLBAR_ITEMS });
  return (
    <div
      ref={root}
      {...rest}
      role="toolbar"
      aria-label={label}
      aria-orientation="horizontal"
      className={className ? `cy-status-bar ${className}` : "cy-status-bar"}
      style={style}
    >
      <div className="cy-reset cy-status-bar-start">{start}</div>
      <div className="cy-reset cy-status-bar-end">{end}</div>
    </div>
  );
});

export type StatusBarSegmentVariant = "plain" | "soft" | "solid";

export interface StatusBarSegmentProps {
  /** The segment's text. It is cut short with an ellipsis past `--cy-status-bar-segment-max-width`. */
  children: ReactNode;
  /** Semantic colour of the segment: its text and icon (`plain`), or its fill (`soft`, `solid`). Default "neutral". */
  tone?: Tone;
  /** Fill: `plain` (none), `soft` (a tint of the tone) or `solid` (the tone itself). Default "plain". */
  variant?: StatusBarSegmentVariant;
  /** Icon before the text. */
  icon?: IconData | undefined;
  /** A status dot before the text: `true` for a steady one, `"live"` for a pulsing one. */
  dot?: boolean | "live";
  /** Colour of the dot. Default: the segment's `tone`. */
  dotTone?: Tone;
  /**
   * Accessible name of the dot, when the text does not already say the state ("Connected" beside a database name).
   * Without it the dot is decoration, hidden from assistive technology.
   */
  dotLabel?: string | undefined;
  /** Monospace text, for paths, positions, versions and identifiers. Default false. */
  mono?: boolean;
  /**
   * Accessible name of a clickable segment, when its text alone does not say what it does. Start it with the visible
   * text so speech input users can say what they see.
   */
  label?: string | undefined;
  /** Makes the segment a button (size `xs`) that calls this when pressed. */
  onClick?: ((event: MouseEvent<HTMLButtonElement>) => void) | undefined;
  /**
   * Content of a Popover the segment opens, above it: the segment becomes a button with `aria-expanded`. Focus moves
   * into the panel, and Escape or a click outside closes it and returns focus to the segment.
   */
  popover?: ReactNode;
  /** Accessible name of the popover panel. Default: `label`, or the text when it is a string. */
  popoverLabel?: string | undefined;
  /** Side the popover opens on; it flips when it does not fit. Default "top". */
  placement?: Placement;
  /** Whether the popover is open, when controlled. */
  open?: boolean;
  /** Whether the popover is open at first, when uncontrolled. Default false. */
  defaultOpen?: boolean;
  /** Called with the new state when the segment, Escape or a click outside opens or closes the popover. */
  onOpenChange?: ((open: boolean) => void) | undefined;
  /** Makes a clickable segment unusable (it leaves the arrow-key order). Default false. */
  disabled?: boolean;
  /** Added to the segment, for layout. */
  className?: string | undefined;
  /** Layout only. */
  style?: CSSProperties | undefined;
  /** Test id, set on the segment (the button of a clickable one). */
  "data-testid"?: string;
}

const BUTTON_VARIANT: Record<StatusBarSegmentVariant, ButtonVariant> = {
  plain: "ghost",
  soft: "soft",
  solid: "solid",
};

/** The text inside a segment: what its tooltip shows in full while it is cut short. */
const textOf = (segment: HTMLElement) => segment.querySelector<HTMLElement>(".cy-status-bar-segment-text");

/**
 * One segment of a StatusBar: short text with an icon or a status dot. With `onClick` or `popover` it is a button;
 * text cut short shows in full in a tooltip.
 */
export const StatusBarSegment = forwardRef<HTMLElement, StatusBarSegmentProps>(function StatusBarSegment(
  {
    children,
    tone = "neutral",
    variant = "plain",
    icon,
    dot,
    dotTone,
    dotLabel,
    mono = false,
    label,
    onClick,
    popover,
    popoverLabel,
    placement = "top",
    open,
    defaultOpen,
    onOpenChange,
    disabled = false,
    className,
    style,
    ...rest
  },
  ref,
) {
  const kind = popover !== undefined ? "popover" : onClick !== undefined ? "button" : "static";
  const content = (
    <span className="cy-reset cy-status-bar-segment-content">
      {dot && (
        <span className="cy-reset cy-status-bar-segment-dot">
          <Badge dot={dot} tone={dotTone ?? tone} label={dotLabel} />
        </span>
      )}
      {icon && <Icon icon={icon} size="sm" />}
      <span className="cy-status-bar-segment-text" data-mono={mono ? "" : undefined}>
        {children}
      </span>
    </span>
  );

  if (kind === "static")
    return (
      <Tooltip content={children} whenTruncated={textOf} className="cy-status-bar-item">
        <span
          ref={ref as Ref<HTMLSpanElement>}
          {...rest}
          className={className ? `cy-status-bar-segment ${className}` : "cy-status-bar-segment"}
          data-tone={tone}
          data-variant={variant}
          style={style}
        >
          {content}
        </span>
      </Tooltip>
    );

  const button = (trigger?: PopoverTriggerProps) => (
    <Tooltip content={children} whenTruncated={textOf} className="cy-status-bar-item">
      <Button
        {...rest}
        {...trigger}
        ref={mergeRefs<HTMLElement>(ref, trigger?.ref)}
        size="xs"
        variant={BUTTON_VARIANT[variant]}
        tone={tone}
        disabled={disabled}
        {...(label !== undefined && { "aria-label": label })}
        {...(style !== undefined && { style })}
        className={className ? `cy-status-bar-button ${className}` : "cy-status-bar-button"}
        onClick={(event) => {
          trigger?.onClick();
          onClick?.(event);
        }}
      >
        {content}
      </Button>
    </Tooltip>
  );

  if (kind === "button") return button();
  return (
    <Popover
      trigger={button}
      label={popoverLabel ?? label ?? (typeof children === "string" ? children : "")}
      placement={placement}
      {...(open !== undefined && { open })}
      {...(defaultOpen !== undefined && { defaultOpen })}
      {...(onOpenChange !== undefined && { onOpenChange })}
    >
      {popover}
    </Popover>
  );
});
