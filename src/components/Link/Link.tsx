import { type CSSProperties, forwardRef, type MouseEventHandler, type ReactNode } from "react";
import { Icon } from "../../foundations/Icon/Icon.js";
import { LinkBase } from "../../foundations/LinkBase/LinkBase.js";
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
  /** Called when the link is activated. */
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  /** Replace the built-in English text: `external` is read out after a link that opens in a new tab. */
  labels?: { external?: string };
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. */
  style?: CSSProperties;
}

/** Inline text link. Text colours use each tone's readable text role. */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { href, children, tone = "accent", size = "inherit", external = false, onClick, labels, className, style },
  ref,
) {
  return (
    <LinkBase
      ref={ref}
      href={href}
      onClick={onClick}
      className={`cy-link${className ? ` ${className}` : ""}`}
      data-tone={tone}
      data-size={size}
      style={style}
      {...(external ? { target: "_blank" } : {})}
    >
      {children}
      {external && (
        <>
          <Icon icon={externalIcon} size="sm" className="cy-link-icon" />
          <span className="cy-visually-hidden"> {labels?.external ?? "(opens in new tab)"}</span>
        </>
      )}
    </LinkBase>
  );
});
