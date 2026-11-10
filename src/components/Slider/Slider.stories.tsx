import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, waitFor } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { Slider, type SliderProps } from "./Slider.js";

const meta = {
  title: "Components/Slider",
  component: Slider,
  args: {
    label: "Volume",
    defaultValue: 40,
    min: 0,
    max: 100,
    step: 1,
    size: "md",
    orientation: "horizontal",
    showValue: true,
    onChange: fn(),
    onCommit: fn(),
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    disabled: { control: "boolean" },
    showValue: { control: "boolean" },
    labelHidden: { control: "boolean" },
    step: { control: "number" },
  },
  decorators: [(Story) => <div style={{ maxWidth: 360, padding: 8 }}>{Story()}</div>],
} satisfies Meta<typeof Slider>;
export default meta;
type Story = StoryObj<typeof meta>;

const trackOf = (canvasElement: HTMLElement) =>
  canvasElement.querySelector(".cy-slider-track") as HTMLElement;

/** Presses, moves and releases a pointer on the track at fractions of its length (0 = start, 1 = end). */
function dragTrack(
  canvasElement: HTMLElement,
  from: number,
  to: number,
  pointerType = "mouse",
  release = true,
) {
  const track = trackOf(canvasElement);
  const box = track.getBoundingClientRect();
  const vertical = canvasElement.querySelector('[data-orientation="vertical"]');
  const at = (f: number) =>
    vertical
      ? { clientX: box.left + box.width / 2, clientY: box.bottom - f * box.height }
      : { clientX: box.left + f * box.width, clientY: box.top + box.height / 2 };
  const init = {
    bubbles: true,
    cancelable: true,
    pointerId: 7,
    pointerType,
    button: 0,
    buttons: 1,
    isPrimary: true,
  };
  track.dispatchEvent(new PointerEvent("pointerdown", { ...init, ...at(from) }));
  track.dispatchEvent(new PointerEvent("pointermove", { ...init, ...at((from + to) / 2) }));
  track.dispatchEvent(new PointerEvent("pointermove", { ...init, ...at(to) }));
  if (release) track.dispatchEvent(new PointerEvent("pointerup", { ...init, ...at(to), buttons: 0 }));
}

export const EscapeCancelsADrag: Story = {
  play: async ({ args, canvas, canvasElement }) => {
    const thumb = canvas.getByRole("slider", { name: "Volume" });
    dragTrack(canvasElement, 0.4, 0.9, "mouse", false);
    await waitFor(() => expect(thumb).toHaveAttribute("aria-valuenow", "90"));
    // Escape before letting go puts it back where the drag began.
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    await waitFor(() => expect(thumb).toHaveAttribute("aria-valuenow", "40"));
    await expect(args.onCommit).toHaveBeenLastCalledWith(40);
  },
};

export const KeyboardFollowsTheApgSlider: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const thumb = canvas.getByRole("slider", { name: "Volume" });
    await expect(thumb).toHaveAttribute("aria-valuenow", "40");
    await expect(thumb).toHaveAttribute("aria-valuemin", "0");
    await expect(thumb).toHaveAttribute("aria-valuemax", "100");
    await expect(thumb).toHaveAttribute("aria-orientation", "horizontal");
    await userEvent.tab();
    await expect(thumb).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(thumb).toHaveAttribute("aria-valuenow", "41");
    await userEvent.keyboard("{ArrowUp}");
    await expect(thumb).toHaveAttribute("aria-valuenow", "42");
    await userEvent.keyboard("{ArrowLeft}{ArrowDown}");
    await expect(thumb).toHaveAttribute("aria-valuenow", "40");
    // Page keys move a tenth of the range; Home and End go to the ends.
    await userEvent.keyboard("{PageUp}");
    await expect(thumb).toHaveAttribute("aria-valuenow", "50");
    await userEvent.keyboard("{PageDown}");
    await expect(thumb).toHaveAttribute("aria-valuenow", "40");
    await userEvent.keyboard("{End}");
    await expect(thumb).toHaveAttribute("aria-valuenow", "100");
    await userEvent.keyboard("{ArrowRight}");
    await expect(thumb).toHaveAttribute("aria-valuenow", "100");
    await userEvent.keyboard("{Home}");
    await expect(thumb).toHaveAttribute("aria-valuenow", "0");
    await expect(args.onChange).toHaveBeenLastCalledWith(0);
    await expect(args.onCommit).toHaveBeenLastCalledWith(0);
    // The value is shown next to the label.
    await expect(canvas.getByText("0", { selector: ".cy-slider-value" })).toBeVisible();
    // Shift+arrows take the big step, like Page Up.
    await userEvent.keyboard("{Shift>}{ArrowRight}{/Shift}");
    await expect(thumb).toHaveAttribute("aria-valuenow", "10");
  },
};

