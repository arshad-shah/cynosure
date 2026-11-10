import {
  type CSSProperties,
  type ElementType,
  forwardRef,
  type MouseEventHandler,
  type ReactNode,
} from "react";
import { ButtonBase } from "../../foundations/ButtonBase/ButtonBase.js";
import { LinkBase } from "../../foundations/LinkBase/LinkBase.js";
import type { Tone } from "../../tokens/schema.js";

export interface CardProps {
  /** `surface` raised panel, `outline` border only, `soft` tone-tinted fill. */
  variant?: "surface" | "outline" | "soft";
  padding?: "none" | "sm" | "md" | "lg";
  tone?: Tone;
  /** Element for a static card. Ignored when `href` or `onClick` makes the whole card interactive. */
  as?: "div" | "section" | "article" | "li" | "aside";
  /** Makes the whole card a link (rendered through LinkBase, so unsafe schemes are not linked). */
  href?: string;
  target?: string;
  /** Makes the whole card a button. */
  onClick?: MouseEventHandler<HTMLElement>;
  disabled?: boolean;
  /**
   * Buttons that sit on the card but act on their own (a game card's 2-player mode, a file card's menu). They are placed
   * over the card's top end, outside its one link or button, so nothing interactive is nested.
   */
  actions?: ReactNode;
  className?: string;
  /** Layout only. */
  style?: CSSProperties;
  children?: ReactNode;
  "aria-label"?: string;
  "data-testid"?: string;
}

const withoutStyle = <T extends { style?: CSSProperties }>({ style: _, ...props }: T) => props;

/** Content container. With `href` or `onClick` the whole card is one link or button (no nested controls). */
export const Card = forwardRef<HTMLElement, CardProps>(function CardRender(
  {
    variant = "surface",
    padding = "md",
    tone = "neutral",
    as = "div",
    href,
    target,
    onClick,
    disabled,
    actions,
    className,
    children,
    ...rest
  },
  ref,
) {
  if (actions !== undefined && (href !== undefined || onClick)) {
    // The card itself stays one target; the actions are its siblings in a shared frame.
    return (
      // Layout (`style`) goes on the frame; the card fills it.
      <div className="cy-card-frame cy-reset" style={rest.style}>
        <Card
          ref={ref}
          {...withoutStyle(rest)}
          variant={variant}
          padding={padding}
          tone={tone}
          {...(href !== undefined ? { href } : {})}
          {...(target !== undefined ? { target } : {})}
          {...(onClick ? { onClick } : {})}
          {...(disabled !== undefined ? { disabled } : {})}
          {...(className ? { className } : {})}
        >
          {children}
        </Card>
        <div className="cy-card-actions cy-reset">{actions}</div>
      </div>
    );
  }
  const common = {
    ...rest,
    className: className ? `cy-card ${className}` : "cy-card",
    "data-variant": variant,
    "data-padding": padding,
    "data-tone": tone,
  };
  if (href !== undefined)
    return (
      <LinkBase
        ref={ref as never}
        {...common}
        href={href}
        target={target}
        data-interactive=""
        onClick={onClick}
      >
        {children}
      </LinkBase>
    );
  if (onClick)
    return (
      <ButtonBase ref={ref as never} {...common} onClick={onClick} disabled={disabled} data-interactive="">
        {children}
      </ButtonBase>
    );
  const Tag = as as ElementType;
  return (
    <Tag ref={ref} {...common}>
      {children}
      {actions !== undefined && <div className="cy-card-actions cy-reset">{actions}</div>}
    </Tag>
  );
});
Card.displayName = "Card";
