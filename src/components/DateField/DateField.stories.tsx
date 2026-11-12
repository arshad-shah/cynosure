import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { expect, fn, waitFor } from "storybook/test";
import { createStyleSheet } from "../../styles/inline.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { DateField } from "./DateField.js";

const meta = {
  title: "Components/DateField",
  component: DateField,
  args: { label: "Due date", today: "2026-11-10", weekStartsOn: 1, locale: "en-GB", onChange: fn() },
  argTypes: { size: { control: "inline-radio", options: ["sm", "md", "lg"] } },
  decorators: [(Story) => <div style={{ maxInlineSize: 320 }}>{Story()}</div>],
} satisfies Meta<typeof DateField>;
export default meta;
type Story = StoryObj<typeof meta>;

const focusedDate = () => (document.activeElement as HTMLElement | null)?.dataset.date;

export const TypeADate: Story = {
  tags: ["visual"],
  play: async ({ args, canvas, userEvent }) => {
    const field = canvas.getByRole("textbox", { name: "Due date" });
    await expect(field).toHaveAttribute("placeholder", "YYYY-MM-DD");
    await expect(field).toHaveAttribute("inputmode", "numeric");
    // Loose separators and single digits are read as a date when typing is finished.
    await userEvent.type(field, "2026/1/5");
    await expect(args.onChange).not.toHaveBeenCalled();
    await userEvent.tab();
    await expect(args.onChange).toHaveBeenLastCalledWith("2026-01-05");
    await expect(field).toHaveValue("2026-01-05");
    // Enter finishes too; clearing the field reports no date.
    await userEvent.clear(field);
    await userEvent.type(field, "2026-12-24{Enter}");
    await expect(args.onChange).toHaveBeenLastCalledWith("2026-12-24");
    await userEvent.clear(field);
    await userEvent.tab();
    await expect(args.onChange).toHaveBeenLastCalledWith(null);
  },
};

export const ExplainsWhatItCannotTake: Story = {
  args: { min: "2026-11-01", isDateDisabled: (d: string) => d === "2026-11-15" },
  play: async ({ args, canvas, userEvent }) => {
    const field = canvas.getByRole("textbox", { name: "Due date" });
    // Not a real date: explained, kept for correcting, not reported.
    await userEvent.type(field, "2026-02-30");
    await userEvent.tab();
    await expect(field).toHaveAccessibleDescription("Enter a date as YYYY-MM-DD");
    await expect(field).toHaveAttribute("aria-invalid", "true");
    await expect(field).toHaveValue("2026-02-30");
    await expect(args.onChange).not.toHaveBeenCalled();
    // Before `min`, or an unavailable day.
    await userEvent.clear(field);
    await userEvent.type(field, "2026-10-31");
    await userEvent.tab();
    await expect(field).toHaveAccessibleDescription("This date is not available");
    await userEvent.clear(field);
    await userEvent.type(field, "2026-11-15");
    await userEvent.tab();
    await expect(field).toHaveAccessibleDescription("This date is not available");
    // Corrected: the message goes.
    await userEvent.clear(field);
    await userEvent.type(field, "2026-11-16");
    await userEvent.tab();
    await expect(args.onChange).toHaveBeenLastCalledWith("2026-11-16");
    await expect(field).not.toHaveAttribute("aria-invalid", "true");
  },
};

export const PickFromTheCalendar: Story = {
  args: { defaultValue: "2026-11-20" },
  play: async ({ args, canvas, userEvent }) => {
    const button = canvas.getByRole("button", { name: "Choose a date" });
    await userEvent.click(button);
    const dialog = await canvas.findByRole("dialog", { name: "Choose a date" });
    await waitFor(() => expect(dialog).toBeVisible());
    // It opens on the chosen day, ready for the arrows.
    await waitFor(() => expect(focusedDate()).toBe("2026-11-20"));
    await userEvent.keyboard("{ArrowRight}{Enter}");
    await expect(args.onChange).toHaveBeenLastCalledWith("2026-11-21");
    // Choosing closes it and puts focus back in the field.
    await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
    await expect(canvas.getByRole("textbox", { name: "Due date" })).toHaveFocus();
    await expect(canvas.getByRole("textbox", { name: "Due date" })).toHaveValue("2026-11-21");
    // Escape closes without choosing.
    await userEvent.click(button);
    await canvas.findByRole("dialog");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
    await expect(args.onChange).toHaveBeenCalledTimes(1);
  },
};

