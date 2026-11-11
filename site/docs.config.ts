/**
 * This site's one settings file. To make the template another product's documentation, change what is here; the
 * pages, navigation, version, changelog and search all follow from the repository. See `site/README.md`.
 */
import {
  code,
  history,
  home,
  keyboard,
  layers,
  packageIcon,
  palette,
  puzzle,
  star,
  zap,
} from "@arshad-shah/cynosure/icons";
import { defineDocs } from "./engine/config.ts";

export default defineDocs({
  name: "Cynosure",
  tagline: "One small, themeable, accessible interface kit.",
  description:
    "React components, Facet icons and a token system that restyles all of it. Built once and used by all my projects: extensions, web apps and sites.",
  package: "@arshad-shah/cynosure",
  repo: "https://github.com/arshad-shah/cynosure",
  url: "https://cynosure.arshadshah.com",

  docs: "docs",
  // Notes for people working on Cynosure and its products, not for people using it: these stay in the repository.
  exclude: [
    "AGENTS",
    "PROGRESS",
    "architecture",
    "conventions",
    "migration",
    "release",
    "testing",
    "superpowers",
  ],
  order: ["theming", "icons", "accessibility", "code-editors", "without-react", "adapters"],
  labels: { adapters: "Build adapters", "without-react": "Without React" },
  components: {
    folders: ["src/components", "src/foundations"],
    groups: "README.md#Components",
  },

  icons: {
    home,
    start: zap,
    theming: palette,
    icons: star,
    accessibility: keyboard,
    "code-editors": code,
    "without-react": layers,
    adapters: packageIcon,
    components: puzzle,
    changelog: history,
  },
  tabs: ["home", "start", "components", "changelog"],
});
