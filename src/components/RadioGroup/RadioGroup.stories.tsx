import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { RadioGroup } from "./RadioGroup.js";

const options = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly", description: "Every Monday" },
  { value: "never", label: "Never", disabled: true },
  { value: "monthly", label: "Monthly" },
];

const meta = {
  title: "Components/RadioGroup",
  component: RadioGroup,
  args: {
    label: "Digest",
    name: "digest",
    options,
    onChange: fn(),
    size: "md",
    tone: "accent",
    orientation: "vertical",
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    tone: { control: "select", options: ["accent", "neutral", "danger", "success", "warning", "info"] },
    orientation: { control: "inline-radio", options: ["vertical", "horizontal"] },
    label: { control: "text" },
    description: { control: "text" },
    error: { control: "text" },
    required: { control: "boolean" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof RadioGroup>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ArrowKeysSelectAndWrapSkippingDisabled: Story = {
  tags: ["visual"],
  args: { defaultValue: "weekly" },
  play: async ({ canvas, args, userEvent }) => {
    await expect(canvas.getByRole("group", { name: "Digest" })).toBeInTheDocument();
    await userEvent.tab();
    await expect(canvas.getByRole("radio", { name: "Weekly" })).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(canvas.getByRole("radio", { name: "Monthly" })).toBeChecked();
    await userEvent.keyboard("{ArrowDown}");
    await expect(canvas.getByRole("radio", { name: "Daily" })).toBeChecked();
    await expect(args.onChange).toHaveBeenLastCalledWith("daily");
    await expect(canvas.getByRole("radio", { name: "Weekly" })).toHaveAccessibleDescription("Every Monday");
  },
};

export const FormResetAndRequired: Story = {
  render: (args) => (
    <form data-testid="form">
      <RadioGroup {...args} required defaultValue={undefined} />
    </form>
  ),
  play: async ({ canvas, userEvent }) => {
    const form = canvas.getByTestId("form") as HTMLFormElement;
    await expect(form.checkValidity()).toBe(false);
    await userEvent.click(canvas.getByText("Monthly"));
    await expect(new FormData(form).get("digest")).toBe("monthly");
    form.reset();
    await expect(new FormData(form).get("digest")).toBeNull();
  },
};

function Controlled() {
  const [value, setValue] = useState("daily");
  return (
    <div>
      <RadioGroup label="Digest" name="c" options={options} value={value} onChange={setValue} />
      <output data-testid="out">{value}</output>
    </div>
  );
}

export const ControlledValue: Story = {
  render: () => <Controlled />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByText("Weekly"));
    await expect(canvas.getByTestId("out")).toHaveTextContent("weekly");
    await expect(canvas.getByRole("radio", { name: "Weekly" })).toBeChecked();
  },
};

export const CoarsePointerRows: Story = {
  tags: ["touch", "!dev"],
  play: async ({ canvasElement }) => {
    for (const row of canvasElement.querySelectorAll(".cy-choice"))
      await expect(row.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    const { clean, hostile } = computeUnderHostileHost(canvasElement, ".cy-radio", [
      "width",
      "height",
      "border-radius",
      "background-color",
    ]);
    await expect(hostile).toEqual(clean);
  },
};
