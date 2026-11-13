import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, waitFor } from "storybook/test";
import * as icons from "../../icons/index.js";
import { chevronRight, copy, trash } from "../../icons/index.js";
import { IconButton } from "./IconButton.js";

const iconMapping: Record<string, unknown> = {};
for (const value of Object.values(icons))
  if (typeof value === "object" && value && "body" in value) iconMapping[value.name] = value;

const meta = {
  title: "Components/IconButton",
  component: IconButton,
  args: {
    icon: copy,
    label: "Copy document",
    onClick: fn(),
    variant: "outline",
    tone: "neutral",
    size: "md",
  },
  argTypes: {
    icon: { control: "select", options: Object.keys(iconMapping), mapping: iconMapping },
    variant: { control: "inline-radio", options: ["solid", "soft", "outline", "ghost"] },
    tone: { control: "select", options: ["accent", "neutral", "danger", "success", "warning", "info"] },
    size: { control: "inline-radio", options: ["xs", "sm", "md", "lg"] },
    label: { control: "text" },
    loading: { control: "boolean" },
    pressed: { control: "boolean" },
    disabled: { control: "boolean" },
    flipRtl: { control: "boolean" },
    iconColor: { control: "color" },
    wrapperClassName: { control: "text" },
  },
} satisfies Meta<typeof IconButton>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["visual"],
  play: async ({ canvas, args, userEvent }) => {
    const button = canvas.getByRole("button", { name: "Copy document" });
    await expect(button.getAttribute("title")).toBeNull();
    const { width, height } = button.getBoundingClientRect();
    await expect(width).toBe(height);
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

const before = (el: Element) => {
  const s = getComputedStyle(el, "::before");
  return Math.min(Number.parseFloat(s.width), Number.parseFloat(s.height));
};

export const ExtraSmallForDenseToolbars: Story = {
  args: { size: "xs", variant: "ghost" },
  render: (args) => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <IconButton {...args} />
      <IconButton {...args} size="sm" label="Delete" icon={trash} />
    </div>
  ),
  play: async ({ canvas, args, userEvent }) => {
    const xs = canvas.getByRole("button", { name: "Copy document" });
    const sm = canvas.getByRole("button", { name: "Delete" });
    // A 20px square with a smaller icon than sm's, centred in it.
    const box = xs.getBoundingClientRect();
    await expect([box.width, box.height]).toEqual([20, 20]);
    const icon = (el: Element) => (el.querySelector(".cy-icon") as Element).getBoundingClientRect();
    await expect(icon(xs).height).toBeLessThan(icon(sm).height);
    await expect(Math.abs(icon(xs).top + icon(xs).height / 2 - (box.top + box.height / 2))).toBeLessThan(1);
    // Still 24px to press.
    await expect(before(xs)).toBeGreaterThanOrEqual(24);
    await expect(document.elementFromPoint(box.left - 1, box.top + box.height / 2)).toBe(xs);
    await userEvent.tab();
    await expect(xs).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const ExtraSmallCoarsePointer: Story = {
  tags: ["touch", "!dev"],
  args: { size: "xs" },
  play: async ({ canvas, args, userEvent }) => {
    const button = canvas.getByRole("button", { name: "Copy document" });
    await expect(button.getBoundingClientRect().height).toBe(20);
    await expect(before(button)).toBeGreaterThanOrEqual(44);
    await userEvent.pointer({ keys: "[TouchA]", target: button });
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const Danger: Story = {
  tags: ["visual"],
  args: { icon: trash, label: "Delete", variant: "soft", tone: "danger" },
};

export const TooltipShowsAndDismisses: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const button = canvas.getByRole("button", { name: "Copy document" });
    const tip = canvasElement.querySelector(".cy-tooltip") as HTMLElement;
    await expect(tip).toHaveTextContent("Copy document");
    await expect(tip.matches(":popover-open")).toBe(false);
    await userEvent.hover(button);
    await waitFor(() => expect(tip.matches(":popover-open")).toBe(true));
    await userEvent.keyboard("{Escape}");
    await expect(tip.matches(":popover-open")).toBe(false);
    await userEvent.unhover(button);
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await waitFor(() => expect(tip.matches(":popover-open")).toBe(true));
    await userEvent.tab();
    await waitFor(() => expect(tip.matches(":popover-open")).toBe(false));
  },
};

export const ForwardsConsumerHandlersAndClassName: Story = {
  args: {
    className: "toolbar-action",
    size: "lg",
    onPointerEnter: fn(),
    onPointerLeave: fn(),
    onFocus: fn(),
    onBlur: fn(),
    onKeyDown: fn(),
  },
  play: async ({ canvas, args, userEvent }) => {
    const button = canvas.getByRole("button", { name: "Copy document" });
    await expect(button).toHaveClass("cy-icon-button", "toolbar-action");
    await expect(button.getBoundingClientRect().width).toBe(40);
    await userEvent.hover(button);
    await userEvent.unhover(button);
    await userEvent.tab();
    await userEvent.keyboard("a");
    await userEvent.tab();
    for (const handler of [
      args.onPointerEnter,
      args.onPointerLeave,
      args.onFocus,
      args.onKeyDown,
      args.onBlur,
    ])
      await expect(handler).toHaveBeenCalled();
  },
};

export const CurrentPageInBothForms: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 8 }}>
      <IconButton {...args} icon={copy} label="Previous page" href="#page-1" />
      <IconButton {...args} icon={copy} label="This page" href="#page-2" aria-current="page" />
      <IconButton {...args} icon={trash} label="This step" aria-current="step" />
    </div>
  ),
  play: async ({ canvas }) => {
    // The mark reaches the element whether it is a link or a button, and only where it was asked for.
    await expect(canvas.getByRole("link", { name: "This page" })).toHaveAttribute("aria-current", "page");
    await expect(canvas.getByRole("link", { name: "This page" })).toHaveAttribute("href", "#page-2");
    await expect(canvas.getByRole("button", { name: "This step" })).toHaveAttribute("aria-current", "step");
    await expect(canvas.getByRole("link", { name: "Previous page" })).not.toHaveAttribute("aria-current");
  },
};

