import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { Button } from "../Button/Button.js";
import { Calendar } from "./Calendar.js";

const meta = {
  title: "Components/Calendar",
  component: Calendar,
  args: { today: "2026-11-10", weekStartsOn: 1, locale: "en-GB", onChange: fn(), onMonthChange: fn() },
  argTypes: { size: { control: "inline-radio", options: ["sm", "md", "lg"] } },
} satisfies Meta<typeof Calendar>;
export default meta;
type Story = StoryObj<typeof meta>;

const day = (el: Element, date: string) => el.querySelector(`[data-date="${date}"]`) as HTMLElement;
const focusedDate = () => (document.activeElement as HTMLElement | null)?.dataset.date;

export const PickADay: Story = {
  tags: ["visual"],
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const grid = canvas.getByRole("grid", { name: "November 2026" });
    await expect(grid).toBeVisible();
    // One Tab stop, on today (marked as the current date).
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    await expect(focusedDate()).toBe("2026-11-10");
    await expect(day(canvasElement, "2026-11-10")).toHaveAttribute("aria-current", "date");
    // Each day is named by its full date, as the language writes it.
    const full = new Intl.DateTimeFormat("en-GB", { dateStyle: "full" }).format(new Date(2026, 10, 10));
    await expect(day(canvasElement, "2026-11-10")).toHaveAccessibleName(full);
    await userEvent.keyboard("{ArrowRight}{Enter}");
    await expect(args.onChange).toHaveBeenLastCalledWith("2026-11-11");
    await expect(day(canvasElement, "2026-11-11")).toHaveAttribute("aria-selected", "true");
    await expect(day(canvasElement, "2026-11-10")).toHaveAttribute("aria-selected", "false");
    // A click chooses too, and takes focus there.
    await userEvent.click(day(canvasElement, "2026-11-20"));
    await expect(args.onChange).toHaveBeenLastCalledWith("2026-11-20");
    await expect(focusedDate()).toBe("2026-11-20");
    await userEvent.keyboard(" ");
    await expect(args.onChange).toHaveBeenLastCalledWith("2026-11-20");
  },
};

export const KeysMoveByDayWeekMonthAndYear: Story = {
  args: { defaultFocusedDate: "2026-11-10" },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    day(canvasElement, "2026-11-10").focus();
    const press = async (keys: string, expected: string) => {
      await userEvent.keyboard(keys);
      await waitFor(() => expect(focusedDate()).toBe(expected));
    };
    await press("{ArrowRight}", "2026-11-11");
    await press("{ArrowDown}", "2026-11-18");
    await press("{ArrowUp}{ArrowLeft}", "2026-11-10");
    // Home and End: the ends of the week (it starts on Monday here).
    await press("{Home}", "2026-11-09");
    await press("{End}", "2026-11-15");
    // Page Down: a month on, the grid following; Shift: a year.
    await press("{PageDown}", "2026-12-15");
    await expect(canvas.getByRole("grid", { name: "December 2026" })).toBeVisible();
    await expect(args.onMonthChange).toHaveBeenLastCalledWith("2026-12-01");
    await press("{Shift>}{PageUp}{/Shift}", "2025-12-15");
    await press("{PageUp}", "2025-11-15");
    // Arrows cross into the next month.
    await press("{End}{ArrowDown}{ArrowDown}{ArrowDown}", "2025-12-07");
    await expect(canvas.getByRole("grid", { name: "December 2025" })).toBeVisible();
  },
};

export const MonthEndsAreKept: Story = {
  args: { defaultFocusedDate: "2027-01-31", className: "mine", style: { padding: 4 } },
  play: async ({ canvasElement, userEvent }) => {
    await expect(canvasElement.querySelector(".cy-calendar.mine")).not.toBeNull();
    day(canvasElement, "2027-01-31").focus();
    // 31 January plus a month is the last day of February; Shift moves a year.
    await userEvent.keyboard("{PageDown}");
    await waitFor(() => expect(focusedDate()).toBe("2027-02-28"));
    await userEvent.keyboard("{Shift>}{PageDown}{/Shift}");
    await waitFor(() => expect(focusedDate()).toBe("2028-02-28"));
    // Other keys leave the grid alone.
    await userEvent.keyboard("a");
    await expect(focusedDate()).toBe("2028-02-28");
  },
};

export const MonthButtons: Story = {
  play: async ({ args, canvas }) => {
    const next = canvas.getByRole("button", { name: "Next month" });
    await next.click();
    await expect(canvas.getByRole("grid", { name: "December 2026" })).toBeVisible();
    await expect(args.onMonthChange).toHaveBeenLastCalledWith("2026-12-01");
    canvas.getByRole("button", { name: "Previous month" }).click();
    canvas.getByRole("button", { name: "Previous month" }).click();
    await waitFor(() => expect(canvas.getByRole("grid", { name: "October 2026" })).toBeVisible());
    // The title is announced as it changes.
    await expect(canvas.getByText("October 2026")).toHaveAttribute("aria-live", "polite");
  },
};

