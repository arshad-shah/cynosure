/**
 * The shape of `docs.config.ts`: the one file a product edits to make this template its own documentation site.
 * Everything else (the page tree, the navigation, the version, the changelog, search) is worked out from the files
 * the config points at.
 */
import type { IconData } from "@arshad-shah/cynosure/icons";

export interface DocsLink {
  label: string;
  href: string;
  icon?: IconData;
}

export interface ComponentsConfig {
  /** Folders that hold one folder per component, each with a `README.md` (relative to the repository root). */
  folders: string[];
  /** Where the component pages live on the site. Default: `/components/`. */
  route?: string;
  /**
   * A Markdown file and heading whose `**Group:** Name, Name, …` lines sort the components into groups, e.g.
   * `README.md#Components`. Components it does not name are listed under "More".
   */
  groups?: string;
  /** The npm package whose type declarations the props tables are generated from. Default: `package`. */
  typesFrom?: string;
  /** A Storybook built beside the site, e.g. `/storybook/`: each component page links to its examples there. */
  storybook?: string;
}

export interface DocsConfig {
  /** The product's name, shown in the header and every page title. */
  name: string;
  /** One line under the name on the home page. */
  tagline: string;
  /** A sentence or two for the home page and the site's description. */
  description: string;
  /** The npm package the site documents. Its installed version is the version the site shows. */
  package: string;
  /** The GitHub repository, e.g. `https://github.com/arshad-shah/cynosure`. */
  repo: string;
  /** The branch "Edit this page" and source links point at. Default: `main`. */
  branch?: string;
  /** Where the site is published, e.g. `https://cynosure.arshadshah.com`. */
  url: string;
  /** The product's own website, when it has one besides these docs. */
  website?: string;
  /** Extra links for the header and footer (GitHub and npm are added from `repo` and `package`). */
  links?: DocsLink[];
  /** The command shown on the home page. Default: `pnpm add <package>`. */
  install?: string;

  /** The file shown as "Getting started" (relative to the repository root). Default: `README.md`. */
  readme?: string;
  /**
   * The folder of guides (relative to the repository root). Every `.md` file in it becomes a page; a sub-folder
   * becomes its own group in the navigation. Default: `docs`.
   */
  docs?: string;
  /** Files in `docs` that are not pages (internal notes), by file name without `.md`, or folder name. */
  exclude?: string[];
  /** Guides in the order they should appear, by file name without `.md`. Anything not named follows, A to Z. */
  order?: string[];
  /** The changelog Changesets writes (relative to the repository root). Default: `CHANGELOG.md`. */
  changelog?: string;
  /** Component documentation, for products that have components. */
  components?: ComponentsConfig;

  /**
   * The product's own artwork, as files relative to the repository root. The mark sits beside the name in the
   * header; the rest go in every page's head (browser tab, home-screen icon, share card).
   */
  brand?: {
    /** A square logo, ideally SVG. */
    mark?: string;
    favicon?: string;
    /** 180 by 180 PNG. */
    appleTouchIcon?: string;
    /** 1200 by 630 PNG, shown when a page is shared. */
    shareImage?: string;
  };
  /** Navigation labels that should differ from the file name, by page id: `{ adapters: "Build adapters" }`. */
  labels?: Record<string, string>;
  /** Icons for navigation entries, by page id (`start`, `theming`, `components`, `changelog`, a group's name…). */
  icons?: Record<string, IconData>;
  /** The four or five entries of the phone tab bar, by page id. Default: home, start, components, changelog. */
  tabs?: string[];
}

export const defineDocs = (config: DocsConfig): DocsConfig => config;
