import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, waitFor, within } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { Button } from "../Button/Button.js";
import { TimeField } from "./TimeField.js";

const meta = {
  title: "Components/TimeField",
  component: TimeField,
  // Stories pin the 24-hour form; `FollowsThePersonsLocale` covers the default.
  args: { label: "Start time", hourCycle: 24, onChange: fn() },
  argTypes: { size: { control: "inline-radio", options: ["sm", "md", "lg"] } },
  decorators: [(Story) => <div style={{ maxInlineSize: 240 }}>{Story()}</div>],
} satisfies Meta<typeof TimeField>;
export default meta;
type Story = StoryObj<typeof meta>;

/** The picker, opened from the field's clock button. */
const openPicker = async (
  canvas: {
    getByRole: ReturnType<typeof within>["getByRole"];
    findByRole: ReturnType<typeof within>["findByRole"];
  },
  userEvent: { click: (el: Element) => Promise<void> },
  name = "Choose a time",
) => {
  await userEvent.click(canvas.getByRole("button", { name }));
  const dialog = await canvas.findByRole("dialog", { name });
  // The picker fades in. WebKit under load can take over a second to draw the first frame of that, so this waits
  // longer than the default, and when it never shows, the failure says what state it was left in.
  await waitFor(
    () => {
      const style = getComputedStyle(dialog);
      const state = {
        open: dialog.matches(":popover-open"),
        display: style.display,
        visibility: style.visibility,
        fadedIn: Number(style.opacity) > 0,
      };
      const running = dialog
        .getAnimations()
        .map((a: Animation) => `${a.playState} at ${String(a.currentTime)}`);
      expect(state, `opacity ${style.opacity}; animations: ${running.join(", ") || "none"}`).toEqual({
        open: true,
        display: "block",
        visibility: "visible",
        fadedIn: true,
      });
    },
    { timeout: 5000 },
  );
  await expect(dialog).toBeVisible();
  return within(dialog);
};
/** How far the chosen row of a column is from the middle of the lens, in pixels. */
const offLens = (list: HTMLElement) => {
  const row = list.querySelector<HTMLElement>('[aria-selected="true"]') as HTMLElement;
  const a = row.getBoundingClientRect();
  const b = list.getBoundingClientRect();
  return Math.abs(a.top + a.height / 2 - (b.top + b.height / 2));
};
const chosen = (list: HTMLElement) => list.querySelector('[aria-selected="true"]')?.textContent;

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