export const TheCalendarFollowsWhatIsTyped: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByRole("textbox", { name: "Due date" }), "2027-3-14");
    await userEvent.click(canvas.getByRole("button", { name: "Choose a date" }));
    await canvas.findByRole("dialog");
    await waitFor(() => expect(canvas.getByRole("grid", { name: "March 2027" })).toBeVisible());
    await waitFor(() => expect(focusedDate()).toBe("2027-03-14"));
  },
};

export const ArrowsStepTheDate: Story = {
  args: { defaultValue: "2026-11-10", max: "2026-12-01" },
  play: async ({ args, canvas, userEvent }) => {
    const field = canvas.getByRole("textbox", { name: "Due date" });
    await userEvent.click(field);
    await userEvent.keyboard("{ArrowUp}");
    await expect(args.onChange).toHaveBeenLastCalledWith("2026-11-11");
    await userEvent.keyboard("{Shift>}{ArrowDown}{/Shift}");
    await expect(args.onChange).toHaveBeenLastCalledWith("2026-10-11");
    // The limits stop it.
    await userEvent.keyboard("{Shift>}{ArrowUp}{ArrowUp}{/Shift}");
    await expect(field).toHaveValue("2026-11-11");
    // Steps from a date being typed, not from the old one; nothing to step from does nothing.
    await userEvent.clear(field);
    await userEvent.type(field, "2026-11-30{ArrowDown}");
    await expect(field).toHaveValue("2026-11-29");
    await userEvent.clear(field);
    await userEvent.type(field, "soon{ArrowDown}");
    await expect(field).toHaveValue("soon");
  },
};

export const FormsAndReadOnly: Story = {
  render: (args) => (
    <form data-testid="form">
      <DateField {...args} name="due" defaultValue="2026-11-10" />
      <DateField label="Created" readOnly defaultValue="2026-01-02" />
      <DateField label="Locked" disabled defaultValue="2026-01-03" />
    </form>
  ),
  play: async ({ canvas }) => {
    const data = new FormData(canvas.getByTestId("form") as HTMLFormElement);
    await expect(data.get("due")).toBe("2026-11-10");
    // A read-only date has no picker; a disabled one has a disabled picker.
    await expect(canvas.getAllByRole("button", { name: "Choose a date" })).toHaveLength(2);
    await expect(canvas.getAllByRole("button", { name: "Choose a date" })[1]).toBeDisabled();
  },
};

export const LabelsOverride: Story = {
  args: {
    label: "Échéance",
    labels: { open: "Choisir une date", invalid: "Date au format AAAA-MM-JJ" },
    locale: "fr-FR",
  },
  play: async ({ canvas, userEvent }) => {
    const field = canvas.getByRole("textbox", { name: "Échéance" });
    await userEvent.type(field, "demain");
    await userEvent.tab();
    await expect(field).toHaveAccessibleDescription("Date au format AAAA-MM-JJ");
    await userEvent.click(canvas.getByRole("button", { name: "Choisir une date" }));
    const grid = await canvas.findByRole("grid", { name: "novembre 2026" });
    await waitFor(() => expect(grid).toBeVisible());
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
    const field = canvas.getByRole("textbox", { name: "Due date" });
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
      "padding-left",
      "font-variant-numeric",
    ]);
    await expect(hostile).toEqual(clean);
    // Digits line up as they are typed (TextField's --cy-text-field-numeric, set by this field).
    await expect(clean["font-variant-numeric"]).toBe("tabular-nums");
  },
};

function ShadowDateField() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current;
    if (!el || el.shadowRoot) return;
    const root = el.attachShadow({ mode: "open" });
    root.adoptedStyleSheets = [createStyleSheet()];
    const mount = document.createElement("div");
    root.append(mount);
    createRoot(mount).render(
      <DateField label="Shadow date" defaultValue="2026-11-20" today="2026-11-10" locale="en-GB" />,
    );
  }, []);
  return <div data-testid="host" ref={host} style={{ paddingBlockEnd: 360 }} />;
}

export const OpensOnTheChosenDayInsideAShadowRoot: Story = {
  render: () => <ShadowDateField />,
  play: async ({ canvas, userEvent }) => {
    const host = await canvas.findByTestId("host");
    await waitFor(() => expect(host.shadowRoot?.querySelector("button")).toBeTruthy());
    const root = host.shadowRoot as ShadowRoot;
    await userEvent.click(root.querySelector("button") as HTMLElement);
    // The calendar is found inside the shadow root too, so focus lands on the chosen day.
    await waitFor(() => expect((root.activeElement as HTMLElement | null)?.dataset.date).toBe("2026-11-20"));
  },
};
