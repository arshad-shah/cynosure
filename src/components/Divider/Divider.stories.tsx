import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ComponentProps, type CSSProperties, createRef } from "react";
import { expect } from "storybook/test";
import { rgb } from "../../test/color.js";
import { computeUnderHostileHost, hostileHostCss } from "../../test/hostile.js";
import { Button } from "../Button/Button.js";
import { Inline } from "../Inline/Inline.js";
import { Link } from "../Link/Link.js";
import { Stack } from "../Stack/Stack.js";
import { Text } from "../Text/Text.js";
import { Divider } from "./Divider.js";

const meta = {
  title: "Components/Divider",
  component: Divider,
  args: {
    orientation: "horizontal",
    variant: "solid",
    tone: "neutral",
    spacing: "none",
    labelAlign: "center",
    decorative: true,
  },
  argTypes: {
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    variant: { control: "inline-radio", options: ["solid", "dashed"] },
    tone: { control: "inline-radio", options: ["neutral", "strong"] },
    spacing: { control: "inline-radio", options: ["none", "sm", "md", "lg"] },
    labelAlign: { control: "inline-radio", options: ["start", "center", "end"] },
    decorative: { control: "boolean" },
    children: { control: "text" },
  },
} satisfies Meta<typeof Divider>;
export default meta;
type Story = StoryObj<typeof meta>;

/** The pixel length a CSS value (a token) resolves to inside `host`. */
const length = (host: Element, value: string) => {
  const probe = document.createElement("div");
  probe.style.cssText = `position:absolute;visibility:hidden;inline-size:${value}`;
  host.append(probe);
  const size = probe.getBoundingClientRect().width;
  probe.remove();
  return size;
};
/** The sRGB colour a CSS value (a token) resolves to inside `host`. */
const colour = (host: Element, value: string) => {
  const probe = document.createElement("div");
  probe.style.color = value;
  host.append(probe);
  const out = rgb(getComputedStyle(probe).color);
  probe.remove();
  return out;
};
const line = (el: Element, pseudo = "::before") => {
  const s = getComputedStyle(el, pseudo);
  return {
    style: s.borderTopStyle,
    width: Number.parseFloat(s.borderTopWidth),
    color: rgb(s.borderTopColor),
  };
};
const box = (el: Element) => el.getBoundingClientRect();
const divider = (root: Element, id = "divider") => root.querySelector(`[data-testid="${id}"]`) as HTMLElement;

export const Default: Story = {
  tags: ["visual"],
  render: (args) => (
    <Stack gap="5" data-testid="box" style={{ inlineSize: 320 }}>
      <Text>Account</Text>
      <Divider {...args} data-testid="divider" />
      <Text>Billing</Text>
    </Stack>
  ),
  play: async ({ canvasElement, canvas }) => {
    const el = divider(canvasElement);
    // Fills the container's width, is as thick as the border token and has the line colour.
    await expect(box(el).width).toBe(box(canvas.getByTestId("box")).width);
    await expect(box(el).width).toBe(320);
    const thickness = length(el, "var(--cy-border-width)");
    await expect(thickness).toBeGreaterThan(0);
    await expect(box(el).height).toBe(thickness);
    await expect(line(el)).toEqual({
      style: "solid",
      width: thickness,
      color: colour(el, "var(--cy-color-line)"),
    });
    // No margins of its own: the Stack's gap is the only space around it.
    const s = getComputedStyle(el);
    await expect([s.marginTop, s.marginBottom, s.marginLeft, s.marginRight]).toEqual([
      "0px",
      "0px",
      "0px",
      "0px",
    ]);
    // Decorative by default: nothing is exposed as a separator.
    await expect(canvas.queryByRole("separator")).toBeNull();
    await expect(el).toHaveAttribute("role", "none");
    await expect(el).toBeEmptyDOMElement();
  },
};