export const ArrowsSnapTheMinutesToTheStep: Story = {
  args: { defaultValue: "09:32", step: 15 },
  play: async ({ args, canvas, userEvent }) => {
    const field = canvas.getByRole("textbox", { name: "Start time" }) as HTMLInputElement;
    field.focus();
    field.setSelectionRange(4, 4);
    // Off the step's grid, the first press lands on it (the picker's rows), in the arrow's direction.
    await userEvent.keyboard("{ArrowDown}");
    await expect(args.onChange).toHaveBeenLastCalledWith("09:30");
    await userEvent.clear(field);
    await userEvent.type(field, "9:52{Enter}{ArrowUp}");
    await expect(args.onChange).toHaveBeenLastCalledWith("10:00");
    // Shift: the snap counts as the first of its ten steps.
    await userEvent.clear(field);
    await userEvent.type(field, "9:37{Enter}{Shift>}{ArrowUp}{/Shift}");
    await expect(args.onChange).toHaveBeenLastCalledWith("12:00");
    // On the grid it moves by whole steps, as before.
    await userEvent.keyboard("{ArrowUp}");
    await expect(args.onChange).toHaveBeenLastCalledWith("12:15");
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
      <TimeField label="Ends" hourCycle={24} picker readOnly defaultValue="10:00" />
      <TimeField
        label="Heure"
        hourCycle={24}
        picker
        labels={{ invalid: "Heure au format HH:MM", open: "Choisir une heure" }}
      />
    </form>
  ),
  play: async ({ canvas, userEvent }) => {
    await expect(new FormData(canvas.getByTestId("form") as HTMLFormElement).get("start")).toBe("09:15");
    // Only a field with `picker` that can be changed has the button, named from `labels`.
    await expect(canvas.getAllByRole("button").map((b) => b.getAttribute("aria-label"))).toEqual([
      "Choisir une heure",
    ]);
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

export const FormsSubmitTheTimeNotTheDraft: Story = {
  args: { min: "08:00" },
  render: (args) => (
    <form data-testid="form" onSubmit={(event) => event.preventDefault()}>
      <TimeField {...args} name="start" defaultValue="09:15" />
      <Button type="reset">Reset</Button>
    </form>
  ),
  play: async ({ args, canvas, userEvent }) => {
    const form = canvas.getByTestId("form") as HTMLFormElement;
    const field = canvas.getByRole("textbox", { name: "Start time" }) as HTMLInputElement;
    // What is being typed is not the value: the form keeps the last real time, and will not submit a wrong one.
    await userEvent.clear(field);
    await userEvent.type(field, "25:99");
    await expect(new FormData(form).getAll("start")).toEqual(["09:15"]);
    await expect(form.checkValidity()).toBe(false);
    await expect(field.validationMessage).toBe("Enter a time as HH:MM");
    await userEvent.tab();
    await expect(new FormData(form).getAll("start")).toEqual(["09:15"]);
    await expect(form.checkValidity()).toBe(false);
    // A time before `min` is not available either.
    await userEvent.clear(field);
    await userEvent.type(field, "7:30");
    await expect(field.validationMessage).toBe("This time is not available");
    // Corrected, it is submitted.
    await userEvent.clear(field);
    await userEvent.type(field, "10:45");
    await userEvent.tab();
    await expect(form.checkValidity()).toBe(true);
    await expect(new FormData(form).getAll("start")).toEqual(["10:45"]);
    // Resetting the form brings back the default, with no message, and reports nothing.
    await userEvent.clear(field);
    await userEvent.type(field, "soon");
    await userEvent.tab();
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await userEvent.click(canvas.getByRole("button", { name: "Reset" }));
    await waitFor(() => expect(field).toHaveValue("09:15"));
    await expect(field).not.toHaveAttribute("aria-invalid", "true");
    await expect(form.checkValidity()).toBe(true);
    await expect(new FormData(form).getAll("start")).toEqual(["09:15"]);
    await expect(args.onChange).toHaveBeenCalledTimes(1);
  },
};

export const PickFromTheColumns: Story = {
  args: { picker: true, defaultValue: "09:30", step: 15 },
  play: async ({ args, canvas, userEvent }) => {
    const picker = await openPicker(canvas, userEvent);
    const hours = picker.getByRole("listbox", { name: "Hours" });
    const minutes = picker.getByRole("listbox", { name: "Minutes" });
    // It opens on the time, in the lens, with the hours ready for the arrows.
    await waitFor(() => expect(hours).toHaveFocus());
    await expect(chosen(hours)).toBe("09");
    await expect(chosen(minutes)).toBe("30");
    await expect(within(minutes).getAllByRole("option")).toHaveLength(4);
    await waitFor(() => expect(offLens(hours)).toBeLessThan(2));
    await expect(offLens(minutes)).toBeLessThan(2);
    // Arrows roll a column and apply at once; Left and Right change column; Home and End go to the ends.
    await userEvent.keyboard("{ArrowDown}");
    await expect(args.onChange).toHaveBeenLastCalledWith("10:30");
    await userEvent.keyboard("{ArrowRight}");
    await expect(minutes).toHaveFocus();
    await userEvent.keyboard("{ArrowUp}");
    await expect(args.onChange).toHaveBeenLastCalledWith("10:15");
    await userEvent.keyboard("{End}");
    await expect(args.onChange).toHaveBeenLastCalledWith("10:45");
    await userEvent.keyboard("{ArrowLeft}{Home}");
    await expect(args.onChange).toHaveBeenLastCalledWith("00:45");
    // Digits seek: 1 then 4 is 14.
    await userEvent.keyboard("14");
    await expect(args.onChange).toHaveBeenLastCalledWith("14:45");
    // A click chooses and the row rolls into the lens.
    await userEvent.click(within(minutes).getByRole("option", { name: "00" }));
    await expect(args.onChange).toHaveBeenLastCalledWith("14:00");
    await waitFor(() => expect(offLens(minutes)).toBeLessThan(2));
    await expect(canvas.getByRole("textbox", { name: "Start time" })).toHaveValue("14:00");
    // Enter closes it and puts focus back in the field; Escape closes it too.
    hours.focus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
    await expect(canvas.getByRole("textbox", { name: "Start time" })).toHaveFocus();
    // Reopen once it has finished closing (it fades out), as a person would.
    const panel = hours.closest(".cy-popover") as HTMLElement;
    await waitFor(() => expect(getComputedStyle(panel).display).toBe("none"));
    await openPicker(canvas, userEvent);
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
  },
};

export const ThePickerFollowsWhatIsTyped: Story = {
  args: { picker: true, step: 5 },
  play: async ({ args, canvas, userEvent }) => {
    // Empty: nothing is chosen yet.
    let picker = await openPicker(canvas, userEvent);
    await expect(picker.queryByRole("option", { selected: true })).toBeNull();
    await userEvent.keyboard("{Escape}");
    // 16:07 is between the minute rows: the hour is chosen, the minutes rest nearby with none chosen.
    await userEvent.type(canvas.getByRole("textbox", { name: "Start time" }), "1607");
    picker = await openPicker(canvas, userEvent);
    await expect(chosen(picker.getByRole("listbox", { name: "Hours" }))).toBe("16");
    await expect(chosen(picker.getByRole("listbox", { name: "Minutes" }))).toBeUndefined();
    await userEvent.click(
      within(picker.getByRole("listbox", { name: "Minutes" })).getByRole("option", { name: "10" }),
    );
    await expect(args.onChange).toHaveBeenLastCalledWith("16:10");
  },
};

export const LimitsInThePicker: Story = {
  args: { picker: true, defaultValue: "16:45", min: "09:00", max: "17:30", step: 15 },
  play: async ({ args, canvas, userEvent }) => {
    const picker = await openPicker(canvas, userEvent);
    const hours = picker.getByRole("listbox", { name: "Hours" });
    // Hours outside the limits cannot be chosen, by click or by key.
    await expect(within(hours).getByRole("option", { name: "08" })).toHaveAttribute("aria-disabled", "true");
    await expect(within(hours).getByRole("option", { name: "18" })).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(within(hours).getByRole("option", { name: "08" }));
    await expect(args.onChange).not.toHaveBeenCalled();
    // 17:45 is past the latest time, so choosing 17 gives 17:30.
    await userEvent.click(within(hours).getByRole("option", { name: "17" }));
    await expect(args.onChange).toHaveBeenLastCalledWith("17:30");
    await expect(picker.getByRole("option", { name: "45" })).toHaveAttribute("aria-disabled", "true");
    hours.focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await userEvent.keyboard("{Home}");
    await expect(args.onChange).toHaveBeenLastCalledWith("09:30");
    await userEvent.keyboard("{ArrowUp}");
    await expect(args.onChange).toHaveBeenCalledTimes(2);
  },
};

export const ScrollingAColumnChooses: Story = {
  args: { picker: true, defaultValue: "09:30", min: "06:00" },
  play: async ({ args, canvas, userEvent }) => {
    const picker = await openPicker(canvas, userEvent);
    const hours = picker.getByRole("listbox", { name: "Hours" });
    await waitFor(() => expect(offLens(hours)).toBeLessThan(2));
    const row = (within(hours).getByRole("option", { name: "09" }) as HTMLElement).offsetHeight;
    // Rolled by the wheel (or a finger), the column chooses the row it stops on.
    hours.dispatchEvent(new WheelEvent("wheel", { bubbles: true, deltaY: row * 3 }));
    hours.scrollTo({ top: hours.scrollTop + row * 3, behavior: "instant" });
    await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith("12:30"));
    await waitFor(() => expect(chosen(hours)).toBe("12"));
    // Wait for the picker to finish centering the newly chosen hour before starting another gesture.
    // WebKit can still be animating this scroll after onChange fires, otherwise the next scroll
    // races the component's programmatic alignment and the second gesture may be lost.
    await waitFor(() => expect(offLens(hours)).toBeLessThan(2));
    // Stopped on an hour the limits rule out, it goes to the nearest time that is allowed and rolls back to it.
    hours.dispatchEvent(new WheelEvent("wheel", { bubbles: true, deltaY: -row * 12 }));
    hours.scrollTo({ top: 0, behavior: "instant" });
    await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith("06:00"));
    await waitFor(() => expect(chosen(hours)).toBe("06"));
    await waitFor(() => expect(offLens(hours)).toBeLessThan(2));
  },
};

