import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { shownFully } from "../../test/settle.js";
import { Button } from "../Button/Button.js";
import { Popover } from "../Popover/Popover.js";
import { Calendar, type CalendarDayMark, type CalendarDayState } from "./Calendar.js";

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

/** The colour a CSS value paints inside the calendar (its tokens resolved), as the browser serialises it. */
const painted = (root: Element, value: string) => {
  const probe = document.createElement("span");
  probe.style.background = value;
  (root.querySelector(".cy-calendar") as Element).append(probe);
  const colour = getComputedStyle(probe).backgroundColor;
  probe.remove();
  return colour;
};
const tabStop = (el: Element) =>
  (el.querySelector('[role="gridcell"][tabindex="0"]') as HTMLElement).dataset.date;

export const ControlledMonth: Story = {
  render: (args) => {
    const [month, setMonth] = useState("2026-11");
    return (
      <div style={{ display: "grid", gap: 8 }}>
        <Button onClick={() => setMonth("2027-03-14")}>Go to March 2027</Button>
        <Calendar
          {...args}
          month={month}
          onMonthChange={(firstDay) => {
            args.onMonthChange?.(firstDay);
            setMonth(firstDay);
          }}
        />
      </div>
    );
  },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    await expect(canvas.getByRole("grid", { name: "November 2026" })).toBeVisible();
    await expect(args.onMonthChange).not.toHaveBeenCalled();
    // The parent sets the month (any date of it will do); the Tab stop is the same day number there.
    await userEvent.click(canvas.getByRole("button", { name: "Go to March 2027" }));
    await expect(canvas.getByRole("grid", { name: "March 2027" })).toBeVisible();
    await expect(tabStop(canvasElement)).toBe("2027-03-10");
    await expect(args.onMonthChange).not.toHaveBeenCalled();
    // The month buttons ask the parent, which moves the grid.
    await userEvent.click(canvas.getByRole("button", { name: "Next month" }));
    await expect(args.onMonthChange).toHaveBeenLastCalledWith("2027-04-01");
    await expect(canvas.getByRole("grid", { name: "April 2027" })).toBeVisible();
    // Arrowing past the month's end asks for the next month, and focus lands on the day asked for.
    day(canvasElement, "2027-04-10").focus();
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}");
    await expect(args.onMonthChange).toHaveBeenLastCalledWith("2027-05-01");
    await waitFor(() => expect(focusedDate()).toBe("2027-05-01"));
    await expect(canvas.getByRole("grid", { name: "May 2027" })).toBeVisible();
    await userEvent.keyboard("{PageUp}");
    await waitFor(() => expect(focusedDate()).toBe("2027-04-01"));
  },
};

export const ControlledMonthThatStays: Story = {
  args: { month: "2026-11", defaultFocusedDate: "2026-11-30" },
  render: (args) => {
    const [date, setDate] = useState<string | null>(null);
    return (
      <div style={{ display: "grid", gap: 8 }}>
        <Button onClick={() => setDate("2027-03-14")}>Select Pi day</Button>
        <Calendar
          {...args}
          value={date}
          onChange={(next) => {
            args.onChange?.(next);
            setDate(next);
          }}
        />
      </div>
    );
  },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    // The parent never moves: every way of leaving the month only asks, and focus stays on a day of November.
    day(canvasElement, "2026-11-30").focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(args.onMonthChange).toHaveBeenLastCalledWith("2026-12-01");
    await expect(focusedDate()).toBe("2026-11-30");
    await userEvent.keyboard("{PageDown}");
    await expect(focusedDate()).toBe("2026-11-30");
    await expect(tabStop(canvasElement)).toBe("2026-11-30");
    await userEvent.click(canvas.getByRole("button", { name: "Previous month" }));
    await expect(args.onMonthChange).toHaveBeenLastCalledWith("2026-10-01");
    await userEvent.click(canvas.getByRole("button", { name: "Previous month" }));
    await expect(args.onMonthChange).toHaveBeenLastCalledWith("2026-10-01");
    await expect(canvas.getByRole("grid", { name: "November 2026" })).toBeVisible();
    // A day of the next month can be chosen where it shows; the grid stays.
    await userEvent.click(day(canvasElement, "2026-12-01"));
    await expect(args.onChange).toHaveBeenLastCalledWith("2026-12-01");
    await expect(day(canvasElement, "2026-12-01")).toHaveAttribute("aria-selected", "true");
    await expect(canvas.getByRole("grid", { name: "November 2026" })).toBeVisible();
    // A new value in another month does not move a controlled month, and asks for nothing.
    const asked = (args.onMonthChange as ReturnType<typeof fn>).mock.calls.length;
    await userEvent.click(canvas.getByRole("button", { name: "Select Pi day" }));
    await expect(canvas.getByRole("grid", { name: "November 2026" })).toBeVisible();
    await expect(args.onMonthChange).toHaveBeenCalledTimes(asked);
    await expect(tabStop(canvasElement)).toBe("2026-11-30");
  },
};

