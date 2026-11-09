import { type AnchorHTMLAttributes, forwardRef } from "react";

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
