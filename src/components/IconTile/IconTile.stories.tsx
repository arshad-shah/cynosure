import type { Meta, StoryObj } from "@storybook/react-vite";
import { type CSSProperties, useRef, useState } from "react";
import { expect, userEvent } from "storybook/test";
import { chartBar, folder, zap } from "../../icons/index.js";
import { textContrast } from "../../test/color.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { Button } from "../Button/Button.js";
import { IconTile } from "./IconTile.js";

const TONES = ["accent", "neutral", "danger", "success", "warning", "info"] as const;
const VARIANTS = ["soft", "solid", "outline"] as const;

const meta = {
  title: "Components/IconTile",
  component: IconTile,
  args: { icon: zap, size: "md", tone: "accent", variant: "soft", shape: "square" },
  argTypes: {
    icon: { control: false },
    label: { control: "text" },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    tone: { control: "select", options: TONES },
    variant: { control: "inline-radio", options: VARIANTS },
    shape: { control: "inline-radio", options: ["square", "circle"] },
  },
} satisfies Meta<typeof IconTile>;
export default meta;
type Story = StoryObj<typeof meta>;

const row = { display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" } as const;
const box = (el: Element) => el.getBoundingClientRect();
const css = (el: Element) => getComputedStyle(el);
const tiles = (root: Element) => [...root.querySelectorAll(".cy-icon-tile")] as HTMLElement[];

export const Default: Story = {
  tags: ["visual"],
  render: (args) => (
    <div style={row}>
      <IconTile {...args} />
      <span>Fast builds</span>
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    // Decorative by default: the text beside it says the same thing, so nothing extra is announced.
    await expect(canvas.queryByRole("img")).toBeNull();
    const tile = tiles(canvasElement)[0] as HTMLElement;
    await expect(tile).toHaveAttribute("aria-hidden", "true");
    await expect(tile).not.toHaveAttribute("role");
    // The icon inside is the Facet icon, centred, half the tile.
    const icon = tile.querySelector("svg.cy-icon") as SVGElement;
    await expect(icon.querySelectorAll(":scope > *")).toHaveLength(zap.body.length);
    await expect(box(icon).width).toBeCloseTo(box(tile).width / 2, 1);
    await expect(box(icon).left - box(tile).left).toBeCloseTo(box(tile).right - box(icon).right, 1);
    await expect(box(icon).top - box(tile).top).toBeCloseTo(box(tile).bottom - box(icon).bottom, 1);
    // Not interactive: nothing to tab to.
    await userEvent.tab();
    await expect(tile.contains(document.activeElement)).toBe(false);
  },
};

export const LabelledIsAnImage: Story = {
  args: { icon: chartBar, label: "Analytics", className: "mine", style: { marginInlineStart: 8 } },
  play: async ({ canvas }) => {
    // With a label: one image with that name; the svg inside is not announced separately.
    const tile = canvas.getByRole("img", { name: "Analytics" });
    await expect(canvas.getAllByRole("img")).toHaveLength(1);
    await expect(tile).not.toHaveAttribute("aria-hidden");
    await expect(tile.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    // className and style land on the root, for layout.
    await expect(tile).toHaveClass("cy-icon-tile", "mine");
    await expect(css(tile).marginInlineStart).toBe("8px");
  },
};

function Renamed() {
  const ref = useRef<HTMLSpanElement>(null);
  const [label, setLabel] = useState<string | undefined>("Folder");
  const [tag, setTag] = useState("");
  return (
    <div style={row}>
      <IconTile ref={ref} icon={folder} label={label} />
      <Button onClick={() => setLabel(label ? undefined : "Folder")}>Toggle label</Button>
      <Button onClick={() => setTag(ref.current?.tagName ?? "")}>Measure</Button>
      <output>{tag}</output>
    </div>
  );
}

export const LabelCanComeAndGo: Story = {
  render: () => <Renamed />,
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole("img", { name: "Folder" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Toggle label" }));
    // An empty label makes it decorative again.
    await expect(canvas.queryByRole("img")).toBeNull();
    await expect(tiles(canvasElement)[0]).toHaveAttribute("aria-hidden", "true");
    await expect(tiles(canvasElement)[0]).not.toHaveAttribute("aria-label");
    // The ref is the root element.
    await userEvent.click(canvas.getByRole("button", { name: "Measure" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("SPAN");
  },
};

export const SizesFollowControlHeights: Story = {
  tags: ["visual"],
  render: () => (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={row} data-testid="defaults">
        {(["sm", "md", "lg"] as const).map((size) => (
          <IconTile key={size} icon={zap} size={size} />
        ))}
        {(["sm", "md", "lg"] as const).map((size) => (
          <Button key={size} size={size}>
            {size}
          </Button>
        ))}
      </div>
      <div
        style={
          {
            ...row,
            "--cy-icon-tile-size-sm": "20px",
            "--cy-icon-tile-size-md": "40px",
            "--cy-icon-tile-size-lg": "60px",
            "--cy-icon-tile-icon-scale": "0.75",
          } as CSSProperties
        }
        data-testid="tokens"
      >
        {(["sm", "md", "lg"] as const).map((size) => (
          <IconTile key={size} icon={zap} size={size} />
        ))}
      </div>
      <div style={{ ...row, "--cy-scale": "1.5" } as CSSProperties} data-testid="scaled">
        <IconTile icon={zap} />
        <Button>md</Button>
      </div>
    </div>
  ),
  play: async ({ canvas }) => {
    const defaults = canvas.getByTestId("defaults");
    const heights = tiles(defaults).map((el) => box(el).height);
    const buttons = [...defaults.querySelectorAll("button")].map((el) => box(el).height);
    // sm, md and lg are the control heights, so a tile lines up with a button of the same size.
    await expect(heights).toEqual(buttons);
    for (const el of tiles(defaults)) await expect(box(el).width).toBe(box(el).height);
    // Each size reads its own token, and the icon is the tile times the scale token.
    const themed = tiles(canvas.getByTestId("tokens"));
    await expect(themed.map((el) => box(el).width)).toEqual([20, 40, 60]);
    await expect(themed.map((el) => box(el.querySelector("svg") as Element).width)).toEqual([15, 30, 45]);
    // It scales with the theme, like the controls.
    const scaled = canvas.getByTestId("scaled");
    const [tile] = tiles(scaled) as [HTMLElement];
    await expect(box(tile).height).toBe(box(scaled.querySelector("button") as Element).height);
  },
};

export const SquareAndCircle: Story = {
  render: () => (
    <div style={row}>
      <IconTile icon={zap} size="lg" />
      <IconTile icon={zap} size="lg" shape="circle" />
      <IconTile icon={zap} style={{ "--cy-icon-tile-radius": "3px" } as CSSProperties} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const [square, circle, themed] = tiles(canvasElement) as [HTMLElement, HTMLElement, HTMLElement];
    const radius = (el: Element) => Number.parseFloat(css(el).borderTopLeftRadius);
    const factor = Number.parseFloat(css(square).getPropertyValue("--cy-radius-factor"));
    // A square rounds like a control of its size; a circle's radius is at least half the tile.
    await expect(radius(square)).toBeCloseTo(box(square).width * factor, 1);
    await expect(radius(square)).toBeLessThan(box(square).width / 2);
    await expect(radius(circle)).toBeGreaterThanOrEqual(box(circle).width / 2);
    await expect(radius(themed)).toBe(3);
  },
};

export const TonesAndVariants: Story = {
  tags: ["visual"],
  render: () => (
    <div style={{ display: "grid", gap: 12 }}>
      {VARIANTS.map((variant) => (
        <div key={variant} style={row} data-testid={variant}>
          {TONES.map((tone) => (
            <IconTile key={tone} icon={zap} tone={tone} variant={variant} label={`${tone} ${variant}`} />
          ))}
        </div>
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    for (const variant of VARIANTS) {
      const set = tiles(canvas.getByTestId(variant));
      // Every tone looks different in every variant.
      await expect(new Set(set.map((el) => css(el).backgroundColor + css(el).color)).size).toBe(TONES.length);
    }
    // Soft is a tint with the tone's text colour; solid fills with the tone; outline is the surface with a tinted border.
    const [soft, solid, outline] = VARIANTS.map((v) => canvas.getByRole("img", { name: `accent ${v}` }));
    await expect(css(solid as Element).backgroundColor).not.toBe(css(soft as Element).backgroundColor);
    await expect(css(outline as Element).borderTopColor).not.toBe(css(soft as Element).borderTopColor);
    await expect(css(soft as Element).borderTopColor).toBe("rgba(0, 0, 0, 0)");
    // The icon stays readable against its fill (it draws in the text colour), in every variant and tone.
    for (const el of canvas.getAllByRole("img")) {
      const contrast = textContrast(el);
      await expect({ name: el.getAttribute("aria-label"), ok: contrast >= 3 }).toEqual({
        name: el.getAttribute("aria-label"),
        ok: true,
      });
    }
  },
};

export const DefaultToneIsAccent: Story = {
  render: () => (
    <div style={row}>
      <IconTile icon={zap} label="Default" />
      <IconTile icon={zap} label="Accent" tone="accent" />
    </div>
  ),
  play: async ({ canvas }) => {
    const plain = canvas.getByRole("img", { name: "Default" });
    const accent = canvas.getByRole("img", { name: "Accent" });
    await expect(css(plain).backgroundColor).toBe(css(accent).backgroundColor);
    await expect(css(plain).color).toBe(css(accent).color);
  },
};

export const StableUnderHostileHost: Story = {
  args: { label: "Hostile", variant: "outline" },
  play: async ({ canvasElement }) => {
    const parts: [selector: string, props: string[]][] = [
      [
        ".cy-icon-tile",
        [
          "display",
          "width",
          "height",
          "padding-top",
          "border-top-width",
          "border-radius",
          "background-color",
          "color",
          "font-size",
          "line-height",
          "box-sizing",
        ],
      ],
      [".cy-icon-tile .cy-icon", ["width", "height", "display", "color", "max-width"]],
    ];
    for (const [selector, props] of parts) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, props);
      await expect({ selector, ...hostile }).toEqual({ selector, ...clean });
    }
  },
};
