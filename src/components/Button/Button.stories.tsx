import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { expect, fn, waitFor } from "storybook/test";
import * as icons from "../../icons/index.js";
import { chevronDown, copy, download, trash } from "../../icons/index.js";
import { createStyleSheet } from "../../styles/inline.js";
import { backdrop, contrast, rgb, textContrast } from "../../test/color.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { realHover } from "../../test/hover.js";
import { CynosureTheme } from "../../theme/index.js";
import { createTheme } from "../../tokens/index.js";
import { TextField } from "../TextField/TextField.js";
import { Button } from "./Button.js";

const iconMapping: Record<string, unknown> = { none: undefined };
for (const value of Object.values(icons))
  if (typeof value === "object" && value && "body" in value) iconMapping[value.name] = value;
const iconNames = Object.keys(iconMapping).filter((n) => n !== "none");

const meta = {
  tags: ["serial"],
  title: "Components/Button",
  component: Button,
  args: { children: "Export", onClick: fn(), variant: "outline", tone: "neutral", size: "md" },
  argTypes: {
    variant: { control: "inline-radio", options: ["solid", "soft", "outline", "ghost"] },
    tone: { control: "select", options: ["accent", "neutral", "danger", "success", "warning", "info"] },
    size: { control: "inline-radio", options: ["xs", "sm", "md", "lg"] },
    icon: { control: "select", options: ["none", ...iconNames], mapping: iconMapping },
    iconEnd: { control: "select", options: ["none", ...iconNames], mapping: iconMapping },
    loading: { control: "boolean" },
    pressed: { control: "boolean" },
    disabled: { control: "boolean" },
    fullWidth: { control: "boolean" },
    square: { control: "boolean" },
    children: { control: "text" },
    type: { control: "inline-radio", options: ["button", "submit", "reset"] },
  },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

const pseudo = (el: Element) => {
  const s = getComputedStyle(el, "::before");
  return { w: Number.parseFloat(s.width), h: Number.parseFloat(s.height) };
};

export const Primary: Story = {
  tags: ["visual"],
  args: { variant: "solid", tone: "accent", icon: download },
  play: async ({ canvas, args, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Export" }));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const Outline: Story = {
  tags: ["visual"],
  args: { variant: "outline", icon: copy, children: "Copy path" },
};
export const Soft: Story = {
  tags: ["visual"],
  args: { variant: "soft", tone: "accent", icon: copy, children: "Copy path" },
};
export const Ghost: Story = { tags: ["visual"], args: { variant: "ghost", children: "Cancel" } };
export const Danger: Story = {
  tags: ["visual"],
  args: { variant: "soft", tone: "danger", icon: trash, children: "Delete" },
};

export const Sizes: Story = {
  tags: ["visual"],
  render: (args) => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args} size="md">
        Medium
      </Button>
      <Button {...args} size="lg">
        Large
      </Button>
    </div>
  ),
  play: async ({ canvas }) => {
    const [sm, md, lg] = canvas.getAllByRole("button").map((b) => b.getBoundingClientRect().height);
    await expect([sm, md, lg]).toEqual([26, 32, 40]);
  },
};

export const WithIcons: Story = {
  tags: ["visual"],
  args: { icon: download, iconEnd: chevronDown, children: "Export as" },
};

export const KeyboardActivation: Story = {
  play: async ({ canvas, args, userEvent }) => {
    const button = canvas.getByRole("button", { name: "Export" });
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvas, args, userEvent }) => {
    const button = canvas.getByRole("button", { name: "Export" });
    await userEvent.click(button);
    await userEvent.pointer({ keys: "[TouchA]", target: button });
    button.focus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onClick).not.toHaveBeenCalled();
    await expect(button).toBeDisabled();
  },
};

