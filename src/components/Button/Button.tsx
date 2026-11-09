import { type CSSProperties, forwardRef, type ReactNode } from "react";
import { ButtonBase, type ButtonBaseProps } from "../../foundations/ButtonBase/ButtonBase.js";
import { Icon } from "../../foundations/Icon/Icon.js";
import type { IconData } from "../../icons/types.js";
import type { Size, Tone } from "../../tokens/schema.js";
import { LoadingDots } from "../LoadingDots/LoadingDots.js";

export interface ButtonTokens {
  heightSm: string;
  heightMd: string;
  heightLg: string;
  radius: string;
  paddingInline: string;
  gap: string;
  fontWeight: string;
  maxWidth: string;
  /** Inset highlight + drop shadow on solid buttons. */
  solidShadow: string;
  /** Tint strength of soft buttons (percentage of the tone mixed into the surface). */
  softMix: string;
  /** Border strength of outline buttons (percentage of the tone mixed into the line colour). */
  outlineMix: string;
  pressScale: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    button: ButtonTokens;
  }
}

export type ButtonVariant = "solid" | "soft" | "outline" | "ghost";

export interface ButtonProps extends Omit<ButtonBaseProps, "children" | "className" | "style" | "color"> {
  /** Fill style. */
  variant?: ButtonVariant;
  /** Semantic colour. */
  tone?: Tone;
  size?: Size;
  /** Leading icon (inline-start, RTL aware). */
  icon?: IconData | undefined;
  /** Trailing icon (inline-end). */
  iconEnd?: IconData | undefined;
  /** Shows LoadingDots, sets aria-busy and ignores activation while keeping the button's width. */
  loading?: boolean;
  /** Stretch to the container's width. */
  fullWidth?: boolean;
  className?: string;
  /** Layout only. Restyle through `--cy-button-*` tokens. */
  style?: CSSProperties;
  children: ReactNode;
  "data-testid"?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "outline",
    tone = "neutral",
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
  const iconSize = size === "lg" ? "lg" : "md";
  return (
    <ButtonBase
      ref={ref}
      {...rest}
      className={`cy-button cy-motion-trigger${className ? ` ${className}` : ""}`}
      data-variant={variant}
      data-tone={tone}
      data-size={size}
      data-full={fullWidth ? "" : undefined}
      data-loading={loading ? "" : undefined}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      onClick={loading ? (e) => e.preventDefault() : onClick}
    >
      <span className="cy-reset cy-button-content">
        {icon && <Icon icon={icon} size={iconSize} />}
        <span className="cy-reset cy-button-label">{children}</span>
        {iconEnd && <Icon icon={iconEnd} size={iconSize} />}
      </span>
      {loading && <LoadingDots className="cy-button-loading" />}
    </ButtonBase>
  );
});
