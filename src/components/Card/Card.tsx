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

export interface CardTokens {
  bg: string;
  border: string;
  radius: string;
  shadow: string;
  softMix: string;
  edgeWidth: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    card: CardTokens;
  }
}

const TONES: readonly string[] = ["accent", "neutral", "danger", "success", "warning", "info"];

export interface CardProps {
  /** `surface` raised panel, `outline` border only, `soft` tone-tinted fill. */
  variant?: "surface" | "outline" | "soft";
  /** Space between the card's edge and its content. Default "md". */
  padding?: "none" | "sm" | "md" | "lg";
  /** Semantic colour. Default "neutral". */
  tone?: Tone;
  /**
   * A coloured edge on the card's inline-start side (left in left-to-right text), e.g. a task's category. A tone name
   * uses that tone's colour; any other string is a CSS colour. Colour alone carries no meaning for many people: say
   * the same thing in the card's text or a Badge. Default: no edge.
   */
  edge?: Tone | (string & {});
  /** Element for a static card. Ignored when `href` or `onClick` makes the whole card interactive. */
  as?: "div" | "section" | "article" | "li" | "aside";
  /** Makes the whole card a link (rendered through LinkBase, so unsafe schemes are not linked). */
  href?: string;
  /** With `href`: where it opens, e.g. `_blank`. */
  target?: string;
  /** Makes the whole card a button. */
  onClick?: MouseEventHandler<HTMLElement>;
  /** With `onClick` (and no `href`): the card cannot be pressed. */
  disabled?: boolean;
  /**
   * Buttons that sit on the card but act on their own (a game card's 2-player mode, a file card's menu). They are placed
   * over the card's top end, outside its one link or button, so nothing interactive is nested.
   */
  actions?: ReactNode;
  /** Added to the card element, for layout. */
  className?: string;
  /** Layout only. */
  style?: CSSProperties;
  /** The card's content. Keep it non-interactive when the card is a link or a button. */
  children?: ReactNode;
  /** Accessible name of the card, set on the card element. */
  "aria-label"?: string;
  /** Set on the card element, to find it in tests. */
  "data-testid"?: string;
}

/** Content container. With `href` or `onClick` the whole card is one link or button (no nested controls). */
export const Card = forwardRef<HTMLElement, CardProps>(function CardRender(props, ref) {
  // With actions, the card itself stays one target and the actions are its siblings in a shared frame. Layout
  // (`style`) goes on the frame; the card fills it.
  if (props.actions !== undefined && (props.href !== undefined || props.onClick)) {
    const { actions, style, ...card } = props;
    return (
      <div className="cy-card-frame cy-reset" style={style}>
        <Card ref={ref} {...card} />
        <div className="cy-card-actions cy-reset">{actions}</div>
      </div>
    );
  }
  const {
    variant = "surface",
    padding = "md",
    tone = "neutral",
    as = "div",
    href,
    target,
    onClick,
    disabled,
    actions,
    edge,
    className,
    style,
    children,
    ...rest
  } = props;
  // A tone name is mapped to its token in CSS; any other colour is handed over as a private custom property.
  const custom = !!edge && !TONES.includes(edge);
  const common = {
    ...rest,
    className: className ? `cy-card ${className}` : "cy-card",
    style: custom ? ({ "--_edge": edge, ...style } as CSSProperties) : style,
    "data-edge": edge ? (custom ? "custom" : edge) : undefined,
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
