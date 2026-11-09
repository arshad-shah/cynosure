import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { check } from "../../../tools/cli/lib/check";
import { readProgress } from "../../../tools/cli/lib/progress";
import {
  addComponentToken,
  iconId,
  scaffoldComponent,
  scaffoldIcon,
  sortExports,
} from "../../../tools/cli/lib/scaffold";

const repo = resolve(__dirname, "../../..");
const temps: string[] = [];
function sandbox(): string {
  const dir = mkdtempSync(join(tmpdir(), "cy-cli-"));
  temps.push(dir);
  for (const p of ["src", "tsconfig.json", ".size-limit.json", "AGENTS.md", "tools", ".storybook", "docs"])
    cpSync(join(repo, p), join(dir, p), { recursive: true });
  symlinkSync(join(repo, "node_modules"), join(dir, "node_modules"));
  return dir;
}
afterEach(() => {
  for (const d of temps.splice(0)) rmSync(d, { recursive: true, force: true });
});
const write = (root: string, file: string, text: string) => writeFileSync(join(root, file), text);
const rules = (root: string) => check(root).map((v) => v.rule);

describe("cy check", () => {
  it("passes on the real repo", () => {
    expect(check(repo)).toEqual([]);
  });
  it("flags a native button in a composite with file and line", () => {
    const root = sandbox();
    write(
      root,
      "src/components/Button/Bad.tsx",
      'export const Bad = () => (\n  <button type="button">x</button>\n);\n',
    );
    const found = check(root).find((v) => v.rule === "native-elements");
    expect(found).toMatchObject({ file: "src/components/Button/Bad.tsx", line: 2 });
  });
  it("flags an emoji or text glyph used as an icon", () => {
    const root = sandbox();
    write(root, "src/components/Button/Glyph.tsx", "export const G = () => <span>✓ Saved</span>;\n");
    expect(rules(root)).toContain("glyphs");
  });
  it("requires .js extensions on relative imports in shipped source", () => {
    const root = sandbox();
    write(
      root,
      "src/components/Button/Ext.ts",
      'import { Icon } from "../../foundations/Icon/Icon";\nexport { Icon };\n',
    );
    expect(check(root).find((v) => v.rule === "import-extensions")).toMatchObject({
      file: "src/components/Button/Ext.ts",
      line: 1,
    });
  });
  it("checks literals in foundations CSS too", () => {
    const root = sandbox();
    write(root, "src/foundations/Icon/extra.css", ".x { color: #ff0000; }\n");
    expect(check(root).find((v) => v.rule === "literals")?.file).toBe("src/foundations/Icon/extra.css");
  });
  it("flags createElement of native interactive tags outside foundations", () => {
    const root = sandbox();
    write(
      root,
      "src/components/Button/Ce.tsx",
      'import { createElement } from "react";\nexport const C = () => createElement("button", null, "x");\n',
    );
    expect(check(root).find((v) => v.rule === "native-elements")?.file).toBe("src/components/Button/Ce.tsx");
  });
  it("flags glyphs inside JSX string expressions", () => {
    const root = sandbox();
    write(
      root,
      "src/components/Button/G2.tsx",
      'export const G = () => <span className="cy-reset">{"✓"}</span>;\n',
    );
    expect(rules(root)).toContain("glyphs");
  });
  it("allows a title prop on Cynosure components but not on DOM elements", () => {
    const root = sandbox();
    write(
      root,
      "src/components/Button/T2.tsx",
      'const Card = (p: { title: string }) => null;\nexport const T = () => <Card title="Summary" />;\n',
    );
    expect(rules(root)).not.toContain("title-attr");
  });
  it("inherit-chain: flags a cy- element that neither resets nor declares its font size", () => {
    const root = sandbox();
    write(
      root,
      "src/components/Button/Part.tsx",
      'export const P = () => <span className="cy-probe-part">x</span>;\n',
    );
    write(root, "src/components/Button/part.css", ".cy-probe-part { display: block; }\n");
    expect(check(root).find((v) => v.rule === "inherit-chain")).toMatchObject({
      file: "src/components/Button/Part.tsx",
    });
    write(root, "src/components/Button/part.css", ".cy-probe-part { display: block; font-size: inherit; }\n");
    expect(rules(root)).not.toContain("inherit-chain");
  });
  it("flags title= attributes", () => {
    const root = sandbox();
    write(root, "src/components/Button/T.tsx", 'export const T = () => <span title="Saved">x</span>;\n');
    expect(rules(root)).toContain("title-attr");
  });
  it("flags hex and px literals in component CSS but allows var() fallbacks", () => {
    const root = sandbox();
    write(
      root,
      "src/components/Button/extra.css",
      ".x { color: #ff0000; padding: 4px; gap: var(--cy-gap, 8px); }\n",
    );
    const lits = check(root).filter((v) => v.rule === "literals");
    expect(lits).toHaveLength(2);
  });
  it("requires an AGENTS.md in every documented folder", () => {
    const root = sandbox();
    expect(check(root).filter((v) => v.rule === "agents")).toEqual([]);
    rmSync(join(root, "src/components/AGENTS.md"));
    expect(
      check(root)
        .filter((v) => v.rule === "agents")
        .map((v) => v.file),
    ).toEqual(["src/components"]);
  });
  it("requires a play test and a Used by section for every component", () => {
    const root = sandbox();
    rmSync(join(root, "src/components/IconButton/README.md"));
    expect(rules(root)).toContain("structure");
  });
  it("flags glyphs used as icons or arrows in docs pages", () => {
    const root = sandbox();
    const page = "src/components/Badge/Badge.mdx";
    write(root, page, `${readFileSync(join(root, page), "utf8")}\n- it navigates \u2192 Link\n`);
    const glyphs = check(root).filter((v) => v.rule === "glyphs");
    expect(glyphs.map((v) => v.file)).toEqual([page]);
  });
  it("requires a hand-written docs page attached to the stories for every component", () => {
    const root = sandbox();
    rmSync(join(root, "src/components/Button/Button.mdx"));
    write(root, "src/foundations/LinkBase/LinkBase.mdx", "# LinkBase\n\nNo Meta here.\n");
    const docs = check(root).filter((v) => v.rule === "docs");
    expect(docs.map((v) => v.file).sort()).toEqual(["src/components/Button", "src/foundations/LinkBase"]);
  });
});

