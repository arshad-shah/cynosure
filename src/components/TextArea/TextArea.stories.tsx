import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { expect, fn, waitFor } from "storybook/test";
import { createStyleSheet } from "../../styles/inline.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { shownFully } from "../../test/settle.js";
import { Popover } from "../Popover/Popover.js";
import { TextArea, type TextAreaMention } from "./TextArea.js";

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
    trigger: { control: "text" },
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

export const RefitsWhenTheWidthChanges: Story = {
  args: {
    rows: 1,
    maxRows: 10,
    defaultValue: "a few words that wrap onto more lines when the box gets narrow",
  },
  decorators: [
    (Story) => (
      <div data-testid="frame" style={{ inlineSize: 600 }}>
        {Story()}
      </div>
    ),
  ],
  play: async ({ canvas }) => {
    const area = canvas.getByRole("textbox", { name: "Notes" });
    const frame = canvas.getByTestId("frame");
    const wide = area.getBoundingClientRect().height;
    // Narrower: the text wraps onto more lines, and the box grows to show them without a scrollbar.
    frame.style.inlineSize = "160px";
    await waitFor(() => expect(area.getBoundingClientRect().height).toBeGreaterThan(wide));
    await waitFor(() => expect(area.scrollHeight).toBeLessThanOrEqual(area.clientHeight));
    // Wider again: back to the one line.
    frame.style.inlineSize = "600px";
    await waitFor(() => expect(area.getBoundingClientRect().height).toBe(wide));
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

const drag = (grip: Element, dy: number, pointerType = "mouse", release = true) => {
  const r = grip.getBoundingClientRect();
  const x = r.left + r.width / 2;
  const y = r.top + r.height / 2;
  const init = {
    bubbles: true,
    pointerId: 7,
    pointerType,
    isPrimary: true,
    clientX: x,
    button: 0,
    buttons: 1,
  };
  grip.dispatchEvent(new PointerEvent("pointerdown", { ...init, clientY: y }));
  grip.dispatchEvent(new PointerEvent("pointermove", { ...init, clientY: y + dy / 2 }));
  grip.dispatchEvent(new PointerEvent("pointermove", { ...init, clientY: y + dy }));
  if (release) grip.dispatchEvent(new PointerEvent("pointerup", { ...init, clientY: y + dy, buttons: 0 }));
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
    // Escape before letting go puts the height back.
    drag(handle, 80, "mouse", false);
    await expect(Math.round(area.getBoundingClientRect().height)).toBe(Math.round(start + 80));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
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
  tags: ["touch", "!dev"],
  args: { label: "Notes", rows: 3 },
  play: async ({ canvas, canvasElement }) => {
    const area = canvas.getByRole("textbox", { name: "Notes" });
    const handle = grip(canvasElement);
    const box = handle.getBoundingClientRect();
    const field = area.getBoundingClientRect();
    // The tap target grows to 44px on touch, but invisibly: the grip itself stays small and tucked in the corner.
    const hit = getComputedStyle(handle, "::before");
    await expect(Number.parseFloat(hit.blockSize || hit.height)).toBeGreaterThanOrEqual(44);
    await expect(Math.round(box.height)).toBe(24);
    await expect(field.bottom - box.bottom).toBeLessThanOrEqual(2);
    await expect(field.right - box.right).toBeLessThanOrEqual(2);
    // Text stays clear of it: the content box ends above the grip.
    const style = getComputedStyle(area);
    const contentBottom =
      field.bottom - Number.parseFloat(style.paddingBottom) - Number.parseFloat(style.borderBottomWidth);
    await expect(contentBottom).toBeLessThanOrEqual(box.top + 1);
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
    // The last line of text ends above the grip.
    const input = canvas.getByRole("textbox", { name: "Notes" });
    const style = getComputedStyle(input);
    await expect(
      area.bottom - Number.parseFloat(style.paddingBottom) - Number.parseFloat(style.borderBottomWidth),
    ).toBeLessThanOrEqual(g.top + 1);
  },
};

export const GripIgnoresOtherButtonsAndCancelledDrags: Story = {
  args: { label: "Notes", rows: 3 },
  play: async ({ canvas, canvasElement }) => {
    const area = canvas.getByRole("textbox", { name: "Notes" });
    const handle = grip(canvasElement);
    const start = area.getBoundingClientRect().height;
    const r = handle.getBoundingClientRect();
    const at = { bubbles: true, pointerId: 9, clientX: r.left + 4, clientY: r.top + 4 };
    // Right button: no drag.
    handle.dispatchEvent(new PointerEvent("pointerdown", { ...at, button: 2, buttons: 2 }));
    handle.dispatchEvent(new PointerEvent("pointermove", { ...at, clientY: at.clientY + 50, buttons: 2 }));
    await expect(Math.round(area.getBoundingClientRect().height)).toBe(Math.round(start));
    // Cancelled drag: later moves do nothing.
    handle.dispatchEvent(new PointerEvent("pointerdown", { ...at, button: 0, buttons: 1 }));
    handle.dispatchEvent(new PointerEvent("pointercancel", at));
    handle.dispatchEvent(new PointerEvent("pointermove", { ...at, clientY: at.clientY + 50, buttons: 1 }));
    await expect(Math.round(area.getBoundingClientRect().height)).toBe(Math.round(start));
  },
};

// Mentions -------------------------------------------------------------------------------------------------------

const PEOPLE: TextAreaMention[] = [
  { value: "@ada", label: "Ada Lovelace", description: "Engineering" },
  { value: "@alan", label: "Alan Turing", description: "Research" },
  { value: "@grace", label: "Grace Hopper", description: "Compilers" },
];

const listOf = (area: HTMLElement) => {
  const id = area.getAttribute("aria-controls");
  return id ? (area.ownerDocument.getElementById(id) as HTMLElement | null) : null;
};
const shownList = (el: HTMLElement | null) => !!el?.matches(":popover-open");
const optionNames = (list: HTMLElement) =>
  [...list.querySelectorAll('[role="option"]')].map(
    (o) => o.querySelector(".cy-option-list-label")?.textContent,
  );
const activeOption = (area: HTMLElement) => {
  const id = area.getAttribute("aria-activedescendant");
  return id ? area.ownerDocument.getElementById(id) : null;
};
/**
 * The insertion is a native edit (so Undo takes it back), which user-event, keeping its own copy of what it typed,
 * does not see: assigning the value through the property it watches brings its copy up to date.
 */
const resync = (area: HTMLTextAreaElement) => {
  const caret = area.selectionStart;
  // biome-ignore lint/correctness/noSelfAssign: the setter call is the point (see above)
  area.value = area.value;
  area.setSelectionRange(caret, caret);
};

export const MentionsInsertOnEnter: Story = {
  tags: ["visual"],
  args: { trigger: "@", suggestions: PEOPLE, onMention: fn(), onKeyDown: fn() },
  play: async ({ canvas, args, userEvent }) => {
    const area = canvas.getByRole("textbox", { name: "Notes" }) as HTMLTextAreaElement;
    await expect(area).toHaveAttribute("aria-autocomplete", "list");
    await expect(area).toHaveAttribute("aria-haspopup", "listbox");
    await expect(area).not.toHaveAttribute("aria-controls");
    // The trigger at the start of a word opens the list; the query filters by value and label.
    await userEvent.type(area, "Thanks @l");
    const list = listOf(area) as HTMLElement;
    await waitFor(() => expect(shownList(list)).toBe(true));
    await shownFully(list);
    await expect(list).toHaveAttribute("role", "listbox");
    // The list is named by the field's label, as Combobox's and TagInput's are.
    await expect(list).toHaveAccessibleName("Notes");
    await expect(optionNames(list)).toEqual(["Ada Lovelace", "Alan Turing"]);
    // The first option is active; the arrows move, stopping at the ends; focus stays in the text.
    await expect(activeOption(area)).toHaveTextContent("Ada Lovelace");
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}");
    await expect(activeOption(area)).toHaveTextContent("Alan Turing");
    await userEvent.keyboard("{ArrowUp}{ArrowUp}");
    await expect(activeOption(area)).toHaveTextContent("Ada Lovelace");
    await userEvent.keyboard("{ArrowDown}");
    await expect(area).toHaveFocus();
    // Enter replaces the trigger and query with the value and a space, and closes the list.
    await userEvent.keyboard("{Enter}");
    await expect(area).toHaveValue("Thanks @alan ");
    await expect(args.onMention).toHaveBeenCalledWith(PEOPLE[1]);
    await expect(args.onChange).toHaveBeenLastCalledWith("Thanks @alan ");
    await expect(area.selectionStart).toBe("Thanks @alan ".length);
    await waitFor(() => expect(shownList(list)).toBe(false));
    await expect(area).not.toHaveAttribute("aria-activedescendant");
    // The keys the list used never reached onKeyDown; once closed, Enter does.
    await expect(args.onKeyDown).not.toHaveBeenCalledWith(expect.objectContaining({ key: "Enter" }));
    resync(area);
    await userEvent.keyboard("{Enter}");
    await expect(args.onKeyDown).toHaveBeenCalledWith(expect.objectContaining({ key: "Enter" }));
    await expect(area).toHaveValue("Thanks @alan \n");
  },
};

export const MentionsTabInsertsInTheMiddle: Story = {
  args: { trigger: "@", suggestions: PEOPLE, defaultValue: "Ask  about it", onMention: fn() },
  play: async ({ canvas, args, userEvent }) => {
    const area = canvas.getByRole("textbox", { name: "Notes" }) as HTMLTextAreaElement;
    await userEvent.type(area, "@gr", { initialSelectionStart: 4, initialSelectionEnd: 4 });
    await waitFor(() => expect(shownList(listOf(area))).toBe(true));
    await expect(optionNames(listOf(area) as HTMLElement)).toEqual(["Grace Hopper"]);
    // Tab inserts too, and keeps focus in the text; the text after the caret stays.
    await userEvent.tab();
    await expect(area).toHaveFocus();
    await expect(area).toHaveValue("Ask @grace  about it");
    await expect(area.selectionStart).toBe("Ask @grace ".length);
    await expect(args.onMention).toHaveBeenCalledWith(PEOPLE[2]);
    // With the list closed, Tab leaves the field as usual.
    await userEvent.tab();
    await expect(area).not.toHaveFocus();
  },
};

export const MentionsOnlyAtTheStartOfAWord: Story = {
  args: { trigger: "#", suggestions: ["general", "random", "design"] },
  play: async ({ canvas, userEvent }) => {
    const area = canvas.getByRole("textbox", { name: "Notes" }) as HTMLTextAreaElement;
    // Inside a word (an issue number, an anchor) the trigger is plain text.
    await userEvent.type(area, "see a#b");
    await expect(area).not.toHaveAttribute("aria-controls");
    // A space ends the query and closes the list; nothing matching closes it too.
    await userEvent.type(area, " #ran");
    await waitFor(() => expect(shownList(listOf(area))).toBe(true));
    await expect(optionNames(listOf(area) as HTMLElement)).toEqual(["random"]);
    await userEvent.type(area, "x");
    await expect(area).not.toHaveAttribute("aria-controls");
    await userEvent.type(area, "{Backspace}");
    await waitFor(() => expect(shownList(listOf(area))).toBe(true));
    await userEvent.type(area, " ");
    await expect(area).not.toHaveAttribute("aria-controls");
    // Moving the caret back into a query opens the list for it; selecting text closes it.
    await userEvent.keyboard("{ArrowLeft}");
    await waitFor(() => expect(shownList(listOf(area))).toBe(true));
    await expect(optionNames(listOf(area) as HTMLElement)).toEqual(["random"]);
    await userEvent.pointer([
      { target: area, offset: 9, keys: "[MouseLeft>]" },
      { offset: 11 },
      { keys: "[/MouseLeft]" },
    ]);
    await expect([area.selectionStart, area.selectionEnd]).toEqual([9, 11]);
    await waitFor(() => expect(area).not.toHaveAttribute("aria-controls"));
    // A string suggestion inserts itself.
    await userEvent.keyboard("{End}#des{Enter}");
    await expect(area).toHaveValue("see a#b #ran design ");
  },
};

function InPopover(args: Parameters<typeof TextArea>[0]) {
  const [open, setOpen] = useState(true);
  return (
    <Popover label="Comment" open={open} onOpenChange={setOpen} initialFocus="none">
      <TextArea {...args} />
    </Popover>
  );
}

export const MentionsEscapeClosesOnlyTheList: Story = {
  args: { trigger: "@", suggestions: PEOPLE },
  render: (args) => <InPopover {...args} />,
  play: async ({ canvas, userEvent }) => {
    const dialog = await canvas.findByRole("dialog", { name: "Comment" });
    await shownFully(dialog);
    const area = canvas.getByRole("textbox", { name: "Notes" }) as HTMLTextAreaElement;
    await userEvent.type(area, "@");
    const list = listOf(area) as HTMLElement;
    await waitFor(() => expect(shownList(list)).toBe(true));
    await expect(optionNames(list)).toHaveLength(3);
    // Escape closes the list, not the popover around it, and the text stays.
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(shownList(list)).toBe(false));
    await expect(dialog.matches(":popover-open")).toBe(true);
    await expect(area).toHaveValue("@");
    await expect(area).toHaveFocus();
    // That mention stays dismissed while typing on; a new trigger opens the list again.
    await userEvent.type(area, "a");
    await expect(area).not.toHaveAttribute("aria-controls");
    await userEvent.type(area, " @g");
    await waitFor(() => expect(shownList(listOf(area))).toBe(true));
    // Leaving the field closes it.
    await userEvent.tab({ shift: true });
    await waitFor(() => expect(shownList(list)).toBe(false));
    // The next Escape closes the popover.
    area.focus();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(dialog.matches(":popover-open")).toBe(false));
  },
};

