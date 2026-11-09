import { type CSSProperties, forwardRef, type ReactNode } from "react";
import { ButtonBase, type ButtonBaseProps } from "../../foundations/ButtonBase/ButtonBase.js";
import { Icon } from "../../foundations/Icon/Icon.js";
import type { IconData } from "../../icons/types.js";

export interface ButtonTokens {
  heightSm: string;
  heightMd: string;
  heightLg: string;
  radius: string;
  paddingInline: string;
  gap: string;
  fontWeight: string;
  maxWidth: string;
  primaryBg: string;
  primaryInk: string;
  primaryHover: string;
  primaryShadow: string;
  secondaryBg: string;
  secondaryInk: string;
  secondaryBorder: string;
  hoverBg: string;
  pressScale: string;
  starRotate: string;
  starScale: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    button: ButtonTokens;
  }
}

export interface ButtonProps extends Omit<ButtonBaseProps, "children" | "className" | "style"> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: IconData;
  iconEnd?: IconData;
  /** Shows a spinner, sets aria-busy and ignores activation while keeping the button's width. */
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  /** Layout only. Restyle through `--cy-button-*` tokens. */
  style?: CSSProperties;
  children: ReactNode;
  "data-testid"?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "secondary",
    size = "md",
    icon,
    iconEnd,
    loading = false,
    fullWidth,
    className,
    children,
    onClick,
    ...rest
  },
  ref,
) {
  return (
    <ButtonBase
      ref={ref}
      {...rest}
      className={`cy-button cy-motion-trigger${className ? ` ${className}` : ""}`}
      data-variant={variant}
      data-size={size}
      data-full={fullWidth ? "" : undefined}
      data-loading={loading ? "" : undefined}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      onClick={loading ? (e) => e.preventDefault() : onClick}
    >
      <span className="cy-reset cy-button-content">
        {icon && <Icon icon={icon} size={size === "lg" ? "lg" : "md"} />}
        <span className="cy-reset cy-button-label">{children}</span>
        {iconEnd && <Icon icon={iconEnd} size={size === "lg" ? "lg" : "md"} />}
      </span>
      {loading && <span className="cy-reset cy-button-spinner" aria-hidden="true" />}
    </ButtonBase>
  );
});
