/**
 * The size budget of `@arshad-shah/cynosure/icons/by-name` (every Facet icon), run by `pnpm size` after size-limit.
 * size-limit's file plugin gzips each file on its own and adds the results up, which counts every icon module's
 * gzip overhead and the re-export modules too (about five times the real cost). An app that imports the entry gets
 * one bundle, so this bundles the entry with the build's own bundler (Vite) and gzips that.
 */
import { gzipSync } from "node:zlib";
import { build, type Rolldown } from "vite";

/** The budget in bytes, gzipped: the measured size (13.54 kB, 274 icons) with a little room. Raise it when icons are added. */
export const ICONS_BY_NAME_BUDGET = 14_000;

/** The minified, gzipped size of `src/icons/by-name.ts` as one bundle, in bytes. */
export async function iconsByNameSize(): Promise<number> {
  const result = await build({
    configFile: false,
    logLevel: "silent",
    build: {
      write: false,
      minify: true,
      target: "es2023",
      lib: { entry: "src/icons/by-name.ts", formats: ["es"], fileName: "by-name" },
    },
  });
  const outputs = (Array.isArray(result) ? result : [result]) as Rolldown.RolldownOutput[];
  const code = outputs
    .flatMap((o) => o.output)
    .map((chunk) => (chunk.type === "chunk" ? chunk.code : ""))
    .join("");
  return gzipSync(code, { level: 9 }).length;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const size = await iconsByNameSize();
  const kb = (n: number) => `${(n / 1000).toFixed(2)} kB`;
  const line = `icons/by-name (every Facet icon, one bundle): ${kb(size)} gzipped, budget ${kb(ICONS_BY_NAME_BUDGET)}`;
  if (size > ICONS_BY_NAME_BUDGET) {
    console.error(`✖ ${line}`);
    process.exit(1);
  }
  console.log(`✔ ${line}`);
}
