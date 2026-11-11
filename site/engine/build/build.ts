/**
 * Builds the site into `dist/`: the app (Vite), then every page as its own HTML file, rendered with the same
 * components the browser then takes over. Also writes `404.html` and `sitemap.xml`. Run with `pnpm build`.
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { themeInitScript } from "@arshad-shah/cynosure/tokens";
import { build } from "vite";
import type { PageData, SiteData } from "../types.ts";

const siteDir = fileURLToPath(new URL("../..", import.meta.url));
const dist = join(siteDir, "dist");
const server = join(siteDir, ".server");

const escapeHtml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

await build({ root: siteDir, logLevel: "warn" });
await build({
  root: siteDir,
  logLevel: "warn",
  build: { ssr: "engine/app/entry-server.tsx", outDir: ".server", emptyOutDir: true },
});

const entry = (await import(pathToFileURL(join(server, "entry-server.js")).href)) as {
  site: SiteData;
  routes: string[];
  render: (route: string | null) => Promise<{ html: string; title: string; page: PageData | null }>;
};
const { site } = entry;
const template = readFileSync(join(dist, "index.html"), "utf8");
// The saved colour mode is applied before the first paint, so a dark-mode visitor never sees a light flash.
const init = `<script>${themeInitScript()}</script>`;

async function write(route: string | null, file: string) {
  const { html, title, page } = await entry.render(route);
  const description = page?.description || site.description;
  const address = route ? site.url + route : undefined;
  const head = [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    address ? `<link rel="canonical" href="${address}" />` : `<meta name="robots" content="noindex" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:type" content="${page?.kind === "home" ? "website" : "article"}" />`,
    `<meta property="og:site_name" content="${escapeHtml(site.name)}" />`,
    address ? `<meta property="og:url" content="${address}" />` : "",
    `<meta name="twitter:card" content="summary" />`,
    init,
  ]
    .filter(Boolean)
    .join("\n    ");
  const path = join(dist, file);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, template.replace("<!--head-->", head).replace("<!--app-->", html));
}

for (const route of entry.routes) await write(route, join(route, "index.html"));
await write(null, "404.html");

writeFileSync(
  join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entry.routes
    .map((route) => `  <url><loc>${site.url}${route}</loc></url>`)
    .join("\n")}\n</urlset>\n`,
);
rmSync(server, { recursive: true, force: true });
console.log(`Built ${entry.routes.length} pages of ${site.name} ${site.version} into dist/.`);
