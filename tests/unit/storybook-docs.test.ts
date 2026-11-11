import remarkGfm from "remark-gfm";
import { describe, expect, it } from "vitest";
import config from "../../.storybook/main";

describe("Storybook docs pages", () => {
  it("compile MDX with GFM so markdown tables render as tables, not raw pipes", () => {
    const docs = config.addons?.find((a) => typeof a === "object" && a.name === "@storybook/addon-docs") as
      | { options?: { mdxPluginOptions?: { mdxCompileOptions?: { remarkPlugins?: unknown[] } } } }
      | undefined;
    // Strict: `toContain` on undefined does not fail, so assert the shape first.
    expect(docs).toBeDefined();
    const plugins = docs?.options?.mdxPluginOptions?.mdxCompileOptions?.remarkPlugins;
    expect(Array.isArray(plugins)).toBe(true);
    expect(plugins).toEqual(expect.arrayContaining([remarkGfm]));
  });
});
