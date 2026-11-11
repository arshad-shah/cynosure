import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { Heading, type HeadingLevel, type HeadingSize } from "./Heading.js";

const LEVELS: HeadingLevel[] = [1, 2, 3, 4, 5, 6];
const SCALE: HeadingSize[] = ["xs", "sm", "md", "lg", "xl", "2xl"];
const DEFAULT_SIZE: Record<HeadingLevel, HeadingSize> = {
  1: "2xl",
  2: "xl",
  3: "lg",
  4: "md",
  5: "sm",
  6: "xs",
};
const LONG =
  "Quarterly export settings for every workspace, including archived projects and the shared team library";

/** What `value` computes to for `property` where `el` sits (reads a token as the browser resolves it there). */
function resolved(
  el: Element,
  property: "font-size" | "color" | "font-weight" | "font-family",
  value: string,
) {
  const probe = document.createElement("span");
  probe.style.setProperty(property, value);
  (el.parentElement as HTMLElement).append(probe);
  const out = getComputedStyle(probe).getPropertyValue(property);
  probe.remove();
  return out;
}
const css = (el: Element, property: string) => getComputedStyle(el).getPropertyValue(property);
const px = (el: Element, property: string) => Number.parseFloat(css(el, property));
/** The box of the text itself, to see where it sits inside the heading. */
function textBox(el: Element) {
  const range = document.createRange();
  range.selectNodeContents(el);
  return range.getBoundingClientRect();
}

const meta = {
  title: "Components/Heading",
  component: Heading,
  args: { children: "Export settings", level: 2, tone: "neutral", weight: "bold", truncate: false },
  argTypes: {
    level: { control: "inline-radio", options: LEVELS },
    size: { control: "select", options: [undefined, ...SCALE, "display"] },
    tone: { control: "inline-radio", options: ["inherit", "neutral", "muted", "accent"] },
    weight: { control: "inline-radio", options: ["medium", "bold"] },
    align: { control: "inline-radio", options: [undefined, "start", "center", "end"] },
    truncate: { control: "boolean" },
    children: { control: "text" },
  },
} satisfies Meta<typeof Heading>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const heading = canvas.getByRole("heading", { level: 2, name: "Export settings" });
    await expect(heading.tagName).toBe("H2");
    // Level 2 looks like "xl", in the display font, bold, in the ink colour.
    await expect(css(heading, "font-size")).toBe(resolved(heading, "font-size", "var(--cy-font-size-xl)"));
    await expect(css(heading, "font-family")).toBe(
      resolved(heading, "font-family", "var(--cy-font-display)"),
    );
    await expect(css(heading, "font-weight")).toBe(
      resolved(heading, "font-weight", "var(--cy-font-weight-bold)"),
    );
    await expect(css(heading, "color")).toBe(resolved(heading, "color", "var(--cy-color-ink)"));
    // A tight line height, balanced wrapping, and no margins of its own (the browser's h2 margins are gone).
    await expect(px(heading, "line-height") / px(heading, "font-size")).toBeCloseTo(1.2, 1);
    await expect(css(heading, "text-wrap-style") || css(heading, "text-wrap")).toContain("balance");
    await expect(css(heading, "margin-block-start")).toBe("0px");
    await expect(css(heading, "margin-block-end")).toBe("0px");
    await expect(heading).not.toHaveAttribute("data-align");
    await expect(heading).not.toHaveAttribute("data-truncate");
  },
};

export const OneLineUsage: Story = {
  render: () => <Heading>Recent exports</Heading>,
  play: async ({ canvas }) => {
    // With no props at all: a level 2 heading that looks "xl", bold, in the ink colour, not truncated.
    const heading = canvas.getByRole("heading", { level: 2, name: "Recent exports" });
    await expect(heading.tagName).toBe("H2");
    await expect(css(heading, "font-size")).toBe(resolved(heading, "font-size", "var(--cy-font-size-xl)"));
    await expect(css(heading, "font-weight")).toBe(
      resolved(heading, "font-weight", "var(--cy-font-weight-bold)"),
    );
    await expect(css(heading, "color")).toBe(resolved(heading, "color", "var(--cy-color-ink)"));
    await expect(css(heading, "white-space")).not.toBe("nowrap");
    await expect(heading.className).toBe("cy-heading");
  },
};

