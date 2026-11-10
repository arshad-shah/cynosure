import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { shownFully } from "../../test/settle.js";
import { Select } from "./Select.js";

const fruits = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana", description: "Ripe" },
  { value: "blueberry", label: "Blueberry", disabled: true },
  { value: "cherry", label: "Cherry" },
  { value: "date", label: "Date" },
];

const meta = {
  title: "Components/Select",
  component: Select,
  args: {
    label: "Fruit",
    options: fruits,
    placeholder: "Pick one",
    onChange: fn(),
    size: "md",
    variant: "outline",
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    variant: { control: "inline-radio", options: ["outline", "soft"] },
    label: { control: "text" },
    placeholder: { control: "text" },
    description: { control: "text" },
    error: { control: "text" },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
  },
} satisfies Meta<typeof Select>;
export default meta;
type Story = StoryObj<typeof meta>;

const list = (root: HTMLElement) => root.querySelector('[role="listbox"]') as HTMLElement;
const isOpen = (el: HTMLElement) => el.matches(":popover-open");
const active = (root: HTMLElement) => {
  const id = (root.querySelector('[role="combobox"]') as HTMLElement).getAttribute("aria-activedescendant");
  return id ? (root.querySelector(`[id="${id}"]`) as HTMLElement).textContent : null;
};

export const ClickToOpenAndSelect: Story = {
  tags: ["visual"],
  play: async ({ canvas, canvasElement, args, userEvent }) => {
    const trigger = canvas.getByRole("combobox", { name: "Fruit" });
    await expect(trigger).toHaveTextContent("Pick one");
    await userEvent.click(trigger);
    await waitFor(() => expect(isOpen(list(canvasElement))).toBe(true));
    await shownFully(list(canvasElement));
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(canvas.getByRole("option", { name: /Banana/ }));
    await expect(trigger).toHaveTextContent("Banana");
    await expect(args.onChange).toHaveBeenCalledWith("banana");
    await expect(isOpen(list(canvasElement))).toBe(false);
    await expect(trigger).toHaveFocus();
  },
};

export const KeyboardNavigatesSkipsDisabledAndEscapeCancels: Story = {
  args: { defaultValue: "apple" },
  play: async ({ canvas, canvasElement, args, userEvent }) => {
    const trigger = canvas.getByRole("combobox");
    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(isOpen(list(canvasElement))).toBe(true));
    await expect(active(canvasElement)).toBe("Apple");
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    await expect(active(canvasElement)).toMatch(/^Cherry/);
    await userEvent.keyboard("{Escape}");
    await expect(isOpen(list(canvasElement))).toBe(false);
    await expect(trigger).toHaveTextContent("Apple");
    await userEvent.keyboard("{Enter}{End}{Enter}");
    await expect(trigger).toHaveTextContent("Date");
    await expect(args.onChange).toHaveBeenCalledWith("date");
  },
};

export const TypeaheadIgnoresComposition: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const trigger = canvas.getByRole("combobox");
    await userEvent.click(trigger);
    await userEvent.keyboard("ch");
    await expect(active(canvasElement)).toBe("Cherry");
    trigger.dispatchEvent(new KeyboardEvent("keydown", { key: "d", bubbles: true, isComposing: true }));
    await expect(active(canvasElement)).toBe("Cherry");
    await userEvent.keyboard("{Tab}");
    await expect(trigger).toHaveTextContent("Cherry");
  },
};

const many = Array.from({ length: 200 }, (_, i) => ({
  value: `item-${i}`,
  label: `Item ${String(i + 1).padStart(3, "0")} with a rather long descriptive label`,
}));

