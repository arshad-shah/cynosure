import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import * as icons from "../../icons/index.js";
import type { IconData } from "../../icons/types.js";
import { CynosureTheme } from "../../theme/index.js";
import { createTheme } from "../../tokens/index.js";
import { Icon } from "./Icon.js";

const all = Object.values(icons).filter(
  (v): v is IconData => typeof v === "object" && v !== null && "body" in v,
);

const meta = { title: "Foundations/Icon", component: Icon, args: { icon: icons.search } } satisfies Meta<
  typeof Icon
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Gallery: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8 }}>
      {all.map((icon) => (
        <div
          key={icon.name}
          className="cy-motion-trigger"
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            padding: 12,
            borderRadius: 10,
            background: "var(--cy-color-surface)",
          }}
        >
          <Icon icon={icon} size="lg" />
          <span style={{ fontFamily: "var(--cy-font-mono)", fontSize: 12 }}>{icon.name}</span>
        </div>
      ))}
    </div>
  ),
};

export const Decorative: Story = {
  play: async ({ canvasElement }) => {
    const svg = canvasElement.querySelector("svg.cy-icon") as SVGElement;
    await expect(svg.getAttribute("aria-hidden")).toBe("true");
    await expect(svg.getAttribute("role")).toBeNull();
    await expect(svg.getAttribute("focusable")).toBe("false");
  },
};

export const Labelled: Story = {
  args: { label: "Search" },
  play: async ({ canvas }) => {
    const img = canvas.getByRole("img", { name: "Search" });
    await expect(img.getAttribute("aria-hidden")).toBeNull();
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "end" }}>
      {(["sm", "md", "lg", 32] as const).map((s) => (
        <Icon key={s} icon={icons.search} size={s} />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const widths = [...canvasElement.querySelectorAll("svg.cy-icon")].map(
      (s) => s.getBoundingClientRect().width,
    );
    await expect(widths).toEqual([14, 16, 20, 32]);
  },
};

export const StarTakesAccent: Story = {
  render: () => (
    <CynosureTheme theme={createTheme({ accent: "#14b8a6" })}>
      <Icon icon={icons.check} size="lg" />
    </CynosureTheme>
  ),
  play: async ({ canvasElement }) => {
    const star = canvasElement.querySelector(".cy-icon-star") as SVGElement;
    await expect(getComputedStyle(star).fill).toBe("rgb(20, 184, 166)");
  },
};

export const MotionOnActive: Story = {
  render: () => (
    <div className="cy-motion-trigger" data-active="" data-testid="trigger">
      <Icon icon={icons.trash} size="lg" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const part = canvasElement.querySelector(".cy-icon-animate") as SVGElement;
    await expect(getComputedStyle(part).animationName).not.toBe("none");
  },
};

export const ReducedMotion: Story = {
  render: () => (
    <CynosureTheme theme={createTheme({ motion: "reduced" })}>
      <div className="cy-motion-trigger" data-active="">
        <Icon icon={icons.trash} size="lg" />
      </div>
    </CynosureTheme>
  ),
  play: async ({ canvasElement }) => {
    const part = canvasElement.querySelector(".cy-icon-animate") as SVGElement;
    await expect(getComputedStyle(part).animationDuration).toBe("0s");
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    const { computeUnderHostileHost } = await import("../../test/hostile.js");
    const { clean, hostile } = computeUnderHostileHost(canvasElement, "svg.cy-icon", [
      "width",
      "height",
      "stroke-width",
      "display",
    ]);
    await expect(hostile).toEqual(clean);
  },
};