export const PointerDragsAndCommitsOnRelease: Story = {
  play: async ({ args, canvas, canvasElement }) => {
    const thumb = canvas.getByRole("slider", { name: "Volume" });
    dragTrack(canvasElement, 0.1, 0.75);
    await waitFor(() => expect(thumb).toHaveAttribute("aria-valuenow", "75"));
    // onChange follows the drag; onCommit fires once, on release.
    await expect((args.onChange as ReturnType<typeof fn>).mock.calls.length).toBeGreaterThanOrEqual(2);
    await expect(args.onCommit).toHaveBeenCalledTimes(1);
    await expect(args.onCommit).toHaveBeenCalledWith(75);
    await expect(thumb).toHaveFocus();
    // The thumb sits at its value along the track.
    const track = trackOf(canvasElement).getBoundingClientRect();
    const box = thumb.getBoundingClientRect();
    await expect(Math.abs(box.left + box.width / 2 - (track.left + 0.75 * track.width))).toBeLessThanOrEqual(
      1,
    );
    // The fill starts where the drawn bar starts (half a thumb before the first value), leaving no grey gap.
    const fill = (canvasElement.querySelector(".cy-slider-fill") as HTMLElement).getBoundingClientRect();
    await expect(Math.abs(fill.left - (track.left - box.width / 2))).toBeLessThanOrEqual(1);
  },
};

export const StepsAndDecimals: Story = {
  args: { min: 0, max: 1, step: 0.05, defaultValue: 0.5, label: "Opacity" },
  play: async ({ canvas, userEvent }) => {
    const thumb = canvas.getByRole("slider", { name: "Opacity" });
    thumb.focus();
    await userEvent.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}");
    // No floating-point drift (0.65, not 0.6500000000000001).
    await expect(thumb).toHaveAttribute("aria-valuenow", "0.65");
  },
};

export const RangeThumbsNeverCross: Story = {
  args: { label: "Price", defaultValue: [20, 60], showValue: true },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    await expect(canvas.getByRole("group", { name: "Price" })).toBeInTheDocument();
    const low = canvas.getByRole("slider", { name: "Price, minimum" });
    const high = canvas.getByRole("slider", { name: "Price, maximum" });
    // Each thumb's limits are the other thumb's value.
    await expect(low).toHaveAttribute("aria-valuemax", "60");
    await expect(high).toHaveAttribute("aria-valuemin", "20");
    low.focus();
    await userEvent.keyboard("{End}");
    await expect(low).toHaveAttribute("aria-valuenow", "60");
    await expect(args.onChange).toHaveBeenLastCalledWith([60, 60]);
    high.focus();
    await userEvent.keyboard("{Home}");
    await expect(high).toHaveAttribute("aria-valuenow", "60");
    // A press on the track moves the nearest thumb; on a tie, the one that can move that way.
    dragTrack(canvasElement, 0.9, 0.9);
    await waitFor(() => expect(high).toHaveAttribute("aria-valuenow", "90"));
    dragTrack(canvasElement, 0.1, 0.1);
    await waitFor(() => expect(low).toHaveAttribute("aria-valuenow", "10"));
    await expect(canvas.getByText("10 – 90")).toBeVisible();
  },
};

export const RightToLeft: Story = {
  render: (args: SliderProps) => (
    <div dir="rtl">
      <Slider {...args} />
    </div>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    const thumb = canvas.getByRole("slider", { name: "Volume" });
    // The start is on the right: right arrow moves towards the start, so it lowers the value.
    thumb.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(thumb).toHaveAttribute("aria-valuenow", "39");
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    await expect(thumb).toHaveAttribute("aria-valuenow", "41");
    // A press near the right edge is near the minimum.
    dragTrack(canvasElement, 0.9, 0.9);
    await waitFor(() => expect(thumb).toHaveAttribute("aria-valuenow", "10"));
  },
};

export const Vertical: Story = {
  args: { orientation: "vertical", label: "Level" },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const thumb = canvas.getByRole("slider", { name: "Level" });
    await expect(thumb).toHaveAttribute("aria-orientation", "vertical");
    const track = trackOf(canvasElement).getBoundingClientRect();
    await expect(track.height).toBeGreaterThan(track.width);
    thumb.focus();
    await userEvent.keyboard("{ArrowUp}");
    await expect(thumb).toHaveAttribute("aria-valuenow", "41");
    // Values run bottom to top.
    dragTrack(canvasElement, 0.8, 0.8);
    await waitFor(() => expect(thumb).toHaveAttribute("aria-valuenow", "80"));
    const box = thumb.getBoundingClientRect();
    await expect(
      Math.abs(box.top + box.height / 2 - (track.bottom - 0.8 * track.height)),
    ).toBeLessThanOrEqual(1);
  },
};

