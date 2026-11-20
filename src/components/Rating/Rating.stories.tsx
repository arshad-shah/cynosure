import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { Rating } from "./Rating.js";

const meta = {
  title: "Components/Controls/Rating",
  component: Rating,
  args: { label: "Your rating", defaultValue: 3, onChange: fn(), max: 5, step: 1, size: "md" },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    step: { control: "inline-radio", options: [1, 0.5] },
    showValue: { control: "boolean" },
    readOnly: { control: "boolean" },
    disabled: { control: "boolean" },
    color: { control: "color" },
  },
} satisfies Meta<typeof Rating>;
export default meta;
type Story = StoryObj<typeof meta>;

const starsOf = (root: HTMLElement) => [...root.querySelectorAll<HTMLElement>(".cy-rating-star")];
const fills = (root: HTMLElement) => starsOf(root).map((s) => Number(s.style.getPropertyValue("--_fill")));
/** A point `across` (0 to 1) of the way over star `i`'s drawn shape (x 3.5 to 20.5 of its 24 grid), left to right. */
const point = (root: HTMLElement, i: number, across: number) => {
  const r = (starsOf(root)[i] as HTMLElement).getBoundingClientRect();
  return { x: r.left + (r.width * (3.5 + 17 * across)) / 24, y: r.top + r.height / 2 };
};

/** Read-only: the exact value, read as one image ("Rated 4.3 out of 5"); 4.3 fills 30% of the fifth star. */
export const ReadOnlyDrawsTheExactValue: Story = {
  args: { value: 4.3, readOnly: true, showValue: true },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole("img", { name: "Rated 4.3 out of 5" })).toBeInTheDocument();
    await expect(canvas.queryByRole("slider")).toBeNull();
    await expect(fills(canvasElement)).toEqual([1, 1, 1, 1, 0.3]);
    await expect(canvas.getByText("4.3")).toBeVisible();
  },
};

/** Interactive: an APG slider. Arrows move by `step`, Page Up/Down by a whole star, Home and End to the ends. */
export const KeysStepAndReachTheEnds: Story = {
  args: { step: 0.5, defaultValue: 3 },
  play: async ({ args, canvas, userEvent }) => {
    const slider = canvas.getByRole("slider", { name: "Your rating" });
    await userEvent.tab();
    await expect(slider).toHaveFocus();
    await expect(slider).toHaveAttribute("aria-valuenow", "3");
    await userEvent.keyboard("{ArrowRight}");
    await expect(slider).toHaveAttribute("aria-valuenow", "3.5");
    await expect(slider).toHaveAttribute("aria-valuetext", "3.5 out of 5");
    await expect(args.onChange).toHaveBeenLastCalledWith(3.5);
    await userEvent.keyboard("{PageDown}");
    await expect(slider).toHaveAttribute("aria-valuenow", "2.5");
    await userEvent.keyboard("{End}");
    await expect(slider).toHaveAttribute("aria-valuenow", "5");
    await userEvent.keyboard("{Home}");
    // The least a person can give is one step.
    await expect(slider).toHaveAttribute("aria-valuenow", "0.5");
  },
};

/** Hover previews exactly where the pointer is over a star (the gaps and the value text do not count); a click sets it. */
export const HoverPreviewsPreciselyAndClickSets: Story = {
  args: { step: 0.5, defaultValue: 1, showValue: true },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const slider = canvas.getByRole("slider");
    const at = async (i: number, across: number) => {
      const { x, y } = point(canvasElement, i, across);
      await userEvent.pointer({ target: slider, coords: { clientX: x, clientY: y } });
    };
    await at(2, 0.25);
    await waitFor(() => expect(fills(canvasElement)).toEqual([1, 1, 0.5, 0, 0]));
    await at(2, 0.75);
    await waitFor(() => expect(fills(canvasElement)).toEqual([1, 1, 1, 0, 0]));
    // Past the last star the preview stops at the maximum.
    const last = (starsOf(canvasElement).at(-1) as HTMLElement).getBoundingClientRect();
    await userEvent.pointer({
      target: slider,
      coords: { clientX: last.right + 40, clientY: last.top + last.height / 2 },
    });
    await waitFor(() => expect(fills(canvasElement)).toEqual([1, 1, 1, 1, 1]));
    await at(3, 0.25);
    const press = point(canvasElement, 3, 0.25);
    await userEvent.pointer({
      keys: "[MouseLeft]",
      target: slider,
      coords: { clientX: press.x, clientY: press.y },
    });
    await expect(args.onChange).toHaveBeenLastCalledWith(3.5);
    await expect(slider).toHaveAttribute("aria-valuenow", "3.5");
    // Leaving shows the value again.
    await userEvent.unhover(slider);
    await waitFor(() => expect(fills(canvasElement)).toEqual([1, 1, 1, 0.5, 0]));
  },
};

