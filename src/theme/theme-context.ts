import { createContext } from "react";
import type { Theme } from "../tokens/index.js";
import type { ColorMode } from "./use-color-mode.js";

/** What the nearest CynosureTheme paints: its theme (or the one it inherits), mode and contrast. */
export interface ThemeState {
  theme: Theme | undefined;
  mode: ColorMode;
  more: boolean;
}

export const ThemeContext = createContext<ThemeState | null>(null);