export const MentionsPointer: Story = {
  args: { trigger: "@", suggestions: PEOPLE, onMention: fn() },
  render: (args) => (
    <>
      <TextArea {...args} />
      <p data-testid="outside">Somewhere else</p>
    </>
  ),
  play: async ({ canvas, args, userEvent }) => {
    const area = canvas.getByRole("textbox", { name: "Notes" }) as HTMLTextAreaElement;
    await userEvent.type(area, "@");
    const list = listOf(area) as HTMLElement;
    await waitFor(() => expect(shownList(list)).toBe(true));
    await shownFully(list);
    // Below the box, at least as wide as it.
    const box = area.getBoundingClientRect();
    await expect(list.getBoundingClientRect().top).toBeGreaterThanOrEqual(box.bottom);
    await expect(list.getBoundingClientRect().width).toBeGreaterThanOrEqual(box.width - 1);
    // Hovering moves the active option; a click inserts it and keeps focus in the text.
    const grace = canvas.getByRole("option", { name: /Grace Hopper/ });
    await userEvent.hover(grace);
    await expect(activeOption(area)).toBe(grace);
    await userEvent.click(grace);
    await expect(area).toHaveValue("@grace ");
    await expect(area).toHaveFocus();
    await expect(args.onMention).toHaveBeenCalledWith(PEOPLE[2]);
    // It was typed in as an edit: Undo puts the trigger back, and the list with it.
    area.ownerDocument.execCommand("undo");
    await expect(area).toHaveValue("@");
    resync(area);
    await userEvent.keyboard("{End}");
    await waitFor(() => expect(shownList(list)).toBe(true));
    // A press outside closes the list.
    await userEvent.click(canvas.getByTestId("outside"));
    await waitFor(() => expect(shownList(list)).toBe(false));
  },
};