export const TwelveHour: Story = {
  args: { picker: true, hourCycle: 12, defaultValue: "21:30", name: "start", step: 5 },
  render: (args) => (
    <form data-testid="form">
      <TimeField {...args} />
    </form>
  ),
  play: async ({ args, canvas, userEvent }) => {
    const field = canvas.getByRole("textbox", { name: "Start time" }) as HTMLInputElement;
    const submitted = () => new FormData(canvas.getByTestId("form") as HTMLFormElement).get("start");
    // Shown as 9:30 PM; the value and the form stay 24-hour.
    await expect(field).toHaveValue("9:30 PM");
    await expect(field).toHaveAttribute("placeholder", "H:MM AM");
    await expect(submitted()).toBe("21:30");
    const picker = await openPicker(canvas, userEvent);
    const hours = picker.getByRole("listbox", { name: "Hours" });
    await expect(within(hours).getAllByRole("option")).toHaveLength(12);
    await expect(chosen(hours)).toBe("9");
    await expect(picker.getByRole("radio", { name: "PM" })).toBeChecked();
    // The switch, and A or P from a column, change the half of the day.
    await userEvent.click(picker.getByRole("radio", { name: "AM" }));
    await expect(args.onChange).toHaveBeenLastCalledWith("09:30");
    await expect(field).toHaveValue("9:30 AM");
    hours.focus();
    await userEvent.keyboard("p");
    await expect(args.onChange).toHaveBeenLastCalledWith("21:30");
    // 12 is midnight in the morning and noon in the afternoon.
    await userEvent.click(within(hours).getByRole("option", { name: "12" }));
    await expect(args.onChange).toHaveBeenLastCalledWith("12:30");
    await userEvent.keyboard("a");
    await expect(args.onChange).toHaveBeenLastCalledWith("00:30");
    await expect(field).toHaveValue("12:30 AM");
    await expect(submitted()).toBe("00:30");
    await userEvent.keyboard("{Escape}");
    // Typing reads both forms; Up and Down in AM or PM change the half.
    await userEvent.clear(field);
    await userEvent.type(field, "17:05{Enter}");
    await expect(field).toHaveValue("5:05 PM");
    field.setSelectionRange(7, 7);
    await userEvent.keyboard("{ArrowUp}");
    await expect(args.onChange).toHaveBeenLastCalledWith("05:05");
    await userEvent.clear(field);
    await userEvent.type(field, "nope{Enter}");
    await expect(field).toHaveAccessibleDescription("Enter a time as H:MM AM");
  },
};

