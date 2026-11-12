import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { folder } from "../../icons/index.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { Button } from "../Button/Button.js";
import { Stack } from "../Stack/Stack.js";
import { PathField } from "./PathField.js";

/** A picker that answers like a native dialog would, after a moment: a path, or null when cancelled. */
const pickerOf = (answer: string | null, ms = 30) =>
  fn(() => new Promise<string | null>((resolve) => setTimeout(() => resolve(answer), ms)));

const meta = {
  title: "Components/PathField",
  component: PathField,
  args: {
    label: "Database file",
    placeholder: "/path/to/file.db",
    onPick: pickerOf("/home/me/data/app.db"),
    onChange: fn(),
    size: "md",
    variant: "outline",
  },
  argTypes: {
    size: { control: "inline-radio", options: ["xs", "sm", "md", "lg"] },
    variant: { control: "inline-radio", options: ["outline", "soft"] },
    label: { control: "text" },
    placeholder: { control: "text" },
    description: { control: "text" },
    error: { control: "text" },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
  },
  decorators: [(Story) => <div style={{ maxWidth: 420 }}>{Story()}</div>],
} satisfies Meta<typeof PathField>;
export default meta;
type Story = StoryObj<typeof meta>;

export const BrowseFillsThePath: Story = {
  tags: ["visual"],
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Database file" });
    const browse = canvas.getByRole("button", { name: "Browse…" });
    // The button sits inside the field, at its end.
    const field = input.closest(".cy-text-field") as HTMLElement;
    await expect(field).toContainElement(browse);
    await expect(browse.getBoundingClientRect().left).toBeGreaterThanOrEqual(
      input.getBoundingClientRect().right - 1,
    );
    // A press asks the app's picker; while it is open the button is busy and cannot be pressed again.
    await userEvent.click(browse);
    await expect(args.onPick).toHaveBeenCalledTimes(1);
    await expect(browse).toHaveAttribute("aria-busy", "true");
    await userEvent.click(browse);
    await expect(args.onPick).toHaveBeenCalledTimes(1);
    // The chosen path fills the field and is reported.
    await waitFor(() => expect(input).toHaveValue("/home/me/data/app.db"));
    await expect(args.onChange).toHaveBeenLastCalledWith("/home/me/data/app.db");
    await expect(browse).not.toHaveAttribute("aria-busy");
  },
};

export const CancellingChangesNothing: Story = {
  args: { defaultValue: "/srv/old.db", onPick: pickerOf(null) },
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Database file" });
    await userEvent.click(canvas.getByRole("button", { name: "Browse…" }));
    await waitFor(() =>
      expect(canvas.getByRole("button", { name: "Browse…" })).not.toHaveAttribute("aria-busy"),
    );
    await expect(input).toHaveValue("/srv/old.db");
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const TypeClearAndKeyboard: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Database file" });
    // A path can be typed too.
    await userEvent.click(input);
    await userEvent.keyboard("/tmp/x.db");
    await expect(args.onChange).toHaveBeenLastCalledWith("/tmp/x.db");
    // Tab order: the input, the clear button, then Browse; Enter on Browse picks.
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Clear" })).toHaveFocus();
    await userEvent.tab();
    const browse = canvas.getByRole("button", { name: "Browse…" });
    await expect(browse).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(input).toHaveValue("/home/me/data/app.db"));
    // The clear button empties the field and puts focus in it.
    await userEvent.click(canvas.getByRole("button", { name: "Clear" }));
    await expect(input).toHaveValue("");
    await expect(args.onChange).toHaveBeenLastCalledWith("");
    await expect(input).toHaveFocus();
    await expect(canvas.queryByRole("button", { name: "Clear" })).toBeNull();
  },
};

export const ControlledValue: Story = {
  render: (args) => {
    function Controlled() {
      const [path, setPath] = useState("/etc/app.conf");
      return (
        <Stack gap="4">
          <PathField {...args} value={path} onChange={setPath} />
          <Button onClick={() => setPath("/var/app.conf")}>Use the default</Button>
          <output data-testid="path">{path}</output>
        </Stack>
      );
    }
    return <Controlled />;
  },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Database file" });
    await expect(input).toHaveValue("/etc/app.conf");
    await userEvent.click(canvas.getByRole("button", { name: "Use the default" }));
    await expect(input).toHaveValue("/var/app.conf");
    await userEvent.click(canvas.getByRole("button", { name: "Browse…" }));
    await waitFor(() => expect(canvas.getByTestId("path")).toHaveTextContent("/home/me/data/app.db"));
    await expect(input).toHaveValue("/home/me/data/app.db");
  },
};

export const InAForm: Story = {
  args: { name: "db", defaultValue: "/srv/a.db", required: true },
  render: (args) => (
    <form data-testid="form">
      <PathField {...args} />
    </form>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    const form = canvasElement.querySelector("form") as HTMLFormElement;
    await expect(new FormData(form).get("db")).toBe("/srv/a.db");
    await userEvent.click(canvas.getByRole("button", { name: "Browse…" }));
    await waitFor(() => expect(new FormData(form).get("db")).toBe("/home/me/data/app.db"));
    // Required: an empty path blocks the form.
    await userEvent.click(canvas.getByRole("button", { name: "Clear" }));
    await expect(form.checkValidity()).toBe(false);
    // Browse never submits the form.
    await expect(canvas.getByRole("button", { name: "Browse…" })).toHaveAttribute("type", "button");
  },
};

