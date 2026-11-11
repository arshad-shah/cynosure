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
  href: string;
  children: ReactNode;
  tone?: Tone;
  size?: Size | "inherit";
  /** Opens in a new tab with a safe rel, an external icon and announced text. */
  external?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  labels?: { external?: string };
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