export const ReadsItsTokens: Story = {
  render: (args) => (
    <div
      style={
        {
          inlineSize: 320,
          "--cy-divider-thickness": "4px",
          "--cy-divider-color": "rgb(10, 120, 200)",
          "--cy-divider-color-strong": "rgb(200, 30, 60)",
          "--cy-divider-label-gap": "20px",
          "--cy-divider-label-color": "rgb(0, 100, 0)",
          "--cy-divider-label-size": "18px",
        } as CSSProperties
      }
    >
      <Divider {...args} data-testid="plain" />
      <Divider {...args} tone="strong" data-testid="strong" />
      <Divider {...args} data-testid="labelled">
        or
      </Divider>
    </div>
  ),
  play: async ({ canvasElement, canvas }) => {
    const plain = divider(canvasElement, "plain");
    await expect(box(plain).height).toBe(4);
    await expect(line(plain)).toEqual({ style: "solid", width: 4, color: [10, 120, 200] });
    await expect(line(divider(canvasElement, "strong")).color).toEqual([200, 30, 60]);
    const labelled = divider(canvasElement, "labelled");
    const label = canvas.getByText("or");
    await expect(rgb(getComputedStyle(label).color)).toEqual([0, 100, 0]);
    await expect(getComputedStyle(label).fontSize).toBe("18px");
    await expect(getComputedStyle(labelled).columnGap).toBe("20px");
    // The line on each side of the label keeps the thickness and colour.
    await expect(line(labelled, "::after")).toEqual({ style: "solid", width: 4, color: [10, 120, 200] });
  },
};

export const Vertical: Story = {
  tags: ["visual"],
  args: { orientation: "vertical" },
  render: (args) => (
    <Inline gap="4" data-testid="row" style={{ blockSize: 48 }}>
      <Link href="https://example.com/docs">Docs</Link>
      <Divider {...args} data-testid="divider" />
      <Link href="https://example.com/privacy">Privacy</Link>
    </Inline>
  ),
  play: async ({ canvasElement, canvas }) => {
    const el = divider(canvasElement);
    const row = box(canvas.getByTestId("row"));
    // Stretches to the row's height although Inline centres its children; as wide as the thickness token.
    await expect(box(el).height).toBe(48);
    await expect(box(el).top).toBe(row.top);
    const thickness = length(el, "var(--cy-border-width)");
    await expect(box(el).width).toBe(thickness);
    const s = getComputedStyle(el, "::before");
    await expect(s.borderLeftStyle).toBe("solid");
    await expect(Number.parseFloat(s.borderLeftWidth)).toBe(thickness);
    await expect(rgb(s.borderLeftColor)).toEqual(colour(el, "var(--cy-color-line)"));
    await expect(Number.parseFloat(s.borderTopWidth)).toBe(0);
    await expect(Number.parseFloat(s.height)).toBe(48);
    // It sits between the two links.
    await expect(box(el).left).toBeGreaterThan(box(canvas.getByRole("link", { name: "Docs" })).right);
    await expect(box(el).right).toBeLessThan(box(canvas.getByRole("link", { name: "Privacy" })).left);
  },
};

export const VerticalFollowsRowHeight: Story = {
  args: { orientation: "vertical" },
  render: (args) => (
    <div style={{ display: "flex" }}>
      <Button size="lg">Tall</Button>
      <Divider {...args} spacing="sm" data-testid="divider" />
      <Button size="sm">Short</Button>
    </div>
  ),
  play: async ({ canvasElement, canvas }) => {
    const el = divider(canvasElement);
    await expect(box(el).height).toBe(box(canvas.getByRole("button", { name: "Tall" })).height);
  },
};

export const VerticalIgnoresLabel: Story = {
  args: { orientation: "vertical", children: "or", decorative: false },
  render: (args) => (
    <Inline>
      <Divider {...args} />
    </Inline>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.queryByText("or")).toBeNull();
    const separator = canvas.getByRole("separator");
    await expect(separator).toBeEmptyDOMElement();
    await expect(separator).not.toHaveAttribute("aria-labelledby");
    await expect(separator).not.toHaveAttribute("data-label");
  },
};

