import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import { HiddenValue } from "./HiddenValue.js";

const meta = {
  title: "Foundations/HiddenValue",
  component: HiddenValue,
  args: { name: "fruit", value: "apple" },
} satisfies Meta<typeof HiddenValue>;
export default meta;
type Story = StoryObj<typeof meta>;

export const SubmitsValidatesAndResets: Story = {
  args: { onReset: fn() },
  render: (args) => (
    <form data-testid="form">
      <HiddenValue {...args} />
      <HiddenValue name="empty" value="" required />
    </form>
  ),
  play: async ({ canvas, args }) => {
    const form = canvas.getByTestId("form") as HTMLFormElement;
    await expect(new FormData(form).get("fruit")).toBe("apple");
    await expect(form.checkValidity()).toBe(false);
    form.reset();
    await expect(args.onReset).toHaveBeenCalledTimes(1);
  },
};
