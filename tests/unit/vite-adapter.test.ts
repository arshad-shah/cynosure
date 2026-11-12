import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { cynosure } from "../../src/adapters/vite";
import { CynosureThemeError } from "../../src/tokens";

const call = <T>(hook: unknown, ...args: unknown[]) => (hook as (...a: unknown[]) => T)(...args);

describe("cynosure() Vite adapter", () => {
  it("serves the product theme as a virtual stylesheet", () => {
    const plugin = cynosure({ theme: { accent: "#14b8a6", scale: "compact" } });
    const id = call<string>(plugin.resolveId, "virtual:cynosure/theme.css");
    expect(id).toBe("\0virtual:cynosure/theme.css");
    const css = call<string>(plugin.load, id);
    expect(css).toContain("--cy-color-accent:#14b8a6");
    expect(css).toContain("--cy-control-height-md:28px");
  });

  it("scopes the theme to a custom selector", () => {
    const plugin = cynosure({ selector: ":host" });
    expect(call<string>(plugin.load, "\0virtual:cynosure/theme.css").startsWith(":host{")).toBe(true);
  });

  it("serves all CSS plus the theme as a string module for shadow roots", () => {
    const dir = mkdtempSync(join(tmpdir(), "cy-vite-"));
    writeFileSync(join(dir, "styles.css"), ".cy-button{color:red}");
    const plugin = cynosure({ theme: { accent: "#e8462e" }, stylesheet: join(dir, "styles.css") });
    const code = call<string>(plugin.load, call<string>(plugin.resolveId, "virtual:cynosure/inline"));
    expect(code.startsWith("export default ")).toBe(true);
    const css = JSON.parse(code.slice("export default ".length).replace(/;$/, ""));
    expect(css).toContain(".cy-button{color:red}");
    expect(css).toContain("--cy-color-accent:#e8462e");
  });

  it("ignores ids it does not own", () => {
    const plugin = cynosure();
    expect(call(plugin.resolveId, "react")).toBeUndefined();
    expect(call(plugin.load, "/src/main.tsx")).toBeUndefined();
  });

  it("fails the build on an invalid theme", () => {
    expect(() => cynosure({ theme: { accent: "nope" } })).toThrow(CynosureThemeError);
  });
});

describe('cynosure({ styles: "imports" })', () => {
  const dir = mkdtempSync(join(tmpdir(), "cy-manifest-"));
  const manifest = join(dir, "manifest.json");
  writeFileSync(
    manifest,
    JSON.stringify({
      Button: ["base.css", "icon.css", "button.css", "loading-dots.css"],
      Inline: ["base.css", "stack.css"],
      Sheet: ["base.css", "dialog.css", "sheet.css"],
    }),
  );
  const transform = (code: string, options: Parameters<typeof cynosure>[0] = {}, id = "/app/src/Page.tsx") =>
    call<string | undefined>(cynosure({ styles: "imports", manifest, ...options }).transform, code, id);

  it("adds the stylesheets the imported components need, with nothing listed by hand", () => {
    const out = transform(
      'import { Inline, Sheet, type ButtonProps } from "@arshad-shah/cynosure";\n',
    ) as string;
    expect(out).toContain('import "@arshad-shah/cynosure/styles/stack.css";');
    expect(out).toContain('import "@arshad-shah/cynosure/styles/dialog.css";');
    expect(out).toContain('import "@arshad-shah/cynosure/styles/base.css";');
    // A type-only import brings no CSS.
    expect(out).not.toContain("button.css");
    // No theme given: the default tokens come first.
    expect(out.indexOf("tokens.css")).toBeLessThan(out.indexOf("base.css"));
  });

  it("leaves the tokens to the theme when there is one, and modules without Cynosure alone", () => {
    const themed = transform('import { Button as B } from "@arshad-shah/cynosure";', {
      theme: { accent: "#0f766e" },
    });
    expect(themed).toContain("loading-dots.css");
    expect(themed).not.toContain("tokens.css");
    expect(transform('import { useState } from "react";')).toBeUndefined();
    expect(
      transform('import { Button } from "@arshad-shah/cynosure";', {}, "/x/node_modules/y.js"),
    ).toBeUndefined();
  });

  it("is off unless asked for", () => {
    const plugin = cynosure({ manifest });
    expect(
      call(plugin.transform, 'import { Button } from "@arshad-shah/cynosure";', "/a.tsx"),
    ).toBeUndefined();
  });
});