export const WithLabel: Story = {
  tags: ["visual"],
  args: { children: "or" },
  render: (args) => (
    <Stack gap="5" style={{ inlineSize: 320 }}>
      <Button fullWidth>Continue with email</Button>
      <Divider {...args} data-testid="divider" />
      <Button fullWidth>Continue with a passkey</Button>
    </Stack>
  ),
  play: async ({ canvasElement, canvas }) => {
    const el = divider(canvasElement);
    const label = canvas.getByText("or");
    await expect(label).toBeVisible();
    const [outer, inner] = [box(el), box(label)];
    // The label is inside the line's box, centred along it and across it.
    await expect(el).toContainElement(label);
    await expect(inner.left).toBeGreaterThan(outer.left);
    await expect(inner.right).toBeLessThan(outer.right);
    await expect(Math.abs((inner.left + inner.right) / 2 - (outer.left + outer.right) / 2)).toBeLessThan(1);
    await expect(Math.abs((inner.top + inner.bottom) / 2 - (outer.top + outer.bottom) / 2)).toBeLessThan(1);
    // A line on each side, each ending one label gap away from the text.
    const gap = length(el, "var(--cy-space-4)");
    const side = (outer.width - inner.width) / 2 - gap;
    for (const pseudo of ["::before", "::after"]) {
      await expect(getComputedStyle(el, pseudo).display).not.toBe("none");
      await expect(Math.abs(Number.parseFloat(getComputedStyle(el, pseudo).width) - side)).toBeLessThan(1);
      await expect(line(el, pseudo).color).toEqual(colour(el, "var(--cy-color-line)"));
    }
    await expect(rgb(getComputedStyle(label).color)).toEqual(colour(el, "var(--cy-color-muted)"));
    await expect(Number.parseFloat(getComputedStyle(label).fontSize)).toBe(
      length(el, "var(--cy-font-size-sm)"),
    );
    // Decorative: the label is plain text, there is no separator.
    await expect(canvas.queryByRole("separator")).toBeNull();
  },
};

const aligned = (dir: "ltr" | "rtl") =>
  function Aligned(args: ComponentProps<typeof Divider>) {
    return (
      <Stack gap="5" style={{ inlineSize: 320 }}>
        <div dir={dir}>
          <Divider {...args} labelAlign="start" data-testid="start">
            Today
          </Divider>
        </div>
        <div dir={dir}>
          <Divider {...args} labelAlign="center" data-testid="center">
            Yesterday
          </Divider>
        </div>
        <div dir={dir}>
          <Divider {...args} labelAlign="end" data-testid="end">
            Last week
          </Divider>
        </div>
      </Stack>
    );
  };

export const LabelAlign: Story = {
  tags: ["visual"],
  render: aligned("ltr"),
  play: async ({ canvasElement, canvas }) => {
    const [start, center, end] = ["start", "center", "end"].map((id) => divider(canvasElement, id)) as [
      HTMLElement,
      HTMLElement,
      HTMLElement,
    ];
    // start: flush with the left edge, one line after it.
    await expect(box(canvas.getByText("Today")).left).toBe(box(start).left);
    await expect(getComputedStyle(start, "::before").display).toBe("none");
    await expect(getComputedStyle(start, "::after").display).not.toBe("none");
    // center: away from both edges.
    await expect(box(canvas.getByText("Yesterday")).left).toBeGreaterThan(box(center).left);
    await expect(box(canvas.getByText("Yesterday")).right).toBeLessThan(box(center).right);
    // end: flush with the right edge, one line before it.
    await expect(box(canvas.getByText("Last week")).right).toBe(box(end).right);
    await expect(getComputedStyle(end, "::after").display).toBe("none");
    await expect(getComputedStyle(end, "::before").display).not.toBe("none");
    // The remaining line takes the rest of the width, less the label gap.
    const rest = box(end).width - box(canvas.getByText("Last week")).width - length(end, "var(--cy-space-4)");
    await expect(Math.abs(Number.parseFloat(getComputedStyle(end, "::before").width) - rest)).toBeLessThan(1);
  },
};

