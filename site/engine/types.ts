/**
 * The data the build hands the app. The build (`engine/build`) reads the repository and produces these; the app
 * (`engine/app`) only renders them. Nothing here is specific to one product.
 */
import type { RootContent } from "mdast";

/** One coloured run of code: the text and, when it has one, its Prism-style class (`keyword`, `string`…). */
export type CodeToken = [text: string, kind?: string];

export interface TocEntry {
  id: string;
  text: string;
  depth: number;
}

export interface PropRow {
  name: string;
  type: string;
  required: boolean;
  default: string;
  description: string;
}

export interface Example {
  /** The story's export name. */
  story: string;
  label: string;
  /** It opens over the page when rendered, so the canvas shows it only when asked. */
  gated?: boolean;
}

export type PageKind = "home" | "doc" | "component" | "catalogue" | "changelog";

/** What the navigation, search and links need to know about a page. */
export interface PageMeta {
  /** Unique, and the id of its navigation entry: `home`, `theming`, `components/button`. */
  id: string;
  route: string;
  title: string;
  description: string;
  kind: PageKind;
  /** The navigation section it sits in ("Guides", "Components"), shown above its title. */
  section: string;
  /** The group inside the section, when there is one ("Controls"). */
  group?: string;
  /** The file it is made from, relative to the repository root: where "Edit this page" leads. */
  source?: string;
}

export interface PageLink {
  title: string;
  route: string;
}

export interface CatalogueGroup {
  label: string;
  items: { name: string; route: string; summary: string }[];
}

export interface Release {
  version: string;
  id: string;
  body: RootContent[];
}

/** Everything one page renders. Loaded only when the page is opened. */
export interface PageData extends PageMeta {
  lead: string;
  body: RootContent[];
  toc: TocEntry[];
  previous?: PageLink;
  next?: PageLink;
  /** Component pages. */
  component?: {
    name: string;
    props: PropRow[];
    examples: Example[];
    /** Names the package exports, so an example's code names only real components. */
    exports: string[];
    /** Key into the examples loader map (`virtual:docs/examples`). */
    stories?: string;
    storybook?: string;
    folder: string;
  };
  /** The catalogue page. */
  catalogue?: CatalogueGroup[];
  /** The changelog page. */
  releases?: Release[];
  /** The home page. */
  home?: {
    cards: { id: string; title: string; route: string; summary: string }[];
    latest?: { version: string; route: string; notes: string[] };
  };
}

/** A navigation entry: a section when it has no id, a group when it has items, otherwise a page. */
export interface NavNode {
  id?: string;
  label: string;
  href?: string;
  items?: NavNode[];
}

/** One thing search can jump to: a page or a heading in it. */
export interface SearchEntry {
  id: string;
  route: string;
  label: string;
  group: string;
  keywords: string[];
}

/** What every page needs: the product, the navigation and the list of pages. */
export interface SiteData {
  name: string;
  tagline: string;
  description: string;
  package: string;
  /** The installed version of `package`: what the site documents. */
  version: string;
  /** True when the repository holds changes that are not released yet: this build is a preview of the next version. */
  unreleased?: boolean;
  repo: string;
  branch: string;
  url: string;
  website?: string;
  npm: string;
  install: string;
  /** Where the product's artwork is served from, for the files the config names. */
  brand: { mark?: string; favicon?: string; appleTouchIcon?: string; shareImage?: string };
  /** The commit the site was built from, when git can say. */
  commit?: string;
  nav: NavNode[];
  pages: PageMeta[];
  /** Ids of the phone tab bar's entries. */
  tabs: string[];
}
