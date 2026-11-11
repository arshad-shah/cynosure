import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { TextAreaBase } from "./TextAreaBase.js";

const meta = {
  title: "Foundations/TextAreaBase",
  component: TextAreaBase,
  args: { "aria-label": "Notes" },
} satisfies Meta<typeof TextAreaBase>;
export default meta;
type Story = StoryObj<typeof meta>;

export const AcceptsTextAndInvalid: Story = {
  args: { invalid: true },
  play: async ({ canvas, userEvent }) => {
    const area = canvas.getByRole("textbox", { name: "Notes" });
    await userEvent.type(area, "line one{enter}line two");
    await expect(area).toHaveValue("line one\nline two");
    await expect(area).toHaveAttribute("aria-invalid", "true");
  },
};
