import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { flag, tag } from "../../icons/index.js";
import { backdrop, contrast, rgb } from "../../test/color.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { shownFully } from "../../test/settle.js";
import { Button } from "../Button/Button.js";
import { Popover } from "../Popover/Popover.js";
import { Select, type SelectOption } from "./Select.js";

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

export const InsideAPopover: Story = {
  render: (args) => (
    <Popover label="Filters" trigger={(p) => <Button {...p}>Filters</Button>}>
      <Select {...args} />
      <p>Choose a fruit to filter by.</p>
    </Popover>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Filters" }));
    const popover = await canvas.findByRole("dialog", { name: "Filters" });
    await userEvent.click(canvas.getByRole("combobox", { name: "Fruit" }));
    await canvas.findByRole("listbox");
    // A press elsewhere in the popover closes only the list; Escape closes the list first, then the popover.
    await userEvent.click(canvas.getByText("Choose a fruit to filter by."));
    await waitFor(() => expect(canvas.queryByRole("listbox")).toBeNull());
    // Waited for: the popover is still fading in when a fast run gets here, and reads as invisible until it has.
    await waitFor(() => expect(popover).toBeVisible());
    await userEvent.click(canvas.getByRole("combobox", { name: "Fruit" }));
    await canvas.findByRole("listbox");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(canvas.queryByRole("listbox")).toBeNull());
    await expect(popover).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(canvas.queryByRole("dialog", { name: "Filters" })).toBeNull());
  },
};

