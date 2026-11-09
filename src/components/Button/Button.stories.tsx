import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { expect, fn, waitFor } from "storybook/test";
import * as icons from "../../icons/index.js";
import { chevronDown, copy, download, trash } from "../../icons/index.js";
import { createStyleSheet } from "../../styles/inline.js";
import { backdrop, contrast } from "../../test/color.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { CynosureTheme } from "../../theme/index.js";
import { createTheme } from "../../tokens/index.js";
import { Button } from "./Button.js";

const iconMapping: Record<string, unknown> = { none: undefined };
for (const value of Object.values(icons))
  if (typeof value === "object" && value && "body" in value) iconMapping[value.name] = value;
const iconNames = Object.keys(iconMapping).filter((n) => n !== "none");

const meta = {
  title: "Components/Button",
  component: Button,
  args: { children: "Export", onClick: fn(), variant: "outline", tone: "neutral", size: "md" },
  argTypes: {
    variant: { control: "inline-radio", options: ["solid", "soft", "outline", "ghost"] },
    tone: { control: "select", options: ["accent", "neutral", "danger", "success", "warning", "info"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    icon: { control: "select", options: ["none", ...iconNames], mapping: iconMapping },
    iconEnd: { control: "select", options: ["none", ...iconNames], mapping: iconMapping },
    loading: { control: "boolean" },
    pressed: { control: "boolean" },
    disabled: { control: "boolean" },
    fullWidth: { control: "boolean" },
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
