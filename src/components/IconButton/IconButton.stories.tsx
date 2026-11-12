import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, waitFor } from "storybook/test";
import * as icons from "../../icons/index.js";
import { copy, trash } from "../../icons/index.js";
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
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    label: { control: "text" },
    loading: { control: "boolean" },
    pressed: { control: "boolean" },
    disabled: { control: "boolean" },
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