export const DisabledAndLabels: Story = {
  render: (args) => (
    <Stack gap="4">
      <PathField {...args} disabled defaultValue="/srv/a.db" />
      <PathField
        {...args}
        label="Ordner"
        iconStart={folder}
        defaultValue="/srv"
        labels={{ browse: "Durchsuchen", clear: "Leeren" }}
      />
    </Stack>
  ),
  play: async ({ args, canvas, userEvent }) => {
    // Disabled: neither the button nor the clear button can be used.
    const [browse] = canvas.getAllByRole("button", { name: "Browse…" });
    await expect(browse).toBeDisabled();
    await expect(canvas.queryByRole("button", { name: "Clear" })).toBeNull();
    // The built-in text is replaceable; an icon can lead the field.
    await expect(canvas.getByRole("button", { name: "Durchsuchen" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Leeren" })).toBeVisible();
    const field = canvas.getByRole("textbox", { name: "Ordner" }).closest(".cy-text-field") as HTMLElement;
    await expect(field.querySelector("svg")).not.toBeNull();
    await userEvent.click(canvas.getByRole("button", { name: "Durchsuchen" }));
    await expect(args.onPick).toHaveBeenCalledTimes(1);
  },
};

export const SizesFitTheButton: Story = {
  render: (args) => (
    <Stack gap="4">
      {(["xs", "sm", "md", "lg"] as const).map((size) => (
        <PathField key={size} {...args} label={size} size={size} defaultValue="/srv/a.db" />
      ))}
    </Stack>
  ),
  play: async ({ canvas }) => {
    // At every size the Browse button fits inside the field's height.
    let last = 0;
    for (const size of ["xs", "sm", "md", "lg"]) {
      const field = canvas.getByRole("textbox", { name: size }).closest(".cy-text-field") as HTMLElement;
      const browse = field.querySelector(".cy-path-field-browse") as HTMLElement;
      const outer = field.getBoundingClientRect();
      const inner = browse.getBoundingClientRect();
      await expect(inner.top).toBeGreaterThanOrEqual(outer.top);
      await expect(inner.bottom).toBeLessThanOrEqual(outer.bottom);
      await expect(inner.right).toBeLessThanOrEqual(outer.right);
      // Larger fields have larger (or equal) buttons.
      await expect(inner.height).toBeGreaterThanOrEqual(last);
      last = inner.height;
    }
  },
};

export const RightToLeft: Story = {
  args: { defaultValue: "/srv/a.db" },
  render: (args) => (
    <div dir="rtl">
      <PathField {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    // The button ends the field: on the left in right-to-left text.
    const input = canvas.getByRole("textbox", { name: "Database file" });
    const browse = canvas.getByRole("button", { name: "Browse…" });
    await expect(browse.getBoundingClientRect().right).toBeLessThanOrEqual(
      input.getBoundingClientRect().left + 1,
    );
  },
};

export const TouchBrowse: Story = {
  tags: ["touch", "!dev"],
  play: async ({ args, canvas, userEvent }) => {
    const browse = canvas.getByRole("button", { name: "Browse…" });
    await expect(Number.parseFloat(getComputedStyle(browse, "::before").height)).toBeGreaterThanOrEqual(44);
    await userEvent.pointer({ keys: "[TouchA]", target: browse });
    await expect(args.onPick).toHaveBeenCalled();
  },
};

export const StableUnderHostileHost: Story = {
  args: { defaultValue: "/srv/a.db" },
  play: async ({ canvasElement }) => {
    for (const selector of [".cy-path-field", ".cy-path-field-browse"]) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, [
        "display",
        "font-size",
        "height",
        "margin-right",
        "box-sizing",
      ]);
      await expect({ selector, ...hostile }).toEqual({ selector, ...clean });
    }
  },
};

export const DefaultsSoftAndClassName: Story = {
  render: () => (
    <Stack gap="4">
      <PathField label="Plain" onPick={pickerOf(null)} className="host-path" />
      <PathField label="Soft" onPick={pickerOf(null)} variant="soft" />
    </Stack>
  ),
  play: async ({ canvas }) => {
    // Without size or variant: a medium outline field; className lands on the root, for layout.
    const plain = canvas.getByRole("textbox", { name: "Plain" });
    await expect(plain.closest(".cy-path-field")).toHaveClass("host-path");
    const field = plain.closest(".cy-text-field") as HTMLElement;
    await expect(field).toHaveAttribute("data-size", "md");
    await expect(field).toHaveAttribute("data-variant", "outline");
    const soft = canvas.getByRole("textbox", { name: "Soft" }).closest(".cy-text-field") as HTMLElement;
    await expect(soft).toHaveAttribute("data-variant", "soft");
    await expect(plain).toHaveValue("");
  },
};
