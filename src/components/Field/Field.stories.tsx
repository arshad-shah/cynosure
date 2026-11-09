import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { InputBase } from "../../foundations/InputBase/InputBase.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { Field } from "./Field.js";

const meta = {
  title: "Components/Field",
  component: Field,
  args: {
    label: "Email",
    description: "We never share it.",
    required: false,
    size: "md",
    children: (f) => <InputBase id={f.id} aria-describedby={f.describedBy} invalid={f.invalid} />,
  },
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
    error: { control: "text" },
    required: { control: "boolean" },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
} satisfies Meta<typeof Field>;
export default meta;
type Story = StoryObj<typeof meta>;

export const LabelAndDescription: Story = {
  tags: ["visual"],
  play: async ({ canvas }) => {
    const input = canvas.getByRole("textbox", { name: "Email" });
    await expect(input).toHaveAccessibleDescription("We never share it.");
  },
};

export const ErrorAnnouncesAndMarksInvalid: Story = {
  tags: ["visual"],
  args: { error: "Enter a valid email." },
  play: async ({ canvas }) => {
    const input = canvas.getByRole("textbox", { name: "Email" });
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(input).toHaveAccessibleDescription("We never share it. Enter a valid email.");
    await expect(canvas.getByRole("alert")).toHaveTextContent("Enter a valid email.");
  },
};

export const RequiredMarkerIsDrawnNotTyped: Story = {
  args: {
    required: true,
    children: (f) => <InputBase id={f.id} required aria-describedby={f.describedBy} />,
  },
  play: async ({ canvasElement, canvas }) => {
    const label = canvasElement.querySelector(".cy-field-label") as HTMLElement;
    await expect(label.textContent).toBe("Email");
    await expect(getComputedStyle(label, "::after").content).not.toBe("none");
    await expect(canvas.getByRole("textbox", { name: "Email" })).toBeRequired();
  },
};

export const GroupLabelsAGroup: Story = {
  args: { group: true, children: (f) => <div aria-describedby={f.describedBy}>options</div> },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("group", { name: "Email" })).toBeInTheDocument();
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    const { clean, hostile } = computeUnderHostileHost(canvasElement, ".cy-field-label", [
      "font-size",
      "font-weight",
      "color",
      "text-transform",
    ]);
    await expect(hostile).toEqual(clean);
  },
};
