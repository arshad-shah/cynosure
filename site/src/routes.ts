/**
 * Where each repository document lives on the site. Used by the Markdown link rewriter (so links between READMEs and
 * guides stay on the site) and by the pages themselves. Anything not listed here is linked on GitHub instead.
 */

export const REPO = "https://github.com/arshad-shah/cynosure";

/** The guides: `docs/<file>.md` shown at `/<file>/`, in navigation order. */
export const GUIDES = [
  { file: "theming", label: "Theming" },
  { file: "icons", label: "Icons" },
  { file: "code-editors", label: "Code editors" },
  { file: "without-react", label: "Without React" },
  { file: "adapters", label: "Build adapters" },
  { file: "migration", label: "Migration" },
] as const;

/** `AppShell` → `app-shell`. */
export const slug = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

/** The site route of a repository path (relative to the repository root), or null when it has no page. */
export function routeOf(repoPath: string): string | null {
  const path = repoPath.replace(/^\.\//, "");
  if (path === "README.md") return "/start/";
  if (path === "CHANGELOG.md") return "/changelog/";
  const guide = /^docs\/([a-z-]+)\.md$/.exec(path)?.[1];
  if (guide && GUIDES.some((g) => g.file === guide)) return `/${guide}/`;
  const component = /^src\/(?:components|foundations)\/([A-Za-z]+)\/README\.md$/.exec(path)?.[1];
  if (component) return `/components/${slug(component)}/`;
  return null;
}
