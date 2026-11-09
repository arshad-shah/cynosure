import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const pkg = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8"));

describe("package manifest", () => {
  it("is ESM-only, dependency-free and exposes the documented subpaths", () => {
    expect(pkg.name).toBe("@arshad-shah/cynosure");
    expect(pkg.type).toBe("module");
    expect(Object.keys(pkg.dependencies ?? {})).toEqual([]);
    expect(pkg.peerDependencies.react).toBe(">=18 <20");
    expect(pkg.peerDependencies["react-dom"]).toBe(">=18 <20");
    expect(Object.keys(pkg.exports)).toEqual([
      ".",
      "./icons",
      "./styles.css",
      "./styles/*.css",
      "./styles.inline",
      "./vite",
      "./package.json",
    ]);
    expect(pkg.sideEffects).toEqual(["*.css"]);
  });
});
