/**
 * Every internal link in the built site must lead to a page or file that exists. Run after the build
 * (`pnpm links`). External links are left to the browser; a Storybook built beside the site is trusted to its own
 * build.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../dist/", import.meta.url));
const pages: string[] = [];
const walk = (dir: string) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      if (path !== join(root, "storybook")) walk(path);
    } else if (name.endsWith(".html")) pages.push(path);
  }
};
walk(root);

const exists = (path: string) => {
  const target = join(root, path);
  return existsSync(target) && (statSync(target).isFile() || existsSync(join(target, "index.html")));
};
const missing: string[] = [];
for (const page of pages) {
  const html = readFileSync(page, "utf8");
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
  for (const [, href = ""] of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const where = page.slice(root.length);
    if (href.startsWith("#")) {
      if (href.length > 1 && !ids.has(decodeURIComponent(href.slice(1)))) missing.push(`${where}: ${href}`);
      continue;
    }
    if (!href.startsWith("/") || href.startsWith("//")) continue;
    const path = decodeURI(href.split(/[?#]/)[0] ?? "");
    if (path.startsWith("/storybook/") && !existsSync(join(root, "storybook"))) continue;
    if (!exists(path)) missing.push(`${where}: ${href}`);
  }
}
if (missing.length) {
  console.error(`Broken internal links:\n${missing.join("\n")}`);
  process.exit(1);
}
console.log(`Links checked: ${pages.length} pages, every internal link resolves.`);