export const FormValueAndReset: Story = {
  args: { name: "volume", defaultValue: 30 },
  render: (args: SliderProps) => (
    <form data-testid="form">
      <Slider {...args} />
      <Slider label="Range" name="range" defaultValue={[10, 20]} />
    </form>
  ),
  play: async ({ canvas, userEvent }) => {
    const form = canvas.getByTestId("form") as HTMLFormElement;
    await expect(new FormData(form).get("volume")).toBe("30");
    await expect(new FormData(form).getAll("range")).toEqual(["10", "20"]);
    canvas.getByRole("slider", { name: "Volume" }).focus();
    await userEvent.keyboard("{End}");
    await expect(new FormData(form).get("volume")).toBe("100");
    form.reset();
    await waitFor(() =>
      expect(canvas.getByRole("slider", { name: "Volume" })).toHaveAttribute("aria-valuenow", "30"),
    );
    await expect(new FormData(form).get("volume")).toBe("30");
  },
};

export const Disabled: Story = {
  args: { disabled: true, name: "volume" },
  render: (args: SliderProps) => (
    <form data-testid="form">
      <Slider {...args} />
    </form>
  ),
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const thumb = canvas.getByRole("slider", { name: "Volume" });
    await expect(thumb).toHaveAttribute("aria-disabled", "true");
    await expect(thumb).not.toHaveAttribute("tabindex");
    await userEvent.tab();
    await expect(thumb).not.toHaveFocus();
    dragTrack(canvasElement, 0.1, 0.9);
    await expect(thumb).toHaveAttribute("aria-valuenow", "40");
    await expect(args.onChange).not.toHaveBeenCalled();
    // Disabled values are not submitted, like native controls.
    await expect(new FormData(canvas.getByTestId("form") as HTMLFormElement).get("volume")).toBeNull();
  },
};

export const LabelsMarksAndHiddenLabel: Story = {
  args: {
    label: "Quality",
    labelHidden: true,
    defaultValue: 2,
    min: 1,
    max: 3,
    marks: [
      { value: 1, label: "Low" },
      { value: 2, label: "Medium" },
      { value: 3, label: "High" },
    ],
    labels: { value: (v) => ["Low", "Medium", "High"][v - 1] ?? String(v) },
  },
  play: async ({ canvas, canvasElement }) => {
    const thumb = canvas.getByRole("slider", { name: "Quality" });
    await expect(thumb).toHaveAttribute("aria-valuetext", "Medium");
    await expect(canvas.queryByText("Quality")).toBeNull();
    // Marks are drawn but decorative; their labels sit under the track without overlapping it.
    const marks = canvasElement.querySelectorAll(".cy-slider-mark");
    await expect(marks).toHaveLength(3);
    for (const mark of marks) await expect(mark).toHaveAttribute("aria-hidden", "true");
    const label = canvas.getByText("High").getBoundingClientRect();
    await expect(label.top).toBeGreaterThanOrEqual(trackOf(canvasElement).getBoundingClientRect().bottom - 1);
  },
};

export const ControlledStaysWithTheParent: Story = {
  args: { value: 40 },
  play: async ({ args, canvas, userEvent }) => {
    const thumb = canvas.getByRole("slider", { name: "Volume" });
    thumb.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(args.onChange).toHaveBeenCalledWith(41);
    // The parent did not update `value`, so the slider stays where it was told.
    await expect(thumb).toHaveAttribute("aria-valuenow", "40");
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    for (const selector of [".cy-slider", ".cy-slider-track", ".cy-slider-thumb", ".cy-slider-label"]) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, [
        "display",
        "width",
        "height",
        "font-size",
        "box-sizing",
        "border-top-width",
        "text-transform",
      ]);
      await expect(hostile).toEqual(clean);
    }
  },
};

export const TouchDragsWithoutScrolling: Story = {
  tags: ["touch", "!dev"],
  play: async ({ canvas, canvasElement }) => {
    const thumb = canvas.getByRole("slider", { name: "Volume" });
    // 44px hit area on touch, invisibly: the thumb itself keeps its size.
    const hit = getComputedStyle(thumb, "::before");
    await expect(Number.parseFloat(hit.height)).toBeGreaterThanOrEqual(44);
    await expect(Math.round(thumb.getBoundingClientRect().height)).toBe(16);
    // Horizontal drags belong to the slider; vertical ones still scroll the page.
    await expect(getComputedStyle(trackOf(canvasElement)).touchAction).toBe("pan-y");
    dragTrack(canvasElement, 0.2, 0.6, "touch");
    await waitFor(() => expect(thumb).toHaveAttribute("aria-valuenow", "60"));
  },
};
