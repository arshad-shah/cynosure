/**
 * `pnpm icons:optimize`: makes every Facet icon as small as it can be drawn identically. Each icon is optimized
 * (tools/icon-optimize.ts), then both versions are rendered in Chromium at 16, 24 and 96px; a change is written back
 * only when every pixel matches. `--check` reports what would change and exits 1 if anything would.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";
import * as facet from "../src/icons/facet";
import type { IconData } from "../src/icons/types";
import { iconSvg, optimizeIcon } from "./icon-optimize";

const SIZES = [16, 24, 96];

/** In the page: renders each pair at every size and says whether every pixel matches. */
const RENDER_COMPARE = `async ({ pairs, sizes }) => {
  const pixels = async (svg, size) => {
    const img = new Image(size, size);
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg.replace(/width="d+" height="d+"/, 'width="' + size + '" height="' + size + '"'));
    await img.decode();
    const canvas = new OffscreenCanvas(size, size);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, size, size);
    return ctx.getImageData(0, 0, size, size).data;
  };
  const out = [];
  for (const [a, b] of pairs) {
    let same = true;
    for (const size of sizes) {
      const pa = await pixels(a, size);
      const pb = await pixels(b, size);
      if (pa.length !== pb.length || pa.some((v, i) => v !== pb[i])) { same = false; break; }
    }
    out.push(same);
  }
  return out;
}`;

/** Renders pairs of SVGs and says, for each pair, whether every pixel is the same at every size. */
async function sameRendering(pairs: [string, string][]): Promise<boolean[]> {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.setContent("<!doctype html><title>icons</title>");
    // Sent as source text: the TypeScript loader would wrap a function with helpers the page does not have.
    return (await page.evaluate(
      `(${RENDER_COMPARE})(${JSON.stringify({ pairs, sizes: SIZES })})`,
    )) as boolean[];
  } finally {
    await browser.close();
  }
}

export interface IconChange {
  name: string;
  before: number;
  after: number;
  identical: boolean;
}

/** Optimizes every icon in `src/icons`; writes the identical-rendering changes unless `check`. */
export async function optimizeIcons({ root = ".", check = false } = {}): Promise<IconChange[]> {
  const icons = Object.values(facet).filter(
    (v): v is IconData => typeof v === "object" && v !== null && "body" in v,
  );
  const candidates = icons
    .map((icon) => ({ icon, next: optimizeIcon(icon) }))
    .filter(({ icon, next }) => JSON.stringify(icon.body) !== JSON.stringify(next.body));
  const same = await sameRendering(candidates.map(({ icon, next }) => [iconSvg(icon), iconSvg(next)]));
  const changes: IconChange[] = [];
  candidates.forEach(({ icon, next }, i) => {
    const size = (x: IconData) => JSON.stringify(x.body).length;
    const identical = same[i] as boolean;
    changes.push({ name: icon.name, before: size(icon), after: size(next), identical });
    if (check || !identical) return;
    const file = join(root, "src/icons", `${icon.name}.ts`);
    let text = readFileSync(file, "utf8");
    icon.body.forEach(([tag, attrs], j) => {
      const nextAttrs = (next.body[j] as (typeof icon.body)[number])[1] as { d?: string };
      if (tag === "path" && "d" in attrs && nextAttrs.d !== attrs.d)
        text = text.replace(JSON.stringify(attrs.d), JSON.stringify(nextAttrs.d));
    });
    writeFileSync(file, text);
  });
  return changes;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const check = process.argv.includes("--check");
  const changes = await optimizeIcons({ check });
  const kept = changes.filter((c) => c.identical);
  const saved = kept.reduce((sum, c) => sum + c.before - c.after, 0);
  for (const c of changes.filter((c) => !c.identical))
    console.log(`  ${c.name}: left as is (the shorter path did not render identically)`);
  console.log(
    `${check ? "Would optimize" : "Optimized"} ${kept.length} icon(s), ${saved} characters of path data; ${changes.length - kept.length} left as is.`,
  );
  if (check && kept.length) process.exit(1);
}
