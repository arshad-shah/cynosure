import { type CSSProperties, type ReactNode, useRef } from "react";
import { useRovingFocus } from "../../foundations/roving-focus.js";

export interface ToolbarProps {
  /** Accessible name (required: a toolbar must be named). */
  label: string;
  orientation?: "horizontal" | "vertical";
  /** Arrow keys wrap from the last item to the first. */
  loop?: boolean;
  className?: string;
  /** Layout only. */
  style?: CSSProperties;
  /** Buttons, IconButtons, SegmentedControls, fields. */
  children?: ReactNode;
  "data-testid"?: string;
}

/** Every focusable control inside joins the roving group (hidden form proxies excluded). */
const ITEMS =
  'button, a[href], textarea, input:not([type="hidden"]):not([aria-hidden="true"]), [data-roving]';

/** APG toolbar: one Tab stop; arrow keys move between controls (RTL aware), Home and End jump. */
export function Toolbar({
  label,
  orientation = "horizontal",
  loop = true,
  className,
  style,
  children,
  ...rest
}: ToolbarProps) {
  const ref = useRef<HTMLDivElement>(null);
  useRovingFocus(ref, { orientation, loop, selector: ITEMS });
  return (
    <div
      ref={ref}
      {...rest}
      role="toolbar"
      aria-label={label}
      aria-orientation={orientation}
      className={className ? `cy-toolbar ${className}` : "cy-toolbar"}
      style={style}
    >
      {children}
    </div>
  );
}
