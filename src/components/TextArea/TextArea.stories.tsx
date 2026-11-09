import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { TextArea } from "./TextArea.js";

const meta = {
  title: "Components/TextArea",
  component: TextArea,
  args: { label: "Notes", onChange: fn(), rows: 2, maxRows: 4, size: "md" },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    variant: { control: "inline-radio", options: ["outline", "soft"] },
    rows: { control: { type: "number", min: 1, max: 10 } },
    maxRows: { control: { type: "number", min: 1, max: 30 } },
    maxLength: { control: { type: "number", min: 1 } },
    showCount: { control: "boolean" },
    label: { control: "text" },
    description: { control: "text" },
    error: { control: "text" },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
  },
} satisfies Meta<typeof TextArea>;
export default meta;
type Story = StoryObj<typeof meta>;

export const GrowsThenScrolls: Story = {
  tags: ["visual"],
  play: async ({ canvas, userEvent }) => {
    const area = canvas.getByRole("textbox", { name: "Notes" });
    const start = area.getBoundingClientRect().height;
    await userEvent.type(area, "one{enter}two{enter}three");
    const grown = area.getBoundingClientRect().height;
    await expect(grown).toBeGreaterThan(start);
    await userEvent.type(area, "{enter}4{enter}5{enter}6{enter}7{enter}8");
    const capped = area.getBoundingClientRect().height;
    await expect(capped).toBeGreaterThan(grown);
    await userEvent.type(area, "{enter}9{enter}10");
    await expect(area.getBoundingClientRect().height).toBe(capped);
    await expect(area.scrollHeight).toBeGreaterThan(area.clientHeight);
  },
};

export const CounterAndMaxLength: Story = {
  args: { maxLength: 20, showCount: true },
  play: async ({ canvas, args, userEvent }) => {
    const area = canvas.getByRole("textbox", { name: "Notes" });
    await userEvent.type(area, "hello");
    const counter = canvasElementCounter(area);
    await expect(counter).toHaveTextContent("5 / 20");
    await expect(counter).toHaveAttribute("aria-live", "polite");
    await expect(area.getAttribute("aria-describedby")).toContain(counter.id);
    await userEvent.type(area, " world, this is far too long");
    await expect((area as HTMLTextAreaElement).value).toHaveLength(20);
    await expect(args.onChange).toHaveBeenLastCalledWith((area as HTMLTextAreaElement).value);
  },
};

const canvasElementCounter = (area: HTMLElement) =>
  area.closest(".cy-field")?.querySelector(".cy-text-area-count") as HTMLElement;

export const CounterLabelsOverride: Story = {
  args: {
    maxLength: 10,
    showCount: true,
    labels: { count: (n: number, max?: number) => `${(max ?? 0) - n} left` },
  },
  play: async ({ canvas, userEvent }) => {
    const area = canvas.getByRole("textbox", { name: "Notes" });
    await userEvent.type(area, "abc");
    await expect(canvasElementCounter(area)).toHaveTextContent("7 left");
  },
};

export const FormResetRestoresValueCountAndHeight: Story = {
  render: () => (
    <form data-testid="form">
      <TextArea label="Notes" name="notes" defaultValue="a" rows={2} maxRows={6} maxLength={50} showCount />
    </form>
  ),
  play: async ({ canvas, userEvent }) => {
    const form = canvas.getByTestId("form") as HTMLFormElement;
    const area = canvas.getByRole("textbox", { name: "Notes" });
    const start = area.getBoundingClientRect().height;
    await userEvent.type(area, "{enter}b{enter}c{enter}d");
    await expect(new FormData(form).get("notes")).toBe("a\nb\nc\nd");
    form.reset();
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    await expect(area).toHaveValue("a");
    await expect(canvasElementCounter(area)).toHaveTextContent("1 / 50");
    await expect(area.getBoundingClientRect().height).toBe(start);
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    const { clean, hostile } = computeUnderHostileHost(canvasElement, "textarea", [
      "font-size",
      "line-height",
      "padding-top",
      "border-top-width",
      "color",
      "height",
    ]);
    await expect(hostile).toEqual(clean);
  },
};

function ControlledArea() {
  const [value, setValue] = useState("abc");
  return (
    <TextArea
      label="Notes"
      value={value}
      onChange={(v) => setValue(v.toUpperCase())}
      showCount
      disabled={false}
      required
    />
  );
}