export const StartingMonthAndLimits: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: 16 }}>
      <div data-testid="start">
        <Calendar {...args} defaultMonth="2027-02" defaultValue="2026-11-30" />
      </div>
      <div data-testid="limit">
        <Calendar {...args} defaultMonth="2026-11-01" defaultFocusedDate="2026-10-25" max="2026-11-20" />
      </div>
      <div data-testid="beyond">
        <Calendar {...args} month="2027-01" max="2026-11-20" />
      </div>
    </div>
  ),
  play: async ({ args, canvas }) => {
    // The month shown at first is the one given, not the selected day's; the Tab stop is its nearest day number.
    await expect(canvas.getByRole("grid", { name: "February 2027" })).toBeVisible();
    await expect(tabStop(canvas.getByTestId("start"))).toBe("2027-02-28");
    await expect(args.onMonthChange).not.toHaveBeenCalled();
    // The Tab stop keeps within the limits where the month has such a day.
    await expect(tabStop(canvas.getByTestId("limit"))).toBe("2026-11-20");
    // A controlled month beyond the limits is still shown, with a Tab stop that cannot be chosen.
    const beyond = canvas.getByTestId("beyond");
    await expect(tabStop(beyond)).toBe("2027-01-10");
    await expect(day(beyond, "2027-01-10")).toHaveAttribute("aria-disabled", "true");
  },
};

const jump = (canvas: { getByRole: (role: string, options: { name: RegExp }) => HTMLElement }) =>
  canvas.getByRole("button", { name: /Choose month and year$/ });

export const JumpToAMonthAndYear: Story = {
  args: { monthPicker: true },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    // The heading is a button that says what it opens; the grid is still named by the month alone.
    const heading = jump(canvas);
    await expect(heading).toHaveAccessibleName("November 2026 Choose month and year");
    await expect(heading).toHaveAttribute("aria-expanded", "false");
    await expect(canvas.getByRole("grid", { name: "November 2026" })).toBeVisible();
    await userEvent.click(heading);
    const panel = canvas.getByRole("dialog", { name: "Choose month and year" });
    await shownFully(panel);
    await expect(heading).toHaveAttribute("aria-expanded", "true");
    // The month shown is marked; each month is named in full with its year.
    await expect(canvas.getByRole("button", { name: "November 2026" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    await expect(canvas.getByRole("button", { name: "March 2026" })).not.toHaveAttribute("aria-current");
    await expect(canvas.getByRole("button", { name: "March 2026" })).toHaveTextContent("Mar");
    await userEvent.click(canvas.getByRole("button", { name: "Next year" }));
    await userEvent.click(canvas.getByRole("button", { name: "March 2027" }));
    // The grid, its name and the Tab stop follow; the panel closes and focus is back on the heading.
    await expect(canvas.getByRole("grid", { name: "March 2027" })).toBeVisible();
    await expect(args.onMonthChange).toHaveBeenLastCalledWith("2027-03-01");
    await expect(args.onMonthChange).toHaveBeenCalledTimes(1);
    await expect(tabStop(canvasElement)).toBe("2027-03-10");
    await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(jump(canvas)).toHaveFocus());
    await expect(jump(canvas)).toHaveAccessibleName("March 2027 Choose month and year");
    // Opened again, the panel starts from the year shown; the month already shown changes nothing.
    await userEvent.click(jump(canvas));
    await userEvent.click(canvas.getByRole("button", { name: "March 2027" }));
    await expect(args.onMonthChange).toHaveBeenCalledTimes(1);
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const JumpWithTheKeyboard: Story = {
  args: { monthPicker: true },
  play: async ({ canvas, canvasElement, userEvent }) => {
    // Tab: previous month, the heading, next month, the grid.
    await userEvent.tab();
    await userEvent.tab();
    await expect(jump(canvas)).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await shownFully(canvas.getByRole("dialog", { name: "Choose month and year" }));
    // Focus moves into the panel, to the first control.
    await expect(canvas.getByRole("button", { name: "Previous year" })).toHaveFocus();
    await userEvent.keyboard("{Enter}{Enter}");
    await userEvent.tab();
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "January 2024" })).toHaveFocus();
    await userEvent.tab();
    await userEvent.keyboard(" ");
    await expect(canvas.getByRole("grid", { name: "February 2024" })).toBeVisible();
    await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
    await expect(jump(canvas)).toHaveFocus();
    // 2024 is a leap year: the Tab stop is the same day number, and the next Tab reaches it past the month button.
    await userEvent.tab();
    await userEvent.tab();
    await expect(focusedDate()).toBe("2024-02-10");
    // Escape closes the panel and changes nothing (the focused year button's tooltip goes first, as everywhere).
    await userEvent.tab({ shift: true });
    await userEvent.tab({ shift: true });
    await userEvent.keyboard("{Enter}");
    await shownFully(canvas.getByRole("dialog"));
    await shownFully(await canvas.findByRole("tooltip"));
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(canvas.queryByRole("tooltip")).toBeNull());
    await expect(canvas.getByRole("dialog")).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(jump(canvas)).toHaveFocus());
    await expect(tabStop(canvasElement)).toBe("2024-02-10");
  },
};