export const MentionsFromAFunction: Story = {
  args: {
    trigger: "@",
    suggestions: fn((query: string) =>
      PEOPLE.filter((p) => p.value.startsWith(`@${query}`)).map((p) => ({ ...p, label: p.value })),
    ),
  },
  play: async ({ canvas, args, userEvent }) => {
    const area = canvas.getByRole("textbox", { name: "Notes" }) as HTMLTextAreaElement;
    await userEvent.type(area, "@a");
    await waitFor(() => expect(optionNames(listOf(area) as HTMLElement)).toEqual(["@ada", "@alan"]));
    // Called with the query (the text after the trigger), not the whole text.
    await expect(args.suggestions).toHaveBeenLastCalledWith("a");
    await userEvent.type(area, "d{Enter}");
    await expect(area).toHaveValue("@ada ");
    // Shift+Enter is still a new line, with the list open or not.
    resync(area);
    await userEvent.type(area, "@a");
    await waitFor(() => expect(shownList(listOf(area))).toBe(true));
    await userEvent.keyboard("{Shift>}{Enter}{/Shift}");
    await expect(area).toHaveValue("@ada @a\n");
    await expect(area).not.toHaveAttribute("aria-controls");
  },
};

const later = <T,>(value: T, ms: number) => new Promise<T>((resolve) => setTimeout(() => resolve(value), ms));

