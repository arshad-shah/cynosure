import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { expect } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { AspectRatio } from "./AspectRatio.js";

/** A picture that needs no network: an SVG of the given size as a data URL. */
const picture = (width: number, height: number) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="teal"/><circle cx="50%" cy="50%" r="${height / 4}" fill="gold"/></svg>`,
  )}`;

const fill = { background: "var(--cy-color-soft)" };

const meta = {
  title: "Components/AspectRatio",
  component: AspectRatio,
  args: { ratio: 16 / 9, radius: "none" },
  argTypes: {
    ratio: { control: "text" },
    radius: { control: "inline-radio", options: ["none", "sm", "md", "lg", "card", "full"] },
    children: { control: false },
  },
  decorators: [(Story) => <div style={{ maxWidth: 420 }}>{Story()}</div>],
} satisfies Meta<typeof AspectRatio>;
export default meta;
type Story = StoryObj<typeof meta>;

const box = (el: Element) => el.getBoundingClientRect();
const root = (el: ParentNode, selector = ".cy-aspect-ratio") => el.querySelector(selector) as HTMLElement;

export const Default: Story = {
  tags: ["visual"],
  args: { ratio: undefined, radius: "card" },
  render: (args) => (
    <AspectRatio {...args}>
      <img src={picture(300, 300)} alt="A gold circle on teal" />
    </AspectRatio>
  ),
  play: async ({ canvasElement, canvas }) => {
    const frame = box(root(canvasElement));
    // 16 to 9 when no ratio is given, at the full width of its container.
    await expect(frame.width).toBeCloseTo(420, 0);
    await expect(frame.height).toBeCloseTo((420 * 9) / 16, 0);
    // The square picture is stretched to the box and covers it instead of being squashed.
    const img = canvas.getByRole("img", { name: "A gold circle on teal" });
    await expect(box(img).width).toBeCloseTo(frame.width, 0);
    await expect(box(img).height).toBeCloseTo(frame.height, 0);
    await expect(getComputedStyle(img).objectFit).toBe("cover");
  },
};

const RATIOS: [name: string, ratio: number | string, value: number][] = [
  ["wide", 16 / 9, 16 / 9],
  ["square", 1, 1],
  ["tall", 0.5, 0.5],
  ["classic", "4/3", 4 / 3],
  ["cinema", "21 / 9", 21 / 9],
  ["single", "2", 2],
];
const WIDTHS = [120, 300, 517];

export const KeepsTheRatioAtAnyWidth: Story = {
  decorators: [],
  render: () => (
    <div style={{ display: "grid", gap: 8 }}>
      {RATIOS.flatMap(([name, ratio]) =>
        WIDTHS.map((width) => (
          <div key={`${name}-${width}`} style={{ inlineSize: width }}>
            <AspectRatio ratio={ratio} className={`${name}-${width}`}>
              <div style={fill} />
            </AspectRatio>
          </div>
        )),
      )}
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const [name, , value] of RATIOS)
      for (const width of WIDTHS) {
        const frame = box(root(canvasElement, `.${name}-${width}`));
        await expect(frame.width).toBeCloseTo(width, 0);
        await expect(Math.abs(frame.height - width / value)).toBeLessThan(0.6);
      }
  },
};

export const FollowsItsContainerWhenItResizes: Story = {
  render: (args) => (
    <div className="holder" style={{ inlineSize: 400 }}>
      <AspectRatio {...args} ratio={2}>
        <div style={fill} />
      </AspectRatio>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const holder = canvasElement.querySelector(".holder") as HTMLElement;
    await expect(box(root(canvasElement)).height).toBeCloseTo(200, 0);
    holder.style.inlineSize = "250px";
    // CSS keeps the ratio: nothing has to measure or re-render.
    await expect(box(root(canvasElement)).height).toBeCloseTo(125, 0);
  },
};

