import { forwardRef, type ReactNode } from "react";
import { ButtonBase } from "../../foundations/ButtonBase/ButtonBase.js";
import { Icon } from "../../foundations/Icon/Icon.js";
import type { SortDirection } from "../../foundations/sort.js";
import { arrowDown } from "../../icons/arrow-down.js";
import { arrowUp } from "../../icons/arrow-up.js";
import { chevronsUpDown } from "../../icons/chevrons-up-down.js";

export interface SortButtonTokens {
  /** Inline padding of a button that fills its cell (`fill`). */
  padding: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    sortButton: SortButtonTokens;
  }
}

export interface SortButtonProps {
  /** The column's header text. It is cut short with an ellipsis when the column is too narrow. */
  children?: ReactNode;
  /** How the column is sorted now; nothing when it is not. The icon follows it. */
  direction?: SortDirection | undefined;
  /** Pressed: change the sort (Table and DataGrid cycle ascending, descending, unsorted with `nextSort`). */
  onClick?: (() => void) | undefined;
  /** Fill the header cell (a data grid's fixed-height header); otherwise the button is as wide as its label. */
  fill?: boolean;
  /** `end` (a numeric column) puts the icon before the label, so the label lines up with the values. */
  align?: "start" | "end" | undefined;
  /** Tab order: a grid with one tab stop sets -1 on all but the active header. */
  tabIndex?: number | undefined;
  /** The shortcuts the header also answers to (a resizable column's Alt+arrows). */
  "aria-keyshortcuts"?: string | undefined;
  /** A grid's cell coordinates, for its keyboard navigation. */
  "data-cell"?: string | undefined;
  /** Added to the root element, for layout. */
  className?: string | undefined;
}

const ICONS = { ascending: arrowUp, descending: arrowDown } as const;

/**
 * The button in a sortable column's header: the label and an icon showing the sort (both ways when unsorted). Table
 * and DataGrid render it; the header cell carries `aria-sort`.
 */
export const SortButton = forwardRef<HTMLButtonElement, SortButtonProps>(function SortButton(
  { children, direction, onClick, fill = false, align, className, ...rest },
  ref,
) {
  return (
    <ButtonBase
      ref={ref}
      {...rest}
      className={className ? `cy-sort-button ${className}` : "cy-sort-button"}
      data-fill={fill ? "" : undefined}
      data-align={align}
      data-sorted={direction ? "" : undefined}
      onClick={onClick}
    >
      <span className="cy-sort-button-label cy-reset">{children}</span>
      <Icon icon={direction ? ICONS[direction] : chevronsUpDown} size="sm" className="cy-sort-button-icon" />
    </ButtonBase>
  );
});
