import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, waitFor } from "storybook/test";
import { contrast } from "../../test/color.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { CynosureTheme } from "../../theme/CynosureTheme.js";
import { createTheme } from "../../tokens/index.js";
import { Button } from "../Button/Button.js";
import { Stack } from "../Stack/Stack.js";
import { ProgressBar } from "./ProgressBar.js";

const TONES = ["accent", "success", "warning", "danger", "info", "neutral"] as const;

const meta = {
  title: "Components/ProgressBar",
  component: ProgressBar,
  args: { label: "Uploading 3 files", value: 40, max: 100, size: "md", tone: "accent", showValue: true },
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100 } },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    tone: { control: "select", options: TONES },
    indeterminate: { control: "boolean" },
    showValue: { control: "boolean" },
    labelHidden: { control: "boolean" },
  },
  decorators: [(Story) => <div style={{ maxWidth: 420 }}>{Story()}</div>],
} satisfies Meta<typeof ProgressBar>;
export default meta;
type Story = StoryObj<typeof meta>;

const bar = (canvasElement: HTMLElement) =>
  canvasElement.querySelector(".cy-progress-bar-track") as HTMLElement;
const fillRatio = (canvasElement: HTMLElement) => {
  const track = bar(canvasElement).getBoundingClientRect();
  const fill = (canvasElement.querySelector(".cy-progress-bar-fill") as HTMLElement).getBoundingClientRect();
  return fill.width / track.width;
};

export const ReportsItsValue: Story = {
  play: async ({ canvas, canvasElement }) => {
    const progress = canvas.getByRole("progressbar", { name: "Uploading 3 files" });
    await expect(progress).toHaveAttribute("aria-valuenow", "40");
    await expect(progress).toHaveAttribute("aria-valuemin", "0");
    await expect(progress).toHaveAttribute("aria-valuemax", "100");
    await expect(progress).toHaveAttribute("aria-valuetext", "40%");
    await expect(canvas.getByText("40%")).toBeVisible();
    await waitFor(() => expect(fillRatio(canvasElement)).toBeCloseTo(0.4, 2));
  },
};

export const UpdatesAndClamps: Story = {
  render: (args) => {
    function Uploader() {
      const [value, setValue] = useState(20);
      return (
        <Stack gap="4">
          <ProgressBar {...args} value={value} max={50} />
          <Button onClick={() => setValue(35)}>Halfway-ish</Button>
          <Button onClick={() => setValue(80)}>Too far</Button>
          <Button onClick={() => setValue(-5)}>Below zero</Button>
        </Stack>
      );
    }
    return <Uploader />;
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const progress = canvas.getByRole("progressbar");
    await expect(progress).toHaveAttribute("aria-valuetext", "40%");
    await userEvent.click(canvas.getByRole("button", { name: "Halfway-ish" }));
    await expect(progress).toHaveAttribute("aria-valuenow", "35");
    await waitFor(() => expect(fillRatio(canvasElement)).toBeCloseTo(0.7, 2));
    // Out-of-range values are clamped, never drawn past the track.
    await userEvent.click(canvas.getByRole("button", { name: "Too far" }));
    await expect(progress).toHaveAttribute("aria-valuenow", "50");
    await waitFor(() => expect(fillRatio(canvasElement)).toBeCloseTo(1, 2));
    await userEvent.click(canvas.getByRole("button", { name: "Below zero" }));
    await expect(progress).toHaveAttribute("aria-valuenow", "0");
    await waitFor(() => expect(fillRatio(canvasElement)).toBeCloseTo(0, 2));
  },
};

export const Indeterminate: Story = {
  args: { value: undefined, label: "Preparing export" },
  play: async ({ canvas, canvasElement }) => {
    const progress = canvas.getByRole("progressbar", { name: "Preparing export" });
    // Unknown amount: no current value, and busy.
    await expect(progress).not.toHaveAttribute("aria-valuenow");
    await expect(progress).not.toHaveAttribute("aria-valuetext");
    await expect(progress).toHaveAttribute("aria-busy", "true");
    await expect(canvas.queryByText("%", { exact: false })).toBeNull();
    const fill = canvasElement.querySelector(".cy-progress-bar-fill") as HTMLElement;
    await expect(fill.getAnimations().length).toBeGreaterThan(0);
  },
};

