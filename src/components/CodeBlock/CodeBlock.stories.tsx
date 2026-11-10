import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, waitFor } from "storybook/test";
import { contrast } from "../../test/color.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { CynosureTheme } from "../../theme/CynosureTheme.js";
import { Stack } from "../Stack/Stack.js";
import { CodeBlock } from "./CodeBlock.js";

const CODE = `import { defineConfig } from "vite";

export default defineConfig({
  base: "/cynosure/",
  build: { target: "es2022", sourcemap: true, reportCompressedSize: false, chunkSizeWarningLimit: 2048 },
});
`;

/** A stand-in highlighter: wraps keywords in spans, as Shiki or Prism output would. */
const highlight = (code: string) =>
  code.split(/(\b(?:import|export|default|from)\b)/).map((part, i) =>
    /^(import|export|default|from)$/.test(part) ? (
      <span key={i} className="kw" style={{ color: "var(--cy-color-accent-text)" }}>
        {part}
      </span>
    ) : (
      part
    ),
  );

const meta = {
  title: "Components/CodeBlock",
  component: CodeBlock,
  args: { code: CODE, title: "vite.config.ts", language: "ts", copy: fn() },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    lineNumbers: { control: "boolean" },
    wrap: { control: "boolean" },
    copyable: { control: "boolean" },
  },
  decorators: [(Story) => <div style={{ maxWidth: 520 }}>{Story()}</div>],
} satisfies Meta<typeof CodeBlock>;
export default meta;
type Story = StoryObj<typeof meta>;

const pre = (el: Element) => el.querySelector("pre") as HTMLElement;

export const CodeWithAHeader: Story = {
  tags: ["visual"],
  play: async ({ canvas, canvasElement }) => {
    const figure = canvas.getByRole("figure", { name: "vite.config.ts" });
    await expect(figure).toBeVisible();
    // The code is exactly the text given, without the trailing new line.
    await expect(pre(canvasElement).textContent).toBe(CODE.replace(/\n$/, ""));
    await expect(canvas.getByRole("button", { name: "Copy" })).toBeVisible();
    await expect(canvas.getByRole("region", { name: "vite.config.ts" })).toBe(pre(canvasElement));
  },
};

export const CopyingTheCode: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Copy" }));
    await expect(args.copy).toHaveBeenCalledWith(CODE);
    await waitFor(() => expect(canvas.getByRole("button", { name: "Copied" })).toBeVisible());
  },
};

export const LongLinesScrollWithTheKeyboard: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const code = pre(canvasElement);
    await expect(code.scrollWidth).toBeGreaterThan(code.clientWidth);
    // The scrolling code is a tab stop (after the copy button), so keyboard users can scroll it.
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Copy" })).toHaveFocus();
    await userEvent.tab();
    await expect(code).toHaveFocus();
    code.scrollLeft = 80;
    await expect(code.scrollLeft).toBeGreaterThan(0);
  },
};

export const LineNumbers: Story = {
  args: { lineNumbers: true },
  play: async ({ canvasElement }) => {
    const gutter = canvasElement.querySelector(".cy-code-block-gutter") as HTMLElement;
    await expect(gutter).toHaveAttribute("aria-hidden", "true");
    const numbers = [...gutter.children].map((n) => n.textContent);
    await expect(numbers).toEqual(["1", "2", "3", "4", "5", "6"]);
    // Numbers line up with the lines: same line height, same total height.
    const code = canvasElement.querySelector("code") as HTMLElement;
    await expect(
      Math.abs(gutter.children[0]?.getBoundingClientRect().height as number) -
        Number.parseFloat(getComputedStyle(code).lineHeight),
    ).toBeLessThan(1);
    await expect(getComputedStyle(gutter).userSelect).toBe("none");
    // Numbers are not part of the code's text (selection and copy).
    await expect(pre(canvasElement).textContent).not.toContain("1import");
  },
};

export const BringYourOwnHighlighter: Story = {
  args: { highlight },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const keywords = [...canvasElement.querySelectorAll(".kw")].map((k) => k.textContent);
    await expect(keywords).toEqual(["import", "from", "export", "default"]);
    await expect(pre(canvasElement).textContent).toBe(CODE.replace(/\n$/, ""));
    // Copy still copies the plain source.
    await userEvent.click(canvas.getByRole("button", { name: "Copy" }));
    await expect(args.copy).toHaveBeenCalledWith(CODE);
  },
};

export const Wrapped: Story = {
  args: { wrap: true, lineNumbers: true },
  play: async ({ canvas, canvasElement }) => {
    const code = pre(canvasElement);
    // Wrapping: no sideways scroll, so no scroll region, and no line numbers (they would not line up).
    await expect(code.scrollWidth).toBeLessThanOrEqual(code.clientWidth);
    await expect(code).not.toHaveAttribute("tabindex");
    await expect(canvas.queryByRole("region")).toBeNull();
    await expect(canvasElement.querySelector(".cy-code-block-gutter")).toBeNull();
  },
};

