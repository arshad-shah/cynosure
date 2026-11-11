/**
 * The frame of every page, all Cynosure: AppShell with the product bar on top, the page tree in a SideNav (a drawer
 * and a tab bar on phones), search in a CommandPalette (Ctrl or Command+K), and the colour mode in a ThemeToggle.
 */

import site from "virtual:docs/site";
import {
  AppShell,
  Badge,
  Button,
  CommandPalette,
  CynosureTheme,
  IconButton,
  Kbd,
  Link,
  type NavEntry,
  SideNav,
  ThemeToggle,
  Toaster,
  useColorMode,
} from "@arshad-shah/cynosure";
import { github, npm } from "@arshad-shah/cynosure/brands";
import { external, globe, search as searchIcon } from "@arshad-shah/cynosure/icons";
import { type ReactNode, useMemo, useState } from "react";
import config from "../../docs.config";
import type { NavNode, SearchEntry } from "../types";
import { useRouter } from "./router";

const icons = config.icons ?? {};

function entries(nodes: NavNode[]): NavEntry[] {
  return nodes.map((node) => {
    if (!node.id) return { label: node.label, items: entries(node.items ?? []) as never };
    const icon = icons[node.id];
    return {
      id: node.id,
      label: node.label,
      ...(node.href ? { href: node.href } : {}),
      ...(icon ? { icon } : {}),
      ...(node.items ? { items: entries(node.items) as never } : {}),
    };
  });
}

const NAV = entries(site.nav);
const TABS: NavEntry[] = site.tabs.flatMap((id) => {
  const page = site.pages.find((candidate) => candidate.id === id);
  const icon = icons[id];
  if (!page) return [];
  const label = id === "home" ? "Home" : id === "start" ? "Start" : page.title;
  return [{ id, label, href: page.route, ...(icon ? { icon } : {}) }];
});

/** Until the full index has loaded, search knows the pages. */
const PAGES: SearchEntry[] = site.pages
  .filter((page) => page.kind !== "home")
  .map((page) => ({
    id: page.route,
    route: page.route,
    label: page.title,
    group: page.group ? `${page.section}: ${page.group}` : page.section,
    keywords: [],
  }));

export function Shell({ children }: { children: ReactNode }) {
  const { mode, setMode } = useColorMode();
  const { page, navigate } = useRouter();
  const [searching, setSearching] = useState(false);
  const [index, setIndex] = useState<SearchEntry[]>(PAGES);

  const openSearch = (open: boolean) => {
    setSearching(open);
    if (open && index === PAGES)
      void import("virtual:docs/search").then((loaded) => setIndex(loaded.default));
  };
  const commands = useMemo(
    () => index.map(({ id, label, group, keywords }) => ({ id, label, group, keywords })),
    [index],
  );

  // The entry to mark current: the page, or for a page outside the tree (not found) nothing.
  const current = page?.id;
  // The tab a page belongs to: its own, or its section's first tab.
  const tab = page
    ? (site.tabs.find((id) => id === page.id) ??
      site.tabs.find((id) => site.pages.find((p) => p.id === id)?.section === page.section))
    : undefined;

  const links = (
    <>
      {site.website && (
        <IconButton size="sm" variant="ghost" icon={globe} label="Website" href={site.website} />
      )}
      {(config.links ?? []).map((item) => (
        <IconButton
          key={item.href}
          size="sm"
          variant="ghost"
          icon={item.icon ?? external}
          label={item.label}
          href={item.href}
        />
      ))}
      <IconButton size="sm" variant="ghost" icon={github} label="GitHub" href={site.repo} />
      <IconButton size="sm" variant="ghost" icon={npm} label="npm" href={site.npm} />
    </>
  );

  return (
    <CynosureTheme target="document" mode={mode}>
      <Toaster>
        <AppShell
          className="docs-shell"
          header={
            <div className="docs-bar">
              <div className="docs-bar-brand">
                <Link href="/" tone="neutral" className="docs-brand">
                  {/* Decorative: the name beside it is the link's text. */}
                  {site.brand.mark && <img className="docs-logo" src={site.brand.mark} alt="" />}
                  {site.name}
                </Link>
                <Badge size="sm" tone="neutral" variant="outline">
                  v{site.version}
                </Badge>
                {/* A preview of what is on its way: the published documentation is the one at the site's address. */}
                {site.unreleased && (
                  <Badge size="sm" tone="warning" variant="outline">
                    Unreleased
                  </Badge>
                )}
              </div>
              <div className="docs-bar-tools">
                <Button
                  className="docs-search-wide"
                  size="sm"
                  icon={searchIcon}
                  onClick={() => openSearch(true)}
                  aria-keyshortcuts="Control+K Meta+K"
                >
                  Search
                  <Kbd size="sm" keys="mod+k" />
                </Button>
                <IconButton
                  className="docs-search-narrow"
                  size="sm"
                  variant="ghost"
                  icon={searchIcon}
                  label="Search"
                  onClick={() => openSearch(true)}
                />
                <span className="docs-bar-links">{links}</span>
                <ThemeToggle size="sm" variant="cycle" value={mode} onChange={setMode} />
              </div>
            </div>
          }
          nav={
            <SideNav
              // Remounted when the page's group changes, so a page reached through search or a link has its group open.
              key={page?.group ?? page?.section ?? "none"}
              label={`${site.name} documentation`}
              items={NAV}
              current={current}
            />
          }
          tabs={<SideNav label="Sections" layout="bar" items={TABS} current={tab} />}
        >
          {children}
        </AppShell>
        <CommandPalette
          open={searching}
          onOpenChange={openSearch}
          commands={commands}
          onRun={(id) => navigate(id)}
          labels={{
            title: `Search ${site.name}`,
            placeholder: "Search the documentation",
            empty: "No page matches",
          }}
        />
      </Toaster>
    </CynosureTheme>
  );
}