export const TouchTap: Story = {
  play: async ({ canvas, args, userEvent }) => {
    await userEvent.pointer({ keys: "[TouchA]", target: canvas.getByRole("button", { name: "Export" }) });
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const HitTargetCompact: Story = {
  render: (args) => (
    <CynosureTheme theme={createTheme({ scale: "compact" })}>
      <Button {...args} size="sm" />
    </CynosureTheme>
  ),
  play: async ({ canvas }) => {
    const button = canvas.getByRole("button");
    await expect(button.getBoundingClientRect().height).toBeLessThan(24);
    const hit = pseudo(button);
    await expect(Math.min(hit.w, hit.h)).toBeGreaterThanOrEqual(24);
  },
};

export const HitTargetCoarsePointer: Story = {
  tags: ["touch", "!dev"],
  args: { size: "sm" },
  play: async ({ canvas, args, userEvent }) => {
    await expect(matchMedia("(pointer: coarse)").matches).toBe(true);
    const button = canvas.getByRole("button");
    const hit = pseudo(button);
    await expect(Math.min(hit.w, hit.h)).toBeGreaterThanOrEqual(44);
    await userEvent.pointer({ keys: "[TouchA]", target: button });
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const ExtraSmallForDenseChrome: Story = {
  args: { size: "xs", icon: download, children: "Export" },
  render: (args) => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <Button {...args} />
      <Button {...args} size="sm">
        Small
      </Button>
    </div>
  ),
  play: async ({ canvas, args, userEvent }) => {
    const xs = canvas.getByRole("button", { name: "Export" });
    const sm = canvas.getByRole("button", { name: "Small" });
    // The visible control is about 20px: smaller than sm, with smaller text and icon.
    const box = xs.getBoundingClientRect();
    await expect(box.height).toBe(20);
    await expect(box.height).toBeLessThan(sm.getBoundingClientRect().height);
    const size = (el: Element) => Number.parseFloat(getComputedStyle(el).fontSize);
    await expect(size(xs)).toBeLessThan(size(sm));
    await expect(size(xs)).toBeGreaterThanOrEqual(11);
    const icon = (el: Element) => (el.querySelector(".cy-icon") as Element).getBoundingClientRect().height;
    await expect(icon(xs)).toBeLessThan(icon(sm));
    await expect(icon(xs)).toBeLessThan(box.height);
    // The label is whole, not clipped, and reads on its surface.
    const label = xs.querySelector(".cy-button-label") as HTMLElement;
    await expect(label.scrollWidth).toBeLessThanOrEqual(label.clientWidth);
    await expect(textContrast(label)).toBeGreaterThanOrEqual(4.5);
    // Still at least 24px to press: a click just above the visible edge lands on the button.
    await expect(Math.min(pseudo(xs).w, pseudo(xs).h)).toBeGreaterThanOrEqual(24);
    await expect(document.elementFromPoint(box.left + box.width / 2, box.top - 1)).toBe(xs);
    await userEvent.click(xs);
    xs.focus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    await expect(args.onClick).toHaveBeenCalledTimes(3);
  },
};

export const ExtraSmallCoarsePointer: Story = {
  tags: ["touch", "!dev"],
  args: { size: "xs" },
  play: async ({ canvas, args, userEvent }) => {
    await expect(matchMedia("(pointer: coarse)").matches).toBe(true);
    const button = canvas.getByRole("button");
    // The look stays dense; only the invisible hit area grows to 44px.
    await expect(button.getBoundingClientRect().height).toBe(20);
    await expect(Math.min(pseudo(button).w, pseudo(button).h)).toBeGreaterThanOrEqual(44);
    await userEvent.pointer({ keys: "[TouchA]", target: button });
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const Loading: Story = {
  tags: ["visual"],
  args: { variant: "solid", tone: "accent", icon: download },
  render: (args) => (
    <div style={{ display: "flex", gap: 12 }}>
      <Button {...args} loading data-testid="busy" />
      <Button {...args} data-testid="idle" />
    </div>
  ),
  play: async ({ canvas, args, userEvent }) => {
    const busy = canvas.getByTestId("busy");
    await expect(busy).toHaveAttribute("aria-busy", "true");
    await expect(busy).toHaveAccessibleName("Export");
    await userEvent.click(busy);
    await expect(args.onClick).not.toHaveBeenCalled();
    const dots = busy.querySelector(".cy-loading-dots") as HTMLElement;
    await expect(dots).toHaveAttribute("aria-hidden", "true");
    const b = busy.getBoundingClientRect();
    const d = dots.getBoundingClientRect();
    await expect(Math.abs(d.left + d.width / 2 - (b.left + b.width / 2))).toBeLessThan(1);
    await expect(Math.abs(d.top + d.height / 2 - (b.top + b.height / 2))).toBeLessThan(1);
    const idle = canvas.getByTestId("idle");
    await expect(busy.getBoundingClientRect().width).toBeCloseTo(idle.getBoundingClientRect().width, 0);
  },
};

export const Pressed: Story = {
  render: (args) => <PressedToggle {...args} />,
  play: async ({ canvas, userEvent }) => {
    const button = canvas.getByRole("button", { name: "Export" });
    await expect(button).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(button);
    await expect(button).toHaveAttribute("aria-pressed", "true");
  },
};

function PressedToggle(props: React.ComponentProps<typeof Button>) {
  const [on, setOn] = useState(false);
  return <Button {...props} pressed={on} onClick={() => setOn(!on)} />;
}

export const NeverSubmitsByDefault: Story = {
  render: (args) => (
    <form
      data-testid="form"
      onSubmit={(e) => {
        e.preventDefault();
        args.onClick?.(e as never);
      }}
    >
      <Button>Export</Button>
    </form>
  ),
  play: async ({ canvas, args, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Export" }));
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const SubmitsWhenTypeSubmit: Story = {
  render: (args) => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        args.onClick?.(e as never);
      }}
    >
      <Button type="submit">Save</Button>
    </form>
  ),
  play: async ({ canvas, args, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const LongLabelTruncates: Story = {
  args: {
    icon: download,
    children: "Export the entire workspace including every nested document and its history",
  },
  play: async ({ canvasElement }) => {
    const button = canvasElement.querySelector("button") as HTMLElement;
    const label = canvasElement.querySelector(".cy-button-label") as HTMLElement;
    await expect(getComputedStyle(label).textOverflow).toBe("ellipsis");
    await expect(label.scrollWidth).toBeGreaterThan(label.clientWidth);
    await expect(button.getBoundingClientRect().height).toBe(32);
  },
};

export const RightToLeft: Story = {
  args: { icon: download, children: "تصدير" },
  render: (args) => (
    <div dir="rtl">
      <Button {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const icon = canvasElement.querySelector(".cy-icon") as Element;
    const label = canvasElement.querySelector(".cy-button-label") as Element;
    await expect(icon.getBoundingClientRect().left).toBeGreaterThan(label.getBoundingClientRect().left);
  },
};

const STABLE = [
  "color",
  "height",
  "padding-inline-start",
  "border-top-width",
  "border-radius",
  "background-color",
  "font-size",
  "line-height",
  "box-sizing",
];

export const ALinkThatLooksLikeAButton: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8 }}>
      <Button href="/docs" variant="solid" tone="accent">
        Read the docs
      </Button>
      <Button href="https://example.com" target="_blank">
        Example
      </Button>
      {/* biome-ignore lint/security/noScriptUrl: the story checks that an unsafe URL is not linked */}
      <Button href="javascript:alert(1)">Unsafe</Button>
    </div>
  ),
  play: async ({ canvas }) => {
    const docs = canvas.getByRole("link", { name: "Read the docs" });
    await expect(docs).toHaveAttribute("href", "/docs");
    await expect(docs).toHaveAttribute("data-variant", "solid");
    await expect(canvas.getByRole("link", { name: "Example" })).toHaveAttribute("rel", "noopener noreferrer");
    // Only safe URLs are linked.
    await expect(canvas.getByText("Unsafe").closest("a")).not.toHaveAttribute("href");
  },
};

export const CurrentPageInBothForms: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8 }}>
      <Button href="/reports" aria-current="page" variant="soft" tone="accent" style={{ marginInlineEnd: 4 }}>
        Reports
      </Button>
      <Button href="/billing">Billing</Button>
      <Button aria-current="step">Shipping</Button>
      <Button>Payment</Button>
    </div>
  ),
  play: async ({ canvas }) => {
    // A link that is the page being shown says so, and so does a button that is the current step.
    const reports = canvas.getByRole("link", { name: "Reports" });
    await expect(reports).toHaveAttribute("aria-current", "page");
    await expect(reports).toHaveAttribute("href", "/reports");
    await expect(canvas.getByRole("button", { name: "Shipping" })).toHaveAttribute("aria-current", "step");
    // Nothing is marked unless asked.
    await expect(canvas.getByRole("link", { name: "Billing" })).not.toHaveAttribute("aria-current");
    await expect(canvas.getByRole("button", { name: "Payment" })).not.toHaveAttribute("aria-current");
    // Layout style reaches a link as it does a button.
    await expect(getComputedStyle(reports).marginInlineEnd).toBe("4px");
  },
};

export const ConfirmInPlace: Story = {
  args: { children: "Delete", confirm: "Press again to delete", tone: "danger", onClick: fn() },
  play: async ({ args, canvas, userEvent }) => {
    const button = canvas.getByRole("button", { name: "Delete" });
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
    await expect(button).toHaveAccessibleName("Press again to delete");
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
    await expect(button).toHaveAccessibleName("Delete");
    // Escape disarms it, and so does leaving it.
    await userEvent.click(button);
    await userEvent.keyboard("{Escape}");
    await expect(button).toHaveAccessibleName("Delete");
    await userEvent.click(button);
    await userEvent.tab();
    await expect(button).toHaveAccessibleName("Delete");
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const KeepFocusForKeypads: Story = {
  render: () => {
    function Keypad() {
      const [text, setText] = useState("");
      return (
        <div style={{ display: "grid", gap: 8, inlineSize: 240 }}>
          <TextField label="Answer" value={text} onChange={setText} />
          <div style={{ display: "flex", gap: 4 }}>
            {["7", "8", "9"].map((k) => (
              <Button key={k} keepFocus onClick={() => setText((t) => t + k)}>
                {k}
              </Button>
            ))}
          </div>
        </div>
      );
    }
    return <Keypad />;
  },
  play: async ({ canvas, userEvent }) => {
    const field = canvas.getByRole("textbox", { name: "Answer" });
    await userEvent.click(field);
    await userEvent.click(canvas.getByRole("button", { name: "8" }));
    await userEvent.click(canvas.getByRole("button", { name: "9" }));
    // The keys type into the field and the field keeps focus.
    await expect(field).toHaveValue("89");
    await expect(field).toHaveFocus();
  },
};

export const StableUnderHostileHost: Story = {
  args: { variant: "solid", tone: "accent", icon: download },
  play: async ({ canvasElement }) => {
    const button = computeUnderHostileHost(canvasElement, "button", STABLE);
    await expect(button.hostile).toEqual(button.clean);
    const icon = computeUnderHostileHost(canvasElement, ".cy-icon", ["width", "height"]);
    await expect(icon.hostile).toEqual(icon.clean);
    const label = computeUnderHostileHost(canvasElement, ".cy-button-label", [
      "font-weight",
      "text-transform",
      "letter-spacing",
      "color",
    ]);
    await expect(label.hostile).toEqual(label.clean);
  },
};

function ShadowButton() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current;
    if (!el || el.shadowRoot) return;
    const root = el.attachShadow({ mode: "open" });
    root.adoptedStyleSheets = [createStyleSheet()];
    const mount = document.createElement("div");
    root.append(mount);
    createRoot(mount).render(
      <Button variant="solid" tone="accent" icon={download}>
        Export
      </Button>,
    );
  }, []);
  return (
    <div>
      <Button variant="solid" tone="accent" icon={download}>
        Export
      </Button>
      <div data-testid="host" ref={host} />
    </div>
  );
}

