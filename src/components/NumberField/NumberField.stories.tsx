import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { Button } from "../Button/Button.js";
import { Stack } from "../Stack/Stack.js";
import { NumberField } from "./NumberField.js";

const meta = {
  title: "Components/NumberField",
  component: NumberField,
  args: { label: "Seats", defaultValue: 5, min: 1, max: 20, step: 1, onChange: fn(), locale: "en-US" },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    variant: { control: "inline-radio", options: ["outline", "soft"] },
    hideSteppers: { control: "boolean" },
  },
  decorators: [(Story) => <div style={{ maxWidth: 280 }}>{Story()}</div>],
} satisfies Meta<typeof NumberField>;
export default meta;
type Story = StoryObj<typeof meta>;

export const SpinButtonWithItsValue: Story = {
  tags: ["visual"],
  play: async ({ canvas }) => {
    const input = canvas.getByRole("spinbutton", { name: "Seats" });
    await expect(input).toHaveValue("5");
    await expect(input).toHaveAttribute("aria-valuenow", "5");
    await expect(input).toHaveAttribute("aria-valuemin", "1");
    await expect(input).toHaveAttribute("aria-valuemax", "20");
    await expect(input).toHaveAttribute("inputmode", "numeric");
  },
};

export const KeyboardSteps: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole("spinbutton", { name: "Seats" });
    input.focus();
    await userEvent.keyboard("{ArrowUp}");
    await expect(input).toHaveValue("6");
    await expect(args.onChange).toHaveBeenLastCalledWith(6);
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    await expect(input).toHaveValue("4");
    await userEvent.keyboard("{PageUp}");
    await expect(input).toHaveValue("14");
    await userEvent.keyboard("{PageUp}");
    // Never past max.
    await expect(input).toHaveValue("20");
    await userEvent.keyboard("{Home}");
    await expect(input).toHaveValue("1");
    await userEvent.keyboard("{ArrowDown}");
    await expect(input).toHaveValue("1");
    await userEvent.keyboard("{End}");
    await expect(input).toHaveAttribute("aria-valuenow", "20");
  },
};

export const SteppersWithThePointer: Story = {
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("spinbutton", { name: "Seats" });
    const plusButton = canvas.getByRole("button", { name: "Increase" });
    const minusButton = canvas.getByRole("button", { name: "Decrease" });
    await userEvent.click(plusButton);
    await expect(input).toHaveValue("6");
    // Focus goes to the input, so the keyboard carries on from there.
    await expect(input).toHaveFocus();
    await userEvent.click(minusButton);
    await expect(input).toHaveValue("5");
    // The steppers are not tab stops (APG spinbutton): Tab leaves the field.
    await expect(plusButton).toHaveAttribute("tabindex", "-1");
    // Hit areas are at least 24px.
    const hit = getComputedStyle(plusButton, "::before");
    await expect(Number.parseFloat(hit.height)).toBeGreaterThanOrEqual(24);
  },
};

export const SteppersStopAtTheLimits: Story = {
  args: { defaultValue: 20 },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Increase" })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "Decrease" })).toBeEnabled();
  },
};

export const TypingInYourOwnFormat: Story = {
  args: { label: "Amount", locale: "de-DE", min: undefined, max: undefined, step: 0.5, defaultValue: 1234.5 },
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole("spinbutton", { name: "Amount" });
    // German: dot groups, comma decimals.
    await expect(input).toHaveValue("1.234,5");
    await userEvent.clear(input);
    await userEvent.type(input, "2.500,25");
    // Nothing is committed while typing…
    await expect(args.onChange).not.toHaveBeenCalled();
    await userEvent.tab();
    // …but on leaving the field it is read, kept and written back in the same format.
    await expect(args.onChange).toHaveBeenLastCalledWith(2500.25);
    await expect(input).toHaveValue("2.500,25");
    // Unreadable text goes back to the last good value.
    await userEvent.clear(input);
    await userEvent.type(input, "abc{Enter}");
    await expect(input).toHaveValue("2.500,25");
    // Empty means no value.
    await userEvent.clear(input);
    await userEvent.keyboard("{Enter}");
    await expect(args.onChange).toHaveBeenLastCalledWith(null);
    await expect(input).not.toHaveAttribute("aria-valuenow");
  },
};

