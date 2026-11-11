// Every internal link in the built site must lead to a page or file that exists: run after `pnpm build:site`.
// External links are left to the browser; Storybook's own files are trusted to its build.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../dist/", import.meta.url).pathname;
const pages = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      if (path !== join(root, "storybook")) walk(path);
    } else if (name.endsWith(".html")) pages.push(path);
  }
};
walk(root);

const missing = [];
for (const page of pages) {
  const html = readFileSync(page, "utf8");
  for (const [, href] of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    if (!href.startsWith("/") || href.startsWith("//")) continue;
    const path = decodeURI(href.split(/[?#]/)[0]);
    const target = join(root, path);
    const found = existsSync(target) && (statSync(target).isFile() || existsSync(join(target, "index.html")));
    if (!found) missing.push(`${page.slice(root.length)} → ${href}`);
  }
}
if (missing.length) {
  console.error(`Broken internal links:\n${missing.join("\n")}`);
  process.exit(1);
}
console.log(`Links checked: ${pages.length} pages, every internal link resolves.`);