export const InsideShadowRoot: Story = {
  render: () => <ShadowButton />,
  play: async ({ canvasElement, canvas }) => {
    const host = await canvas.findByTestId("host");
    await waitFor(() => expect(host.shadowRoot?.querySelector("button")).toBeTruthy());
    const inside = getComputedStyle(host.shadowRoot?.querySelector("button") as Element);
    const onPage = getComputedStyle(canvasElement.querySelector("button") as Element);
    for (const p of ["height", "border-radius", "padding-inline-start", "font-size", "font-weight"])
      await expect(inside.getPropertyValue(p)).toBe(onPage.getPropertyValue(p));
  },
};

export const FocusVisibleInForcedColors: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab();
    const style = getComputedStyle(canvas.getByRole("button"));
    // A transparent solid outline is what forced-colors mode turns into a visible focus ring.
    await expect(style.outlineStyle).toBe("solid");
    await expect(Number.parseFloat(style.outlineWidth)).toBeGreaterThan(0);
  },
};

export const LargeWithTrailingIconAndLayoutProps: Story = {
  args: {
    size: "lg",
    icon: download,
    iconEnd: chevronDown,
    className: "layout-hook",
    style: { marginInlineStart: 12 },
  },
  play: async ({ canvas }) => {
    const button = canvas.getByRole("button", { name: "Export" });
    await expect(button.getBoundingClientRect().height).toBe(40);
    await expect(button).toHaveClass("cy-button", "layout-hook");
    await expect(getComputedStyle(button).marginInlineStart).toBe("12px");
    const icons = button.querySelectorAll(".cy-icon");
    await expect(icons).toHaveLength(2);
    for (const icon of icons) await expect(icon.getBoundingClientRect().width).toBe(20);
  },
};