export const AHalfOutsideTheLimits: Story = {
  args: { picker: true, hourCycle: 12, defaultValue: "09:00", min: "08:00", max: "11:30" },
  play: async ({ args, canvas, userEvent }) => {
    const picker = await openPicker(canvas, userEvent);
    await expect(picker.getByRole("radio", { name: "PM" })).toBeDisabled();
    picker.getByRole("listbox", { name: "Hours" }).focus();
    await userEvent.keyboard("p");
    await expect(args.onChange).toHaveBeenLastCalledWith("11:30");
  },
};

export const TheDayTrack: Story = {
  tags: ["visual"],
  args: { picker: true, defaultValue: "09:30", step: 15, min: "09:00", max: "17:30" },
  // The picker shows "Now" only while the time of day is inside the limits, so the screenshot would depend on when
  // the test runs. The clock is held at 20:00 (outside them) for this story.
  beforeEach: () => {
    const RealDate = Date;
    class FixedDate extends RealDate {
      constructor(...args: ConstructorParameters<DateConstructor> | []) {
        if (args.length === 0) super(2026, 0, 15, 20, 0, 0);
        else super(...(args as ConstructorParameters<DateConstructor>));
      }
      static override now() {
        return new RealDate(2026, 0, 15, 20, 0, 0).getTime();
      }
    }
    globalThis.Date = FixedDate as DateConstructor;
    return () => {
      globalThis.Date = RealDate;
    };
  },
  play: async ({ args, canvas, userEvent }) => {
    const picker = await openPicker(canvas, userEvent);
    const track = picker.getByRole("slider", { name: "Time of day" });
    await expect(track).toHaveAttribute("aria-valuetext", "09:30");
    // Arrows move by `step`, Page Up and Down by an hour, and the limits stop it.
    track.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(args.onChange).toHaveBeenLastCalledWith("09:45");
    await userEvent.keyboard("{PageUp}");
    await expect(args.onChange).toHaveBeenLastCalledWith("10:45");
    await userEvent.keyboard("{End}");
    await expect(args.onChange).toHaveBeenLastCalledWith("17:30");
    await userEvent.keyboard("{Home}");
    await expect(args.onChange).toHaveBeenLastCalledWith("09:00");
    // A press on the strip jumps there: its middle is midday. The columns follow.
    const box = (track.closest(".cy-slider-track") as HTMLElement).getBoundingClientRect();
    await userEvent.pointer({
      keys: "[MouseLeft]",
      target: track.closest(".cy-slider-track") as HTMLElement,
      coords: { clientX: box.left + box.width / 2, clientY: box.top + box.height / 2 },
    });
    await expect(args.onChange).toHaveBeenLastCalledWith("12:00");
    await expect(chosen(picker.getByRole("listbox", { name: "Hours" }))).toBe("12");
    // With the clock outside the limits there is no "Now" button, whenever the test runs.
    await expect(picker.queryByRole("button", { name: "Now" })).toBeNull();
  },
};