describe("cy new component", () => {
  it("scaffolds a composite that typechecks and only reports its TODO(cy) markers", () => {
    const root = sandbox();
    scaffoldComponent(root, "ScaffoldProbe", "composite");
    for (const f of [
      "ScaffoldProbe.tsx",
      "scaffold-probe.css",
      "ScaffoldProbe.stories.tsx",
      "README.md",
      "ScaffoldProbe.mdx",
      "index.ts",
    ])
      expect(existsSync(join(root, "src/components/ScaffoldProbe", f))).toBe(true);
    expect(readFileSync(join(root, "src/components/ScaffoldProbe/ScaffoldProbe.mdx"), "utf8")).toContain(
      "<Meta of={Stories} />",
    );
    expect(readFileSync(join(root, "src/index.ts"), "utf8")).toContain(
      'export { ScaffoldProbe, type ScaffoldProbeProps } from "./components/ScaffoldProbe/index.js";',
    );
    expect(
      JSON.parse(readFileSync(join(root, ".size-limit.json"), "utf8")).map((e: { name: string }) => e.name),
    ).toContain("ScaffoldProbe (JS + CSS)");
    expect(new Set(rules(root))).toEqual(new Set(["scaffold-todo"]));
    execFileSync(join(repo, "node_modules/.bin/tsc"), ["-p", root], { stdio: "pipe" });
  });
  it("scaffolds a foundation under src/foundations", () => {
    const root = sandbox();
    scaffoldComponent(root, "SliderBase", "foundation");
    expect(existsSync(join(root, "src/foundations/SliderBase/SliderBase.tsx"))).toBe(true);
  });
  it("refuses an existing name and non-PascalCase names", () => {
    const root = sandbox();
    expect(() => scaffoldComponent(root, "Button", "composite")).toThrow(/exists/);
    expect(() => scaffoldComponent(root, "badge", "composite")).toThrow(/PascalCase/);
  });
});

