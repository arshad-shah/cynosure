import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { contrast, rgb } from "../../test/color.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { ROOT_ATTRIBUTES, rootAttributesStory } from "../../test/root-attributes.js";
import { ColorSample } from "./ColorSample.js";

const meta = {
  title: "Components/Feedback and display/ColorSample",
  component: ColorSample,
  args: { color: "#3366ff", size: "md" },
  argTypes: {
    color: { control: "color" },
    ink: { control: "color" },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    largeText: { control: "boolean" },
    contrast: { control: "boolean" },
    label: { control: "text" },
    children: { control: "text" },
  },
} satisfies Meta<typeof ColorSample>;
export default meta;
type Story = StoryObj<typeof meta>;

const surfaceOf = (el: Element) => el.querySelector(".cy-color-sample-surface") as HTMLElement;
const same = (a: string, b: string) => rgb(a).join() === rgb(b).join();
/** The colour a surface is painted with: the first layer of its background. */
const paint = (el: Element) => /rgba?\([^)]*\)/.exec(getComputedStyle(el).backgroundImage)?.[0] ?? "";

export const AColourAsASurface: Story = {
  args: { color: "rgb(51 102 255)", label: "Brand blue" },
  play: async ({ canvas, canvasElement }) => {
    // It is an image of the colour, named by its label, with no text and no contrast line.
    const sample = canvas.getByRole("img", { name: "Brand blue" });
    await expect(sample).toHaveClass("cy-color-sample");
    await expect(same(paint(surfaceOf(canvasElement)), "rgb(51 102 255)")).toBe(true);
    await expect(canvas.queryByText(/Contrast/)).toBeNull();
    // It fills the width it is given and has a height of its own.
    const r = surfaceOf(canvasElement).getBoundingClientRect();
    await expect(r.height).toBeGreaterThan(40);
    await expect(
      Math.abs(
        r.width -
          (canvasElement.querySelector(".cy-color-sample") as HTMLElement).getBoundingClientRect().width,
      ),
    ).toBeLessThan(1);
  },
};

export const NamedByTheColourWithoutALabel: Story = {
  args: { color: "teal" },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("img", { name: "teal" })).toBeVisible();
  },
};

export const TextOnAColourWithItsContrast: Story = {
  args: { color: "#ffffff", ink: "#767676", children: "The quick brown fox" },
  play: async ({ canvas, canvasElement }) => {
    // The text is drawn in the ink on the colour.
    const text = canvas.getByText("The quick brown fox");
    await expect(same(getComputedStyle(text).color, "#767676")).toBe(true);
    await expect(same(paint(surfaceOf(canvasElement)), "#ffffff")).toBe(true);
    await expect(contrast(getComputedStyle(text).color, paint(surfaceOf(canvasElement)))).toBeCloseTo(
      4.54,
      1,
    );
    // The ratio is shown, cut (never rounded up) to two decimals, with the WCAG levels it passes and fails.
    await expect(canvas.getByText("Contrast 4.54:1")).toBeVisible();
    await expect(canvas.getByText("AA pass")).toBeInTheDocument();
    await expect(canvas.getByText("AAA fail")).toBeInTheDocument();
    // The group is named by the pair.
    await expect(canvas.getByRole("group", { name: "#767676 on #ffffff" })).toBeVisible();
  },
};

export const JustBelowAAFails: Story = {
  args: { color: "white", ink: "#777777" },
  play: async ({ canvas }) => {
    // 4.478:1 is shown as 4.47, and fails AA: a ratio is never rounded up into a pass.
    await expect(canvas.getByText("Contrast 4.47:1")).toBeVisible();
    await expect(canvas.getByText("AA fail")).toBeInTheDocument();
    // The default sample text.
    await expect(canvas.getByText("Aa")).toBeVisible();
  },
};

export const LargeTextThresholds: Story = {
  args: { color: "white", ink: "#949494", largeText: true },
  play: async ({ canvas }) => {
    // About 3:1: large text passes AA at 3 and AAA at 4.5.
    await expect(canvas.getByText(/^Contrast 3\.0\d:1$/)).toBeVisible();
    await expect(canvas.getByText("AA pass")).toBeInTheDocument();
    await expect(canvas.getByText("AAA fail")).toBeInTheDocument();
  },
};

export const TranslucentInkIsBlended: Story = {
  args: { color: "white", ink: "rgb(0 0 0 / 0.5)" },
  play: async ({ canvas }) => {
    // Half black on white is #808080 as seen: about 3.95:1.
    await expect(canvas.getByText("Contrast 3.94:1")).toBeVisible();
  },
};

export const WithoutTheContrastLine: Story = {
  args: { color: "navy", ink: "white", contrast: false, children: "Preview" },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Preview")).toBeVisible();
    await expect(canvas.queryByText(/Contrast/)).toBeNull();
  },
};

export const Labels: Story = {
  args: {
    color: "white",
    ink: "black",
    labels: {
      contrast: (ratio) => `Kontrast ${ratio}:1`,
      pass: (level) => `${level} bestanden`,
      fail: (level) => `${level} nicht bestanden`,
      on: (ink, color) => `${ink} auf ${color}`,
      sample: "Beispiel",
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Kontrast 21:1")).toBeVisible();
    await expect(canvas.getByText("AAA bestanden")).toBeInTheDocument();
    await expect(canvas.getByText("Beispiel")).toBeVisible();
    await expect(canvas.getByRole("group", { name: "black auf white" })).toBeVisible();
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 8 }}>
      <ColorSample color="red" size="sm" label="small" />
      <ColorSample color="red" size="md" label="medium" />
      <ColorSample color="red" size="lg" label="large" />
    </div>
  ),
  play: async ({ canvas }) => {
    const h = (name: string) => canvas.getByRole("img", { name }).getBoundingClientRect().height;
    await expect(h("small")).toBeLessThan(h("medium"));
    await expect(h("medium")).toBeLessThan(h("large"));
  },
};

export const ThemedThroughTokens: Story = {
  args: { color: "gold", label: "Gold" },
  render: (args) => (
    <div
      style={{
        ["--cy-color-sample-height" as string]: "123px",
        ["--cy-color-sample-radius" as string]: "0px",
      }}
    >
      <ColorSample {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const s = surfaceOf(canvasElement);
    await expect(s.getBoundingClientRect().height).toBeCloseTo(123, 0);
    await expect(getComputedStyle(s).borderTopLeftRadius).toBe("0px");
  },
};

export const StableUnderHostileHost: Story = {
  args: { color: "white", ink: "black" },
  play: async ({ canvasElement }) => {
    for (const selector of [".cy-color-sample", ".cy-color-sample-surface", ".cy-color-sample-text"]) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, [
        "display",
        "height",
        "font-size",
        "box-sizing",
        "text-transform",
        "letter-spacing",
      ]);
      await expect({ selector, ...hostile }).toEqual({ selector, ...clean });
    }
  },
};

export const PassesIdDataAndRef: Story = rootAttributesStory<HTMLDivElement>(
  (ref) => <ColorSample ref={ref} color="red" {...ROOT_ATTRIBUTES} />,
  "cy-color-sample",
);
