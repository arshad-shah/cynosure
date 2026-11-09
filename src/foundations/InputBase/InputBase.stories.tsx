import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { InputBase } from "./InputBase.js";

const meta = {
  title: "Foundations/InputBase",
  component: InputBase,
  args: { "aria-label": "Name" },
} satisfies Meta<typeof InputBase>;
export default meta;
type Story = StoryObj<typeof meta>;

export const MapsInvalidToAria: Story = {
  args: { invalid: true },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Name" });
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await userEvent.type(input, "Ada");
    await expect(input).toHaveValue("Ada");
  },
};
