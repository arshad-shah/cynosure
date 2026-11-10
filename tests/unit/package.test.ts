import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const pkg = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8"));

describe("package manifest", () => {
  it("is ESM-only, depends only on detent and exposes the documented subpaths", () => {
    expect(pkg.name).toBe("@arshad-shah/cynosure");
    expect(pkg.type).toBe("module");
    // The one runtime dependency: Arshad's own zero-dependency drag/reorder library (approved 2026-11-10).
    expect(Object.keys(pkg.dependencies ?? {})).toEqual(["@arshad-shah/detent"]);
    expect(pkg.peerDependencies.react).toBe(">=18 <20");
    expect(pkg.peerDependencies["react-dom"]).toBe(">=18 <20");
    expect(Object.keys(pkg.exports)).toEqual([
      ".",
      "./icons",
      "./styles.css",
      "./styles/*.css",
      "./styles.inline",
      "./vite",
      "./fonts/*",
      "./package.json",
    ]);
    expect(pkg.sideEffects).toEqual(["*.css"]);
  });
});

import { existsSync, mkdtempSync, readFileSync as read } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildCss } from "../../tools/build-css";

describe("CSS build", () => {
  it("copies the optional font files next to the stylesheets", () => {
    const out = mkdtempSync(join(tmpdir(), "cy-build-"));
    buildCss("src", out);
    expect(existsSync(join(out, "fonts", "hanken.css"))).toBe(true);
    expect(existsSync(join(out, "fonts", "hanken-grotesk-latin-wght-normal.woff2"))).toBe(true);
    expect(read(join(out, "fonts", "hanken.css"), "utf8")).toContain("Hanken Grotesk");
  });
  it("M13: OS reduced motion reaches every Cynosure element, including component roots", () => {
    const out = mkdtempSync(join(tmpdir(), "cy-build-"));
    const css = buildCss("src", out);
    expect(css).toMatch(/@media \(prefers-reduced-motion:reduce\)\{:where\(\[class\*=cy-\]\)/);
  });
});