export const JumpWithinLimits: Story = {
  args: { monthPicker: true, min: "2026-09-15", max: "2027-02-10", defaultFocusedDate: "2026-11-25" },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    await userEvent.click(jump(canvas));
    await shownFully(canvas.getByRole("dialog"));
    // Months and years outside the limits cannot be chosen.
    await expect(canvas.getByRole("button", { name: "Previous year" })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "August 2026" })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "September 2026" })).toBeEnabled();
    await userEvent.click(canvas.getByRole("button", { name: "Next year" }));
    await expect(canvas.getByRole("button", { name: "Next year" })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "Previous year" })).toBeEnabled();
    await expect(canvas.getByRole("button", { name: "March 2027" })).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", { name: "February 2027" }));
    await expect(args.onMonthChange).toHaveBeenLastCalledWith("2027-02-01");
    // The Tab stop keeps within the limits: the 25th is past the last day allowed.
    await expect(tabStop(canvasElement)).toBe("2027-02-10");
  },
};

export const JumpInAnotherLanguage: Story = {
  args: {
    monthPicker: true,
    size: "lg",
    locale: "fr-FR",
    labels: {
      previous: "Mois précédent",
      next: "Mois suivant",
      monthPicker: "Choisir le mois et l'année",
      previousYear: "Année précédente",
      nextYear: "Année suivante",
    },
  },
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByRole("button", { name: "Mois précédent" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Mois suivant" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "novembre 2026 Choisir le mois et l'année" }));
    await shownFully(canvas.getByRole("dialog", { name: "Choisir le mois et l'année" }));
    await userEvent.click(canvas.getByRole("button", { name: "Année précédente" }));
    await expect(canvas.getByRole("button", { name: "Année suivante" })).toBeEnabled();
    // Month names come from the locale.
    await userEvent.click(canvas.getByRole("button", { name: "août 2025" }));
    await expect(canvas.getByRole("grid", { name: "août 2025" })).toBeVisible();
  },
};

export const JumpInASmallCalendarInAPopover: Story = {
  args: { monthPicker: true, size: "sm", defaultMonth: "2026-09" },
  render: (args) => (
    <Popover label="Date" trigger={(props) => <Button {...props}>Pick a date</Button>}>
      <Calendar {...args} />
    </Popover>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Pick a date" }));
    await shownFully(canvas.getByRole("dialog", { name: "Date" }));
    // The longest month name still fits the small calendar: the heading row is no wider than the grid.
    const root = canvasElement.querySelector(".cy-calendar") as HTMLElement;
    const head = canvasElement.querySelector(".cy-calendar-head") as HTMLElement;
    const grid = canvas.getByRole("grid", { name: "September 2026" });
    await expect(head.scrollWidth).toBeLessThanOrEqual(head.clientWidth);
    await expect(root.getBoundingClientRect().width).toBe(grid.getBoundingClientRect().width);
    // The picker opens over the popover that holds the calendar, and choosing a month closes only the picker.
    await userEvent.click(jump(canvas));
    await shownFully(canvas.getByRole("dialog", { name: "Choose month and year" }));
    await userEvent.click(canvas.getByRole("button", { name: "December 2026" }));
    await waitFor(() => expect(canvas.queryByRole("dialog", { name: "Choose month and year" })).toBeNull());
    await expect(canvas.getByRole("dialog", { name: "Date" })).toBeVisible();
    await expect(canvas.getByRole("grid", { name: "December 2026" })).toBeVisible();
    // A press outside the picker but inside the popover closes only the picker.
    await userEvent.click(jump(canvas));
    await shownFully(canvas.getByRole("dialog", { name: "Choose month and year" }));
    await userEvent.click(day(canvasElement, "2026-12-24"));
    await waitFor(() => expect(canvas.queryByRole("dialog", { name: "Choose month and year" })).toBeNull());
    await expect(canvas.getByRole("dialog", { name: "Date" })).toBeVisible();
  },
};

const MARKS: Record<string, CalendarDayMark> = {
  "2026-11-10": {
    tone: "success",
    dots: ["danger", "info", "#ff00aa", "accent", "warning"],
    label: "5 tasks",
  },
  "2026-11-12": { tone: "warning", dots: ["accent"], label: "Release" },
  "2026-11-13": { tone: "danger", label: "Closed" },
  "2026-11-17": { dots: ["info", "info"] },
  "2026-11-18": { dots: [] },
};
const markDay = (date: string, state: CalendarDayState) =>
  MARKS[date] ?? (state.weekend ? { tone: "neutral" as const, label: "Weekend" } : undefined);

export const MarkedDays: Story = {
  tags: ["visual"],
  args: {
    defaultValue: "2026-11-12",
    markDay,
    isDateDisabled: (date: string) => date === "2026-11-13",
  },
  play: async ({ args, canvasElement, userEvent }) => {
    const bg = (date: string) => getComputedStyle(day(canvasElement, date)).backgroundColor;
    // A tone tints the day with the token mix of that tone; a plain day has no fill.
    await expect(bg("2026-11-10")).toBe(
      painted(canvasElement, "color-mix(in oklab, var(--cy-color-success) 12%, transparent)"),
    );
    await expect(bg("2026-11-14")).toBe(
      painted(canvasElement, "color-mix(in oklab, var(--cy-color-ink) 12%, transparent)"),
    );
    await expect(bg("2026-11-11")).toBe("rgba(0, 0, 0, 0)");
    await expect(bg("2026-11-10")).not.toBe(bg("2026-11-11"));
    await expect(bg("2026-11-10")).not.toBe(bg("2026-11-14"));
    // The label is part of the day's name, so the mark is not colour alone.
    await expect(day(canvasElement, "2026-11-10")).toHaveAccessibleName(/10 November 2026, 5 tasks$/);
    await expect(day(canvasElement, "2026-11-14")).toHaveAccessibleName(/14 November 2026, Weekend$/);
    await expect(day(canvasElement, "2026-11-11")).toHaveAccessibleName(/11 November 2026$/);
    // At most three dots, in the order given: tones, or any CSS colour.
    const dots = (date: string) => [...day(canvasElement, date).querySelectorAll(".cy-calendar-dot")];
    const colours = (date: string) => dots(date).map((dot) => getComputedStyle(dot).backgroundColor);
    await expect(colours("2026-11-10")).toEqual([
      painted(canvasElement, "var(--cy-color-danger)"),
      painted(canvasElement, "var(--cy-color-info)"),
      "rgb(255, 0, 170)",
    ]);
    await expect(dots("2026-11-17")).toHaveLength(2);
    await expect(dots("2026-11-18")).toHaveLength(0);
    await expect(dots("2026-11-11")).toHaveLength(0);
    // Dots sit under the number without moving it or the cell.
    const number = (date: string) =>
      (day(canvasElement, date).querySelector(".cy-calendar-number") as Element).getBoundingClientRect();
    const dot = (dots("2026-11-10")[0] as Element).getBoundingClientRect();
    await expect(dot.width).toBe(4);
    await expect(dot.top).toBeGreaterThanOrEqual(number("2026-11-10").bottom - 4);
    await expect(number("2026-11-10").top).toBe(number("2026-11-11").top);
    await expect(day(canvasElement, "2026-11-10").getBoundingClientRect().height).toBe(
      day(canvasElement, "2026-11-11").getBoundingClientRect().height,
    );
    // Selected wins over the tone; today keeps its ring; an unavailable day stays unavailable.
    await expect(bg("2026-11-12")).toBe(painted(canvasElement, "var(--cy-color-accent)"));
    await expect(day(canvasElement, "2026-11-12")).toHaveAttribute("aria-selected", "true");
    await expect(day(canvasElement, "2026-11-10")).toHaveAttribute("aria-current", "date");
    await expect(getComputedStyle(day(canvasElement, "2026-11-10")).boxShadow).not.toBe("none");
    await expect(day(canvasElement, "2026-11-13")).toHaveAttribute("aria-disabled", "true");
    await expect(getComputedStyle(day(canvasElement, "2026-11-13")).textDecorationLine).toBe("line-through");
    await userEvent.click(day(canvasElement, "2026-11-13"));
    await expect(args.onChange).not.toHaveBeenCalled();
    // A toned day is chosen like any other, and then shows as selected.
    await userEvent.click(day(canvasElement, "2026-11-10"));
    await expect(args.onChange).toHaveBeenLastCalledWith("2026-11-10");
    await userEvent.unhover(day(canvasElement, "2026-11-10"));
    await expect(bg("2026-11-10")).toBe(painted(canvasElement, "var(--cy-color-accent)"));
  },
};

/** The weekend the browser knows for a locale (0 Sunday to 6 Saturday), or undefined where it does not say. */
const platformWeekend = (locale: string) => {
  const loc = new Intl.Locale(locale) as Intl.Locale & {
    getWeekInfo?: () => { weekend?: number[] };
    weekInfo?: { weekend?: number[] };
  };
  return (loc.getWeekInfo?.() ?? loc.weekInfo)?.weekend?.map((d) => d % 7);
};

export const Weekends: Story = {
  args: {
    markDay: (_date: string, state: CalendarDayState) => (state.weekend ? { tone: "neutral" } : undefined),
  },
  render: (args) => (
    <div style={{ display: "grid", gap: 16 }}>
      <div data-testid="us">
        <Calendar {...args} locale="en-US" weekStartsOn={0} />
      </div>
      <div data-testid="eg">
        <Calendar {...args} locale="ar-EG" weekStartsOn={6} />
      </div>
    </div>
  ),
  play: async ({ canvas }) => {
    const toned = (el: Element) =>
      [...el.querySelectorAll('[role="gridcell"][data-tone]:not([data-outside])')].map(
        (d) => (d as HTMLElement).dataset.date,
      );
    // November 2026 in the United States: Saturdays and Sundays.
    await expect(toned(canvas.getByTestId("us"))).toEqual([
      ...["01", "07", "08", "14", "15", "21", "22", "28", "29"].map((d) => `2026-11-${d}`),
    ]);
    // Egypt's weekend is Friday and Saturday, where the browser knows it; otherwise Saturday and Sunday.
    const weekend = platformWeekend("ar-EG") ?? [6, 0];
    const expected = Array.from({ length: 30 }, (_, i) => new Date(2026, 10, i + 1))
      .filter((d) => weekend.includes(d.getDay()))
      .map((d) => `2026-11-${String(d.getDate()).padStart(2, "0")}`);
    await expect(toned(canvas.getByTestId("eg"))).toEqual(expected);
    if (platformWeekend("ar-EG")) await expect(expected).toContain("2026-11-06");
  },
};

export const PlannerMarksAndSizes: Story = {
  args: {
    markDay,
    renderDay: (date: string) => PLANS[date]?.length,
    style: {
      "--cy-calendar-content-size": "96px",
      "--cy-calendar-tone-mix": "40%",
      "--cy-calendar-dot-size": "8px",
    } as React.CSSProperties,
  },
  decorators: [(Story) => <div style={{ inlineSize: 640 }}>{Story()}</div>],
  play: async ({ canvasElement }) => {
    const cell = day(canvasElement, "2026-11-10");
    // The tokens set a day's least height, the strength of the tint and the size of the dots.
    await expect(cell.getBoundingClientRect().height).toBe(96);
    await expect(getComputedStyle(cell).backgroundColor).toBe(
      painted(canvasElement, "color-mix(in oklab, var(--cy-color-success) 40%, transparent)"),
    );
    const dot = cell.querySelector(".cy-calendar-dot") as Element;
    await expect(dot.getBoundingClientRect().width).toBe(8);
    await expect(dot.getBoundingClientRect().height).toBe(8);
    // With day content the dots are in the flow: under the number, above the content, at the start.
    const number = (cell.querySelector(".cy-calendar-number") as Element).getBoundingClientRect();
    const extra = (cell.querySelector(".cy-calendar-extra") as Element).getBoundingClientRect();
    await expect(dot.getBoundingClientRect().top).toBeGreaterThanOrEqual(number.bottom - 4);
    await expect(dot.getBoundingClientRect().bottom).toBeLessThanOrEqual(extra.top);
    await expect(dot.getBoundingClientRect().left - cell.getBoundingClientRect().left).toBeLessThan(12);
    // The name: the date, the mark's label, then the content.
    await expect(cell).toHaveAccessibleName(/10 November 2026, 5 tasks 2$/);
  },
};

export const TouchPlannerMonthFitsAPhone: Story = {
  tags: ["touch", "!dev"],
  args: {
    defaultMonth: "2026-08",
    markDay,
    renderDay: (date: string) => (Number(date.slice(8)) % 3 === 0 ? "2 tasks" : null),
  },
  render: (args) => (
    <div style={{ display: "grid", gap: 16 }}>
      <div data-testid="phone" style={{ inlineSize: 390 }}>
        <Calendar {...args} />
      </div>
      <div data-testid="short" style={{ inlineSize: 390 }}>
        <Calendar {...args} style={{ "--cy-calendar-content-size": "20px" } as React.CSSProperties} />
      </div>
      <div data-testid="tall" style={{ inlineSize: 390 }}>
        <Calendar {...args} style={{ "--cy-calendar-content-size": "120px" } as React.CSSProperties} />
      </div>
      <div data-testid="narrow" style={{ inlineSize: 250, overflow: "auto" }}>
        <Calendar {...args} />
      </div>
    </div>
  ),
  play: async ({ args, canvas, userEvent }) => {
    const phone = canvas.getByTestId("phone");
    const cells = (el: Element) =>
      [...el.querySelectorAll('[role="gridcell"]')].map((cell) => cell.getBoundingClientRect());
    // August 2026 takes six weeks. Every day is a 44px target at least, and the whole month is under 520px tall.
    await expect(cells(phone)).toHaveLength(42);
    for (const cell of cells(phone)) {
      await expect(cell.height).toBeGreaterThanOrEqual(44);
      await expect(cell.width).toBeGreaterThanOrEqual(44);
    }
    const month = (phone.querySelector(".cy-calendar") as Element).getBoundingClientRect();
    await expect(month.width).toBe(390);
    await expect(month.height).toBeLessThanOrEqual(520);
    await userEvent.pointer({ keys: "[TouchA]", target: day(phone, "2026-08-12") });
    await expect(args.onChange).toHaveBeenLastCalledWith("2026-08-12");
    // The content size is the product's to set, but never below the touch target.
    for (const cell of cells(canvas.getByTestId("short")))
      await expect(cell.height).toBeGreaterThanOrEqual(44);
    await expect(Math.max(...cells(canvas.getByTestId("short")).map((c) => c.height))).toBeLessThan(66);
    for (const cell of cells(canvas.getByTestId("tall")))
      await expect(cell.height).toBeGreaterThanOrEqual(120);
    // A container narrower than seven targets scrolls rather than shrinking them.
    for (const cell of cells(canvas.getByTestId("narrow")))
      await expect(cell.width).toBeGreaterThanOrEqual(44);
  },
};

export const MarksStableUnderHostileHost: Story = {
  args: { markDay, monthPicker: true },
  play: async ({ canvasElement }) => {
    const dot = computeUnderHostileHost(canvasElement, ".cy-calendar-dot", [
      "width",
      "height",
      "background-color",
      "border-top-width",
    ]);
    await expect(dot.hostile).toEqual(dot.clean);
    const toned = computeUnderHostileHost(canvasElement, ".cy-calendar-day[data-tone]", [
      "width",
      "height",
      "background-color",
      "font-size",
    ]);
    await expect(toned.hostile).toEqual(toned.clean);
    const title = computeUnderHostileHost(canvasElement, ".cy-calendar-title", [
      "font-size",
      "font-weight",
      "text-transform",
    ]);
    await expect(title.hostile).toEqual(title.clean);
  },
};
