import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// The release workflow stops on a changeset it cannot parse (a formatter once turned every front-matter fence into a
// Markdown heading). Checking them here fails the gates instead of the release.
describe("changesets", () => {
  const files = readdirSync(".changeset").filter((f) => f.endsWith(".md") && f !== "README.md");
  it.each(files)("%s has front matter naming this package and a bump", (file) => {
    const text = readFileSync(`.changeset/${file}`, "utf8");
    expect(text).toMatch(/^---\n"@arshad-shah\/cynosure": (major|minor|patch)\n---\n\n\S/);
  });
});
