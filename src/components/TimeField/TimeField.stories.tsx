import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { TimeField } from "./TimeField.js";

const meta = {
  title: "Components/TimeField",
  component: TimeField,
  args: { label: "Start time", onChange: fn() },
  argTypes: { size: { control: "inline-radio", options: ["sm", "md", "lg"] } },
  decorators: [(Story) => <div style={{ maxInlineSize: 240 }}>{Story()}</div>],
} satisfies Meta<typeof TimeField>;
export default meta;
type Story = StoryObj<typeof meta>;

export const TypeATime: Story = {
  tags: ["visual"],
  play: async ({ args, canvas, userEvent }) => {
    const field = canvas.getByRole("textbox", { name: "Start time" });
    await expect(field).toHaveAttribute("placeholder", "HH:MM");
    // Read loosely when typing is finished, reported in 24-hour HH:MM.
    for (const [typed, read] of [
      ["930", "09:30"],
      ["9", "09:00"],
      ["21:5", null],
      ["9:30 pm", "21:30"],
      ["12am", "00:00"],
      ["1745", "17:45"],
    ] as const) {
      await userEvent.clear(field);
      await userEvent.type(field, typed);
      await userEvent.tab();
      if (read) {
        await expect(args.onChange).toHaveBeenLastCalledWith(read);
        await expect(field).toHaveValue(read);
      } else await expect(field).toHaveAccessibleDescription("Enter a time as HH:MM");
    }
    await userEvent.clear(field);
    await userEvent.type(field, "{Enter}");
    await expect(args.onChange).toHaveBeenLastCalledWith(null);
  },
};

export const ExplainsWhatItCannotTake: Story = {
  args: { min: "09:00", max: "17:30" },
  play: async ({ args, canvas, userEvent }) => {
    const field = canvas.getByRole("textbox", { name: "Start time" });
    for (const typed of ["25:00", "9:75", "13 pm", "noon"]) {
      await userEvent.clear(field);
      await userEvent.type(field, `${typed}{Enter}`);
      await expect(field).toHaveAccessibleDescription("Enter a time as HH:MM");
      await expect(field).toHaveAttribute("aria-invalid", "true");
    }
    await userEvent.clear(field);
    await userEvent.type(field, "18:00{Enter}");
    await expect(field).toHaveAccessibleDescription("This time is not available");
    await expect(args.onChange).not.toHaveBeenCalled();
    await userEvent.clear(field);
    await userEvent.type(field, "17:30{Enter}");
    await expect(args.onChange).toHaveBeenLastCalledWith("17:30");
    await expect(field).not.toHaveAttribute("aria-invalid", "true");
  },
};

export const ArrowsStepThePartUnderTheCaret: Story = {
  args: { defaultValue: "09:30", step: 15 },
  play: async ({ args, canvas, userEvent }) => {
    const field = canvas.getByRole("textbox", { name: "Start time" }) as HTMLInputElement;
    field.focus();
    // In the hours.
    field.setSelectionRange(1, 1);
    await userEvent.keyboard("{ArrowUp}");
    await expect(args.onChange).toHaveBeenLastCalledWith("10:30");
    // In the minutes: by `step`; Shift by ten steps; across midnight it wraps.
    field.setSelectionRange(4, 4);
    await userEvent.keyboard("{ArrowDown}");
    await expect(args.onChange).toHaveBeenLastCalledWith("10:15");
    await userEvent.keyboard("{Shift>}{ArrowUp}{/Shift}");
    await expect(args.onChange).toHaveBeenLastCalledWith("12:45");
    field.setSelectionRange(0, 0);
    await userEvent.keyboard("{Shift>}{ArrowUp}{ArrowUp}{/Shift}");
    await expect(args.onChange).toHaveBeenLastCalledWith("08:45");
    // Nothing to step from: the arrows do nothing.
    await userEvent.clear(field);
    await userEvent.type(field, "later{ArrowUp}");
    await expect(field).toHaveValue("later");
  },
};

export const LimitsStopTheArrows: Story = {
  args: { defaultValue: "17:00", min: "09:00", max: "17:30" },
  play: async ({ args, canvas, userEvent }) => {
    const field = canvas.getByRole("textbox", { name: "Start time" }) as HTMLInputElement;
    field.focus();
    field.setSelectionRange(0, 0);
    await userEvent.keyboard("{ArrowUp}");
    await expect(args.onChange).toHaveBeenLastCalledWith("17:30");
    await userEvent.keyboard("{Shift>}{ArrowDown}{/Shift}");
    await expect(args.onChange).toHaveBeenLastCalledWith("09:00");
  },
};

export const WithSeconds: Story = {
  args: { seconds: true, defaultValue: "08:00:00" },
  play: async ({ args, canvas, userEvent }) => {
    const field = canvas.getByRole("textbox", { name: "Start time" }) as HTMLInputElement;
    await expect(field).toHaveAttribute("placeholder", "HH:MM:SS");
    field.focus();
    field.setSelectionRange(7, 7);
    await userEvent.keyboard("{ArrowDown}");
    await expect(args.onChange).toHaveBeenLastCalledWith("07:59:59");
    await userEvent.clear(field);
    await userEvent.type(field, "211530{Enter}");
    await expect(args.onChange).toHaveBeenLastCalledWith("21:15:30");
    await userEvent.clear(field);
    await userEvent.type(field, "x{Enter}");
    await expect(field).toHaveAccessibleDescription("Enter a time as HH:MM:SS");
  },
};

export const FormsReadOnlyAndLabels: Story = {
  render: (args) => (
    <form data-testid="form">
      <TimeField {...args} name="start" defaultValue="09:15" />
      <TimeField label="Ends" readOnly defaultValue="10:00" />
      <TimeField label="Heure" labels={{ invalid: "Heure au format HH:MM" }} />
    </form>
  ),
  play: async ({ canvas, userEvent }) => {
    await expect(new FormData(canvas.getByTestId("form") as HTMLFormElement).get("start")).toBe("09:15");
    // Read-only: the arrows do not change it.
    const ends = canvas.getByRole("textbox", { name: "Ends" });
    ends.focus();
    await userEvent.keyboard("{ArrowUp}");
    await expect(ends).toHaveValue("10:00");
    const heure = canvas.getByRole("textbox", { name: "Heure" });
    await userEvent.type(heure, "midi{Enter}");
    await expect(heure).toHaveAccessibleDescription("Heure au format HH:MM");
  },
};

export const HiddenLabelDescriptionAndOwnError: Story = {
  args: {
    labelHidden: true,
    description: "Shown under the field",
    error: "Your own message",
    className: "mine",
    style: { maxInlineSize: 200 },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const field = canvas.getByRole("textbox", { name: "Start time" });
    // The label still names it; your error replaces the field's own, even after a mistake.
    await expect(
      (canvasElement.querySelector("label") as HTMLElement).getBoundingClientRect().width,
    ).toBeLessThanOrEqual(1);
    await expect(field).toHaveAccessibleDescription(/Your own message/);
    await userEvent.type(field, "nonsense{Enter}");
    await expect(field).toHaveAccessibleDescription(/Your own message/);
    await expect(field).not.toHaveAccessibleDescription(/Enter a/);
    await expect(canvasElement.querySelector(".mine")).not.toBeNull();
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    const { clean, hostile } = computeUnderHostileHost(canvasElement, ".cy-text-field-input", [
      "height",
      "font-size",
      "font-variant-numeric",
    ]);
    await expect(hostile).toEqual(clean);
  },
};
