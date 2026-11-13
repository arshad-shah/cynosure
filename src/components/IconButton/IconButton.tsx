import { forwardRef } from "react";
import { Icon } from "../../foundations/Icon/Icon.js";
import { iconSizeFor } from "../../foundations/icon-size.js";
import type { IconData } from "../../icons/types.js";
import type { Placement } from "../../overlay/position.js";
import { Button, type ButtonProps } from "../Button/Button.js";
import { Tooltip } from "../Tooltip/Tooltip.js";

export interface IconButtonProps
  extends Omit<ButtonProps, "children" | "icon" | "iconEnd" | "fullWidth" | "square"> {
  /** The Facet icon shown in the button. */
  icon: IconData;
  /** Required accessible name, also shown as the tooltip. */
  label: string;
  /** Where the label tooltip appears. */
  tooltipPlacement?: Placement;
  /**
   * The icon points along the reading direction (previous, next, back): it is mirrored in right-to-left text, as
   * Icon's `flipRtl`. Default false.
   */
  flipRtl?: boolean;
  /**
   * Any CSS colour for the icon, as Icon's `color` (e.g. a status the button shows for a moment). Default: the
   * button's text colour.
   */
  iconColor?: string | undefined;
  /**
   * Added to the element around the button (the tooltip's anchor, the box the parent lays out), for layout: a grid
   * area, `flex`, margins. `className` goes on the button itself.
   */
  wrapperClassName?: string | undefined;
}

/** A square Button with only an icon. Its label is the accessible name and a Tooltip (no native title). */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, label, className, tooltipPlacement = "top", flipRtl = false, iconColor, wrapperClassName, ...rest },
  ref,
) {
  return (
    <Tooltip content={label} placement={tooltipPlacement} className={wrapperClassName}>
      <Button
        ref={ref}
        {...rest}
        square
        aria-label={label}
        className={`cy-icon-button${className ? ` ${className}` : ""}`}
      >
        <Icon
          icon={icon}
          size={iconSizeFor(rest.size)}
          flipRtl={flipRtl}
          {...(iconColor ? { color: iconColor } : {})}
        />
      </Button>
    </Tooltip>
  );
});
