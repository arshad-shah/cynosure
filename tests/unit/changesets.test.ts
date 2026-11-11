import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// The release workflow stops on a changeset it cannot parse (a formatter once turned every front-matter fence into a
// Markdown heading). Checking them here fails the gates instead of the release. There may be none: the release
// consumes them all, and its own commit runs this test through the git hook, so an empty folder must pass.
describe("changesets", () => {
  const files = readdirSync(".changeset").filter((f) => f.endsWith(".md") && f !== "README.md");
  it("each names this package and a bump in its front matter", () => {
    for (const file of files) {
      const text = readFileSync(`.changeset/${file}`, "utf8");
      expect(text, file).toMatch(/^---\n"@arshad-shah\/cynosure": (major|minor|patch)\n---\n\n\S/);
    }
  });
});