describe("sortExports", () => {
  it("keeps multi-line export statements intact while sorting", () => {
    const input =
      'export { Zed } from "./z.js";\nexport {\n  Alpha,\n  type AlphaProps,\n} from "./a.js";\nexport * from "./theme/index.js";\n';
    expect(sortExports(input)).toBe(
      'export {\n  Alpha,\n  type AlphaProps,\n} from "./a.js";\nexport { Zed } from "./z.js";\nexport * from "./theme/index.js";\n',
    );
  });
});

describe("cy new token", () => {
  it("adds a typed component token and documents it", () => {
    const root = sandbox();
    addComponentToken(root, "button.ringColor", "Colour of the focus ring");
    expect(readFileSync(join(root, "src/components/Button/Button.tsx"), "utf8")).toMatch(
      /interface ButtonTokens \{\n {2}ringColor: string;/,
    );
    expect(readFileSync(join(root, "src/components/Button/README.md"), "utf8")).toContain(
      "`--cy-button-ring-color`: Colour of the focus ring",
    );
  });
});

describe("cy new icon", () => {
  it("converts an SVG into a validated icon module and exports it", () => {
    const root = sandbox();
    const svg =
      '<svg viewBox="0 0 24 24"><path d="M4 12h16"/><rect x="3" y="3" width="6" height="6" rx="1.5"/></svg>';
    scaffoldIcon(root, "flat-line", svg, "actions");
    const mod = readFileSync(join(root, "src/icons/flat-line.ts"), "utf8");
    expect(mod).toContain('name: "flat-line"');
    expect(mod).toContain('category: "actions"');
    expect(mod).toContain('["rect", { x: 3, y: 3, width: 6, height: 6, rx: 1.5 }]');
    expect(readFileSync(join(root, "src/icons/index.ts"), "utf8")).toContain(
      'export { flatLine } from "./flat-line.js";',
    );
  });
  it("rejects filled shapes (stroke only)", () => {
    const root = sandbox();
    expect(() =>
      scaffoldIcon(
        root,
        "blob",
        '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="3" height="3" fill="red"/></svg>',
        "actions",
      ),
    ).toThrow(/stroke only/);
  });
  it("suffixes reserved-word icon names so the export is valid", () => {
    expect([iconId("package"), iconId("delete"), iconId("arrow-left")]).toEqual([
      "packageIcon",
      "deleteIcon",
      "arrowLeft",
    ]);
  });
  it("rejects an SVG with text", () => {
    const root = sandbox();
    expect(() =>
      scaffoldIcon(root, "bad", '<svg viewBox="0 0 24 24"><text>A</text></svg>', "actions"),
    ).toThrow(/text/);
  });
});

describe("cy progress", () => {
  it("returns the current task and next step", () => {
    const root = sandbox();
    write(
      root,
      "PROGRESS.md",
      "# P\n## Status\nok\n## Current task\nT7\n## Next step\nT8\n## Plans\n- x\n## Blockers\nnone\n## Decision log\n- d\n## Verification\n- v\n## How to resume\npnpm i\n",
    );
    expect(readProgress(join(root, "PROGRESS.md"))).toEqual({ current: "T7", next: "T8" });
  });
  it("fails when the Next step section is missing", () => {
    const root = sandbox();
    write(root, "PROGRESS.md", "# P\n## Status\nok\n## Current task\nT7\n");
    expect(() => readProgress(join(root, "PROGRESS.md"))).toThrow(/Next step/);
  });
});