export const WithoutTheDayTrackAndWithSeconds: Story = {
  args: { picker: true, dayTrack: false, seconds: true, defaultValue: "08:00:05" },
  play: async ({ args, canvas, userEvent }) => {
    const picker = await openPicker(canvas, userEvent);
    await expect(picker.queryByRole("slider")).toBeNull();
    const secs = picker.getByRole("listbox", { name: "Seconds" });
    await expect(chosen(secs)).toBe("05");
    await userEvent.click(within(secs).getByRole("option", { name: "07" }));
    await expect(args.onChange).toHaveBeenLastCalledWith("08:00:07");
  },
};

export const NowAndLabels: Story = {
  args: {
    picker: true,
    step: 5,
    labels: {
      open: "Choisir une heure",
      hours: "Heures",
      minutes: "Minutes",
      dayTrack: "Journée",
      now: "Maintenant",
    },
  },
  play: async ({ args, canvas, userEvent }) => {
    const picker = await openPicker(canvas, userEvent, "Choisir une heure");
    await expect(picker.getByRole("listbox", { name: "Heures" })).toBeVisible();
    await expect(picker.getByRole("slider", { name: "Journée" })).toBeVisible();
    // Now: the current time, rounded to the step.
    const before = new Date();
    await userEvent.click(picker.getByRole("button", { name: "Maintenant" }));
    const reported = String((args.onChange as ReturnType<typeof fn>).mock.lastCall?.[0] ?? "");
    const [h, m] = reported.split(":").map(Number);
    const gap = Math.abs((h as number) * 60 + (m as number) - (before.getHours() * 60 + before.getMinutes()));
    await expect(Math.min(gap, 1440 - gap)).toBeLessThanOrEqual(4);
    await expect((m as number) % 5).toBe(0);
  },
};

export const NowIsNotOfferedOutsideTheLimits: Story = {
  args: (() => {
    // A window of one minute, twelve hours from now.
    const far = new Date(Date.now() + 12 * 3600 * 1000);
    const at = `${String(far.getHours()).padStart(2, "0")}:${String(far.getMinutes()).padStart(2, "0")}`;
    return { picker: true, min: at, max: at };
  })(),
  play: async ({ canvas, userEvent }) => {
    const picker = await openPicker(canvas, userEvent);
    await expect(picker.queryByRole("button", { name: "Now" })).toBeNull();
  },
};