export const ControlledWithDefaultCounter: Story = {
  render: () => <ControlledArea />,
  play: async ({ canvas, userEvent }) => {
    const area = canvas.getByRole("textbox", { name: "Notes" });
    await expect(canvasElementCounter(area)).toHaveTextContent("3 characters");
    await userEvent.type(area, "de");
    await expect(area).toHaveValue("ABCDE");
    await expect(canvasElementCounter(area)).toHaveTextContent("5 characters");
    await expect(area).toBeRequired();
  },
};

const drag = (grip: Element, dy: number, pointerType = "mouse") => {
  const r = grip.getBoundingClientRect();
  const x = r.left + r.width / 2;
  const y = r.top + r.height / 2;
  const init = { bubbles: true, pointerId: 7, pointerType, clientX: x, button: 0, buttons: 1 };
  grip.dispatchEvent(new PointerEvent("pointerdown", { ...init, clientY: y }));
  grip.dispatchEvent(new PointerEvent("pointermove", { ...init, clientY: y + dy / 2 }));
  grip.dispatchEvent(new PointerEvent("pointermove", { ...init, clientY: y + dy }));
  grip.dispatchEvent(new PointerEvent("pointerup", { ...init, clientY: y + dy, buttons: 0 }));
};
const grip = (root: HTMLElement) => root.querySelector(".cy-text-area-grip") as HTMLElement;

export const ResizesByDraggingTheGrip: Story = {
  args: { label: "Notes", rows: 3, defaultValue: "" },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const area = canvas.getByRole("textbox", { name: "Notes" });
    const handle = grip(canvasElement);
    await expect(handle).toBeTruthy();
    // A pointer convenience: hidden from assistive tech and not a Tab stop (content growth covers keyboard users).
    await expect(handle).toHaveAttribute("aria-hidden", "true");
    await expect(handle.tabIndex).toBe(-1);
    const start = area.getBoundingClientRect().height;
    drag(handle, 60);
    await expect(Math.round(area.getBoundingClientRect().height)).toBe(Math.round(start + 60));
    // The chosen height is kept while typing short text.
    await userEvent.type(area, "hi");
    await expect(Math.round(area.getBoundingClientRect().height)).toBe(Math.round(start + 60));
    // Never smaller than `rows`.
    drag(handle, -400);
    await expect(Math.round(area.getBoundingClientRect().height)).toBe(Math.round(start));
  },
};

export const GrowsPastTheChosenHeightWithContent: Story = {
  args: { label: "Notes", rows: 2, maxRows: 20, defaultValue: "" },
  play: async ({ canvas, canvasElement }) => {
    const area = canvas.getByRole("textbox", { name: "Notes" }) as HTMLTextAreaElement;
    drag(grip(canvasElement), 20);
    const chosen = area.getBoundingClientRect().height;
    area.focus();
    area.setRangeText("1\n2\n3\n4\n5\n6\n7\n8");
    area.dispatchEvent(new Event("input", { bubbles: true }));
    await expect(area.getBoundingClientRect().height).toBeGreaterThan(chosen + 40);
  },
};

export const NotResizableWhenAskedOrDisabled: Story = {
  render: () => (
    <>
      <TextArea label="Fixed" resizable={false} />
      <TextArea label="Off" disabled />
    </>
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector(".cy-text-area-grip")).toBeNull();
  },
};

export const TouchDragResizes: Story = {
  tags: ["touch"],
  args: { label: "Notes", rows: 3 },
  play: async ({ canvas, canvasElement }) => {
    const area = canvas.getByRole("textbox", { name: "Notes" });
    const handle = grip(canvasElement);
    const box = handle.getBoundingClientRect();
    await expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(24);
    await expect(getComputedStyle(handle).touchAction).toBe("none");
    const start = area.getBoundingClientRect().height;
    drag(handle, 40, "touch");
    await expect(Math.round(area.getBoundingClientRect().height)).toBe(Math.round(start + 40));
  },
};

export const GripSitsInTheBoxCornerClearOfTheCounter: Story = {
  args: { label: "Notes", showCount: true, maxLength: 40, defaultValue: "hello" },
  play: async ({ canvas, canvasElement }) => {
    const area = canvas.getByRole("textbox", { name: "Notes" }).getBoundingClientRect();
    const g = grip(canvasElement).getBoundingClientRect();
    const count = (canvasElement.querySelector(".cy-text-area-count") as HTMLElement).getBoundingClientRect();
    await expect(g.bottom).toBeLessThanOrEqual(area.bottom);
    await expect(g.right).toBeLessThanOrEqual(area.right);
    await expect(g.bottom <= count.top || g.top >= count.bottom).toBe(true);
  },
};