export const IndeterminateStaysStillUnderReducedMotion: Story = {
  render: (args) => (
    <CynosureTheme theme={createTheme({ motion: "reduced" })}>
      <ProgressBar {...args} indeterminate label="Preparing export" />
    </CynosureTheme>
  ),
  play: async ({ canvasElement }) => {
    const fill = canvasElement.querySelector(".cy-progress-bar-fill") as HTMLElement;
    await expect(Number.parseFloat(getComputedStyle(fill).animationDuration)).toBe(0);
    // Still visible: a segment in the middle of the track.
    const track = bar(canvasElement).getBoundingClientRect();
    const box = fill.getBoundingClientRect();
    await expect(box.width).toBeGreaterThan(0);
    await expect(box.left).toBeGreaterThan(track.left);
    await expect(box.right).toBeLessThan(track.right);
  },
};

export const LabelsAndHiddenLabel: Story = {
  args: {
    value: 3,
    max: 12,
    labelHidden: true,
    label: "Steps completed",
    labels: { value: (value, max) => `${value} of ${max} steps` },
  },
  play: async ({ canvas }) => {
    const progress = canvas.getByRole("progressbar", { name: "Steps completed" });
    await expect(progress).toHaveAttribute("aria-valuetext", "3 of 12 steps");
    await expect(canvas.getByText("3 of 12 steps")).toBeVisible();
    // The label is not shown, only announced.
    await expect(canvas.queryByText("Steps completed")).toBeNull();
  },
};

export const VisibleInEveryToneAndMode: Story = {
  render: (args) => (
    <Stack gap="6">
      {(["light", "dark"] as const).map((mode) => (
        <CynosureTheme key={mode} mode={mode}>
          <div style={{ background: "var(--cy-color-surface)", padding: 8 }}>
            <Stack gap="3">
              {TONES.map((tone) => (
                <ProgressBar key={tone} {...args} tone={tone} label={`${mode} ${tone}`} value={60} />
              ))}
            </Stack>
          </div>
        </CynosureTheme>
      ))}
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    // The fill stands out from its track (non-text contrast, 3:1).
    for (const root of canvasElement.querySelectorAll(".cy-progress-bar")) {
      const name = root.querySelector(".cy-progress-bar-label")?.textContent;
      const fill = getComputedStyle(root.querySelector(".cy-progress-bar-fill") as Element).backgroundColor;
      const track = getComputedStyle(root.querySelector(".cy-progress-bar-track") as Element).backgroundColor;
      await expect({ name, visible: contrast(fill, track) >= 3 }).toEqual({ name, visible: true });
    }
  },
};

export const FillsFromTheStartInRightToLeft: Story = {
  render: (args) => (
    <div dir="rtl">
      <ProgressBar {...args} value={25} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const track = bar(canvasElement).getBoundingClientRect();
    const fill = (
      canvasElement.querySelector(".cy-progress-bar-fill") as HTMLElement
    ).getBoundingClientRect();
    await waitFor(() => expect(Math.round(fill.right)).toBe(Math.round(track.right)));
  },
};

export const SizesChangeThickness: Story = {
  render: (args) => (
    <Stack gap="4">
      {(["sm", "md", "lg"] as const).map((size) => (
        <ProgressBar key={size} {...args} size={size} label={size} />
      ))}
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const heights = [...canvasElement.querySelectorAll(".cy-progress-bar-track")].map(
      (t) => t.getBoundingClientRect().height,
    );
    await expect(heights[0]).toBeLessThan(heights[1] as number);
    await expect(heights[1]).toBeLessThan(heights[2] as number);
  },
};