export const TallCodeScrolls: Story = {
  args: {
    code: Array.from({ length: 80 }, (_, i) => `line ${i + 1}`).join("\n"),
    title: undefined,
    language: "txt",
  },
  play: async ({ canvas, canvasElement }) => {
    const body = canvasElement.querySelector(".cy-code-block-body") as HTMLElement;
    await expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
    // Without a title the language heads the block and names the region.
    await expect(canvas.getByRole("region", { name: "txt" })).toBeVisible();
  },
};

export const Bare: Story = {
  args: { title: undefined, language: undefined, copyable: false, labels: { region: "Example" } },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvasElement.querySelector(".cy-code-block-header")).toBeNull();
    await expect(canvas.getByRole("figure", { name: "Example" })).toBeVisible();
    await expect(canvas.queryByRole("button")).toBeNull();
    await expect(canvas.getByRole("region", { name: "Example" })).toBeVisible();
  },
};

export const NamesAndDefaults: Story = {
  render: () => (
    <Stack gap="4">
      <CodeBlock code="npm i" title={<strong>Install</strong>} language="sh" className="element-title" />
      <CodeBlock code="plain" className="no-title" />
    </Stack>
  ),
  play: async ({ canvas, canvasElement }) => {
    // A title that is an element still names the figure; the scroll region falls back to the language.
    await expect(canvas.getByRole("figure", { name: "Install" })).toHaveClass("element-title");
    await expect(canvas.getByRole("region", { name: "sh" })).toBeVisible();
    // No title or language: the header holds only the copy button, and the block is called "Code".
    const bare = canvasElement.querySelector(".no-title") as HTMLElement;
    await expect(bare).toHaveAccessibleName("Code");
    await expect(bare.querySelector(".cy-code-block-title")?.textContent).toBe("");
    await expect(bare.querySelector("code")).not.toHaveAttribute("data-language");
  },
};

export const ReadableInLightAndDark: Story = {
  args: { highlight, lineNumbers: true },
  render: (args) => (
    <Stack gap="4">
      {(["light", "dark"] as const).map((mode) => (
        <CynosureTheme key={mode} mode={mode}>
          <div className="surface">
            <CodeBlock {...args} title={`${mode}.ts`} />
          </div>
        </CynosureTheme>
      ))}
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    for (const surface of canvasElement.querySelectorAll(".surface")) {
      const block = getComputedStyle(surface.querySelector(".cy-code-block") as Element);
      const header = getComputedStyle(surface.querySelector(".cy-code-block-header") as Element);
      const colour = (sel: string) => getComputedStyle(surface.querySelector(sel) as Element).color;
      await expect(contrast(colour("code"), block.backgroundColor)).toBeGreaterThanOrEqual(4.5);
      await expect(contrast(colour(".kw"), block.backgroundColor)).toBeGreaterThanOrEqual(4.5);
      await expect(contrast(colour(".cy-code-block-gutter"), block.backgroundColor)).toBeGreaterThanOrEqual(
        4.5,
      );
      await expect(contrast(colour(".cy-code-block-title"), header.backgroundColor)).toBeGreaterThanOrEqual(
        4.5,
      );
    }
  },
};

export const MarkedLines: Story = {
  args: {
    code: "let i = 0;\nwhile (i < 3) {\n  i++;\n}",
    language: "ts",
    lineNumbers: true,
    activeLines: [3],
  },
  play: async ({ canvasElement }) => {
    const mark = canvasElement.querySelector(".cy-code-block-mark") as HTMLElement;
    const pre = canvasElement.querySelector(".cy-code-block-pre") as HTMLElement;
    // The band covers the third line: two line heights below the top padding, one line tall.
    const line = Number.parseFloat(getComputedStyle(pre).lineHeight);
    const pad = Number.parseFloat(getComputedStyle(pre).paddingTop);
    await expect(mark.getBoundingClientRect().top - pre.getBoundingClientRect().top).toBeCloseTo(
      pad + 2 * line,
      0,
    );
    await expect(mark.getBoundingClientRect().height).toBeCloseTo(line, 0);
    await expect(canvasElement.querySelector("[data-active]")).toHaveTextContent("3");
    await expect(canvasElement.querySelector(".cy-visually-hidden")).toHaveTextContent("Line 3 highlighted");
  },
};

export const StableUnderHostileHost: Story = {
  args: { lineNumbers: true },
  play: async ({ canvasElement }) => {
    const props = [
      "font-family",
      "font-size",
      "line-height",
      "color",
      "white-space",
      "padding-left",
      "box-sizing",
    ];
    for (const selector of [
      ".cy-code-block",
      ".cy-code-block-title",
      ".cy-code-block-pre",
      ".cy-code-block-gutter",
    ]) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, props);
      await expect({ selector, ...hostile }).toEqual({ selector, ...clean });
    }
  },
};