export const TypedValuesAreClamped: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole("spinbutton", { name: "Seats" });
    await userEvent.clear(input);
    await userEvent.type(input, "99{Enter}");
    await expect(args.onChange).toHaveBeenLastCalledWith(20);
    await expect(input).toHaveValue("20");
    // Typing then stepping continues from what was typed.
    await userEvent.clear(input);
    await userEvent.type(input, "7");
    await userEvent.keyboard("{ArrowUp}");
    await expect(input).toHaveValue("8");
  },
};

export const DecimalStepsStayExact: Story = {
  args: { label: "Opacity", min: 0, max: 1, step: 0.1, defaultValue: 0.1 },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("spinbutton", { name: "Opacity" });
    await expect(input).toHaveAttribute("inputmode", "decimal");
    input.focus();
    await userEvent.keyboard("{ArrowUp}{ArrowUp}");
    // 0.1 + 0.1 + 0.1 is 0.3 here, not 0.30000000000000004.
    await expect(input).toHaveValue("0.3");
    await expect(input).toHaveAttribute("aria-valuenow", "0.3");
  },
};

export const CurrencyAndPercent: Story = {
  render: () => (
    <Stack gap="6">
      <NumberField
        label="Price"
        locale="en-US"
        defaultValue={1234.5}
        formatOptions={{ style: "currency", currency: "EUR" }}
        step={0.01}
      />
      <NumberField
        label="Discount"
        locale="en-US"
        defaultValue={0.15}
        min={0}
        max={1}
        step={0.05}
        formatOptions={{ style: "percent" }}
      />
    </Stack>
  ),
  play: async ({ canvas, userEvent }) => {
    const price = canvas.getByRole("spinbutton", { name: "Price" });
    await expect(price).toHaveValue("€1,234.50");
    await expect(price).toHaveAttribute("aria-valuetext", "€1,234.50");
    const discount = canvas.getByRole("spinbutton", { name: "Discount" });
    await expect(discount).toHaveValue("15%");
    // A percent is typed as people say it: 20 means 20%.
    await userEvent.clear(discount);
    await userEvent.type(discount, "20{Enter}");
    await expect(discount).toHaveAttribute("aria-valuenow", "0.2");
    await expect(discount).toHaveValue("20%");
  },
};

export const ControlledValue: Story = {
  render: (args) => {
    function Controlled() {
      const [seats, setSeats] = useState<number | null>(3);
      return (
        <Stack gap="4">
          <NumberField {...args} value={seats} onChange={setSeats} />
          <Button onClick={() => setSeats(10)}>Ten seats</Button>
          <output data-testid="out">{String(seats)}</output>
        </Stack>
      );
    }
    return <Controlled />;
  },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("spinbutton", { name: "Seats" });
    await expect(input).toHaveValue("3");
    await userEvent.click(canvas.getByRole("button", { name: "Increase" }));
    await expect(canvas.getByTestId("out")).toHaveTextContent("4");
    await userEvent.click(canvas.getByRole("button", { name: "Ten seats" }));
    await expect(input).toHaveValue("10");
  },
};

export const FormsGetThePlainNumber: Story = {
  args: { name: "amount", label: "Amount", min: undefined, max: undefined, defaultValue: 1234.5, step: 0.5 },
  render: (args) => (
    <form data-testid="form">
      <Stack gap="4">
        <NumberField {...args} />
        <NumberField label="Disabled" name="off" defaultValue={2} disabled />
        <Button type="reset">Reset</Button>
      </Stack>
    </form>
  ),
  play: async ({ canvas, userEvent }) => {
    const form = canvas.getByTestId("form") as HTMLFormElement;
    // The visible text is formatted; the submitted value is the plain number. Disabled fields are not submitted.
    await expect(canvas.getByRole("spinbutton", { name: "Amount" })).toHaveValue("1,234.5");
    await expect(Object.fromEntries(new FormData(form))).toEqual({ amount: "1234.5" });
    const input = canvas.getByRole("spinbutton", { name: "Amount" });
    input.focus();
    await userEvent.keyboard("{ArrowUp}");
    await expect(new FormData(form).get("amount")).toBe("1235");
    await userEvent.click(canvas.getByRole("button", { name: "Reset" }));
    await waitFor(() => expect(input).toHaveValue("1,234.5"));
    await expect(new FormData(form).get("amount")).toBe("1234.5");
  },
};

