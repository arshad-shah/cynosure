import type { Meta, StoryObj } from "@storybook/react-vite";
import { type CSSProperties, useState } from "react";
import { expect, fn } from "storybook/test";
import { mail, search } from "../../icons/index.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { TextField } from "./TextField.js";

const meta = {
  title: "Components/TextField",
  component: TextField,
  args: { label: "Email", placeholder: "you@example.com", onChange: fn(), size: "md", variant: "outline" },
  argTypes: {
    size: { control: "inline-radio", options: ["xs", "sm", "md", "lg"] },
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

const shellOf = (input: HTMLElement) => input.closest(".cy-text-field") as HTMLElement;

export const ExtraSmallForDenseChrome: Story = {
  args: { size: "xs", label: "Filter", iconStart: search, clearable: true, defaultValue: "orders" },
  render: (args) => (
    <div style={{ display: "grid", gap: 16, maxWidth: 280 }}>
      <TextField {...args} />
      <TextField {...args} size="sm" label="Small" />
      <TextField size="xs" label="Token" type="password" revealable defaultValue="sk-123" />
    </div>
  ),
  play: async ({ canvas, args, userEvent }) => {
    const xs = canvas.getByRole("textbox", { name: "Filter" });
    const sm = canvas.getByRole("textbox", { name: "Small" });
    const shell = shellOf(xs).getBoundingClientRect();
    // A 20px field with smaller text and icon than sm's.
    await expect(shell.height).toBe(20);
    const size = (el: Element) => Number.parseFloat(getComputedStyle(el).fontSize);
    await expect(size(xs)).toBeLessThan(size(sm));
    await expect(size(xs)).toBeGreaterThanOrEqual(11);
    const icon = (el: HTMLElement) =>
      (shellOf(el).querySelector(".cy-icon") as Element).getBoundingClientRect();
    await expect(icon(xs).height).toBeLessThan(icon(sm).height);
    // The clear button is the dense size too: it fits the field instead of standing out of it.
    const clear = canvas.getAllByRole("button", { name: "Clear" })[0] as HTMLElement;
    await expect(clear.getBoundingClientRect().height).toBeLessThanOrEqual(shell.height);
    // The input itself is still at least 24px tall to press, reaching invisibly past the field's edge.
    await expect(xs.getBoundingClientRect().height).toBeGreaterThanOrEqual(24);
    await expect(document.elementFromPoint(shell.left + shell.width / 2, shell.top - 1)).toBe(xs);
    // Typing and clearing work as at any size.
    xs.focus();
    await userEvent.clear(xs);
    await userEvent.type(xs, "users");
    await expect(args.onChange).toHaveBeenLastCalledWith("users");
    await userEvent.click(canvas.getAllByRole("button", { name: "Clear" })[0] as HTMLElement);
    await expect(xs).toHaveValue("");
    await expect(xs).toHaveFocus();
    // The reveal button of a dense secret field fits it too, and still works.
    const token = canvas.getByLabelText("Token");
    const show = canvas.getByRole("button", { name: "Show" });
    await expect(show.getBoundingClientRect().height).toBeLessThanOrEqual(
      shellOf(token).getBoundingClientRect().height,
    );
    await userEvent.click(show);
    await expect(token).toHaveAttribute("type", "text");
  },
};

export const ExtraSmallCoarsePointer: Story = {
  tags: ["touch", "!dev"],
  args: { size: "xs" },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Email" });
    // The field stays dense; the input reaches 44px invisibly, so a finger finds it.
    await expect(shellOf(input).getBoundingClientRect().height).toBe(20);
    await expect(input.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    await userEvent.pointer({ keys: "[TouchA]", target: input });
    await expect(input).toHaveFocus();
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

export const AddonsAndNumericDigits: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16, maxWidth: 320 }}>
      <TextField label="Plain" defaultValue="1111" clearable />
      <TextField
        label="With a start addon"
        defaultValue="1111"
        addonStart={<span data-testid="addon">#</span>}
        style={{ "--cy-text-field-numeric": "tabular-nums" } as CSSProperties}
      />
    </div>
  ),
  play: async ({ canvas }) => {
    const plain = canvas.getByRole("textbox", { name: "Plain" });
    const tuned = canvas.getByRole("textbox", { name: "With a start addon" });
    const shell = (input: HTMLElement) => input.closest(".cy-text-field") as HTMLElement;
    // The addon sits inside the field, before the input.
    const addon = canvas.getByTestId("addon");
    await expect(shell(tuned)).toContainElement(addon);
    await expect(addon.compareDocumentPosition(tuned) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    // --cy-text-field-numeric sets the digits' style; the default leaves them proportional.
    await expect(getComputedStyle(tuned).fontVariantNumeric).toBe("tabular-nums");
    await expect(getComputedStyle(plain).fontVariantNumeric).toBe("normal");
    // The clear button sits nearer the edge than the field's padding.
    const clear = canvas.getByRole("button", { name: "Clear" });
    await expect(Number.parseFloat(getComputedStyle(clear).marginInlineEnd)).toBeLessThan(0);
  },
};

export const SplitSettingsRow: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: 12, inlineSize: 560 }}>
      <TextField {...args} label="Font" description="Used in the editor." layout="split" width="md" />
      <TextField {...args} label="A longer label for the size" layout="split" width="md" />
      <div style={{ inlineSize: 240 }}>
        <TextField {...args} label="Narrow" description="Moves under." layout="split" width="md" />
      </div>
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    const font = canvas.getByRole("textbox", { name: "Font" });
    const size = canvas.getByRole("textbox", { name: "A longer label for the size" });
    await expect(font).toHaveAccessibleDescription("Used in the editor.");
    // The fields' boxes line up at the row's end, whatever the label.
    const box = (el: Element) => (el.closest(".cy-text-field") as Element).getBoundingClientRect();
    await expect(box(font).left).toBe(box(size).left);
    await expect(box(font).width).toBe(box(size).width);
    await expect(box(font).left).toBeGreaterThan(canvas.getByText("Font").getBoundingClientRect().right);
    // Narrow: under its text, inside the field.
    const narrow = canvas.getByRole("textbox", { name: "Narrow" });
    await expect(box(narrow).top).toBeGreaterThanOrEqual(
      canvas.getByText("Moves under.").getBoundingClientRect().bottom,
    );
    await expect(box(narrow).width).toBeLessThanOrEqual(240);
    // Pressing the label focuses the input, and typing works as ever.
    await userEvent.click(canvas.getByText("Font"));
    await expect(font).toHaveFocus();
    await userEvent.keyboard("Inter");
    await expect(font).toHaveValue("Inter");
  },
};