export const ChildrenFillTheBox: Story = {
  render: (args) => (
    <AspectRatio {...args} ratio="4/3">
      <div className="map" style={{ ...fill, padding: 16 }}>
        <span className="inner">Map</span>
      </div>
      <span className="badge">Live</span>
    </AspectRatio>
  ),
  play: async ({ canvasElement }) => {
    const frame = box(root(canvasElement));
    for (const name of [".map", ".badge"]) {
      const child = box(canvasElement.querySelector(name) as Element);
      // Padding on the child does not push it past the box.
      await expect(child.width).toBeCloseTo(frame.width, 0);
      await expect(child.height).toBeCloseTo(frame.height, 0);
      await expect(child.top).toBeCloseTo(frame.top, 0);
      await expect(child.left).toBeCloseTo(frame.left, 0);
    }
    // Only direct children are stretched: what is inside them lays out as usual.
    const inner = canvasElement.querySelector(".inner") as Element;
    await expect(getComputedStyle(inner).position).toBe("static");
    await expect(box(inner).width).toBeLessThan(frame.width / 2);
  },
};

export const TallContentIsClipped: Story = {
  render: (args) => (
    <AspectRatio {...args} ratio={2} style={{ inlineSize: 200 }}>
      <div style={fill}>
        <div className="tall" style={{ blockSize: 600 }}>
          Long content
        </div>
      </div>
    </AspectRatio>
  ),
  play: async ({ canvasElement }) => {
    const frame = root(canvasElement);
    // Content never stretches the box out of its ratio.
    await expect(box(frame).height).toBeCloseTo(100, 0);
    await expect(getComputedStyle(frame).overflow).toBe("hidden");
  },
};

const RADII = ["none", "sm", "md", "lg", "card", "full"] as const;

export const RadiusFollowsTheTokens: Story = {
  tags: ["visual"],
  render: (args) => (
    <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(3, 1fr)" }}>
      {RADII.map((radius) => (
        <AspectRatio key={radius} {...args} ratio={1} radius={radius} className={`r-${radius}`}>
          <div style={fill} />
        </AspectRatio>
      ))}
      <AspectRatio {...args} ratio={1} className="r-default">
        <div style={fill} />
      </AspectRatio>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const probe = document.createElement("div");
    root(canvasElement).after(probe);
    const token = (name: string) => {
      probe.style.borderRadius = `var(--cy-radius-${name})`;
      return getComputedStyle(probe).borderTopLeftRadius;
    };
    const radius = (name: string) => getComputedStyle(root(canvasElement, `.r-${name}`)).borderTopLeftRadius;
    try {
      for (const name of RADII.filter((r) => r !== "none")) {
        await expect(token(name)).not.toBe("");
        await expect(radius(name)).toBe(token(name));
      }
      await expect(radius("card")).not.toBe("0px");
      await expect(radius("none")).toBe("0px");
      // Square unless asked.
      await expect(radius("default")).toBe("0px");
      await expect(root(canvasElement, ".r-default")).toHaveAttribute("data-radius", "none");
    } finally {
      probe.remove();
    }
  },
};

export const RadiusTokenOverridesTheProp: Story = {
  render: (args) => (
    <div style={{ "--cy-aspect-ratio-radius": "7px" } as CSSProperties}>
      <AspectRatio {...args} radius="none" className="none" />
      <AspectRatio {...args} radius="card" className="card" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const name of [".none", ".card"])
      await expect(getComputedStyle(root(canvasElement, name)).borderTopLeftRadius).toBe("7px");
  },
};

export const NeverWiderThanItsContainer: Story = {
  render: (args) => (
    <div className="narrow" style={{ inlineSize: 200 }}>
      <AspectRatio {...args} ratio={2} style={{ inlineSize: 800 }}>
        <div style={fill} />
      </AspectRatio>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const frame = box(root(canvasElement));
    await expect(frame.width).toBeCloseTo(200, 0);
    // The height still follows the width it ended up with.
    await expect(frame.height).toBeCloseTo(100, 0);
    const holder = canvasElement.querySelector(".narrow") as HTMLElement;
    await expect(holder.scrollWidth).toBeLessThanOrEqual(holder.clientWidth);
  },
};

