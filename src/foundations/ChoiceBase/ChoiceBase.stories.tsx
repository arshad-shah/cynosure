import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import { ChoiceBase } from "./ChoiceBase.js";

const meta = {
  title: "Foundations/ChoiceBase",
  component: ChoiceBase,
  args: { type: "checkbox" },
} satisfies Meta<typeof ChoiceBase>;
export default meta;
type Story = StoryObj<typeof meta>;

export const FocusableAndSubmits: Story = {
  render: () => (
    <form data-testid="form">
      <ChoiceBase id="agree" type="checkbox" name="agree" value="yes" />
      <label htmlFor="agree">Agree</label>
    </form>
  ),
  play: async ({ canvas, userEvent }) => {
    const box = canvas.getByRole("checkbox", { name: "Agree" });
    await userEvent.tab();
    await expect(box).toHaveFocus();
    await userEvent.click(canvas.getByText("Agree"));
    await expect(box).toBeChecked();
    await expect(new FormData(canvas.getByTestId("form") as HTMLFormElement).get("agree")).toBe("yes");
  },
};

export const Indeterminate: Story = {
  args: { indeterminate: true, "aria-label": "Select all" },
  play: async ({ canvas }) => {
    const box = canvas.getByRole("checkbox", { name: "Select all" }) as HTMLInputElement;
    await expect(box.indeterminate).toBe(true);
  },
};

export const IndeterminateSurvivesAClick: Story = {
  args: { indeterminate: true, "aria-label": "Select all", onChange: fn() },
  play: async ({ args, canvas, userEvent }) => {
    const box = canvas.getByRole("checkbox", { name: "Select all" }) as HTMLInputElement;
    // The browser clears the mixed state on a click; while the prop stays true it is put back.
    await userEvent.click(box);
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await expect(box.indeterminate).toBe(true);
    await userEvent.keyboard(" ");
    await expect(box.indeterminate).toBe(true);
  },
};
