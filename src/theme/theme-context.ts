import { createContext } from "react";
import type { Theme } from "../tokens/index.js";

/** What the nearest CynosureTheme paints: its theme (or the one it inherits), mode and contrast. */
export interface ThemeState {
  theme: Theme | undefined;
  mode: "light" | "dark" | "system";
  more: boolean;
}

export const ThemeContext = createContext<ThemeState | null>(null);
