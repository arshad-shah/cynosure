import { type AnchorHTMLAttributes, forwardRef } from "react";

export type LinkBaseProps = AnchorHTMLAttributes<HTMLAnchorElement>;

const UNSAFE = /^\s*(javascript|vbscript|data):/i;

/** Foundation: the only place Cynosure renders a native <a>. Safe rel for new tabs; script URLs are dropped. */
export const LinkBase = forwardRef<HTMLAnchorElement, LinkBaseProps>(function LinkBase(
  { href, target, rel, ...rest },
  ref,
) {
  const safeHref = href && !UNSAFE.test(href) ? href : undefined;
  const safeRel = target === "_blank" ? [rel, "noopener noreferrer"].filter(Boolean).join(" ") : rel;
  return <a ref={ref} href={safeHref} target={target} rel={safeRel} {...rest} />;
});