export const FollowsThePersonsLocale: Story = {
  render: (args) => (
    <>
      <TimeField {...args} label="Their own" hourCycle="auto" defaultValue="21:30" />
      <TimeField {...args} label="United States" hourCycle="auto" locale="en-US" defaultValue="21:30" />
      <TimeField {...args} label="Germany" hourCycle="auto" locale="de-DE" defaultValue="21:30" />
      <TimeField {...args} label="Pinned" hourCycle={12} locale="de-DE" defaultValue="21:30" />
    </>
  ),
  play: async ({ args, canvas, userEvent }) => {
    // By default the field follows the browser; a `locale` overrides the browser, and a number overrides both.
    const own = new Intl.DateTimeFormat(undefined, { hour: "numeric" }).resolvedOptions().hour12;
    await expect(canvas.getByRole("textbox", { name: "Their own" })).toHaveValue(own ? "9:30 PM" : "21:30");
    await expect(canvas.getByRole("textbox", { name: "United States" })).toHaveValue("9:30 PM");
    await expect(canvas.getByRole("textbox", { name: "Germany" })).toHaveValue("21:30");
    await expect(canvas.getByRole("textbox", { name: "Pinned" })).toHaveValue("9:30 PM");
    // However it is shown, what is reported is 24-hour.
    const us = canvas.getByRole("textbox", { name: "United States" });
    await userEvent.clear(us);
    await userEvent.type(us, "7:05 pm{Enter}");
    await expect(args.onChange).toHaveBeenLastCalledWith("19:05");
    await expect(us).toHaveValue("7:05 PM");
  },
};

export const RightToLeft: Story = {
  args: { picker: true, defaultValue: "09:30" },
  decorators: [(Story) => <div dir="rtl">{Story()}</div>],
  play: async ({ canvas, userEvent }) => {
    const picker = await openPicker(canvas, userEvent);
    // A time reads hours first, left to right, in every language.
    const hours = picker.getByRole("listbox", { name: "Hours" }).getBoundingClientRect();
    const minutes = picker.getByRole("listbox", { name: "Minutes" }).getBoundingClientRect();
    await expect(hours.left).toBeLessThan(minutes.left);
    await userEvent.keyboard("{ArrowRight}");
    await expect(picker.getByRole("listbox", { name: "Minutes" })).toHaveFocus();
  },
};

export const TouchRows: Story = {
  tags: ["touch", "!dev"],
  args: { picker: true, defaultValue: "09:30", hourCycle: 12 },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.pointer({
      keys: "[TouchA]",
      target: canvas.getByRole("button", { name: "Choose a time" }),
    });
    const picker = within(await canvas.findByRole("dialog"));
    const row = within(picker.getByRole("listbox", { name: "Hours" })).getByRole("option", { name: "10" });
    await waitFor(() => expect(row).toBeVisible());
    await expect((row as HTMLElement).offsetHeight).toBeGreaterThanOrEqual(44);
    await expect(
      canvas.getByRole("button", { name: "Choose a time" }).getBoundingClientRect().width,
    ).toBeGreaterThanOrEqual(24);
    await userEvent.pointer({ keys: "[TouchA]", target: row });
    await expect(args.onChange).toHaveBeenLastCalledWith("10:30");
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
  args: { picker: true },
  play: async ({ canvasElement }) => {
    const { clean, hostile } = computeUnderHostileHost(canvasElement, ".cy-text-field-input", [
      "height",
      "font-size",
      "font-variant-numeric",
    ]);
    await expect(hostile).toEqual(clean);
    // Digits line up as they are typed (TextField's --cy-text-field-numeric, set by this field).
    await expect(clean["font-variant-numeric"]).toBe("tabular-nums");
    const picker = computeUnderHostileHost(canvasElement, ".cy-time-field-option", [
      "height",
      "font-size",
      "font-weight",
      "letter-spacing",
      "text-transform",
      "box-sizing",
    ]);
    await expect(picker.hostile).toEqual(picker.clean);
  },
};