export const FullWidth: Story = {
  args: { fullWidth: true },
  render: (args) => (
    <div style={{ width: 480 }}>
      <Button {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button").getBoundingClientRect().width).toBe(480);
  },
};

export const DangerIsDistinctFromPrimary: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12 }}>
      <Button variant="solid" tone="accent" data-testid="primary">
        Save
      </Button>
      <Button variant="soft" tone="danger" data-testid="danger" icon={trash}>
        Delete
      </Button>
    </div>
  ),
  play: async ({ canvas }) => {
    const primary = getComputedStyle(canvas.getByTestId("primary"));
    const danger = getComputedStyle(canvas.getByTestId("danger"));
    // Soft danger is a crimson tint with crimson text: never a second solid accent.
    await expect(danger.backgroundColor).not.toBe(primary.backgroundColor);
    await expect(danger.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    await expect(danger.color).not.toBe(primary.color);
  },
};

const VARIANTS = ["solid", "soft", "outline", "ghost"] as const;
const TONES = ["accent", "neutral", "danger", "success", "warning", "info"] as const;

export const VariantsAndTones: Story = {
  tags: ["visual"],
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, max-content)", gap: 12 }}>
      {TONES.flatMap((tone) =>
        VARIANTS.map((variant) => (
          <Button key={`${tone}-${variant}`} variant={variant} tone={tone} data-testid={`${tone}-${variant}`}>
            {tone} {variant}
          </Button>
        )),
      )}
    </div>
  ),
  play: async ({ canvas }) => {
    for (const tone of TONES) {
      const looks = new Set<string>();
      for (const variant of VARIANTS) {
        const button = canvas.getByTestId(`${tone}-${variant}`);
        const style = getComputedStyle(button);
        looks.add(`${style.backgroundColor}|${style.borderTopColor}|${style.color}`);
        const ratio = contrast(style.color, backdrop(button));
        await expect({ tone, variant, readable: ratio >= 4.5 }).toEqual({ tone, variant, readable: true });
      }
      await expect(looks.size).toBe(VARIANTS.length);
    }
  },
};

