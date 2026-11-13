import { useContext, useMemo } from "react";
import { useMediaQuery } from "../foundations/media-query.js";
import {
  type ColorTokens,
  createTheme,
  type GlobalTokens,
  type PaletteName,
  resolveColors,
  type Theme,
} from "../tokens/index.js";
import { ThemeContext } from "./theme-context.js";

/** The theme in force where `useCynosureTheme` is called, resolved for code that cannot read CSS variables. */
export interface CynosureThemeValue {
  /** The theme of the nearest `CynosureTheme` that has one (Cynosure's own theme when there is none). */
  theme: Theme;
  /** The palette being shown: the mode (a fixed-mode theme's own, or the OS for `system`) plus contrast. */
  palette: PaletteName;
  /** That palette's colours as concrete hex values, for canvas `fillStyle`, chart and editor themes. */
  colors: ColorTokens;
  /** The type ramp in px, already multiplied by the theme's scale. */
  fontSize: GlobalTokens["font"]["size"];
}

let fallback: Theme | undefined;

/**
 * The theme, palette and resolved colours where it is called. Re-renders when the theme, the mode, the contrast or the
 * OS setting they follow changes, so a canvas or chart can redraw or re-register its theme. Reads the nearest
 * `CynosureTheme`; pass `mode` there (from `useColorMode`) so this knows a mode set on the page.
 */
export function useCynosureTheme(): CynosureThemeValue {
  const state = useContext(ThemeContext);
  const systemDark = useMediaQuery("(prefers-color-scheme: dark)");
  const osMore = useMediaQuery("(prefers-contrast: more)");
  fallback ??= createTheme();
  const theme = state?.theme ?? fallback;
  const mode = theme.mode ?? state?.mode ?? "system";
  const dark = mode === "system" ? systemDark : mode === "dark";
  const more = state ? state.more : osMore;
  const palette = `${dark ? "dark" : "light"}${more ? "-contrast" : ""}` as PaletteName;
  return useMemo(
    () => ({ theme, palette, colors: resolveColors(theme, palette), fontSize: theme.global.font.size }),
    [theme, palette],
  );
}
