import {
  type AnchorHTMLAttributes,
  type AriaAttributes,
  type CSSProperties,
  forwardRef,
  type MouseEventHandler,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import type { DataAttributes } from "../attributes.js";

export type LinkBaseProps = AnchorHTMLAttributes<HTMLAnchorElement>;

const SAFE_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

/**
 * Returns `href` only when it is relative or uses an allowlisted scheme. Parses like a browser does
 * (strips tab/newline anywhere and leading control characters), so obfuscated `javascript:` URLs cannot slip through.
 */
export function safeHref(href: string | undefined): string | undefined {
  if (!href) return undefined;
  // biome-ignore lint/suspicious/noControlCharactersInRegex: browsers ignore these characters in URLs; so must we
  const cleaned = href.replace(/[\t\n\r]/g, "").replace(/^[\u0000- ]+/, "");
  if (/^[a-z][a-z0-9+.-]*:/i.test(cleaned)) {
    try {
      return SAFE_PROTOCOLS.has(new URL(cleaned).protocol) ? href : undefined;
    } catch {
      return undefined;
    }
  }
  return href; // relative, hash or query URL
}

/** Foundation: the only place Cynosure renders a native <a>. Safe rel for new tabs; only safe schemes are linked. */
export const LinkBase = forwardRef<HTMLAnchorElement, LinkBaseProps>(function LinkBase(
  { href, target, rel, ...rest },
  ref,
) {
  const safeRel = target === "_blank" ? [rel, "noopener noreferrer"].filter(Boolean).join(" ") : rel;
  return <a ref={ref} href={safeHref(href)} target={target} rel={safeRel} {...rest} />;
});

/**
 * What a `renderLink` prop receives (Link, Button and IconButton, Card, ListRow, Breadcrumbs, Pagination, SiteHeader):
 * spread all of it onto your router's link component, mapping `href` to its own prop (`to`). The class and the
 * `data-*` attributes are the component's look and state, and the handlers its behaviour: keep them on the element.
 */
export interface LinkRenderProps extends DataAttributes {
  /** Where the link goes; undefined when `href` used a scheme that is not allowed (`javascript:`). */
  href: string | undefined;
  /** The component's styling; keep it on the element. */
  className: string;
  /** The component's id, when it has one. */
  id?: string | undefined;
  /** The link's name, when it is not its text (an icon-only link, a page number). */
  "aria-label"?: string | undefined;
  /** The ids of what names the link. */
  "aria-labelledby"?: string | undefined;
  /** The ids of what describes the link. */
  "aria-describedby"?: string | undefined;
  /** Marks the current link of a set (`"page"`). */
  "aria-current"?: AriaAttributes["aria-current"] | undefined;
  /** Where it opens, e.g. `_blank`. */
  target?: string | undefined;
  /** With `target="_blank"`, at least `noopener noreferrer`. */
  rel?: string | undefined;
  /** The component's click handler; keep it on the element. */
  onClick?: MouseEventHandler<HTMLAnchorElement> | undefined;
  /** The component's style (layout and its custom properties); keep it on the element. */
  style?: CSSProperties | undefined;
  /** Forwarded to the anchor, when the component needs it (focus, measuring). */
  ref?: Ref<HTMLAnchorElement> | undefined;
  /** The link's content. */
  children: ReactNode;
}

/** A `renderLink` prop: your router's link component, given the props a component would put on its anchor. */
export type RenderLink = (props: LinkRenderProps) => ReactElement;

/**
 * The anchor of a component that may be a router link: `renderLink` with safe `href` and `rel` when given, else a
 * LinkBase. Components with a `renderLink` prop render their link through it.
 */
export function anchor(
  renderLink: RenderLink | undefined,
  { href, target, rel, ref, ...props }: LinkRenderProps,
) {
  if (!renderLink) return <LinkBase ref={ref} href={href} target={target} rel={rel} {...props} />;
  const safeRel = target === "_blank" ? [rel, "noopener noreferrer"].filter(Boolean).join(" ") : rel;
  return renderLink({ ...props, ref, href: safeHref(href), target, rel: safeRel });
}