export const Levels: Story = {
  tags: ["visual"],
  render: (args) => (
    <div style={{ display: "grid", gap: "var(--cy-space-4)", padding: "var(--cy-space-6)" }}>
      {LEVELS.map((level) => (
        <Heading key={level} {...args} level={level}>
          Level {level}
        </Heading>
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    for (const level of LEVELS) {
      // The element and the level assistive technology reports both follow `level`.
      const heading = canvas.getByRole("heading", { level });
      await expect(heading).toHaveTextContent(`Level ${level}`);
      await expect(heading.tagName).toBe(`H${level}`);
      // Without `size`, each level takes its own step of the type scale.
      const token = `var(--cy-font-size-${DEFAULT_SIZE[level]})`;
      await expect(css(heading, "font-size")).toBe(resolved(heading, "font-size", token));
    }
    await expect(canvas.getAllByRole("heading")).toHaveLength(6);
    // Level 1 is the largest and level 6 the smallest.
    const sizes = LEVELS.map((level) => px(canvas.getByRole("heading", { level }), "font-size"));
    await expect([...sizes].sort((a, b) => b - a)).toEqual(sizes);
    await expect(new Set(sizes).size).toBe(6);
  },
};

export const SizeIsSeparateFromLevel: Story = {
  tags: ["visual"],
  render: (args) => (
    <div style={{ display: "grid", gap: "var(--cy-space-4)", padding: "var(--cy-space-6)" }}>
      {[...SCALE, "display" as const].map((size) => (
        <Heading key={size} {...args} level={3} size={size}>
          Size {size}
        </Heading>
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    // Seven looks, one level: the outline does not change.
    const headings = canvas.getAllByRole("heading", { level: 3 });
    await expect(headings).toHaveLength(7);
    for (const heading of headings) await expect(heading.tagName).toBe("H3");
    for (const size of SCALE) {
      const heading = canvas.getByRole("heading", { name: `Size ${size}` });
      await expect(css(heading, "font-size")).toBe(
        resolved(heading, "font-size", `var(--cy-font-size-${size})`),
      );
    }
    // "display" is larger than "2xl", and never more than twice its size.
    const display = px(canvas.getByRole("heading", { name: "Size display" }), "font-size");
    const largest = px(canvas.getByRole("heading", { name: "Size 2xl" }), "font-size");
    await expect(display).toBeGreaterThanOrEqual(largest * 1.25);
    await expect(display).toBeLessThanOrEqual(largest * 2);
  },
};

export const Tones: Story = {
  render: (args) => (
    <div
      style={{
        display: "grid",
        gap: "var(--cy-space-4)",
        padding: "var(--cy-space-6)",
        color: "var(--cy-color-success-text)",
      }}
    >
      <Heading {...args} tone="neutral">
        Neutral
      </Heading>
      <Heading {...args} tone="muted">
        Muted
      </Heading>
      <Heading {...args} tone="accent">
        Accent
      </Heading>
      <Heading {...args} tone="inherit">
        Inherit
      </Heading>
    </div>
  ),
  play: async ({ canvas }) => {
    const colour = (name: string) => css(canvas.getByRole("heading", { name }), "color");
    const token = (name: string) => resolved(canvas.getByRole("heading", { name: "Neutral" }), "color", name);
    await expect(colour("Neutral")).toBe(token("var(--cy-color-ink)"));
    await expect(colour("Muted")).toBe(token("var(--cy-color-muted)"));
    await expect(colour("Accent")).toBe(token("var(--cy-color-accent-text)"));
    // "inherit" takes the colour of what it sits in (here the success text colour of the wrapper).
    await expect(colour("Inherit")).toBe(token("var(--cy-color-success-text)"));
    await expect(new Set(["Neutral", "Muted", "Accent", "Inherit"].map(colour)).size).toBe(4);
  },
};

export const Weights: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: "var(--cy-space-4)", padding: "var(--cy-space-6)" }}>
      <Heading {...args} weight="bold">
        Bold
      </Heading>
      <Heading {...args} weight="medium">
        Medium
      </Heading>
    </div>
  ),
  play: async ({ canvas }) => {
    const bold = canvas.getByRole("heading", { name: "Bold" });
    const medium = canvas.getByRole("heading", { name: "Medium" });
    await expect(css(bold, "font-weight")).toBe(resolved(bold, "font-weight", "var(--cy-font-weight-bold)"));
    await expect(css(medium, "font-weight")).toBe(
      resolved(bold, "font-weight", "var(--cy-font-weight-medium)"),
    );
    await expect(px(medium, "font-weight")).toBeLessThan(px(bold, "font-weight"));
    // Weight does not change the size.
    await expect(css(medium, "font-size")).toBe(css(bold, "font-size"));
  },
};

const aligned = (dir: "ltr" | "rtl") => (args: Story["args"]) => (
  <div dir={dir} style={{ display: "grid", gap: "var(--cy-space-4)", inlineSize: "24rem" }}>
    <Heading {...args} align="start">
      Start
    </Heading>
    <Heading {...args} align="center">
      Center
    </Heading>
    <Heading {...args} align="end">
      End
    </Heading>
  </div>
);
/** Gaps between the text and the heading's left and right edges. */
function gaps(heading: Element) {
  const box = heading.getBoundingClientRect();
  const text = textBox(heading);
  return { left: text.left - box.left, right: box.right - text.right };
}

export const Alignment: Story = {
  render: aligned("ltr"),
  play: async ({ canvas }) => {
    const start = gaps(canvas.getByRole("heading", { name: "Start" }));
    const center = gaps(canvas.getByRole("heading", { name: "Center" }));
    const end = gaps(canvas.getByRole("heading", { name: "End" }));
    await expect(start.left).toBeLessThan(1);
    await expect(start.right).toBeGreaterThan(100);
    await expect(Math.abs(center.left - center.right)).toBeLessThan(1);
    await expect(center.left).toBeGreaterThan(50);
    await expect(end.right).toBeLessThan(1);
    await expect(end.left).toBeGreaterThan(100);
  },
};

export const RightToLeft: Story = {
  render: (args) => (
    <>
      {aligned("rtl")(args)}
      <div dir="rtl" style={{ inlineSize: "12rem" }}>
        <Heading {...args} truncate>
          إعدادات التصدير الفصلية لكل مساحة عمل بما في ذلك المشاريع المؤرشفة
        </Heading>
      </div>
    </>
  ),
  play: async ({ canvas }) => {
    // Start and end swap sides.
    const start = gaps(canvas.getByRole("heading", { name: "Start" }));
    const center = gaps(canvas.getByRole("heading", { name: "Center" }));
    const end = gaps(canvas.getByRole("heading", { name: "End" }));
    await expect(start.right).toBeLessThan(1);
    await expect(start.left).toBeGreaterThan(100);
    await expect(Math.abs(center.left - center.right)).toBeLessThan(1);
    await expect(end.left).toBeLessThan(1);
    await expect(end.right).toBeGreaterThan(100);
    // A truncated heading keeps the start of the text (the right side) and cuts the end.
    const cut = canvas.getAllByRole("heading")[3] as HTMLElement;
    await expect(cut.scrollWidth).toBeGreaterThan(cut.clientWidth);
    await expect(cut.clientHeight).toBeLessThan(px(cut, "line-height") * 1.5);
    await expect(css(cut, "direction")).toBe("rtl");
  },
};

export const Truncation: Story = {
  tags: ["visual"],
  render: (args) => (
    <div
      style={{ display: "grid", gap: "var(--cy-space-5)", inlineSize: "14rem", padding: "var(--cy-space-6)" }}
    >
      <Heading {...args} id="wraps">
        {LONG}
      </Heading>
      <Heading {...args} id="one-line" truncate>
        {LONG}
      </Heading>
      <Heading {...args} id="two-lines" truncate={2}>
        {LONG}
      </Heading>
      <Heading {...args} id="three-lines" truncate={3.7}>
        {LONG}
      </Heading>
      <Heading {...args} id="zero" truncate={0}>
        {LONG}
      </Heading>
      <Heading {...args} id="short" truncate>
        Short
      </Heading>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const get = (id: string) => canvasElement.querySelector(`#${id}`) as HTMLElement;
    const line = px(get("wraps"), "line-height");
    const linesOf = (el: HTMLElement) => Math.round(el.getBoundingClientRect().height / line);
    // Without `truncate` the whole text shows, on as many lines as it needs.
    await expect(linesOf(get("wraps"))).toBeGreaterThan(3);
    await expect(get("wraps").scrollHeight).toBeLessThanOrEqual(get("wraps").clientHeight + 1);
    // `truncate`: one line, the rest cut off with an ellipsis.
    await expect(linesOf(get("one-line"))).toBe(1);
    await expect(get("one-line").scrollWidth).toBeGreaterThan(get("one-line").clientWidth);
    await expect(css(get("one-line"), "text-overflow")).toBe("ellipsis");
    // A number: that many lines, the rest cut off. Fractions round down.
    await expect(linesOf(get("two-lines"))).toBe(2);
    await expect(get("two-lines").scrollHeight).toBeGreaterThan(get("two-lines").clientHeight + line / 2);
    await expect(linesOf(get("three-lines"))).toBe(3);
    await expect(get("three-lines").scrollHeight).toBeGreaterThan(get("three-lines").clientHeight + line / 2);
    // 0 means no truncation.
    await expect(linesOf(get("zero"))).toBe(linesOf(get("wraps")));
    // Text that fits is not cut. The full text stays in the accessible name either way.
    await expect(get("short").scrollWidth).toBeLessThanOrEqual(get("short").clientWidth);
    await expect(get("one-line")).toHaveAccessibleName(LONG);
    await expect(get("two-lines")).toHaveAccessibleName(LONG);
  },
};

export const TokensRetuneTheScale: Story = {
  render: (args) => (
    <div
      style={
        {
          "--cy-heading-size-xl": "calc(var(--cy-font-size-md) * 3)",
          "--cy-heading-size-display": "calc(var(--cy-font-size-md) * 5)",
          "--cy-heading-line-height": "2",
          "--cy-heading-font-weight": "300",
          "--cy-heading-font-family": "var(--cy-font-mono)",
        } as React.CSSProperties
      }
    >
      <Heading {...args}>Retuned</Heading>
      <Heading {...args} size="display">
        Hero
      </Heading>
      <Heading {...args} size="lg">
        Untouched
      </Heading>
    </div>
  ),
  play: async ({ canvas }) => {
    const retuned = canvas.getByRole("heading", { name: "Retuned" });
    const md = Number.parseFloat(resolved(retuned, "font-size", "var(--cy-font-size-md)"));
    await expect(px(retuned, "font-size")).toBeCloseTo(md * 3, 1);
    await expect(px(retuned, "line-height")).toBeCloseTo(md * 6, 1);
    await expect(css(retuned, "font-weight")).toBe("300");
    await expect(css(retuned, "font-family")).toBe(resolved(retuned, "font-family", "var(--cy-font-mono)"));
    await expect(px(canvas.getByRole("heading", { name: "Hero" }), "font-size")).toBeCloseTo(md * 5, 1);
    // A size whose token is not set keeps the global type scale.
    const untouched = canvas.getByRole("heading", { name: "Untouched" });
    await expect(css(untouched, "font-size")).toBe(
      resolved(untouched, "font-size", "var(--cy-font-size-lg)"),
    );
  },
};

let forwarded: HTMLHeadingElement | null = null;
export const RefIdClassNameAndStyle: Story = {
  render: (args) => (
    <section aria-labelledby="billing-title">
      <Heading
        {...args}
        ref={(el) => {
          forwarded = el;
        }}
        id="billing-title"
        className="product-title"
        style={{ marginBlockEnd: "var(--cy-space-6)" }}
        truncate={2}
      >
        Billing
      </Heading>
    </section>
  ),
  play: async ({ canvas }) => {
    const heading = canvas.getByRole("heading", { name: "Billing" });
    await expect(forwarded).toBe(heading);
    await expect(forwarded).toBeInstanceOf(HTMLHeadingElement);
    await expect(heading).toHaveClass("cy-heading", "product-title");
    // `id` lets a region take its name from the heading.
    await expect(canvas.getByRole("region", { name: "Billing" })).toContainElement(heading);
    // `style` is applied (also next to the line clamp) and adds layout spacing the heading does not have itself.
    await expect(css(heading, "margin-block-end")).toBe(resolved(heading, "font-size", "var(--cy-space-6)"));
    await expect(css(heading, "-webkit-line-clamp")).toBe("2");
  },
};

export const StableUnderHostileHost: Story = {
  args: { children: "Export Settings", tone: "accent", align: "center" },
  play: async ({ canvasElement }) => {
    const { clean, hostile } = computeUnderHostileHost(canvasElement, ".cy-heading", [
      "display",
      "box-sizing",
      "font-family",
      "font-size",
      "font-weight",
      "line-height",
      "letter-spacing",
      "text-transform",
      "text-align",
      "color",
      "margin-block-start",
      "margin-block-end",
      "padding-block-start",
      "block-size",
    ]);
    await expect(hostile).toEqual(clean);
    // And the values are the heading's own, not the browser's or the host's.
    await expect(clean["text-transform"]).toBe("none");
    await expect(clean["letter-spacing"]).toBe("normal");
    await expect(clean["box-sizing"]).toBe("border-box");
  },
};