export const MouseFocusDoesNotPinTooltip: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const button = canvas.getByRole("button", { name: "Copy document" });
    const tip = canvasElement.querySelector(".cy-tooltip") as HTMLElement;
    await userEvent.click(button);
    await expect(button).toHaveFocus();
    await userEvent.unhover(button);
    await waitFor(() => expect(tip.matches(":popover-open")).toBe(false));
  },
};

export const NextPointsAlongTheReadingDirection: Story = {
  args: { icon: chevronRight, label: "Next page", flipRtl: true },
  render: (args) => (
    <div style={{ display: "flex", gap: 8 }}>
      <div dir="ltr">
        <IconButton {...args} data-testid="ltr" />
      </div>
      <div dir="rtl">
        <IconButton {...args} data-testid="rtl" />
      </div>
    </div>
  ),
  play: async ({ canvas }) => {
    const icon = (id: string) => canvas.getByTestId(id).querySelector("svg") as SVGElement;
    await expect(getComputedStyle(icon("ltr")).scale).toBe("none");
    // Mirrored in right-to-left text.
    await expect(getComputedStyle(icon("rtl")).scale).toBe("-1 1");
  },
};

export const IconColourAndWrapperLayout: Story = {
  args: { iconColor: "rgb(0, 128, 0)", wrapperClassName: "row-end" },
  render: (args) => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr auto" }}>
      <span>Row</span>
      <IconButton {...args} />
      <style>{".row-end { grid-column: 1; }"}</style>
    </div>
  ),
  play: async ({ canvas }) => {
    const button = canvas.getByRole("button", { name: "Copy document" });
    await expect(getComputedStyle(button.querySelector("svg") as SVGElement).color).toBe("rgb(0, 128, 0)");
    // The wrapper (the tooltip's anchor) is the box the parent lays out, and it takes the class.
    const wrapper = button.parentElement as HTMLElement;
    await expect(wrapper).toHaveClass("cy-tooltip-anchor", "row-end");
    await expect(getComputedStyle(wrapper).gridColumnStart).toBe("1");
    await expect(button).not.toHaveClass("row-end");
  },
};
