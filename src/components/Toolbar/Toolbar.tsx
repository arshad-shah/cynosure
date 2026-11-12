import { type CSSProperties, type ReactNode, useRef } from "react";
import { TOOLBAR_ITEMS, useRovingFocus } from "../../foundations/roving-focus.js";

export interface ToolbarProps {
  /** Accessible name (required: a toolbar must be named). */
  label: string;
  /** Direction of the toolbar: Left/Right move between controls, or Up/Down when vertical. Default "horizontal". */
  orientation?: "horizontal" | "vertical";
  /** Arrow keys wrap from the last item to the first. */
  loop?: boolean;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. */
  style?: CSSProperties;
  /** Buttons, IconButtons, SegmentedControls, fields. */
  children?: ReactNode;
  /** Test id, set on the toolbar element. */
  "data-testid"?: string;
}

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
  useRovingFocus(ref, { orientation, loop, selector: TOOLBAR_ITEMS });
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
