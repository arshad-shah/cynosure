import { forwardRef } from "react";
import { Icon } from "../../foundations/Icon/Icon.js";
import type { IconData } from "../../icons/types.js";
import type { Placement } from "../../overlay/position.js";
import { Button, type ButtonProps } from "../Button/Button.js";
import { Tooltip } from "../Tooltip/Tooltip.js";

export interface IconButtonProps extends Omit<ButtonProps, "children" | "icon" | "iconEnd" | "fullWidth"> {
  icon: IconData;
  /** Required accessible name, also shown as the tooltip. */
  label: string;
  /** Where the label tooltip appears. */
  tooltipPlacement?: Placement;
}

/** A square Button with only an icon. Its label is the accessible name and a Tooltip (no native title). */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, label, className, tooltipPlacement = "top", ...rest },
  ref,
) {
  return (
    <Tooltip content={label} placement={tooltipPlacement}>
      <Button
        ref={ref}
        {...rest}
        aria-label={label}
        className={`cy-icon-button${className ? ` ${className}` : ""}`}
      >
        <Icon icon={icon} size={rest.size === "lg" ? "lg" : "md"} />
      </Button>
    </Tooltip>
  );
});