export const ManyOptionsScrollAndTruncate: Story = {
  args: { options: many, defaultValue: "item-0" },
  render: (args) => (
    <div style={{ width: 220 }}>
      <Select {...args} />
    </div>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    const trigger = canvas.getByRole("combobox");
    const value = trigger.querySelector(".cy-select-value") as HTMLElement;
    await expect(getComputedStyle(value).textOverflow).toBe("ellipsis");
    await userEvent.click(trigger);
    await userEvent.keyboard("{End}");
    const listbox = list(canvasElement);
    const last = canvas.getByRole("option", { name: /Item 200/ });
    await waitFor(() => {
      const l = listbox.getBoundingClientRect();
      const o = last.getBoundingClientRect();
      expect(o.bottom).toBeLessThanOrEqual(l.bottom + 1);
      expect(o.top).toBeGreaterThanOrEqual(l.top - 1);
    });
  },
};

export const FormValueRequiredAndReset: Story = {
  render: (args) => (
    <form data-testid="form">
      <Select {...args} name="fruit" required defaultValue="" />
    </form>
  ),
  play: async ({ canvas, userEvent }) => {
    const form = canvas.getByTestId("form") as HTMLFormElement;
    await expect(form.checkValidity()).toBe(false);
    await userEvent.click(canvas.getByRole("combobox"));
    await userEvent.click(canvas.getByRole("option", { name: "Date" }));
    await expect(form.checkValidity()).toBe(true);
    await expect(new FormData(form).get("fruit")).toBe("date");
    form.reset();
    await waitFor(() => expect(canvas.getByRole("combobox")).toHaveTextContent("Pick one"));
    await expect(new FormData(form).get("fruit")).toBe("");
  },
};

function Controlled() {
  const [value, setValue] = useState("cherry");
  return (
    <div>
      <Select label="Fruit" options={fruits} value={value} onChange={setValue} />
      <output data-testid="out">{value}</output>
    </div>
  );
}

export const ControlledValue: Story = {
  render: () => <Controlled />,
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByRole("combobox")).toHaveTextContent("Cherry");
    await userEvent.click(canvas.getByRole("combobox"));
    await userEvent.click(canvas.getByRole("option", { name: "Apple" }));
    await expect(canvas.getByTestId("out")).toHaveTextContent("apple");
  },
};

export const OutsideClickCloses: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole("combobox"));
    await waitFor(() => expect(isOpen(list(canvasElement))).toBe(true));
    await userEvent.click(canvasElement);
    await expect(isOpen(list(canvasElement))).toBe(false);
  },
};

export const FlipsAboveNearTheBottom: Story = {
  render: (args) => (
    <div style={{ position: "fixed", insetInline: 16, bottom: 4 }}>
      <Select {...args} />
    </div>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    const trigger = canvas.getByRole("combobox");
    await userEvent.click(trigger);
    await waitFor(() => expect(isOpen(list(canvasElement))).toBe(true));
    await expect(list(canvasElement).getBoundingClientRect().bottom).toBeLessThanOrEqual(
      trigger.getBoundingClientRect().top,
    );
  },
};

export const CoarsePointerRows: Story = {
  tags: ["touch", "!dev"],
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("combobox"));
    for (const option of canvas.getAllByRole("option"))
      await expect(option.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    const { clean, hostile } = computeUnderHostileHost(canvasElement, '[role="combobox"]', [
      "height",
      "border-radius",
      "background-color",
      "font-size",
      "padding-inline-start",
    ]);
    await expect(hostile).toEqual(clean);
  },
};

export const ArrowUpOpensAtLastAndTypingWhileClosedJumps: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const trigger = canvas.getByRole("combobox");
    trigger.focus();
    await userEvent.keyboard("{ArrowUp}");
    await expect(active(canvasElement)).toBe("Date");
    await userEvent.keyboard("{ArrowUp}{Home}{PageDown}");
    await expect(active(canvasElement)).toBe("Date");
    await userEvent.keyboard("{PageUp}{Escape}");
    await userEvent.keyboard("c");
    await waitFor(() => expect(isOpen(list(canvasElement))).toBe(true));
    await expect(active(canvasElement)).toBe("Cherry");
  },
};