export const KeepsItsWidthInAFlexRow: Story = {
  render: (args) => (
    <div style={{ display: "flex", inlineSize: 300 }}>
      <AspectRatio {...args} ratio={3}>
        <div style={fill} />
      </AspectRatio>
    </div>
  ),
  play: async ({ canvasElement }) => {
    // Its children are out of flow, so without a width of its own it would collapse to nothing here.
    const frame = box(root(canvasElement));
    await expect(frame.width).toBeCloseTo(300, 0);
    await expect(frame.height).toBeCloseTo(100, 0);
  },
};

export const BadNumbersUseTheDefault: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: 8, inlineSize: 160 }}>
      {[0, -2, Number.NaN, Number.POSITIVE_INFINITY].map((ratio, i) => (
        <AspectRatio key={i} {...args} ratio={ratio} className={`bad-${i}`}>
          <div style={fill} />
        </AspectRatio>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const i of [0, 1, 2, 3]) {
      // A ratio from a division by zero does not make the box vanish.
      await expect(box(root(canvasElement, `.bad-${i}`)).height).toBeCloseTo(90, 0);
    }
  },
};

export const RefClassNameAndStyle: Story = {
  render: (args) => (
    <AspectRatio
      {...args}
      ref={(el) => {
        if (el) el.dataset.ref = el.tagName;
      }}
      className="mine"
      style={{ inlineSize: 100, marginBlockStart: 12 }}
    />
  ),
  play: async ({ canvasElement }) => {
    const frame = root(canvasElement);
    // The ref is the box itself.
    await expect(frame).toHaveAttribute("data-ref", "DIV");
    await expect(frame).toHaveClass("cy-aspect-ratio", "mine");
    await expect(box(frame).width).toBeCloseTo(100, 0);
    await expect(getComputedStyle(frame).marginTop).toBe("12px");
    // An empty box still takes its space.
    await expect(box(frame).height).toBeCloseTo((100 * 9) / 16, 0);
  },
};

export const SameInRightToLeft: Story = {
  render: (args) => (
    <div dir="rtl" style={{ inlineSize: 240 }}>
      <AspectRatio {...args} ratio={2}>
        <div className="child" style={fill} />
      </AspectRatio>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const frame = box(root(canvasElement));
    const child = box(canvasElement.querySelector(".child") as Element);
    await expect(frame.height).toBeCloseTo(120, 0);
    await expect(child.left).toBeCloseTo(frame.left, 0);
    await expect(child.right).toBeCloseTo(frame.right, 0);
  },
};

export const StableUnderHostileHost: Story = {
  args: { radius: "card" },
  render: (args) => (
    <AspectRatio {...args}>
      <img src={picture(300, 300)} alt="A gold circle on teal" />
    </AspectRatio>
  ),
  play: async ({ canvasElement }) => {
    // The host sheet sets `img { max-width: 100%; height: auto; display: block }` and resizes, pads and recolours all.
    // Text styles are inherited on purpose, so they are not compared.
    const layout = [
      "display",
      "position",
      "width",
      "height",
      "box-sizing",
      "overflow",
      "border-top-left-radius",
    ];
    const frame = computeUnderHostileHost(canvasElement, ".cy-aspect-ratio", [
      ...layout,
      "aspect-ratio",
      "margin-top",
      "letter-spacing",
      "text-transform",
    ]);
    await expect(frame.hostile).toEqual(frame.clean);
    await expect(frame.clean.height).toBe("236.25px");
    const child = computeUnderHostileHost(canvasElement, ".cy-aspect-ratio > img", [
      ...layout,
      "max-width",
      "object-fit",
    ]);
    await expect(child.hostile).toEqual(child.clean);
    await expect(child.clean.height).toBe("236.25px");
  },
};
