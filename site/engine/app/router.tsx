/**
 * Navigation between pages without a full reload. The first page arrives as HTML; after that a click on an internal
 * link loads that page's data and swaps the content, so the shell, the navigation's scroll position and the theme
 * stay put. Anything that is not a page of this site (Storybook, a file, another origin) is left to the browser.
 */
import pages from "virtual:docs/pages";
import site from "virtual:docs/site";
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { PageData } from "../types";

/** `/theming` and `/theming/index.html` are `/theming/`. */
export const normalise = (path: string) => {
  const clean = path.replace(/index\.html$/, "");
  return clean.endsWith("/") ? clean : `${clean}/`;
};

export async function loadPage(route: string): Promise<PageData | null> {
  const load = pages[normalise(route)];
  return load ? (await load()).default : null;
}

interface Router {
  page: PageData | null;
  route: string;
  navigate: (href: string) => void;
}
const Context = createContext<Router>({ page: null, route: "/", navigate: () => undefined });
export const useRouter = () => useContext(Context);

const titleOf = (page: PageData | null) =>
  !page
    ? `Not found · ${site.name}`
    : page.kind === "home"
      ? `${site.name}: ${site.tagline}`
      : `${page.title} · ${site.name}`;

/** Where the page's own scrolling happens: the shell's content area. */
const scroller = () => document.querySelector<HTMLElement>("main");

function settle(hash: string) {
  const main = scroller();
  const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
  if (target) target.scrollIntoView();
  else main?.scrollTo(0, 0);
}

export function RouterProvider({
  initial,
  initialRoute,
  children,
}: {
  initial: PageData | null;
  initialRoute: string;
  children: ReactNode;
}) {
  const [state, setState] = useState({ page: initial, route: initialRoute });

  const show = useCallback(async (url: URL, push: boolean) => {
    const route = normalise(url.pathname);
    const page = await loadPage(route);
    if (push) history.pushState(null, "", url.pathname + url.search + url.hash);
    setState({ page, route });
    document.title = titleOf(page);
    // After the new page has rendered: go to the heading asked for, or the top, and tell assistive technology the
    // page changed by moving focus to the content.
    requestAnimationFrame(() => {
      settle(url.hash);
      if (push) scroller()?.focus({ preventScroll: true });
    });
  }, []);

  const navigate = useCallback(
    (href: string) => {
      const url = new URL(href, location.href);
      if (url.origin !== location.origin || !pages[normalise(url.pathname)]) {
        location.assign(url.href);
        return;
      }
      if (normalise(url.pathname) === normalise(location.pathname)) {
        if (url.hash !== location.hash) history.pushState(null, "", url.hash || url.pathname);
        settle(url.hash);
        return;
      }
      void show(url, true);
    },
    [show],
  );

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, location.href);
      if (url.origin !== location.origin || !pages[normalise(url.pathname)]) return;
      event.preventDefault();
      navigate(anchor.href);
    };
    const onPop = () => void show(new URL(location.href), false);
    document.addEventListener("click", onClick);
    window.addEventListener("popstate", onPop);
    // A page opened at a heading: the heading exists only once the page has rendered.
    if (location.hash) settle(location.hash);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("popstate", onPop);
    };
  }, [navigate, show]);

  const value = useMemo(() => ({ ...state, navigate }), [state, navigate]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export { titleOf };
