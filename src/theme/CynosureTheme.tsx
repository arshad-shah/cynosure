import { type CSSProperties, type ReactNode, useContext, useMemo } from "react";
import { useClientLayoutEffect } from "../foundations/client-layout-effect.js";
import { useMediaQuery } from "../foundations/media-query.js";
import { type Theme, themeProperties } from "../tokens/index.js";
import { ThemeContext, type ThemeState } from "./theme-context.js";

export interface CynosureThemeProps {
  /**
   * A theme from `createTheme()`, or a named theme's `theme` (`defineTheme`, `createThemeRegistry`). Omit to inherit
   * every token from the surrounding theme (or the default stylesheet).
   */
  theme?: Theme;
  /** Omit to inherit the surrounding mode. `system` follows the OS. A theme fixed to one mode (Midnight) ignores it. */
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
  const parent = useContext(ThemeContext);
  const osMore = useMediaQuery("(prefers-contrast: more)");
  // Undefined contrast follows the OS, like "system" (spec §6.4: system by default).
  const more = contrast === "more" || (contrast !== "normal" && osMore);
  const properties = useMemo(() => (theme ? themeProperties(theme, { contrast: more }) : {}), [theme, more]);
  // A theme fixed to one mode (its own, or the one it inherits) wins over the mode prop.
  const painted = theme ?? parent?.theme;
  const fixed = painted?.mode;
  const ownMode = theme?.mode ?? (mode && (fixed ?? mode));
  const parentMode = parent?.mode;
  const parentMore = parent?.more;
  // What useCynosureTheme reads below this wrapper: the same theme, mode and contrast the wrapper paints.
  const state = useMemo<ThemeState>(
    () => ({
      theme: painted,
      mode: fixed ?? mode ?? parentMode ?? "system",
      more: theme || contrast ? more : (parentMore ?? more),
    }),
    [painted, fixed, mode, parentMode, theme, contrast, more, parentMore],
  );

  useClientLayoutEffect(() => {
    if (target !== "document") return;
    const html = document.documentElement;
    const names = Object.keys(properties);
    // Remember what the host had so unmounting restores it instead of deleting it.
    const previousProps = names.map((name) => [name, html.style.getPropertyValue(name)] as const);
    const previousAttrs = (["data-cy-mode", "data-cy-contrast"] as const).map(
      (a) => [a, html.getAttribute(a)] as const,
    );
    for (const name of names) html.style.setProperty(name, properties[name] as string);
    if (ownMode) html.setAttribute("data-cy-mode", ownMode);
    if (contrast) html.setAttribute("data-cy-contrast", contrast);
    return () => {
      for (const [name, value] of previousProps)
        if (value) html.style.setProperty(name, value);
        else html.style.removeProperty(name);
      for (const [attr, value] of previousAttrs)
        if (value === null) html.removeAttribute(attr);
        else html.setAttribute(attr, value);
    };
  }, [target, properties, ownMode, contrast]);

  if (target === "document") return <ThemeContext.Provider value={state}>{children}</ThemeContext.Provider>;
  return (
    <ThemeContext.Provider value={state}>
      <Tag
        className={className ? `cy-theme ${className}` : "cy-theme"}
        data-cy-mode={ownMode}
        data-cy-contrast={contrast}
        style={{ ...(properties as CSSProperties), ...style }}
      >
        {children}
      </Tag>
    </ThemeContext.Provider>
  );
}
