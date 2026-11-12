import {
  type AriaAttributes,
  type CSSProperties,
  createElement,
  type ElementType,
  forwardRef,
  type MouseEventHandler,
  type ReactNode,
  useId,
} from "react";
import { ButtonBase } from "../../foundations/ButtonBase/ButtonBase.js";
import { type Edge, edgeProps } from "../../foundations/edge.js";
import { LinkBase } from "../../foundations/LinkBase/LinkBase.js";
import type { Tone } from "../../tokens/schema.js";

export interface CardTokens {
  /** Font size of the `title`. Default: the large font size. */
  titleSize: string;
  /** Border colour of the current card of a set (`aria-current`). Default: the accent. */
  currentBorder: string;
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
  edge?: Edge;
  /**
   * A heading at the top of the card, above the content, beside the `actions`. In a static or link card it is a
   * heading (`headingLevel`); in a button card it is plain text, as a button may not hold a heading. A `section`,
   * `article` or `aside` card is named by it.
   */
  title?: ReactNode;
  /** A quieter line under the title. */
  description?: ReactNode;
  /** Heading level of the title, to fit the page outline. Default 3. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
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
  /**
   * Marks a link or button card as the current one of a set: `"page"` for the page being shown (a card grid of
   * sections), or `"step"`, `"location"`, `true`. Read by screen readers, and the card's border takes the accent.
   */
  "aria-current"?: AriaAttributes["aria-current"];
  /** Set on the card element, to find it in tests. */
  "data-testid"?: string;
}

/** Content container. With `href` or `onClick` the whole card is one link or button (no nested controls). */
export const Card = forwardRef<HTMLElement, CardProps>(function CardRender(props, ref) {
  const titleId = `${useId()}-title`;
  const headed = props.title != null || props.description != null;
  // With actions, the card itself stays one target and the actions are its siblings in a shared frame. Layout
  // (`style`) goes on the frame; the card fills it. With a header, the frame keeps a column for the actions that the
  // header stops before.
  if (props.actions !== undefined && (props.href !== undefined || props.onClick)) {
    const { actions, style, ...card } = props;
    return (
      <div className="cy-card-frame cy-reset" data-header={headed ? "" : undefined} style={style}>
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
    title,
    description,
    headingLevel = 3,
    className,
    style,
    children,
    ...rest
  } = props;
  // A button holds phrasing content only: its header and body are spans, and the title is not a heading.
  const phrasing = href === undefined && !!onClick;
  const Box = phrasing ? "span" : "div";
  const own = href === undefined && !onClick;
  const content = headed ? (
    <>
      <Box className="cy-card-header cy-reset">
        <Box className="cy-card-heading cy-reset">
          {title != null &&
            createElement(
              phrasing ? "span" : `h${headingLevel}`,
              { id: titleId, className: "cy-card-title cy-reset" },
              title,
            )}
          {description != null &&
            createElement(
              phrasing ? "span" : "p",
              { className: "cy-card-description cy-reset" },
              description,
            )}
        </Box>
        {own && actions !== undefined && <div className="cy-card-actions cy-reset">{actions}</div>}
      </Box>
      {children != null && <Box className="cy-card-body cy-reset">{children}</Box>}
    </>
  ) : (
    children
  );
  // A sectioning card is a landmark or an article: its title names it.
  const named =
    own && title != null && !rest["aria-label"] && (as === "section" || as === "article" || as === "aside");
  const common = {
    ...rest,
    "aria-labelledby": named ? titleId : undefined,
    className: className ? `cy-card ${className}` : "cy-card",
    ...edgeProps(edge, style),
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
        {content}
      </LinkBase>
    );
  if (onClick)
    return (
      <ButtonBase ref={ref as never} {...common} onClick={onClick} disabled={disabled} data-interactive="">
        {content}
      </ButtonBase>
    );
  const Tag = as as ElementType;
  return (
    <Tag ref={ref} {...common}>
      {content}
      {!headed && actions !== undefined && <div className="cy-card-actions cy-reset">{actions}</div>}
    </Tag>
  );
});
Card.displayName = "Card";