export const RightToLeft: Story = {
  render: aligned("rtl"),
  play: async ({ canvasElement, canvas }) => {
    const start = divider(canvasElement, "start");
    const end = divider(canvasElement, "end");
    // start is the right edge in right-to-left text, end the left edge.
    await expect(box(canvas.getByText("Today")).right).toBe(box(start).right);
    await expect(box(canvas.getByText("Today")).left).toBeGreaterThan(box(start).left + 100);
    await expect(box(canvas.getByText("Last week")).left).toBe(box(end).left);
    await expect(box(canvas.getByText("Last week")).right).toBeLessThan(box(end).right - 100);
  },
};

export const Dashed: Story = {
  tags: ["visual"],
  args: { variant: "dashed" },
  render: (args) => (
    <div style={{ inlineSize: 320 }}>
      <Divider {...args} data-testid="divider">
        or
      </Divider>
      <Inline style={{ blockSize: 32 }}>
        <Divider {...args} orientation="vertical" data-testid="vertical" />
      </Inline>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const el = divider(canvasElement);
    await expect(line(el).style).toBe("dashed");
    await expect(line(el, "::after").style).toBe("dashed");
    await expect(getComputedStyle(divider(canvasElement, "vertical"), "::before").borderLeftStyle).toBe(
      "dashed",
    );
  },
};

export const StrongTone: Story = {
  args: { tone: "strong" },
  render: (args) => (
    <Stack gap="5" style={{ inlineSize: 320 }}>
      <Divider {...args} tone="neutral" data-testid="neutral" />
      <Divider {...args} data-testid="strong" />
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const strong = divider(canvasElement, "strong");
    await expect(line(strong).color).toEqual(colour(strong, "var(--cy-color-muted)"));
    await expect(line(strong).color).not.toEqual(line(divider(canvasElement, "neutral")).color);
  },
};

const SPACING = {
  none: "0px",
  sm: "var(--cy-space-2)",
  md: "var(--cy-space-4)",
  lg: "var(--cy-space-6)",
} as const;
const spacings = Object.keys(SPACING) as (keyof typeof SPACING)[];

export const Spacing: Story = {
  render: (args) => (
    <div style={{ inlineSize: 320 }}>
      {spacings.map((spacing) => (
        <Divider key={spacing} {...args} spacing={spacing} data-testid={`h-${spacing}`} />
      ))}
      <div style={{ display: "flex", blockSize: 32 }}>
        {spacings.map((spacing) => (
          <Divider
            key={spacing}
            {...args}
            orientation="vertical"
            spacing={spacing}
            data-testid={`v-${spacing}`}
          />
        ))}
      </div>
      <div style={{ "--cy-divider-spacing-md": "30px" } as CSSProperties}>
        <Divider {...args} spacing="md" data-testid="token" />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const margins = (el: Element) => {
      const s = getComputedStyle(el);
      return [s.marginTop, s.marginBottom, s.marginLeft, s.marginRight].map(Number.parseFloat);
    };
    for (const spacing of spacings) {
      const h = divider(canvasElement, `h-${spacing}`);
      const space = length(h, SPACING[spacing]);
      // Horizontal: above and below only. Vertical: before and after only.
      await expect(margins(h)).toEqual([space, space, 0, 0]);
      await expect(margins(divider(canvasElement, `v-${spacing}`))).toEqual([0, 0, space, space]);
    }
    await expect(length(canvasElement, SPACING.sm)).toBeGreaterThan(0);
    await expect(length(canvasElement, SPACING.lg)).toBeGreaterThan(length(canvasElement, SPACING.md));
    await expect(margins(divider(canvasElement, "token"))).toEqual([30, 30, 0, 0]);
  },
};

export const Separator: Story = {
  args: { decorative: false },
  render: (args) => (
    <div style={{ inlineSize: 320 }}>
      <Divider {...args} data-testid="plain" />
      <Divider {...args}>Earlier messages</Divider>
      <Inline style={{ blockSize: 32 }}>
        <Divider {...args} orientation="vertical" data-testid="vertical" />
      </Inline>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole("separator")).toHaveLength(3);
    // Horizontal is the role's default orientation, so it is not repeated; vertical is stated.
    const plain = canvas.getByTestId("plain");
    await expect(plain).toHaveRole("separator");
    await expect(plain).not.toHaveAttribute("aria-orientation");
    await expect(plain).not.toHaveAttribute("aria-labelledby");
    await expect(canvas.getByTestId("vertical")).toHaveAttribute("aria-orientation", "vertical");
    // The label is the separator's accessible name.
    const named = canvas.getByRole("separator", { name: "Earlier messages" });
    await expect(named).toContainElement(canvas.getByText("Earlier messages"));
    await expect(named).not.toHaveAttribute("aria-orientation");
  },
};

