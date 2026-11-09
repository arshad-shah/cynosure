import { type CSSProperties, type ReactNode, useLayoutEffect, useMemo, useSyncExternalStore } from "react";
import { type Theme, themeProperties } from "../tokens/index.js";

export interface CynosureThemeProps {
  /** A theme from `createTheme()`. Omit to inherit tokens from the surrounding stylesheet or theme. */
  theme?: Theme;
  /** Omit to inherit the surrounding mode. `system` follows the OS. */
  mode?: "light" | "dark" | "system";
  contrast?: "normal" | "more" | "system";
  /** `self` (default) themes only this wrapper. `document` themes `<html>`; only for apps that own the page. */
  target?: "self" | "document";
  as?: "div" | "span";
  className?: string;
  /** Layout only (margin, placement). Restyle through tokens. */
  style?: CSSProperties;
  children?: ReactNode;
}

const CONTRAST_QUERY = "(prefers-contrast: more)";
function subscribe(callback: () => void) {
  const query = globalThis.matchMedia?.(CONTRAST_QUERY);
  query?.addEventListener("change", callback);
  return () => query?.removeEventListener("change", callback);
}
const prefersMore = () => globalThis.matchMedia?.(CONTRAST_QUERY).matches ?? false;

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
  const more = contrast === "more" || (contrast === "system" && osMore);
  const properties = useMemo(() => (theme ? themeProperties(theme, { contrast: more }) : {}), [theme, more]);

  useLayoutEffect(() => {
    if (target !== "document") return;
    const html = document.documentElement;
    const names = Object.keys(properties);
    for (const name of names) html.style.setProperty(name, properties[name] ?? null);
    if (mode) html.setAttribute("data-cy-mode", mode);
    if (contrast) html.setAttribute("data-cy-contrast", contrast);
    return () => {
      for (const name of names) html.style.removeProperty(name);
      html.removeAttribute("data-cy-mode");
      html.removeAttribute("data-cy-contrast");
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