/** A tap sets the rating where the finger lands. */
export const TapSets: Story = {
  args: { defaultValue: 1 },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const { x, y } = point(canvasElement, 3, 0.75);
    await userEvent.pointer({
      keys: "[TouchA]",
      target: canvas.getByRole("slider"),
      coords: { clientX: x, clientY: y },
    });
    await expect(args.onChange).toHaveBeenLastCalledWith(4);
    await expect(fills(canvasElement)).toEqual([1, 1, 1, 1, 0]);
  },
};

/** Disabled: no focus stop, no change on keys, hover or click. */
export const DisabledIgnoresInput: Story = {
  args: { disabled: true, defaultValue: 2 },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const slider = canvas.getByRole("slider");
    await expect(slider).toHaveAttribute("aria-disabled", "true");
    await expect(slider).not.toHaveAttribute("tabindex", "0");
    const press = point(canvasElement, 4, 0.9);
    await userEvent.pointer({
      keys: "[MouseLeft]",
      target: slider,
      coords: { clientX: press.x, clientY: press.y },
    });
    await expect(args.onChange).not.toHaveBeenCalled();
    await expect(fills(canvasElement)).toEqual([1, 1, 0, 0, 0]);
  },
};

/** Right to left: the stars fill from the right, the pointer reads from the right, Right arrow takes away. */
export const RightToLeft: Story = {
  args: { defaultValue: 2 },
  render: (args) => (
    <div dir="rtl">
      <Rating {...args} />
    </div>
  ),
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const stars = starsOf(canvasElement);
    const first = (stars[0] as HTMLElement).getBoundingClientRect();
    const second = (stars[1] as HTMLElement).getBoundingClientRect();
    await expect(first.left).toBeGreaterThan(second.left);
    // 75% of the way across the first star from its right edge is the first star.
    const r = first;
    await userEvent.pointer({
      keys: "[MouseLeft]",
      target: canvas.getByRole("slider"),
      coords: { clientX: r.right - (r.width * (3.5 + 17 * 0.75)) / 24, clientY: r.top + r.height / 2 },
    });
    await expect(args.onChange).toHaveBeenLastCalledWith(1);
    canvas.getByRole("slider").focus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(args.onChange).toHaveBeenLastCalledWith(2);
  },
};

/** With `name`, the value submits with a form (and resets with it). */
export const SubmitsWithAForm: Story = {
  args: { name: "stars", defaultValue: 4 },
  render: (args) => (
    <form aria-label="Review">
      <Rating {...args} />
    </form>
  ),
  play: async ({ canvas }) => {
    const form = canvas.getByRole("form", { name: "Review" }) as HTMLFormElement;
    await expect(new FormData(form).get("stars")).toBe("4");
  },
};

/** A form reset puts back `defaultValue` (without reporting a change); a disabled rating is not submitted. */
export const FormResetAndDisabled: Story = {
  args: { name: "stars", defaultValue: 2 },
  render: (args) => (
    <form aria-label="Review">
      <Rating {...args} />
      <Rating label="Locked" name="locked" defaultValue={5} disabled />
    </form>
  ),
  play: async ({ args, canvas, userEvent }) => {
    const form = canvas.getByRole("form", { name: "Review" }) as HTMLFormElement;
    await expect(new FormData(form).get("locked")).toBeNull();
    canvas.getByRole("slider", { name: "Your rating" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(new FormData(form).get("stars")).toBe("3");
    form.reset();
    await waitFor(() => expect(new FormData(form).get("stars")).toBe("2"));
    await expect(canvas.getByRole("slider", { name: "Your rating" })).toHaveAttribute("aria-valuenow", "2");
    await expect(args.onChange).toHaveBeenCalledTimes(1);
  },
};

/** Controlled: the stars follow `value`. */
export const Controlled: Story = {
  render: function Render(args) {
    const [v, setV] = useState(2);
    return <Rating {...args} value={v} onChange={setV} showValue />;
  },
  play: async ({ canvas, userEvent }) => {
    canvas.getByRole("slider").focus();
    await userEvent.keyboard("{ArrowUp}");
    await expect(canvas.getByRole("slider")).toHaveAttribute("aria-valuenow", "3");
    await expect(canvas.getByText("3")).toBeVisible();
  },
};

/** On a touch screen the row of stars is at least 44px tall, so a finger lands on it. */
export const CoarsePointerHitArea: Story = {
  tags: ["touch", "!dev"],
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("slider").getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
  },
};

export const StableUnderHostileHost: Story = {
  args: { value: 3.5, readOnly: true },
  play: async ({ canvasElement }) => {
    // A host page that sizes every svg and recolours every element changes neither the stars' size nor their colour.
    const stars = computeUnderHostileHost(canvasElement, ".cy-rating-star svg", ["width", "height"]);
    await expect(stars.hostile).toEqual(stars.clean);
    const fill = computeUnderHostileHost(canvasElement, ".cy-rating-filled", ["color"]);
    await expect(fill.hostile).toEqual(fill.clean);
  },
};