export const GroupedOptions: Story = {
  args: {
    label: "Format",
    options: [
      { value: "png", label: "PNG", group: "Image" },
      { value: "jpg", label: "JPEG", group: "Image" },
      { value: "pdf", label: "PDF", group: "Document" },
      { value: "docx", label: "Word", group: "Document" },
    ],
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("combobox", { name: "Format" }));
    const doc = await canvas.findByRole("group", { name: "Document" });
    await expect(doc).toContainElement(canvas.getByRole("option", { name: "PDF" }));
    // Arrow keys move over the headings, from one group into the next.
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    await expect(canvas.getByRole("combobox", { name: "Format" })).toHaveTextContent("PDF");
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

export const PageKeysStopAtTheLastUsableOption: Story = {
  args: {
    options: [
      { value: "first", label: "First", disabled: true },
      { value: "a", label: "Alpha" },
      { value: "b", label: "Bravo" },
      { value: "c", label: "Charlie" },
      { value: "last", label: "Last", disabled: true },
    ],
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    canvas.getByRole("combobox").focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(active(canvasElement)).toBe("Alpha");
    await userEvent.keyboard("{PageDown}");
    await expect(active(canvasElement)).toBe("Charlie");
    await userEvent.keyboard("{PageUp}");
    await expect(active(canvasElement)).toBe("Alpha");
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("combobox")).toHaveTextContent("Alpha");
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
    const label = canvasElement.querySelector(".cy-option-list-label") as HTMLElement;
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

/** A colour token as painted sRGB, resolved next to `near` (so it follows that element's theme). */
function token(near: Element, name: string) {
  const probe = document.createElement("i");
  probe.style.color = `var(${name})`;
  near.after(probe);
  const value = rgb(getComputedStyle(probe).color);
  probe.remove();
  return value;
}
const VIOLET = "rgb(124, 58, 237)";

const priorities: SelectOption[] = [
  { value: "low", label: "Low", icon: flag, iconTone: "info" },
  { value: "high", label: "High", icon: flag, iconTone: "danger" },
  { value: "garden", label: "Garden", icon: tag, iconColor: VIOLET },
  { value: "blocked", label: "Blocked", icon: flag, iconTone: "danger", iconColor: VIOLET, disabled: true },
  { value: "none", label: "No priority", icon: flag },
  { value: "text", label: "Text only" },
];
const optionIcon = (option: HTMLElement) => option.querySelector(".cy-icon") as SVGElement;
const colourOf = (el: Element) => rgb(getComputedStyle(el).color);

export const OptionIconsKeepTheirColourInTheListAndTheTrigger: Story = {
  args: { label: "Priority", options: priorities },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const trigger = canvas.getByRole("combobox", { name: "Priority" });
    const danger = token(trigger, "--cy-color-danger");
    await userEvent.click(trigger);
    await shownFully(list(canvasElement));
    const option = (name: string) => canvas.getByRole("option", { name });
    await expect(colourOf(optionIcon(option("Low")))).toEqual(token(trigger, "--cy-color-info"));
    await expect(colourOf(optionIcon(option("High")))).toEqual(danger);
    await expect(colourOf(optionIcon(option("Garden")))).toEqual(rgb(VIOLET));
    // Without the props an icon is the option's text colour, as before; a disabled option's icon is muted with its row.
    await expect(colourOf(optionIcon(option("No priority")))).toEqual(colourOf(option("No priority")));
    await expect(colourOf(optionIcon(option("Blocked")))).toEqual(colourOf(option("Blocked")));
    await expect(getComputedStyle(option("Blocked")).opacity).toBe("0.45");
    await expect(option("Text only").querySelector(".cy-icon")).toBeNull();
    // The highlighted option keeps the icon's colour, readable on the highlight (3:1 for graphics).
    await userEvent.hover(option("High"));
    await expect(option("High")).toHaveAttribute("data-active");
    await expect(colourOf(optionIcon(option("High")))).toEqual(danger);
    for (const name of ["Low", "High"]) {
      await userEvent.hover(option(name));
      const ratio = contrast(getComputedStyle(optionIcon(option(name))).color, backdrop(option(name)));
      await expect({ name, visible: ratio >= 3 }).toEqual({ name, visible: true });
    }
    // A disabled option cannot be chosen, so its icon never reaches the trigger.
    await userEvent.click(option("Blocked"));
    await expect(isOpen(list(canvasElement))).toBe(true);
    await expect(trigger.querySelector(".cy-select-icon")).toBeNull();
    // Chosen: the trigger shows the icon in the same colour, and so does the now selected option.
    await userEvent.click(option("High"));
    await expect(trigger).toHaveTextContent("High");
    await expect(colourOf(optionIcon(trigger))).toEqual(danger);
    // (The list has closed, so the option is looked up in the DOM, not among what is on screen.)
    await expect(colourOf(optionIcon(canvas.getByRole("option", { name: "High", hidden: true })))).toEqual(
      danger,
    );
    await userEvent.click(trigger);
    await shownFully(list(canvasElement));
    await userEvent.click(option("Garden"));
    await expect(colourOf(optionIcon(trigger))).toEqual(rgb(VIOLET));
    await userEvent.click(trigger);
    await shownFully(list(canvasElement));
    await userEvent.click(option("No priority"));
    await expect(colourOf(optionIcon(trigger))).toEqual(colourOf(trigger));
    // Opening and closing again from the trigger leaves the chosen icon as it is.
    await userEvent.click(trigger);
    await waitFor(() => expect(isOpen(list(canvasElement))).toBe(true));
    await userEvent.click(trigger);
    await waitFor(() => expect(isOpen(list(canvasElement))).toBe(false));
    await expect(colourOf(optionIcon(trigger))).toEqual(colourOf(trigger));
  },
};

export const DisabledSelectMutesTheChosenIcon: Story = {
  args: { label: "Priority", options: priorities, defaultValue: "high", disabled: true },
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole("combobox", { name: "Priority" });
    await expect(trigger).toBeDisabled();
    await expect(colourOf(optionIcon(trigger))).toEqual(colourOf(trigger));
    await expect(optionIcon(trigger)).not.toHaveAttribute("data-tone");
  },
};

export const OptionIconColourIsStableUnderHostileHost: Story = {
  args: { label: "Priority", options: priorities, defaultValue: "high" },
  play: async ({ canvasElement }) => {
    for (const selector of [
      ".cy-select-trigger .cy-select-icon",
      '[role="option"] .cy-select-icon[data-tone="info"]',
      '[role="option"] .cy-select-icon[style*="color"]',
      '[role="option"][aria-disabled="true"] .cy-select-icon',
    ]) {
      const icon = computeUnderHostileHost(canvasElement, selector, ["color", "stroke", "width"]);
      await expect({ selector, ...icon.hostile }).toEqual({ selector, ...icon.clean });
    }
    const chosen = computeUnderHostileHost(canvasElement, ".cy-select-trigger .cy-select-icon", ["color"]);
    await expect(rgb(chosen.hostile.color as string)).toEqual(
      token(canvasElement.querySelector(".cy-select") as Element, "--cy-color-danger"),
    );
  },
};
