import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, waitFor } from "storybook/test";
import { copy, trash } from "../../icons/index.js";
import { IconButton } from "./IconButton.js";

const meta = {
  title: "Components/IconButton",
  component: IconButton,
  args: { icon: copy, label: "Copy document", onClick: fn() },
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

export const Danger: Story = { tags: ["visual"], args: { icon: trash, label: "Delete", variant: "danger" } };

export const TooltipShowsAndDismisses: Story = {
  play: async ({ canvas, userEvent }) => {
    const button = canvas.getByRole("button", { name: "Copy document" });
    const tip = button.querySelector(".cy-icon-button-tip") as HTMLElement;
    await expect(tip).toHaveAttribute("aria-hidden", "true");
    await expect(button).not.toHaveAttribute("data-tip");
    await userEvent.hover(button);
    await waitFor(() => expect(button).toHaveAttribute("data-tip", "open"));
    await expect(tip.textContent).toBe("Copy document");
    await userEvent.keyboard("{Escape}");
    await expect(button).not.toHaveAttribute("data-tip");
    await userEvent.unhover(button);
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await waitFor(() => expect(button).toHaveAttribute("data-tip", "open"));
    await userEvent.tab();
    await expect(button).not.toHaveAttribute("data-tip");
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

export const MouseFocusDoesNotPinTooltip: Story = {
  play: async ({ canvas, userEvent }) => {
    const button = canvas.getByRole("button", { name: "Copy document" });
    await userEvent.click(button);
    await expect(button).toHaveFocus();
    await userEvent.unhover(button);
    await expect(button).not.toHaveAttribute("data-tip");
  },
};
