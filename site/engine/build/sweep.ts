/**
 * Opens every built page in a real browser, at desktop and phone width, and fails on anything a visitor would see as
 * broken: a console error, a page that scrolls sideways, a second page-level scrollbar, or an example that opens
 * over the page by itself. Run against a served
 * build: `pnpm preview` in one terminal, `pnpm sweep` in another.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const origin = process.env.SITE_ORIGIN ?? "http://localhost:4321";
const sitemap = readFileSync(fileURLToPath(new URL("../../dist/sitemap.xml", import.meta.url)), "utf8");
const routes = [...sitemap.matchAll(/<loc>https?:\/\/[^/]+([^<]*)<\/loc>/g)].map(
  (match) => match[1] as string,
);
const sizes = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "phone", width: 390, height: 844 },
];

const browser = await chromium.launch();
const problems: string[] = [];
for (const size of sizes) {
  const context = await browser.newContext({ viewport: size, hasTouch: size.name === "phone" });
  const page = await context.newPage();
  let where = "";
  page.on("console", (message) => {
    if (message.type() === "error") problems.push(`${size.name} ${where}: console: ${message.text()}`);
  });
  page.on("pageerror", (error) => problems.push(`${size.name} ${where}: error: ${error.message}`));
  for (const route of routes) {
    where = route;
    await page.goto(origin + route, { waitUntil: "networkidle" });
    const found = await page.evaluate(() => {
      const root = document.documentElement;
      const main = document.querySelector("main");
      const wide = [...(main?.querySelectorAll("*") ?? [])].find((element) => {
        const box = element.getBoundingClientRect();
        if (!box.width || box.right <= window.innerWidth + 1) return false;
        // Content inside its own sideways scroller (code, a wide table) is fine.
        for (let parent = element.parentElement; parent && parent !== main; parent = parent.parentElement)
          if (/(auto|scroll|hidden|clip)/.test(getComputedStyle(parent).overflowX)) return false;
        return true;
      });
      return {
        sideways:
          root.scrollWidth > window.innerWidth + 1 ||
          (main ? main.scrollWidth > main.clientWidth + 1 : false),
        tall: root.scrollHeight > window.innerHeight + 1,
        wide: wide ? `${wide.tagName.toLowerCase()}.${String(wide.className).split(" ")[0]}` : "",
        hydrated: Boolean(main),
        modal: Boolean(document.querySelector("dialog:modal")),
      };
    });
    if (!found.hydrated) problems.push(`${size.name} ${route}: no content`);
    if (found.sideways)
      problems.push(`${size.name} ${route}: scrolls sideways (${found.wide || "unknown element"})`);
    if (found.modal) problems.push(`${size.name} ${route}: something opened over the page on load`);
    if (found.tall) problems.push(`${size.name} ${route}: the page itself scrolls (second scrollbar)`);
  }
  await context.close();
}
await browser.close();
if (problems.length) {
  console.error(`${problems.length} problems:\n${problems.join("\n")}`);
  process.exit(1);
}
console.log(
  `Swept ${routes.length} pages at ${sizes.map((size) => size.width).join(" and ")} points: clean.`,
);
