import type { NavEntry } from "@arshad-shah/cynosure";
import { github } from "@arshad-shah/cynosure/brands";
import { grid, home, palette } from "@arshad-shah/cynosure/icons";

/**
 * The site map. Only pages that exist are listed: the rest of #152 adds its pages here as they are built, so the
 * navigation never leads to a missing page.
 */
export const NAV: NavEntry[] = [
  { id: "home", label: "Home", href: "/", icon: home },
  { id: "storybook", label: "Components", href: "/storybook/", icon: grid },
  { id: "github", label: "Source", href: "https://github.com/arshad-shah/cynosure", icon: github },
  {
    id: "theming",
    label: "Theming",
    href: "https://github.com/arshad-shah/cynosure/blob/main/docs/theming.md",
    icon: palette,
  },
];

export const VERSION = "0.1.0";
