import {
  type AriaAttributes,
  type CSSProperties,
  forwardRef,
  type MouseEventHandler,
  type ReactNode,
} from "react";
import { Icon } from "../../foundations/Icon/Icon.js";
import { anchor, type RenderLink } from "../../foundations/LinkBase/LinkBase.js";
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

export type { LinkRenderProps, RenderLink } from "../../foundations/LinkBase/LinkBase.js";

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
  renderLink?: RenderLink | undefined;
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
  return anchor(renderLink, {
    ...props,
    ref,
    href,
    ...(external ? { target: "_blank" } : {}),
    children: content,
  });
});
