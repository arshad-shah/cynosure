// Rewrites links in the repository's Markdown (READMEs and docs/*.md) for the site: a link to another document that
// has a page goes to that page; any other relative link goes to the file on GitHub. Anchors are kept.
import { dirname, posix, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(fileURLToPath(new URL("../..", import.meta.url)));

/** @param {{ routeOf: (path: string) => string | null, repo: string }} options */
export default function remarkRepoLinks({ routeOf, repo }) {
  return (tree, file) => {
    const from = file.path ? relative(repoRoot, dirname(file.path)) : "";
    const visit = (node) => {
      if (node.type === "link" && typeof node.url === "string")
        node.url = rewrite(node.url, from, routeOf, repo);
      for (const child of node.children ?? []) visit(child);
    };
    visit(tree);
  };
}

function rewrite(url, from, routeOf, repo) {
  if (/^[a-z]+:|^\/\/|^#|^\?/i.test(url)) return url;
  const [path, hash = ""] = url.split("#");
  const target = posix.normalize(posix.join(from.split("\\").join("/"), path));
  const anchor = hash ? `#${hash}` : "";
  const route = routeOf(target);
  if (route) return route + anchor;
  return `${repo}/blob/main/${target}${anchor}`;
}