export const MentionsAsyncLoadingAndStaleResults: Story = {
  args: {
    trigger: "@",
    labels: { loading: "Searching people" },
    suggestions: (query: string) => {
      if (query === "zz") return Promise.reject(new Error("offline"));
      // The first query answers last: its late answer must not replace the newer one.
      const hits = PEOPLE.filter((p) => p.value.startsWith(`@${query}`));
      return later(hits, query === "a" ? 400 : 50);
    },
  },
  play: async ({ canvas, userEvent }) => {
    const area = canvas.getByRole("textbox", { name: "Notes" }) as HTMLTextAreaElement;
    await userEvent.type(area, "@a");
    const list = listOf(area) as HTMLElement;
    // While nothing has come back, the list says it is loading and is busy.
    await waitFor(() => expect(shownList(list)).toBe(true));
    await expect(list).toHaveAttribute("aria-busy", "true");
    await expect(list).toHaveTextContent("Searching people");
    await expect(area).not.toHaveAttribute("aria-activedescendant");
    await userEvent.type(area, "l");
    await waitFor(() => expect(optionNames(list)).toEqual(["Alan Turing"]));
    await expect(list).not.toHaveAttribute("aria-busy");
    await new Promise((r) => setTimeout(r, 450));
    await expect(optionNames(list)).toEqual(["Alan Turing"]);
    await userEvent.keyboard("{Enter}");
    await expect(area).toHaveValue("@alan ");
    // A failed lookup closes the list.
    resync(area);
    await userEvent.type(area, "@zz");
    await waitFor(() => expect(area).not.toHaveAttribute("aria-controls"));
    await expect(area).toHaveValue("@alan @zz");
  },
};