export const SegmentsForTimings: Story = {
  args: {
    label: "Request timing",
    labelHidden: true,
    max: 200,
    offset: 20,
    marker: 150,
    markerLabel: "budget 150 ms",
    segments: [
      { value: 12, label: "DNS", tone: "info" },
      { value: 30, label: "Connect", color: "rgb(194 65 12)" },
      { value: 80, label: "Wait", tone: "warning" },
      { value: 18, label: "Download", tone: "success" },
    ],
  },
  play: async ({ canvas, canvasElement }) => {
    const bar = canvas.getByRole("progressbar", { name: "Request timing" });
    // Read as its parts, with the marker; the value is where the last part ends.
    await expect(bar).toHaveAttribute(
      "aria-valuetext",
      "DNS 12, Connect 30, Wait 80, Download 18, budget 150 ms",
    );
    await expect(bar).toHaveAttribute("aria-valuenow", "160");
    const parts = [...canvasElement.querySelectorAll<HTMLElement>(".cy-progress-bar-segment")];
    await expect(parts).toHaveLength(4);
    const track = bar.getBoundingClientRect();
    // The first part starts at the offset (20 of 200), and each starts where the last ended.
    await expect((parts[0] as HTMLElement).getBoundingClientRect().left - track.left).toBeCloseTo(
      track.width * 0.1,
      0,
    );
    await expect((parts[1] as HTMLElement).getBoundingClientRect().left).toBeCloseTo(
      (parts[0] as HTMLElement).getBoundingClientRect().right,
      0,
    );
    await expect(getComputedStyle(parts[1] as HTMLElement).backgroundColor).toBe("rgb(194, 65, 12)");
    const marker = canvasElement.querySelector(".cy-progress-bar-marker") as HTMLElement;
    await expect(
      marker.getBoundingClientRect().left + marker.getBoundingClientRect().width / 2 - track.left,
    ).toBeCloseTo(track.width * 0.75, 0);
  },
};

export const AMarkerOnAPlainBar: Story = {
  args: { label: "Upload", value: 40, marker: 75 },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("progressbar")).toHaveAttribute("aria-valuetext", "40%, marker at 75%");
  },
};

export const SegmentsTakeTheBarsTone: Story = {
  args: { label: "Steps", tone: "success", max: 10, segments: [{ value: 4, label: "Done" }] },
  play: async ({ canvas, canvasElement }) => {
    const part = canvasElement.querySelector(".cy-progress-bar-segment") as HTMLElement;
    await expect(part).toHaveAttribute("data-tone", "success");
    await expect(canvas.getByRole("progressbar")).toHaveAttribute("aria-valuetext", "Done 4");
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    for (const selector of [".cy-progress-bar", ".cy-progress-bar-label", ".cy-progress-bar-track"]) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, [
        "display",
        "height",
        "font-size",
        "box-sizing",
        "color",
        "text-transform",
        "letter-spacing",
      ]);
      await expect(hostile).toEqual(clean);
    }
  },
};

export const DefaultsAndBadInput: Story = {
  render: () => (
    <Stack gap="4">
      <ProgressBar label="Plain" value={30} className="host-progress" />
      <ProgressBar label="Zero max" value={50} max={0} />
      <ProgressBar label="Not a number" value={Number.NaN} labelHidden />
    </Stack>
  ),
  play: async ({ canvas, canvasElement }) => {
    // Defaults: accent tone, md size, no value text; className is for layout.
    const plain = canvasElement.querySelector(".host-progress") as HTMLElement;
    await expect(plain).toHaveAttribute("data-tone", "accent");
    await expect(plain).toHaveAttribute("data-size", "md");
    await expect(canvas.queryByText("30%")).toBeNull();
    // A max of 0 falls back to 100 instead of dividing by zero.
    await expect(canvas.getByRole("progressbar", { name: "Zero max" })).toHaveAttribute(
      "aria-valuemax",
      "100",
    );
    // NaN is treated as unknown (indeterminate), and a hidden label leaves no empty header behind.
    const nan = canvas.getByRole("progressbar", { name: "Not a number" });
    await expect(nan).not.toHaveAttribute("aria-valuenow");
    await expect(nan.closest(".cy-progress-bar")?.querySelector(".cy-progress-bar-head")).toBeNull();
  },
};
