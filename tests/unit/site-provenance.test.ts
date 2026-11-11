import { describe, expect, it } from "vitest";
import { examplesNote, propsNote, viewRef } from "../../site/engine/app/provenance";

/**
 * What the documentation site says about the version it shows. The site is built from one commit, so a page must
 * never describe two versions as if both were on it (it once said "the examples run the library's source at <commit>;
 * the package on npm is 0.2.0" on a build where everything came from that commit).
 */
const base = { name: "Cynosure", package: "@arshad-shah/cynosure", version: "0.2.0" };

describe("the site's version notes", () => {
  it("on a release build, name the one version and never call it unreleased", () => {
    for (const note of [
      examplesNote({ ...base, commit: "233f3ba" }),
      propsNote({ ...base, commit: "233f3ba" }),
    ]) {
      expect(note).toContain("0.2.0");
      expect(note).not.toMatch(/unreleased/i);
      expect(note).not.toMatch(/library's source/i);
    }
    expect(examplesNote({ ...base, commit: "233f3ba" })).toBe(
      "These examples run Cynosure 0.2.0 (commit 233f3ba), the version on npm.",
    );
    expect(propsNote(base)).toBe("Generated from the type definitions in @arshad-shah/cynosure 0.2.0.");
  });

  it("on a build with pending changes, say so and give the published version as the other one", () => {
    const site = { ...base, unreleased: true, commit: "6cc6783" };
    expect(examplesNote(site)).toBe(
      "These examples run unreleased changes (commit 6cc6783). The published version is 0.2.0.",
    );
    expect(propsNote(site)).toBe(
      "Generated from the type definitions of unreleased changes (commit 6cc6783). @arshad-shah/cynosure on npm is 0.2.0.",
    );
  });

  it("leave the commit out when it is not known", () => {
    expect(examplesNote(base)).toBe("These examples run Cynosure 0.2.0, the version on npm.");
    expect(examplesNote({ ...base, unreleased: true })).toBe(
      "These examples run unreleased changes. The published version is 0.2.0.",
    );
  });

  it("link to files at the built commit while changes are pending, and at the branch on a release", () => {
    expect(viewRef({ branch: "main", unreleased: true, commit: "6cc6783" })).toBe("6cc6783");
    expect(viewRef({ branch: "main", commit: "233f3ba" })).toBe("main");
    expect(viewRef({ branch: "main", unreleased: true })).toBe("main");
  });
});