export const MentionsWaitForTheImeToFinish: Story = {
  args: { trigger: "@", suggestions: PEOPLE, onMention: fn() },
  play: async ({ canvas, args, userEvent }) => {
    const area = canvas.getByRole("textbox", { name: "Notes" }) as HTMLTextAreaElement;
    await userEvent.type(area, "@");
    const list = listOf(area) as HTMLElement;
    await waitFor(() => expect(optionNames(list)).toHaveLength(3));
    // While an IME composes, the query is not read and Enter belongs to the IME.
    area.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
    const setValue = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;
    setValue?.call(area, "@gr");
    area.dispatchEvent(new Event("input", { bubbles: true }));
    await expect(optionNames(list)).toHaveLength(3);
    const enter = new KeyboardEvent("keydown", {
      key: "Enter",
      bubbles: true,
      cancelable: true,
      isComposing: true,
    });
    area.dispatchEvent(enter);
    await expect(enter.defaultPrevented).toBe(false);
    await expect(area).toHaveValue("@gr");
    await expect(args.onMention).not.toHaveBeenCalled();
    // Safari reports it as keyCode 229.
    area.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", keyCode: 229, bubbles: true, cancelable: true }),
    );
    await expect(args.onMention).not.toHaveBeenCalled();
    // When it finishes, the query is read.
    area.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true, data: "gr" }));
    await waitFor(() => expect(optionNames(list)).toEqual(["Grace Hopper"]));
    await userEvent.keyboard("{Enter}");
    await expect(area).toHaveValue("@grace ");
  },
};

export const MentionsWithoutEditingCommands: Story = {
  args: { trigger: "@", suggestions: PEOPLE, defaultValue: "to  now", onMention: fn() },
  play: async ({ canvas, args, userEvent }) => {
    const area = canvas.getByRole("textbox", { name: "Notes" }) as HTMLTextAreaElement;
    const doc = area.ownerDocument;
    const native = doc.execCommand;
    // Where the editing command is refused, the text is replaced directly and still reported as input.
    doc.execCommand = () => false;
    try {
      await userEvent.type(area, "@ad", { initialSelectionStart: 3, initialSelectionEnd: 3 });
      await waitFor(() => expect(shownList(listOf(area))).toBe(true));
      await userEvent.keyboard("{Enter}");
      await expect(area).toHaveValue("to @ada  now");
      await expect(area.selectionStart).toBe("to @ada ".length);
      await expect(args.onChange).toHaveBeenLastCalledWith("to @ada  now");
      await expect(args.onMention).toHaveBeenCalledWith(PEOPLE[0]);
    } finally {
      doc.execCommand = native;
    }
  },
};

function ControlledMentions() {
  const [value, setValue] = useState("");
  return (
    <>
      <TextArea label="Notes" value={value} onChange={setValue} trigger="@" suggestions={PEOPLE} />
      <output data-testid="out">{value}</output>
    </>
  );
}

