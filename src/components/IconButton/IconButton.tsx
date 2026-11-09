import { forwardRef, useEffect, useState } from "react";
import { Icon } from "../../foundations/Icon/Icon.js";
import type { IconData } from "../../icons/types.js";
import { Button, type ButtonProps } from "../Button/Button.js";

export interface IconButtonProps extends Omit<ButtonProps, "children" | "icon" | "iconEnd" | "fullWidth"> {
  icon: IconData;
  /** Required accessible name, also shown as the tooltip. */
  label: string;
}

/** A square Button with only an icon. Its label is the accessible name and a hand-made tooltip (no native title). */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, label, className, onPointerEnter, onPointerLeave, onFocus, onBlur, onKeyDown, ...rest },
  ref,
) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    // WCAG 1.4.13: the tooltip is dismissible with Escape wherever focus is.
    const dismiss = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", dismiss);
    return () => document.removeEventListener("keydown", dismiss);
  }, [open]);
  return (
    <Button
      ref={ref}
      {...rest}
      aria-label={label}
      className={`cy-icon-button${className ? ` ${className}` : ""}`}
      data-tip={open ? "open" : undefined}
      onPointerEnter={(e) => {
        setOpen(true);
        onPointerEnter?.(e);
      }}
      onPointerLeave={(e) => {
        setOpen(false);
        onPointerLeave?.(e);
      }}
      onFocus={(e) => {
        if (e.currentTarget.matches(":focus-visible")) setOpen(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setOpen(false);
        onBlur?.(e);
      }}
      onKeyDown={onKeyDown}
    >
      <Icon icon={icon} size={rest.size === "lg" ? "lg" : "md"} />
      <span className="cy-reset cy-icon-button-tip" aria-hidden="true">
        {label}
      </span>
    </Button>
  );
});