export const LimitsAndUnavailableDays: Story = {
  args: {
    min: "2026-11-05",
    max: "2026-11-20",
    defaultFocusedDate: "2026-11-05",
    isDateDisabled: (date: string) => [0, 6].includes(new Date(`${date}T12:00`).getDay()),
  },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    // Days outside the limits, and unavailable days, cannot be chosen.
    await expect(day(canvasElement, "2026-11-04")).toHaveAttribute("aria-disabled", "true");
    await expect(day(canvasElement, "2026-11-07")).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(day(canvasElement, "2026-11-04"));
    await expect(args.onChange).not.toHaveBeenCalled();
    // Focus stops at the limits.
    day(canvasElement, "2026-11-05").focus();
    await userEvent.keyboard("{ArrowLeft}");
    await waitFor(() => expect(focusedDate()).toBe("2026-11-05"));
    await userEvent.keyboard("{PageDown}");
    await waitFor(() => expect(focusedDate()).toBe("2026-11-20"));
    // An unavailable day can be focused (to hear about it) but not chosen.
    await userEvent.keyboard("{ArrowUp}{ArrowUp}{Enter}");
    await waitFor(() => expect(focusedDate()).toBe("2026-11-06"));
    await expect(args.onChange).toHaveBeenLastCalledWith("2026-11-06");
    await userEvent.keyboard("{ArrowRight}{Enter}");
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    // The month buttons stop at the limits too.
    await expect(canvas.getByRole("button", { name: "Previous month" })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "Next month" })).toBeDisabled();
  },
};

export const WeekStartAndOtherMonthsDays: Story = {
  args: { weekStartsOn: 0, locale: "en-US" },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const heads = canvas.getAllByRole("columnheader");
    await expect(heads[0]).toHaveTextContent("Sun");
    await expect(heads[0]).toHaveAttribute("abbr", "Sunday");
    // 1 November 2026 is a Sunday: no days before it. The weeks end with December's first days, muted.
    await expect(day(canvasElement, "2026-10-31")).toBeNull();
    await expect(day(canvasElement, "2026-12-05")).toHaveAttribute("data-outside");
    await userEvent.click(day(canvasElement, "2026-12-05"));
    await expect(args.onChange).toHaveBeenLastCalledWith("2026-12-05");
    await expect(canvas.getByRole("grid", { name: "December 2026" })).toBeVisible();
  },
};

export const OtherLanguages: Story = {
  args: { locale: "fr-FR", weekStartsOn: undefined },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole("grid", { name: "novembre 2026" })).toBeVisible();
    // The week starts where the language's calendar starts it.
    await expect(canvas.getAllByRole("columnheader")[0]).toHaveAttribute("abbr", "lundi");
    await expect(day(canvasElement, "2026-11-10")).toHaveAccessibleName(
      new Intl.DateTimeFormat("fr-FR", { dateStyle: "full" }).format(new Date(2026, 10, 10)),
    );
  },
};

export const RightToLeft: Story = {
  args: { locale: "ar-EG", weekStartsOn: 6, defaultFocusedDate: "2026-11-10" },
  render: (args) => (
    <div dir="rtl">
      <Calendar {...args} />
    </div>
  ),
  play: async ({ canvasElement, userEvent }) => {
    day(canvasElement, "2026-11-10").focus();
    // Left moves on in time when the text runs right to left.
    await userEvent.keyboard("{ArrowLeft}");
    await waitFor(() => expect(focusedDate()).toBe("2026-11-11"));
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    await waitFor(() => expect(focusedDate()).toBe("2026-11-09"));
  },
};

export const ControlledFromOutside: Story = {
  render: (args) => {
    const [date, setDate] = useState<string | null>("2026-11-03");
    return (
      <div style={{ display: "grid", gap: 8 }}>
        <Button onClick={() => setDate("2027-03-14")}>Jump to Pi day</Button>
        <Calendar {...args} value={date} onChange={setDate} />
      </div>
    );
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await expect(day(canvasElement, "2026-11-03")).toHaveAttribute("aria-selected", "true");
    await userEvent.click(canvas.getByRole("button", { name: "Jump to Pi day" }));
    // The month of a new value is shown, with that day the Tab stop.
    await expect(canvas.getByRole("grid", { name: "March 2027" })).toBeVisible();
    await expect(day(canvasElement, "2027-03-14")).toHaveAttribute("tabindex", "0");
    await expect(day(canvasElement, "2027-03-14")).toHaveAttribute("aria-selected", "true");
  },
};

const PLANS: Record<string, string[]> = { "2026-11-10": ["Stand-up", "Dentist"], "2026-11-12": ["Release"] };

export const AMonthOfPlans: Story = {
  tags: ["visual"],
  args: {
    renderDay: (date: string) =>
      PLANS[date]?.map((plan) => (
        <span key={plan} style={{ display: "block" }}>
          {plan}
        </span>
      )),
  },
  decorators: [(Story) => <div style={{ inlineSize: 640 }}>{Story()}</div>],
  play: async ({ canvasElement }) => {
    // Each day holds the product's content under its number; the grid fills the width.
    // The plans are part of the day's name, after its date.
    await expect(day(canvasElement, "2026-11-10")).toHaveAccessibleName(/10 November 2026 Stand-up Dentist$/);
    const cell = day(canvasElement, "2026-11-10").getBoundingClientRect();
    await expect(cell.width).toBeGreaterThan(80);
    await expect(cell.height).toBeGreaterThan(cell.width / 2);
  },
};

export const TouchDays: Story = {
  tags: ["touch", "!dev"],
  play: async ({ args, canvasElement, userEvent }) => {
    const cell = day(canvasElement, "2026-11-10");
    await expect(cell.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    await expect(cell.getBoundingClientRect().width).toBeGreaterThanOrEqual(44);
    await userEvent.pointer({ keys: "[TouchA]", target: cell });
    await expect(args.onChange).toHaveBeenLastCalledWith("2026-11-10");
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    const { clean, hostile } = computeUnderHostileHost(canvasElement, ".cy-calendar-day", [
      "width",
      "height",
      "padding-top",
      "font-size",
      "border-top-width",
      "background-color",
    ]);
    await expect(hostile).toEqual(clean);
  },
};
