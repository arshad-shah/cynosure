import { type CSSProperties, type ReactNode, useLayoutEffect, useMemo, useSyncExternalStore } from "react";
import { type Theme, themeProperties } from "../tokens/index.js";

export interface CynosureThemeProps {
  /** A theme from `createTheme()`. Omit to inherit every token from the surrounding theme (or the default stylesheet). */
  theme?: Theme;
  /** Omit to inherit the surrounding mode. `system` follows the OS. */
  mode?: "light" | "dark" | "system";
  /** `more` uses the higher-contrast palettes. `system`, or leaving it out, follows the OS setting. */
  contrast?: "normal" | "more" | "system";
  /** `self` (default) themes only this wrapper. `document` themes `<html>`; only for apps that own the page. */
  target?: "self" | "document";
  /** The wrapper element. Default "div". */
  as?: "div" | "span";
  /** Added to the wrapper element. Not used with `target="document"`, which renders no wrapper. */
  className?: string;
  /** Layout only (margin, placement). Restyle through tokens. */
  style?: CSSProperties;
  /** Everything that should use the theme. */
  children?: ReactNode;
}

const CONTRAST_QUERY = "(prefers-contrast: more)";
function subscribe(callback: () => void) {
  // Client-only: on the server useSyncExternalStore uses the server snapshot and never subscribes.
  const query = matchMedia(CONTRAST_QUERY);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
const prefersMore = () => matchMedia(CONTRAST_QUERY).matches;

/** Applies a Cynosure theme to its own wrapper (or, opt-in, to the document). Never writes to <head> or <body>. */
export function CynosureTheme({
  theme,
  mode,
  contrast,
  target = "self",
  as: Tag = "div",
  className,
  style,
  children,
}: CynosureThemeProps) {
  const osMore = useSyncExternalStore(subscribe, prefersMore, () => false);
  // Undefined contrast follows the OS, like "system" (spec §6.4: system by default).
  const more = contrast === "more" || (contrast !== "normal" && osMore);
  const properties = useMemo(() => (theme ? themeProperties(theme, { contrast: more }) : {}), [theme, more]);

  useLayoutEffect(() => {
    if (target !== "document") return;
    const html = document.documentElement;
    const names = Object.keys(properties);
    // Remember what the host had so unmounting restores it instead of deleting it.
    const previousProps = names.map((name) => [name, html.style.getPropertyValue(name)] as const);
    const previousAttrs = (["data-cy-mode", "data-cy-contrast"] as const).map(
      (a) => [a, html.getAttribute(a)] as const,
    );
    for (const name of names) html.style.setProperty(name, properties[name] as string);
    if (mode) html.setAttribute("data-cy-mode", mode);
    if (contrast) html.setAttribute("data-cy-contrast", contrast);
    return () => {
      for (const [name, value] of previousProps)
        if (value) html.style.setProperty(name, value);
        else html.style.removeProperty(name);
      for (const [attr, value] of previousAttrs)
        if (value === null) html.removeAttribute(attr);
        else html.setAttribute(attr, value);
    };
  }, [target, properties, mode, contrast]);

  if (target === "document") return <>{children}</>;
  return (
    <Tag
      className={className ? `cy-theme ${className}` : "cy-theme"}
      data-cy-mode={mode}
      data-cy-contrast={contrast}
      style={{ ...(properties as CSSProperties), ...style }}
    >
      {children}
    </Tag>
  );
}