/** The font's own ascent and descent at the element's computed font, in px (what a glyph like g or y can reach). */
const fontExtent = (el: Element) => {
  const ctx = document.createElement("canvas").getContext("2d") as CanvasRenderingContext2D;
  ctx.font = getComputedStyle(el).font;
  const m = ctx.measureText("Égypj");
  return m.fontBoundingBoxAscent + m.fontBoundingBoxDescent;
};

export const DescendersAreNeverClipped: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <Button key={size} size={size} variant="solid" tone="accent">
          Typography
        </Button>
      ))}
      {/* A font with deep descenders and tall accents, like Plus Jakarta Sans, at a tight line height. */}
      <span style={{ fontFamily: "serif" }}>
        <Button style={{ fontFamily: "inherit" }}>Gypsy jig</Button>
      </span>
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const label of canvasElement.querySelectorAll<HTMLElement>(".cy-button-label")) {
      // The label clips its overflow (long labels end in an ellipsis), so its box must hold the font's whole
      // ascent and descent, or the tails of g, y and p are cut off.
      await expect(label.clientHeight).toBeGreaterThanOrEqual(Math.floor(fontExtent(label)));
      // The button keeps its height token.
      const button = label.closest(".cy-button") as HTMLElement;
      await expect(button.getBoundingClientRect().height).toBeCloseTo(
        Number.parseFloat(getComputedStyle(button).blockSize),
        0,
      );
    }
  },
};

