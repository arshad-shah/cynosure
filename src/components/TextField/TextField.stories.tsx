import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn } from "storybook/test";
import { mail, search } from "../../icons/index.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { TextField } from "./TextField.js";

const meta = {
  title: "Components/TextField",
  component: TextField,
  args: { label: "Email", placeholder: "you@example.com", onChange: fn(), size: "md", variant: "outline" },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    variant: { control: "inline-radio", options: ["outline", "soft"] },
    type: { control: "select", options: ["text", "email", "url", "tel", "password", "number"] },
    label: { control: "text" },
    description: { control: "text" },
    error: { control: "text" },
    placeholder: { control: "text" },
    clearable: { control: "boolean" },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
    required: { control: "boolean" },
  },
} satisfies Meta<typeof TextField>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Uncontrolled: Story = {
  tags: ["visual"],
  args: { description: "We never share it.", iconStart: mail },
  play: async ({ canvas, args, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Email" });
    await userEvent.type(input, "ada@lovelace.dev");
    await expect(input).toHaveValue("ada@lovelace.dev");
    await expect(args.onChange).toHaveBeenLastCalledWith("ada@lovelace.dev");
  },
};

function ControlledField() {
  const [value, setValue] = useState("start");
  return (
    <div>
      <TextField label="Name" value={value} onChange={(v) => setValue(v.toUpperCase())} />
      <span data-testid="mirror">{value}</span>
    </div>
  );
}

export const Controlled: Story = {
  render: () => <ControlledField />,
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Name" });
    await userEvent.clear(input);
    await userEvent.type(input, "ada");
    await expect(input).toHaveValue("ADA");
    await expect(canvas.getByTestId("mirror")).toHaveTextContent("ADA");
  },
};

export const ClearButton: Story = {
  args: { clearable: true, defaultValue: "draft", labels: { clear: "Empty field" } },
  play: async ({ canvas, args, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Email" });
    await userEvent.click(canvas.getByRole("button", { name: "Empty field" }));
    await expect(input).toHaveValue("");
    await expect(input).toHaveFocus();
    await expect(args.onChange).toHaveBeenLastCalledWith("");
    await expect(canvas.queryByRole("button", { name: "Empty field" })).toBeNull();
  },
};

export const FormResetAndRequired: Story = {
  render: () => (
    <form data-testid="form">
      <TextField label="Title" name="title" defaultValue="Draft" required clearable />
    </form>
  ),
  play: async ({ canvas, userEvent }) => {
    const form = canvas.getByTestId("form") as HTMLFormElement;
    const input = canvas.getByRole("textbox", { name: "Title" });
    await userEvent.clear(input);
    await expect(form.checkValidity()).toBe(false);
    await userEvent.type(input, "Final");
    await expect(new FormData(form).get("title")).toBe("Final");
    form.reset();
    await expect(input).toHaveValue("Draft");
    await expect(canvas.getByRole("button", { name: "Clear" })).toBeVisible();
  },
};

export const ErrorAndDisabled: Story = {
  tags: ["visual"],
  render: () => (
    <div style={{ display: "grid", gap: 16, maxWidth: 320 }}>
      <TextField label="Email" defaultValue="nope" error="Enter a valid email." />
      <TextField label="Locked" defaultValue="read only" disabled />
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByRole("textbox", { name: "Email" })).toHaveAttribute("aria-invalid", "true");
    const locked = canvas.getByRole("textbox", { name: "Locked" });
    await userEvent.type(locked, "x");
    await expect(locked).toHaveValue("read only");
  },
};

export const TouchFocusesInput: Story = {
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Email" });
    await userEvent.pointer({ keys: "[TouchA]", target: input });
    await expect(input).toHaveFocus();
  },
};

export const RightToLeft: Story = {
  args: { iconStart: search, label: "بحث" },
  render: (args) => (
    <div dir="rtl" style={{ maxWidth: 320 }}>
      <TextField {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const icon = canvasElement.querySelector(".cy-text-field .cy-icon") as Element;
    const input = canvasElement.querySelector("input") as Element;
    await expect(icon.getBoundingClientRect().left).toBeGreaterThan(input.getBoundingClientRect().left);
  },
};

export const RevealASecret: Story = {
  args: { label: "API key", type: "password", revealable: true, defaultValue: "sk-123" },
  play: async ({ canvas, userEvent }) => {
    const field = canvas.getByLabelText("API key");
    await expect(field).toHaveAttribute("type", "password");
    const show = canvas.getByRole("button", { name: "Show" });
    await expect(show).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(show);
    await expect(field).toHaveAttribute("type", "text");
    await expect(canvas.getByRole("button", { name: "Hide" })).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(canvas.getByRole("button", { name: "Hide" }));
    await expect(field).toHaveAttribute("type", "password");
    await expect(field).toHaveValue("sk-123");
  },
};

export const StableUnderHostileHost: Story = {
  args: { iconStart: mail },
  play: async ({ canvasElement }) => {
    const shell = computeUnderHostileHost(canvasElement, ".cy-text-field", [
      "height",
      "border-top-width",
      "border-radius",
      "background-color",
    ]);
    await expect(shell.hostile).toEqual(shell.clean);
    const input = computeUnderHostileHost(canvasElement, ".cy-text-field-input", [
      "font-size",
      "color",
      "padding-top",
      "background-color",
    ]);
    await expect(input.hostile).toEqual(input.clean);
  },
};

export const HiddenLabelStillNamesTheControl: Story = {
  args: { label: "Email", labelHidden: true, description: undefined },
  play: async ({ canvas, canvasElement }) => {
    const input = canvas.getByRole("textbox", { name: "Email" });
    const field = canvasElement.querySelector(".cy-field") as HTMLElement;
    const label = canvasElement.querySelector(".cy-field-label") as HTMLElement;
    await expect(label.getBoundingClientRect().height).toBeLessThanOrEqual(1);
    const control = input.closest(".cy-text-field") as HTMLElement;
    await expect(
      Math.abs(control.getBoundingClientRect().top - field.getBoundingClientRect().top),
    ).toBeLessThan(1);
  },
};