export const DecorativeIsNotASeparator: Story = {
  args: { children: "or" },
  render: (args) => (
    <div style={{ inlineSize: 320 }}>
      <Divider {...args} data-testid="labelled" />
      <Inline style={{ blockSize: 32 }}>
        <Divider orientation="vertical" data-testid="vertical" />
      </Inline>
      <Divider data-testid="empty">{""}</Divider>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole("separator")).toBeNull();
    for (const id of ["labelled", "vertical", "empty"]) {
      const el = canvas.getByTestId(id);
      await expect(el).toHaveAttribute("role", "none");
      await expect(el).not.toHaveAttribute("aria-orientation");
      await expect(el).not.toHaveAttribute("aria-labelledby");
    }
    // The label stays readable text; an empty label draws one unbroken line.
    await expect(canvas.getByText("or")).toBeVisible();
    await expect(canvas.getByTestId("empty")).toBeEmptyDOMElement();
    await expect(canvas.getByTestId("empty")).not.toHaveAttribute("data-label");
  },
};

const ref = createRef<HTMLDivElement>();
export const RefClassNameAndStyle: Story = {
  render: (args) => (
    <div style={{ inlineSize: 320 }}>
      <Divider
        {...args}
        ref={ref}
        className="host-divider"
        style={{ inlineSize: 120 }}
        data-testid="divider"
      />
    </div>
  ),
  play: async ({ canvas }) => {
    const el = canvas.getByTestId("divider");
    await expect(ref.current).toBe(el);
    await expect(el).toHaveClass("cy-divider", "host-divider");
    await expect(box(el).width).toBe(120);
  },
};

export const StableUnderHostileHost: Story = {
  args: { children: "or", spacing: "md" },
  render: (args) => (
    <div style={{ inlineSize: 320 }}>
      <Divider {...args} />
      <div style={{ display: "flex", blockSize: 32 }}>
        <Divider {...args} orientation="vertical" className="host-vertical" />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const root = computeUnderHostileHost(canvasElement, ".cy-divider", [
      "display",
      "box-sizing",
      "width",
      "height",
      "margin-top",
      "margin-bottom",
      "padding-top",
      "column-gap",
      "color",
      "font-size",
      "font-weight",
      "line-height",
      "letter-spacing",
      "text-transform",
    ]);
    await expect(root.hostile).toEqual(root.clean);
    const label = computeUnderHostileHost(canvasElement, ".cy-divider-label", [
      "box-sizing",
      "width",
      "height",
      "color",
      "font-size",
      "font-weight",
      "letter-spacing",
      "text-transform",
    ]);
    await expect(label.hostile).toEqual(label.clean);
    const vertical = computeUnderHostileHost(canvasElement, ".host-vertical", [
      "box-sizing",
      "width",
      "height",
      "margin-left",
      "margin-right",
    ]);
    await expect(vertical.hostile).toEqual(vertical.clean);
    // The lines are pseudo-elements: host `::before { border-width: 0 }` resets must not remove them.
    const el = canvasElement.querySelector(".cy-divider") as HTMLElement;
    const upright = canvasElement.querySelector(".host-vertical") as HTMLElement;
    const read = () => [
      line(el),
      line(el, "::after"),
      getComputedStyle(el, "::before").width,
      getComputedStyle(upright, "::before").borderLeftWidth,
      getComputedStyle(upright, "::before").height,
    ];
    const clean = read();
    const style = document.createElement("style");
    style.textContent = hostileHostCss;
    document.head.append(style);
    try {
      await expect(read()).toEqual(clean);
    } finally {
      style.remove();
    }
  },
};