export const OneOffColour: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8 }}>
      <Button color="#0b7a75" variant="solid" data-testid="teal-solid">
        Teal
      </Button>
      <Button color="#f5d90a" variant="solid" data-testid="yellow-solid">
        Yellow
      </Button>
      <Button color="#f5d90a" variant="outline" data-testid="yellow-outline">
        Yellow
      </Button>
      <Button color="#0b7a75" variant="soft" data-testid="teal-soft">
        Teal
      </Button>
      <Button color="#0b7a75" variant="ghost" tone="danger" data-testid="teal-ghost">
        Teal
      </Button>
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    const solid = canvas.getByTestId("teal-solid");
    await expect(rgb(getComputedStyle(solid).backgroundColor)).toEqual(rgb("#0b7a75"));
    // The text on a solid fill is chosen for the colour: light on dark, dark on light, readable either way.
    await expect(contrast(getComputedStyle(solid).color, "#0b7a75")).toBeGreaterThanOrEqual(4.5);
    const yellow = canvas.getByTestId("yellow-solid");
    await expect(contrast(getComputedStyle(yellow).color, "#f5d90a")).toBeGreaterThanOrEqual(4.5);
    // On the surface (outline, soft, ghost) the colour is darkened or lightened until it reads.
    for (const id of ["yellow-outline", "teal-soft", "teal-ghost"])
      await expect(textContrast(canvas.getByTestId(id)), id).toBeGreaterThanOrEqual(4.5);
    // `color` wins over `tone`.
    await expect(canvas.getByTestId("teal-ghost")).not.toHaveAttribute("data-tone");
    // Focus still uses the theme's ring, and the button still works.
    await userEvent.tab();
    await expect(solid).toHaveFocus();
  },
};

export const SquareForOneIcon: Story = {
  args: { square: true, "aria-label": "Delete", children: <span data-testid="glyph">D</span> },
  play: async ({ canvas }) => {
    const button = canvas.getByRole("button", { name: "Delete" });
    // As wide as it is tall, with no padding; the label box steps aside so its content is not clipped.
    const { width, height } = button.getBoundingClientRect();
    await expect(width).toBe(height);
    await expect(getComputedStyle(button).paddingInlineStart).toBe("0px");
    const label = canvas.getByTestId("glyph").parentElement as HTMLElement;
    await expect(label).toHaveClass("cy-button-label");
    await expect(getComputedStyle(label).display).toBe("contents");
  },
};

export const HoverColoursFromTokens: Story = {
  tags: ["!dev"],
  args: { variant: "ghost", children: "Close" },
  render: (args) => (
    <div
      style={
        { "--cy-button-hover-bg": "rgb(200, 0, 40)", "--cy-button-hover-ink": "rgb(255, 255, 255)" } as never
      }
    >
      <Button {...args} />
      <Button variant="ghost">Stays</Button>
    </div>
  ),
  play: async ({ canvas }) => {
    const button = canvas.getByRole("button", { name: "Close" });
    const resting = getComputedStyle(button).color;
    await expect(rgb(resting)).not.toEqual([255, 255, 255]);
    // On hover the fill and the ink come from the tokens; off hover the button is its usual ghost self.
    if (!(await realHover(button))) return;
    await waitFor(() => expect(rgb(getComputedStyle(button).backgroundColor)).toEqual([200, 0, 40]));
    await expect(rgb(getComputedStyle(button).color)).toEqual([255, 255, 255]);
    await realHover(null);
    await waitFor(() => expect(getComputedStyle(button).backgroundColor).toBe("rgba(0, 0, 0, 0)"));
    await expect(getComputedStyle(button).color).toBe(resting);
  },
};

export const LinkTakesIdAndRef: Story = {
  render: function Render() {
    const ref = useRef<HTMLAnchorElement>(null);
    const [tag, setTag] = useState("");
    useEffect(() => setTag(ref.current?.tagName ?? "none"), []);
    return (
      <div>
        <Button href="/docs" id="docs-link" linkRef={ref}>
          Read the docs
        </Button>
        <output data-testid="tag">{tag}</output>
      </div>
    );
  },
  play: async ({ canvas }) => {
    const link = canvas.getByRole("link", { name: "Read the docs" });
    await expect(link).toHaveAttribute("id", "docs-link");
    // linkRef receives the link element.
    await waitFor(() => expect(canvas.getByTestId("tag")).toHaveTextContent("A"));
  },
};