export const AllDisabledHasNoActiveOption: Story = {
  args: { options: [{ value: "x", label: "Only", disabled: true }], labels: { empty: "Nothing" } },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole("combobox"));
    await expect(active(canvasElement)).toBeNull();
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect(canvas.getByRole("combobox")).toHaveTextContent("Pick one");
  },
};

export const EmptyOptionsShowsEmptyLabel: Story = {
  args: { options: [], labels: { empty: "Nothing to pick" } },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole("combobox"));
    await expect(list(canvasElement)).toHaveTextContent("Nothing to pick");
  },
};

export const DisabledNeitherSubmitsNorBlocks: Story = {
  render: (args) => (
    <form data-testid="form">
      <Select {...args} name="fruit" required disabled defaultValue="" />
      <Select {...args} label="Kept" name="kept" disabled defaultValue="apple" />
    </form>
  ),
  play: async ({ canvas }) => {
    const form = canvas.getByTestId("form") as HTMLFormElement;
    await expect(form.checkValidity()).toBe(true);
    await expect(new FormData(form).has("kept")).toBe(false);
  },
};

export const InvalidSubmitFocusesTheTriggerAndExplains: Story = {
  render: (args) => (
    <form data-testid="form" onSubmit={(e) => e.preventDefault()}>
      <Select {...args} name="fruit" required defaultValue="" labels={{ required: "Choose a fruit." }} />
    </form>
  ),
  play: async ({ canvas }) => {
    (canvas.getByTestId("form") as HTMLFormElement).requestSubmit();
    const trigger = canvas.getByRole("combobox", { name: "Fruit" });
    await waitFor(() => expect(trigger).toHaveFocus());
    await expect(canvas.getByRole("alert")).toHaveTextContent("Choose a fruit.");
    await expect(trigger).toHaveAttribute("aria-invalid", "true");
  },
};

export const NarrowTriggerLongLabels: Story = {
  args: {
    options: Array.from({ length: 5 }, (_, i) => ({
      value: `long-${i}`,
      label: `Option ${i + 1}: a deliberately long label that keeps going well past any sensible list width`,
    })),
    defaultValue: "long-0",
  },
  render: (args) => (
    <div style={{ width: 220, marginInlineStart: 200 }}>
      <Select {...args} />
    </div>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    const trigger = canvas.getByRole("combobox");
    await userEvent.click(trigger);
    await waitFor(() => expect(isOpen(list(canvasElement))).toBe(true));
    const l = list(canvasElement).getBoundingClientRect();
    const t = trigger.getBoundingClientRect();
    await expect(Math.abs(l.left - t.left)).toBeLessThan(1);
    await expect(l.width).toBeLessThanOrEqual(Math.max(t.width, 320) + 1);
    const label = canvasElement.querySelector(".cy-select-option-label") as HTMLElement;
    await expect(label.scrollWidth).toBeGreaterThan(label.clientWidth);
  },
};

export const SpaceOpensAndStaysOpen: Story = {
  args: { defaultValue: "apple" },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const trigger = canvas.getByRole("combobox");
    trigger.focus();
    await userEvent.keyboard(" ");
    await new Promise((r) => setTimeout(r, 150));
    await expect(isOpen(list(canvasElement))).toBe(true);
    await userEvent.keyboard("{ArrowDown} ");
    await expect(trigger).toHaveTextContent("Banana");
    await new Promise((r) => setTimeout(r, 150));
    await expect(isOpen(list(canvasElement))).toBe(false);
  },
};

export const HiddenLabelStillNamesTheTrigger: Story = {
  args: { labelHidden: true },
  play: async ({ canvas, canvasElement }) => {
    const trigger = canvas.getByRole("combobox", { name: "Fruit" });
    const field = canvasElement.querySelector(".cy-field") as HTMLElement;
    await expect(
      Math.abs(trigger.getBoundingClientRect().top - field.getBoundingClientRect().top),
    ).toBeLessThan(1);
  },
};
