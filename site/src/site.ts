import type { NavEntry } from "@arshad-shah/cynosure";
import { github } from "@arshad-shah/cynosure/brands";
import { bookOpen, grid, home, palette } from "@arshad-shah/cynosure/icons";
import { GUIDES, REPO } from "./routes";

/** The site map. Only pages that exist are listed, so the navigation never leads to a missing page. */
export const NAV: NavEntry[] = [
  { id: "home", label: "Home", href: "/", icon: home },
  { id: "start", label: "Getting started", href: "/start/", icon: bookOpen },
  { id: "components", label: "Components", href: "/components/", icon: grid },
  { label: "Guides", items: GUIDES.map((g) => ({ id: g.file, label: g.label, href: `/${g.file}/` })) },
  {
    label: "More",
    items: [
      { id: "changelog", label: "Changelog", href: "/changelog/" },
      { id: "storybook", label: "Storybook", href: "/storybook/" },
      { id: "github", label: "Source on GitHub", href: REPO, icon: github },
    ],
  },
];

/** The phone tab bar: the four main sections. */
export const TABS: NavEntry[] = [
  { id: "home", label: "Home", href: "/", icon: home },
  { id: "start", label: "Start", href: "/start/", icon: bookOpen },
  { id: "components", label: "Components", href: "/components/", icon: grid },
  { id: "theming", label: "Theming", href: "/theming/", icon: palette },
];

export const VERSION = "0.1.0";