export const MentionsControlled: Story = {
  render: () => <ControlledMentions />,
  play: async ({ canvas, userEvent }) => {
    const area = canvas.getByRole("textbox", { name: "Notes" }) as HTMLTextAreaElement;
    await userEvent.type(area, "cc @gr");
    await waitFor(() => expect(shownList(listOf(area))).toBe(true));
    await userEvent.keyboard("{Enter}");
    // The insertion goes through onChange like typing does.
    await expect(canvas.getByTestId("out")).toHaveTextContent("cc @grace");
    await expect(area).toHaveValue("cc @grace ");
    resync(area);
    await userEvent.type(area, "ok");
    await expect(area).toHaveValue("cc @grace ok");
  },
};

export const MentionsInRtl: Story = {
  args: { trigger: "@", suggestions: PEOPLE },
  decorators: [
    (Story) => (
      <div dir="rtl" style={{ inlineSize: 360, marginInlineStart: 40 }}>
        {Story()}
      </div>
    ),
  ],
  play: async ({ canvas, userEvent }) => {
    const area = canvas.getByRole("textbox", { name: "Notes" }) as HTMLTextAreaElement;
    await userEvent.type(area, "شكرا @");
    const list = listOf(area) as HTMLElement;
    await waitFor(() => expect(shownList(list)).toBe(true));
    await shownFully(list);
    // Lined up with the box's start edge, its right in right-to-left text.
    await expect(
      Math.abs(list.getBoundingClientRect().right - area.getBoundingClientRect().right),
    ).toBeLessThan(2);
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect(area).toHaveValue("شكرا @alan ");
  },
};

export const MentionsTouch: Story = {
  tags: ["touch", "!dev"],
  args: { trigger: "@", suggestions: PEOPLE, onMention: fn() },
  play: async ({ canvas, args, userEvent }) => {
    const area = canvas.getByRole("textbox", { name: "Notes" }) as HTMLTextAreaElement;
    await userEvent.type(area, "@");
    const list = listOf(area) as HTMLElement;
    await waitFor(() => expect(shownList(list)).toBe(true));
    await shownFully(list);
    const ada = canvas.getByRole("option", { name: /Ada Lovelace/ });
    // A finger-sized row; a tap inserts it.
    await expect(ada.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    await userEvent.pointer({ keys: "[TouchA]", target: ada });
    await expect(area).toHaveValue("@ada ");
    await expect(args.onMention).toHaveBeenCalledWith(PEOPLE[0]);
  },
};

export const MentionsUnderHostileHost: Story = {
  args: { trigger: "@", suggestions: PEOPLE },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const area = canvas.getByRole("textbox", { name: "Notes" }) as HTMLTextAreaElement;
    await userEvent.type(area, "@");
    await waitFor(() => expect(shownList(listOf(area))).toBe(true));
    await shownFully(listOf(area) as HTMLElement);
    for (const selector of ["textarea", ".cy-option-list-option"]) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, [
        "font-size",
        "line-height",
        "padding-top",
        "color",
        "height",
      ]);
      await expect(hostile).toEqual(clean);
    }
  },
};

function ShadowMentions() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current;
    if (!el || el.shadowRoot) return;
    const root = el.attachShadow({ mode: "open" });
    root.adoptedStyleSheets = [createStyleSheet()];
    const mount = document.createElement("div");
    root.append(mount);
    createRoot(mount).render(<TextArea label="Shadow notes" trigger="@" suggestions={PEOPLE} />);
  }, []);
  return <div data-testid="host" ref={host} style={{ paddingBlockEnd: 200 }} />;
}

export const MentionsInsideAShadowRoot: Story = {
  render: () => <ShadowMentions />,
  play: async ({ canvas }) => {
    const host = await canvas.findByTestId("host");
    await waitFor(() => expect(host.shadowRoot?.querySelector("textarea")).toBeTruthy());
    const root = host.shadowRoot as ShadowRoot;
    const area = root.querySelector("textarea") as HTMLTextAreaElement;
    area.focus();
    const setValue = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;
    setValue?.call(area, "hi @gr");
    area.setSelectionRange(6, 6);
    area.dispatchEvent(new Event("input", { bubbles: true }));
    const list = await waitFor(() => {
      const id = area.getAttribute("aria-controls") as string;
      const found = root.getElementById(id) as HTMLElement;
      expect(shownList(found)).toBe(true);
      return found;
    });
    await expect(root.getElementById(area.getAttribute("aria-activedescendant") as string)).toHaveTextContent(
      "Grace Hopper",
    );
    area.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true, composed: true, cancelable: true }),
    );
    await waitFor(() => expect(area).toHaveValue("hi @grace "));
    await waitFor(() => expect(shownList(list)).toBe(false));
  },
};
