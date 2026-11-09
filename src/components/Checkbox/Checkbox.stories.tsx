import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { Checkbox } from "./Checkbox.js";

const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  args: { label: "Email me updates", onChange: fn(), size: "md", tone: "accent" },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    tone: { control: "select", options: ["accent", "neutral", "danger", "success", "warning", "info"] },
    checked: { control: "boolean" },
    indeterminate: { control: "boolean" },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
    label: { control: "text" },
    description: { control: "text" },
  },
} satisfies Meta<typeof Checkbox>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ClickSpaceAndLabelToggle: Story = {
  tags: ["visual"],
  args: { description: "Monthly, no spam." },
  play: async ({ canvas, args, userEvent }) => {
    const box = canvas.getByRole("checkbox", { name: "Email me updates" });
    await expect(box).toHaveAccessibleDescription("Monthly, no spam.");
    await userEvent.click(box);
    await expect(box).toBeChecked();
    await userEvent.keyboard(" ");
    await expect(box).not.toBeChecked();
    await userEvent.click(canvas.getByText("Email me updates"));
    await expect(box).toBeChecked();
    await expect(args.onChange).toHaveBeenNthCalledWith(1, true);
    await expect(args.onChange).toHaveBeenNthCalledWith(2, false);
    await expect(args.onChange).toHaveBeenNthCalledWith(3, true);
  },
};

export const DoubleClickAndHeldSpace: Story = {
  play: async ({ canvas, args, userEvent }) => {
    const box = canvas.getByRole("checkbox");
    await userEvent.dblClick(box);
    await expect(args.onChange).toHaveBeenCalledTimes(2);
    await expect(box).not.toBeChecked();
    box.focus();
    await userEvent.keyboard("{ >6}{/ }");
    await expect(args.onChange).toHaveBeenCalledTimes(3);
    await expect(box).toBeChecked();
  },
};

export const IndeterminateIsMixed: Story = {
  tags: ["visual"],
  args: { indeterminate: true, label: "Select all" },
  play: async ({ canvas }) => {
    const box = canvas.getByRole("checkbox", { name: "Select all" }) as HTMLInputElement;
    await expect(box.indeterminate).toBe(true);
    await expect(box).toBePartiallyChecked();
  },
};

export const FormValueResetAndRequired: Story = {
  render: () => (
    <form data-testid="form">
      <Checkbox label="Accept terms" name="terms" value="yes" required />
      <Checkbox label="Newsletter" name="news" value="on" defaultChecked />
    </form>
  ),
  play: async ({ canvas, userEvent }) => {
    const form = canvas.getByTestId("form") as HTMLFormElement;
    await expect(form.checkValidity()).toBe(false);
    await expect(new FormData(form).get("terms")).toBeNull();
    await userEvent.click(canvas.getByRole("checkbox", { name: "Accept terms" }));
    await userEvent.click(canvas.getByRole("checkbox", { name: "Newsletter" }));
    await expect(form.checkValidity()).toBe(true);
    await expect(new FormData(form).get("terms")).toBe("yes");
    await expect(new FormData(form).get("news")).toBeNull();
    form.reset();
    await expect(canvas.getByRole("checkbox", { name: "Accept terms" })).not.toBeChecked();
    await expect(canvas.getByRole("checkbox", { name: "Newsletter" })).toBeChecked();
  },
};

export const CheckedShowsMark: Story = {
  tags: ["visual"],
  args: { defaultChecked: true },
  play: async ({ canvasElement }) => {
    const mark = canvasElement.querySelector(".cy-checkbox-mark") as Element;
    await expect(getComputedStyle(mark).opacity).toBe("1");
  },
};

export const CoarsePointerRow: Story = {
  tags: ["touch", "!dev"],
  play: async ({ canvasElement, canvas, args, userEvent }) => {
    const row = canvasElement.querySelector(".cy-choice") as HTMLElement;
    await expect(row.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    await userEvent.pointer({ keys: "[TouchA]", target: canvas.getByText("Email me updates") });
    await expect(args.onChange).toHaveBeenCalledWith(true);
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    const box = computeUnderHostileHost(canvasElement, ".cy-checkbox", [
      "width",
      "height",
      "border-radius",
      "background-color",
    ]);
    await expect(box.hostile).toEqual(box.clean);
    const label = computeUnderHostileHost(canvasElement, ".cy-choice-label", [
      "font-size",
      "font-weight",
      "color",
    ]);
    await expect(label.hostile).toEqual(label.clean);
  },
};
