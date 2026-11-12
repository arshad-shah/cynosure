import { type CSSProperties, forwardRef, type MouseEvent } from "react";
import { LinkBase } from "../../foundations/LinkBase/LinkBase.js";

export interface SkipLinkTokens {
  /** Distance of the shown link from the top and inline-start edges of the window. */
  offset: string;
  /** Background of the shown link. */
  background: string;
  /** Text colour of the shown link. */
  color: string;
  /** Corner radius of the shown link. */
  radius: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    skipLink: SkipLinkTokens;
  }
}

export interface SkipLinkLabels {
  /** The link text. Default: "Skip to content". */
  skip: string;
}

export interface SkipLinkProps {
  /**
   * Where the link goes: `#` and the id of the page's main content. Default "#main". Without JavaScript it is a plain
   * in-page link; with it, focus moves to the target too.
   */
  href?: string;
  /** Replace the built-in English text: `skip`, the link text. */
  labels?: Partial<SkipLinkLabels>;
  /** Set on the link element. */
  id?: string | undefined;
  /** Added to the link, for layout (e.g. to place it inside a positioned frame). */
  className?: string | undefined;
  /** Layout only. Restyle through --cy-skip-link-* tokens. */
  style?: CSSProperties;
}

const DEFAULT_LABELS: SkipLinkLabels = { skip: "Skip to content" };

/** Moves focus to an in-page target; returns false when there is none, so the browser follows the link. */
function focusTarget(link: HTMLAnchorElement, href: string): boolean {
  if (!href.startsWith("#") || href.length < 2) return false;
  let id = href.slice(1);
  try {
    id = decodeURIComponent(id);
  } catch {
    // Not percent-encoded: use it as written.
  }
  // Look in the link's own shadow root first, where a hash link cannot reach.
  const root = link.getRootNode() as Document | ShadowRoot;
  const target = root.getElementById?.(id) ?? document.getElementById(id);
  if (!target) return false;
  // Not focusable on its own (a `main` or a `div`): focusable from script only, so Tab order does not change.
  if (target.tabIndex < 0 && !target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
  target.focus();
  return true;
}

/**
 * "Skip to content": the first stop of the Tab order, hidden until it has focus and then shown at the top-start corner
 * of the window. It is a real link, so it works before or without JavaScript; with it, focus also moves to the target.
 */
export const SkipLink = forwardRef<HTMLAnchorElement, SkipLinkProps>(function SkipLink(
  { href = "#main", labels, id, className, style },
  ref,
) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    // Focus moves without touching the URL (a client-side router may own it).
    if (focusTarget(event.currentTarget, href)) event.preventDefault();
  };
  return (
    <LinkBase
      ref={ref}
      id={id}
      href={href}
      onClick={onClick}
      className={`cy-skip-link${className ? ` ${className}` : ""}`}
      style={style}
    >
      {text.skip}
    </LinkBase>
  );
});
