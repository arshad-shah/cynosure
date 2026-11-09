import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import { ButtonBase } from "./ButtonBase.js";

const meta = {
  title: "Foundations/ButtonBase",
  component: ButtonBase,
  args: { children: "Base", onClick: fn() },
} satisfies Meta<typeof ButtonBase>;
export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultsToTypeButton: Story = {
  play: async ({ canvas, args, userEvent }) => {
    const button = canvas.getByRole("button", { name: "Base" });
    await expect(button).toHaveAttribute("type", "button");
    await expect(button).not.toHaveAttribute("aria-pressed");
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const MirrorsPressed: Story = {
  args: { pressed: true },
  play: async ({ canvas }) => {
    const button = canvas.getByRole("button", { name: "Base" });
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(button).toHaveAttribute("data-pressed", "");
  },
};