export const RequiredAndReadOnly: Story = {
  render: () => (
    <form data-testid="form">
      <Stack gap="4">
        <NumberField label="Quantity" name="qty" required />
        <NumberField label="Total" defaultValue={42} readOnly />
      </Stack>
    </form>
  ),
  play: async ({ canvas, userEvent }) => {
    const form = canvas.getByTestId("form") as HTMLFormElement;
    // Empty and required: the form does not validate.
    await expect(form.checkValidity()).toBe(false);
    await expect(canvas.getByRole("spinbutton", { name: "Quantity" })).toBeRequired();
    // Read-only: no stepping by keyboard or buttons.
    const total = canvas.getByRole("spinbutton", { name: "Total" });
    total.focus();
    await userEvent.keyboard("{ArrowUp}");
    await expect(total).toHaveValue("42");
    for (const b of canvas.getAllByRole("button", { name: /Increase|Decrease/ }).slice(2))
      await expect(b).toBeDisabled();
  },
};

export const StartingFromEmpty: Story = {
  render: () => (
    <Stack gap="6">
      <NumberField label="Free" locale="en-US" hideSteppers />
      <NumberField label="From ten" locale="en-US" min={10} max={30} step={5} />
    </Stack>
  ),
  play: async ({ canvas, userEvent }) => {
    const free = canvas.getByRole("spinbutton", { name: "Free" });
    // hideSteppers: keyboard only.
    await expect(canvas.getAllByRole("button")).toHaveLength(2);
    free.focus();
    // Without limits, Home and End leave the caret alone and the value unchanged.
    await userEvent.keyboard("{Home}{End}");
    await expect(free).toHaveValue("");
    // Stepping an empty field starts from zero, in either direction.
    await userEvent.keyboard("{ArrowDown}");
    await expect(free).toHaveValue("0");
    await userEvent.keyboard("{ArrowUp}");
    await expect(free).toHaveValue("1");
    // Unreadable text then a step: it steps from the last good value.
    await userEvent.type(free, "x");
    await userEvent.keyboard("{ArrowUp}");
    await expect(free).toHaveValue("2");
    // With a minimum, an empty field steps up to it first, then along the grid from it.
    const ten = canvas.getByRole("spinbutton", { name: "From ten" });
    ten.focus();
    await userEvent.keyboard("{ArrowUp}");
    await expect(ten).toHaveValue("10");
    await userEvent.keyboard("{ArrowUp}");
    await expect(ten).toHaveValue("15");
    await expect(canvas.getByRole("button", { name: "Decrease" })).toBeEnabled();
  },
};

export const TouchSteppers: Story = {
  tags: ["touch", "!dev"],
  play: async ({ canvas, userEvent }) => {
    const plusButton = canvas.getByRole("button", { name: "Increase" });
    const hit = getComputedStyle(plusButton, "::before");
    await expect(Number.parseFloat(hit.height)).toBeGreaterThanOrEqual(44);
    await userEvent.pointer({ keys: "[TouchA]", target: plusButton });
    await expect(canvas.getByRole("spinbutton", { name: "Seats" })).toHaveValue("6");
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    const props = ["height", "font-size", "font-variant-numeric", "color", "padding-left", "box-sizing"];
    for (const selector of [".cy-text-field", ".cy-text-field-input", ".cy-number-field-steppers"]) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, props);
      await expect({ selector, ...hostile }).toEqual({ selector, ...clean });
    }
  },
};
