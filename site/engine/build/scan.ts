/**
 * Reads the repository and works out the whole site: which pages exist, where they live, what the navigation looks
 * like, and each page's data. Nothing is listed by hand: a new Markdown file in the docs folder, a new component
 * folder with a README, or a new release in the changelog shows up on the next build.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";
import type { List, RootContent } from "mdast";
import { toString as textOf } from "mdast-util-to-string";
import type { DocsConfig } from "../config.ts";
import type {
  CatalogueGroup,
  NavNode,
  PageData,
  PageMeta,
  Release,
  SearchEntry,
  SiteData,
} from "../types.ts";
import { examplesOf } from "./examples.ts";
import { fromDocsPage, type LinkContext, parseMarkdown } from "./markdown.ts";
import { exportedNames, packageDir, propsOf } from "./props.ts";

export interface Scanned {
  site: SiteData;
  /** Artwork to serve: the address it is served at, and the file it is read from. */
  assets: Record<string, string>;
  pages: PageData[];
  search: SearchEntry[];
  /** Stories files to load examples from, by key (absolute paths). */
  stories: Record<string, string>;
  /** Every file the result was read from, so the dev server can watch them. */
  files: string[];
}

/** `AppShell` is `app-shell`. */
export const slug = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
/** `code-editors` is "Code editors". */
const titled = (name: string) => {
  const words = name.replace(/[-_]+/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
};
const trail = (route: string) => (route.endsWith("/") ? route : `${route}/`);

interface Planned extends PageMeta {
  /** Absolute path of the Markdown it is read from. */
  file?: string;
  /** Kept when the document's own first heading should not name the page. */
  fixedTitle?: boolean;
  componentFolder?: string;
  componentName?: string;
}

/** The groups a README section declares as `**Label:** Name, Name, …` lines. */
function groupsFrom(
  markdown: string,
  heading: string,
  known: Set<string>,
): { label: string; names: string[] }[] {
  const section =
    markdown.split(new RegExp(`^##+ ${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "m"))[1] ?? "";
  const body = section.split(/^## /m)[0] ?? "";
  const groups: { label: string; names: string[] }[] = [];
  for (const [, label, list] of body.matchAll(/\*\*([A-Z][A-Za-z ]+):\*\*\s*([^\n*]+)/g)) {
    const names = (list ?? "")
      .replace(/\([^)]*\)/g, "")
      .split(/[,;]/)
      .map((name) => name.trim().replace(/\.$/, "").split(/\s+/)[0] ?? "")
      .filter((name) => known.has(name));
    if (names.length) groups.push({ label: label as string, names });
  }
  return groups;
}

function installedVersion(pkg: string, root: string): string {
  try {
    return JSON.parse(readFileSync(join(packageDir(pkg), "package.json"), "utf8")).version;
  } catch {
    // A product that is not an npm package: the repository's own version.
    return JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version ?? "0.0.0";
  }
}

function commitOf(root: string): string | undefined {
  try {
    return execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
  } catch {
    return undefined;
  }
}

/** The changelog Changesets writes, one release per `## version` heading. */
function releasesFrom(body: RootContent[]): Release[] {
  const releases: Release[] = [];
  for (const node of body) {
    if (node.type === "heading" && node.depth === 2) {
      const version = textOf(node);
      releases.push({ version, id: (node as { id?: string }).id ?? version, body: [] });
    } else {
      const release = releases[releases.length - 1];
      if (!release) continue;
      // Changesets starts each entry with the commit it came from ("77703a0: …"); the page reads better without.
      if (node.type === "list") {
        for (const item of (node as List).children) {
          const first = item.children[0];
          const text = first?.type === "paragraph" ? first.children[0] : undefined;
          if (text?.type === "text") text.value = text.value.replace(/^[0-9a-f]{7,}: /, "");
        }
      }
      release.body.push(node);
    }
  }
  return releases;
}

export async function scan(config: DocsConfig, siteDir: string): Promise<Scanned> {
  const root = resolve(siteDir, "..");
  const branch = config.branch ?? "main";
  const files: string[] = [];
  const read = (file: string) => {
    files.push(file);
    return readFileSync(file, "utf8");
  };
  const repoPath = (file: string) => relative(root, file).split("\\").join("/");

  // 1. Which pages exist.
  const planned: Planned[] = [];
  const guides: Planned[] = [];
  const folders = new Map<string, Planned[]>();

  planned.push({
    id: "home",
    route: "/",
    title: config.name,
    description: config.description,
    kind: "home",
    section: "",
  });

  const readme = join(root, config.readme ?? "README.md");
  if (existsSync(readme))
    guides.push({
      id: "start",
      route: "/start/",
      title: "Getting started",
      description: "",
      kind: "doc",
      section: "Guides",
      file: readme,
      source: repoPath(readme),
      fixedTitle: true,
    });

  const docsDir = join(root, config.docs ?? "docs");
  const excluded = new Set(config.exclude ?? []);
  const order = config.order ?? [];
  /** Repository files the config leaves out of the site (an excluded name also covers that file at the root). */
  const hidden = new Set<string>([...excluded].map((id) => `${id}.md`));
  const rank = (id: string) => {
    const at = order.indexOf(id);
    return at === -1 ? order.length : at;
  };
  const byOrder = (a: Planned, b: Planned) => rank(a.id) - rank(b.id) || a.id.localeCompare(b.id);
  if (existsSync(docsDir)) {
    const top: Planned[] = [];
    for (const name of readdirSync(docsDir).sort()) {
      const path = join(docsDir, name);
      const id = name.replace(/\.md$/, "");
      if (excluded.has(id)) {
        hidden.add(repoPath(path));
        continue;
      }
      if (statSync(path).isDirectory()) {
        const pages: Planned[] = [];
        for (const child of readdirSync(path).sort()) {
          const childId = `${id}/${child.replace(/\.md$/, "")}`;
          if (!child.endsWith(".md") || excluded.has(childId)) continue;
          pages.push({
            id: childId,
            route: `/${childId}/`,
            title: "",
            description: "",
            kind: "doc",
            section: titled(id),
            file: join(path, child),
            source: repoPath(join(path, child)),
          });
        }
        if (pages.length) folders.set(titled(id), pages.sort(byOrder));
      } else if (name.endsWith(".md")) {
        top.push({
          id,
          route: `/${id}/`,
          title: "",
          description: "",
          kind: "doc",
          section: "Guides",
          file: path,
          source: repoPath(path),
        });
      }
    }
    guides.push(...top.sort(byOrder));
  }
  planned.push(...guides, ...[...folders.values()].flat());

  const components: Planned[] = [];
  /** Other files that lead to a page: a component's README, when its page is made from its docs page. */
  const aliases = new Map<string, string>();
  const base = trail(config.components?.route ?? "/components/");
  if (config.components) {
    for (const folder of config.components.folders) {
      const dir = join(root, folder);
      if (!existsSync(dir)) continue;
      for (const name of readdirSync(dir).sort()) {
        const readme = join(dir, name, "README.md");
        const docsPage = join(dir, name, `${name}.mdx`);
        // The hand-written docs page (also Storybook's Docs tab) when there is one; otherwise the README.
        const file = existsSync(docsPage) ? docsPage : readme;
        if (!existsSync(file)) continue;
        if (existsSync(readme)) aliases.set(repoPath(readme), `${base}${slug(name)}/`);
        components.push({
          id: `components/${slug(name)}`,
          route: `${base}${slug(name)}/`,
          title: name,
          description: "",
          kind: "component",
          section: "Components",
          file,
          source: repoPath(file),
          fixedTitle: true,
          componentFolder: join(dir, name),
          componentName: name,
        });
      }
    }
    components.sort((a, b) => a.title.localeCompare(b.title));
    if (components.length)
      planned.push({
        id: "components",
        route: base,
        title: "Components",
        description: `Every ${config.name} component, grouped by what it is for.`,
        kind: "catalogue",
        section: "Components",
      });
    planned.push(...components);
  }

  const changelog = join(root, config.changelog ?? "CHANGELOG.md");
  if (existsSync(changelog))
    planned.push({
      id: "changelog",
      route: "/changelog/",
      title: "Changelog",
      description: `Every release of ${config.name}, newest first.`,
      kind: "changelog",
      section: "Project",
      file: changelog,
      source: repoPath(changelog),
      fixedTitle: true,
    });

  // 2. Links between repository files lead to their pages.
  const routes = new Map([
    ...aliases,
    ...planned.filter((p) => p.source).map((p) => [p.source as string, p.route] as const),
  ]);
  const byStorybookId = new Map(
    components.map((c) => [(c.componentName as string).toLowerCase(), c.route] as const),
  );
  const storybookBase = config.components?.storybook ? trail(config.components.storybook) : undefined;
  const context = (source: string): LinkContext => ({
    source,
    routeOf: (path) => routes.get(path) ?? null,
    blob: `${config.repo}/blob/${branch}`,
    hidden: (path) => hidden.has(path),
    // A docs page links to its neighbours by their Storybook address; here they are pages.
    storybook: (query) => {
      const [, id = "", rest = ""] = /^\?path=\/docs\/[a-z]+-([a-z0-9]+)--docs(.*)$/.exec(query) ?? [];
      const route = byStorybookId.get(id);
      if (route) return route + rest;
      return storybookBase ? storybookBase + query : null;
    },
  });

  // 3. Component groups, as the README lists them.
  const groupOf = new Map<string, string>();
  let groups: { label: string; names: string[] }[] = [];
  if (components.length) {
    const known = new Set(components.map((c) => c.title));
    const [file, heading] = (config.components?.groups ?? "").split("#");
    if (file && heading && existsSync(join(root, file)))
      groups = groupsFrom(read(join(root, file)), heading, known);
    const grouped = new Set(groups.flatMap((g) => g.names));
    const rest = components.map((c) => c.title).filter((name) => !grouped.has(name));
    if (rest.length) groups.push({ label: groups.length ? "More" : "All", names: rest });
    for (const group of groups) for (const name of group.names) groupOf.set(name, group.label);
  }

  // 4. Each page's data.
  const version = installedVersion(config.package, root);
  const typesFrom = config.components?.typesFrom ?? config.package;
  const stories: Record<string, string> = {};
  const exports = components.length ? exportedNames(typesFrom) : [];
  const pages: PageData[] = [];
  for (const plan of planned) {
    const { file, fixedTitle, componentFolder, componentName, ...meta } = plan;
    const text = file ? read(file) : "";
    const parsed = file
      ? await parseMarkdown(file.endsWith(".mdx") ? fromDocsPage(text) : text, context(plan.source as string))
      : { title: "", lead: "", body: [], toc: [], text: "" };
    const page: PageData = {
      ...meta,
      title: fixedTitle || !parsed.title ? meta.title || titled(meta.id) : parsed.title,
      // A document that opens with a heading or code has no lead; its first paragraph still describes it.
      description: (
        meta.description ||
        parsed.lead ||
        textOf(parsed.body.find((node) => node.type === "paragraph") ?? { type: "text", value: "" })
      )
        .replace(/\s+/g, " ")
        .slice(0, 220),
      lead: parsed.lead,
      body: parsed.body,
      toc: parsed.toc,
    };
    if (plan.kind === "component" && componentFolder && componentName) {
      const group = groupOf.get(componentName);
      if (group) page.group = group;
      const wanted: string[] = [];
      const collect = (nodes: readonly unknown[]) => {
        for (const node of nodes as { type: string; stories?: string[]; children?: unknown[] }[]) {
          if (node.type === "canvas") wanted.push(...(node.stories ?? []));
          if (node.children) collect(node.children);
        }
      };
      collect(parsed.body);
      const storiesFile = join(componentFolder, `${componentName}.stories.tsx`);
      const examples = existsSync(storiesFile) ? examplesOf(wanted, read(storiesFile)) : [];
      if (examples.length) {
        stories[plan.id] = storiesFile;
        files.push(storiesFile);
      }
      const kind = repoPath(componentFolder).split("/").slice(-2, -1)[0] ?? "components";
      const props = propsOf(typesFrom, componentName) ?? [];
      page.component = {
        name: componentName,
        props,
        examples,
        exports,
        ...(examples.length ? { stories: plan.id } : {}),
        ...(storybookBase
          ? { storybook: `${storybookBase}?path=/docs/${kind}-${componentName.toLowerCase()}--docs` }
          : {}),
        folder: `${config.repo}/tree/${branch}/${repoPath(componentFolder)}`,
      };
      // A page whose document does not place the props table gets it at the end.
      const placed = (parsed.body as { type: string }[]).some((node) => node.type === "props");
      if (props.length && !placed) {
        page.body = [
          ...page.body,
          { type: "heading", depth: 2, id: "props", children: [{ type: "text", value: "Props" }] } as never,
          { type: "props" } as never,
        ];
        page.toc.push({ id: "props", text: "Props", depth: 2 });
      }
    }
    if (plan.kind === "changelog") {
      page.releases = releasesFrom(parsed.body);
      page.body = [];
      page.toc = page.releases.map((release) => ({ id: release.id, text: release.version, depth: 2 }));
      page.lead = page.description;
    }
    pages.push(page);
  }
  const byId = new Map(pages.map((page) => [page.id, page]));

  // 5. The catalogue and the navigation, from the same groups.
  const componentNav: NavNode[] = [];
  const catalogue: CatalogueGroup[] = [];
  for (const group of groups) {
    const members = group.names
      .map((name) => byId.get(`components/${slug(name)}`))
      .filter((page): page is PageData => Boolean(page));
    catalogue.push({
      label: group.label,
      items: members.map((page) => ({ name: page.title, route: page.route, summary: page.lead })),
    });
    componentNav.push({
      id: `group/${slug(group.label.replace(/\s+/g, ""))}`,
      label: group.label,
      items: members.map((page) => ({ id: page.id, label: page.title, href: page.route })),
    });
  }
  const cataloguePage = byId.get("components");
  if (cataloguePage) cataloguePage.catalogue = catalogue;

  // The navigation names a guide by its file ("code-editors" is "Code editors"), which stays short however long
  // the document's own title is; `labels` in the config overrides it.
  const entry = (plan: Planned): NavNode => {
    const page = byId.get(plan.id) as PageData;
    const short = plan.fixedTitle ? page.title : titled(plan.id.split("/").pop() as string);
    return { id: page.id, label: config.labels?.[plan.id] ?? short, href: page.route };
  };
  const nav: NavNode[] = [{ id: "home", label: "Overview", href: "/" }];
  if (guides.length) nav.push({ label: "Guides", items: guides.map(entry) });
  for (const [label, members] of folders) nav.push({ label, items: members.map(entry) });
  if (cataloguePage)
    nav.push({
      label: "Components",
      items: [{ id: "components", label: "All components", href: cataloguePage.route }, ...componentNav],
    });
  const project: NavNode[] = [];
  if (byId.has("changelog")) project.push({ id: "changelog", label: "Changelog", href: "/changelog/" });
  if (project.length) nav.push({ label: "Project", items: project });

  // 6. Previous and next, in navigation order.
  const sequence: PageData[] = [];
  const walk = (nodes: NavNode[]) => {
    for (const node of nodes) {
      const page = node.id ? byId.get(node.id) : undefined;
      if (page && page.kind !== "home") sequence.push(page);
      if (node.items) walk(node.items);
    }
  };
  walk(nav);
  sequence.forEach((page, index) => {
    const previous = sequence[index - 1];
    const next = sequence[index + 1];
    if (previous) page.previous = { title: previous.title, route: previous.route };
    if (next) page.next = { title: next.title, route: next.route };
  });

  // 7. The home page: a card per guide and section, and the newest release.
  const home = byId.get("home") as PageData;
  const latest = byId.get("changelog")?.releases?.[0];
  home.lead = config.description;
  home.home = {
    cards: [...guides.map((g) => byId.get(g.id) as PageData), cataloguePage, byId.get("changelog")]
      .filter((page): page is PageData => Boolean(page))
      .map((page) => ({ id: page.id, title: page.title, route: page.route, summary: page.description })),
    ...(latest
      ? {
          latest: {
            version: latest.version,
            route: `/changelog/#${latest.id}`,
            notes: latest.body
              .filter((node): node is List => node.type === "list")
              .flatMap((list) => list.children.map((item) => textOf(item).replace(/\s+/g, " ")))
              .slice(0, 4),
          },
        }
      : {}),
  };

  // 8. Search: every page and every heading in it.
  const search: SearchEntry[] = [];
  for (const page of pages) {
    if (page.kind === "home") continue;
    const group = page.group ? `${page.section}: ${page.group}` : page.section;
    search.push({
      id: page.route,
      route: page.route,
      label: page.title,
      group,
      keywords:
        page.lead
          .toLowerCase()
          .match(/[a-z][a-z-]{3,}/g)
          ?.slice(0, 24) ?? [],
    });
    for (const heading of page.toc) {
      if (page.kind === "changelog" || heading.id === "all-props" || heading.id === "examples") continue;
      search.push({
        id: `${page.route}#${heading.id}`,
        route: `${page.route}#${heading.id}`,
        label: `${page.title}: ${heading.text}`,
        group,
        keywords: [],
      });
    }
  }

  // The product's artwork, served from the site's root under plain names.
  const assets: Record<string, string> = {};
  const brand: SiteData["brand"] = {};
  for (const [key, name] of [
    ["mark", "logo"],
    ["favicon", "favicon"],
    ["appleTouchIcon", "apple-touch-icon"],
    ["shareImage", "share"],
  ] as const) {
    const source = config.brand?.[key];
    if (!source || !existsSync(join(root, source))) continue;
    const address = `/${name}${extname(source)}`;
    assets[address] = join(root, source);
    brand[key] = address;
    files.push(join(root, source));
  }

  const commit = commitOf(root);
  const site: SiteData = {
    name: config.name,
    tagline: config.tagline,
    description: config.description,
    package: config.package,
    version,
    repo: config.repo,
    branch,
    url: config.url.replace(/\/$/, ""),
    ...(config.website ? { website: config.website } : {}),
    npm: `https://www.npmjs.com/package/${config.package}`,
    install: config.install ?? `pnpm add ${config.package}`,
    brand,
    ...(commit ? { commit } : {}),
    nav,
    pages: pages.map(({ id, route, title, description, kind, section, group, source }) => ({
      id,
      route,
      title,
      description,
      kind,
      section,
      ...(group ? { group } : {}),
      ...(source ? { source } : {}),
    })),
    tabs: (config.tabs ?? ["home", "start", "components", "changelog"]).filter((id) => byId.has(id)),
  };
  return { site, assets, pages, search, stories, files: [...new Set(files)] };
}
