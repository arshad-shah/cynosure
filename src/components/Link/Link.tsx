import {
  type AriaAttributes,
  type CSSProperties,
  forwardRef,
  type MouseEventHandler,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { Icon } from "../../foundations/Icon/Icon.js";
import { LinkBase, safeHref } from "../../foundations/LinkBase/LinkBase.js";
import { external as externalIcon } from "../../icons/external.js";
import type { Size, Tone } from "../../tokens/schema.js";

export interface LinkTokens {
  underlineOffset: string;
  underlineThickness: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    link: LinkTokens;
  }
}

/**
 * What `renderLink` receives: spread all of it onto your router's link component, mapping `href` to its own prop
 * (`to`). It carries Link's class and data attributes (its look), its state and its handlers.
 */
export interface LinkRenderProps {
  /** Where the link goes; undefined when `href` used a scheme that is not allowed (`javascript:`). */
  href: string | undefined;
  /** Link's styling; keep it on the element. */
  className: string;
  /** The tone, read by Link's stylesheet; keep it on the element. */
  "data-tone": Tone;
  /** The size, read by Link's stylesheet; keep it on the element. */
  "data-size": Size | "inherit";
  /** When the underline shows (absent for `always`), read by Link's stylesheet; keep it on the element. */
  "data-underline"?: "hover" | "none" | undefined;
  /** Link's `aria-current`. */
  "aria-current"?: AriaAttributes["aria-current"] | undefined;
  /** `_blank` for an `external` link. */
  target?: "_blank" | undefined;
  /** A safe `rel` (`noopener noreferrer`) for an `external` link. */
  rel?: string | undefined;
  /** Link's `onClick`; keep it on the element. */
  onClick?: MouseEventHandler<HTMLAnchorElement> | undefined;
  /** Link's `style` (layout only). */
  style?: CSSProperties | undefined;
  /** Forwarded to the anchor. */
  ref: Ref<HTMLAnchorElement>;
  /** The text, and the external icon and announcement. */
  children: ReactNode;
}

export interface LinkProps {
  /** Where the link goes. */
  href: string;
  /** The link text. */
  children: ReactNode;
  /** Colour of the text. Default "accent". */
  tone?: Tone;
  /** Text size; `inherit` follows the surrounding text. Default "inherit". */
  size?: Size | "inherit";
  /** Opens in a new tab with a safe rel, an external icon and announced text. */
  external?: boolean;
  /**
   * When the underline shows: `always` (default), `hover` (on hover and focus) or `none`. Leave it on in running
   * text, where the underline is what tells a link from the words around it; take it off only where the place says
   * it is a link (a navigation bar, a footer's columns, a card title).
   */
  underline?: "always" | "hover" | "none";
  /** Marks the link as the current item of a set, e.g. `"page"` for the page being shown in a navigation bar. */
  "aria-current"?: AriaAttributes["aria-current"];
  /** Called when the link is activated. */
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  /**
   * Render the anchor with your router: `(props) => <RouterLink {...props} to={props.href} />`. It receives Link's
   * class, data attributes and handlers, so the router's element looks and behaves like a Link. Default: a plain link.
   */
  renderLink?: ((props: LinkRenderProps) => ReactElement) | undefined;
  /** Replace the built-in English text: `external` is read out after a link that opens in a new tab. */
  labels?: { external?: string };
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. */
  style?: CSSProperties;
}

/** Inline text link. Text colours use each tone's readable text role. */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  {
    href,
    children,
    tone = "accent",
    size = "inherit",
    external = false,
    underline = "always",
    onClick,
    renderLink,
    labels,
    className,
    style,
    "aria-current": current,
  },
  ref,
) {
  const content = (
    <>
      {children}
      {external && (
        <>
          <Icon icon={externalIcon} size="sm" className="cy-link-icon" />
          <span className="cy-visually-hidden"> {labels?.external ?? "(opens in new tab)"}</span>
        </>
      )}
    </>
  );
  const props = {
    className: `cy-link${className ? ` ${className}` : ""}`,
    "data-tone": tone,
    "data-size": size,
    "data-underline": underline === "always" ? undefined : underline,
    "aria-current": current,
    onClick,
    style,
  };
  if (renderLink)
    return renderLink({
      ...props,
      ref,
      href: safeHref(href),
      ...(external ? { target: "_blank" as const, rel: "noopener noreferrer" } : {}),
      children: content,
    });
  return (
    <LinkBase ref={ref} href={href} {...props} {...(external ? { target: "_blank" } : {})}>
      {content}
    </LinkBase>
  );
});
