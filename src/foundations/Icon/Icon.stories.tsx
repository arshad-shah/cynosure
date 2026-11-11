import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import * as brands from "../../brands/index.js";
import * as icons from "../../icons/index.js";
import type { IconData } from "../../icons/types.js";
import { ICON_CATEGORIES } from "../../icons/types.js";
import { CynosureTheme } from "../../theme/index.js";
import { createTheme } from "../../tokens/index.js";
import { Icon } from "./Icon.js";

const all = Object.values(icons).filter(
  (v): v is IconData => typeof v === "object" && v !== null && "body" in v,
);

const mapping = Object.fromEntries(all.map((i) => [i.name, i]));
const meta = {
  title: "Foundations/Icon",
  component: Icon,
  args: { icon: icons.search, size: "lg", tone: "inherit" },
  argTypes: {
    icon: { control: "select", options: Object.keys(mapping), mapping },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    tone: {
      control: "select",
      options: ["inherit", "accent", "neutral", "muted", "danger", "success", "warning", "info"],
    },
    color: { control: "color" },
    label: { control: "text" },
  },
} satisfies Meta<typeof Icon>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Gallery: Story = {
  parameters: { layout: "fullscreen" },
  render: () => (
    <div style={{ display: "grid", gap: 28, maxWidth: 1080 }}>
      {ICON_CATEGORIES.map((category) => {
        const items = all.filter((i) => i.category === category);
        return (
          <section key={category} aria-labelledby={`cat-${category}`} data-category={category}>
            <h2
              id={`cat-${category}`}
              style={{
                margin: "0 0 10px",
                font: "600 11px/1 var(--cy-font-mono)",
                letterSpacing: ".08em",
                textTransform: "uppercase",
                color: "var(--cy-color-muted)",
              }}
            >
              {category} · {items.length}
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(104px, 1fr))",
                gap: 8,
              }}
            >
              {items.map((icon) => (
                <figure
                  key={icon.name}
                  className="cy-motion-trigger"
                  data-icon={icon.name}
                  style={{
                    margin: 0,
                    display: "grid",
                    justifyItems: "center",
                    gap: 10,
                    padding: "16px 8px 12px",
                    borderRadius: 12,
                    border: "1px solid var(--cy-color-line)",
                    background: "var(--cy-color-surface)",
                    color: "var(--cy-color-ink)",
                  }}
                >
                  <Icon icon={icon} size={24} />
                  <figcaption
                    style={{
                      font: "11px/1.3 var(--cy-font-mono)",
                      color: "var(--cy-color-muted)",
                      textAlign: "center",
                    }}
                  >
                    {icon.name}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const tiles = [...canvasElement.querySelectorAll("[data-icon]")];
    await expect(tiles).toHaveLength(all.length);
    await expect(new Set(tiles.map((t) => t.getAttribute("data-icon"))).size).toBe(all.length);
    for (const category of ICON_CATEGORIES) {
      const section = canvasElement.querySelector(`[data-category="${category}"]`) as HTMLElement;
      for (const tile of section.querySelectorAll("[data-icon]")) {
        const icon = all.find((i) => i.name === tile.getAttribute("data-icon"));
        await expect(icon?.category).toBe(category);
      }
    }
    // Every glyph renders at the requested size with visible strokes.
    for (const svg of canvasElement.querySelectorAll("svg.cy-icon")) {
      await expect(svg.getBoundingClientRect().width).toBe(24);
      await expect((svg as SVGGraphicsElement).getBBox().width).toBeGreaterThan(0);
    }
  },
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

export const LayoutClassName: Story = {
  args: { className: "nav-icon", style: { marginInlineEnd: 6 } },
  play: async ({ canvasElement }) => {
    const svg = canvasElement.querySelector("svg.cy-icon") as SVGElement;
    await expect(svg).toHaveClass("cy-icon", "nav-icon");
    await expect(getComputedStyle(svg).marginInlineEnd).toBe("6px");
  },
};

export const TonesAndColour: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12 }}>
      <Icon icon={icons.check} tone="success" size="lg" />
      <Icon icon={icons.warning} tone="warning" size="lg" />
      <Icon icon={icons.trash} tone="danger" size="lg" />
      <Icon icon={icons.info} color="rgb(0, 128, 0)" size="lg" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const colours = [...canvasElement.querySelectorAll("svg.cy-icon")].map((s) => getComputedStyle(s).color);
    await expect(new Set(colours.slice(0, 3)).size).toBe(3);
    await expect(colours[3]).toBe("rgb(0, 128, 0)");
  },
};

const marks = Object.values(brands) as IconData[];

/** Brand marks from `@arshad-shah/cynosure/brands`: filled, unaltered, in currentColor or their owner's colour. */
export const BrandMarks: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(7.5rem, 1fr))", gap: 12 }}>
      {marks.map((m) => (
        <figure key={m.name} style={{ margin: 0, display: "grid", justifyItems: "center", gap: 6 }}>
          <Icon icon={m} size="lg" color="brand" label={m.brand?.title as string} />
          <figcaption style={{ fontSize: 12, color: "var(--cy-color-muted)" }}>{m.name}</figcaption>
        </figure>
      ))}
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const github = canvas.getByRole("img", { name: "GitHub" });
    // Filled, not stroked; in the brand's own colour when asked.
    await expect(getComputedStyle(github).fill).not.toBe("none");
    await expect(
      getComputedStyle(github).strokeWidth === "0px" || getComputedStyle(github).stroke === "none",
    ).toBe(true);
    await expect(getComputedStyle(canvas.getByRole("img", { name: "Spotify" })).color).toBe(
      "rgb(30, 215, 96)",
    );
    await expect(canvasElement.querySelectorAll("svg[data-fill]").length).toBe(marks.length);
  },
};

export const BrandMarksInTextColour: Story = {
  render: () => (
    <p style={{ color: "rgb(10, 20, 30)", display: "flex", gap: 8 }}>
      <Icon icon={brands.github} label="GitHub" />
      <Icon icon={brands.npm} tone="muted" label="npm" />
    </p>
  ),
  play: async ({ canvas }) => {
    // Without `color="brand"` a mark follows the text colour (the one-colour version brands allow).
    await expect(getComputedStyle(canvas.getByRole("img", { name: "GitHub" })).color).toBe("rgb(10, 20, 30)");
  },
};
