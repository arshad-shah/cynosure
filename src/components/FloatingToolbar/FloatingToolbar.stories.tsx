import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { bold } from "../../icons/bold.js";
import { italic } from "../../icons/italic.js";
import { trash } from "../../icons/trash.js";
import { underline } from "../../icons/underline.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { shownFully } from "../../test/settle.js";
import { Button } from "../Button/Button.js";
import { IconButton } from "../IconButton/IconButton.js";
import { DockedToolbar, FloatingToolbar, useSelectionAnchor } from "./FloatingToolbar.js";

const tools = (
  <>
    <IconButton icon={bold} label="Bold" variant="ghost" size="sm" />
    <IconButton icon={italic} label="Italic" variant="ghost" size="sm" />
    <IconButton icon={underline} label="Underline" variant="ghost" size="sm" />
    <IconButton icon={trash} label="Delete" variant="ghost" size="sm" tone="danger" />
  </>
);

/** A box being edited, with a FloatingToolbar anchored to it. */
function Field({ top = 160, onEscape }: { top?: number; onEscape?: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(true);
  return (
    <div style={{ paddingBlockStart: top }}>
      {/* biome-ignore lint/a11y/useSemanticElements: a rich-text editor surface, as products have */}
      <div
        ref={box}
        className="box"
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        tabIndex={0}
        aria-label="Signature field"
        style={{ inlineSize: 240, padding: 12, border: "var(--cy-border-width) dashed var(--cy-color-line)" }}
      >
        Ada Lovelace
      </div>
      <Button onClick={() => setOpen((o) => !o)}>Toggle bar</Button>
      <FloatingToolbar label="Field tools" anchor={box} open={open} onEscape={onEscape}>
        {tools}
      </FloatingToolbar>
    </div>
  );
}

const meta = {
  title: "Components/FloatingToolbar",
  component: FloatingToolbar,
  args: { label: "Field tools", anchor: null },
  render: () => <Field />,
} satisfies Meta<typeof FloatingToolbar>;
export default meta;
type Story = StoryObj<typeof meta>;

const bar = () => document.querySelector(".cy-floating-toolbar") as HTMLElement;
const box = (el: Element) => el.getBoundingClientRect();
const shown = () => bar().matches(":popover-open");

export const AnchoredAboveItsBox: Story = {
  play: async ({ canvas, canvasElement }) => {
    await waitFor(() => expect(shown()).toBe(true));
    await shownFully(bar());
    await expect(canvas.getByRole("toolbar", { name: "Field tools" })).toBeVisible();
    const field = box(canvasElement.querySelector(".box") as Element);
    // Above the box, starting at its edge, never covering it.
    await waitFor(() => expect(box(bar()).bottom).toBeLessThanOrEqual(field.top));
    await expect(Math.abs(box(bar()).left - field.left)).toBeLessThan(2);
    // It does not take focus when it appears.
    await expect(bar().contains(document.activeElement)).toBe(false);
  },
};

export const FlipsBelowWhenNoRoomAbove: Story = {
  render: () => <Field top={0} />,
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(shown()).toBe(true));
    const field = box(canvasElement.querySelector(".box") as Element);
    await waitFor(() => expect(box(bar()).top).toBeGreaterThanOrEqual(field.bottom));
  },
};

export const FollowsItsBox: Story = {
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(shown()).toBe(true));
    const field = canvasElement.querySelector(".box") as HTMLElement;
    field.style.marginInlineStart = "120px";
    // The box moved without a scroll or resize; the bar goes with it.
    await waitFor(() => expect(Math.abs(box(bar()).left - box(field).left)).toBeLessThan(2));
  },
};

export const KeyboardInAndOut: Story = {
  render: () => {
    const onEscape = fn();
    (window as unknown as { escaped: typeof onEscape }).escaped = onEscape;
    return <Field onEscape={onEscape} />;
  },
  play: async ({ canvas, userEvent }) => {
    await waitFor(() => expect(shown()).toBe(true));
    const editor = canvas.getByRole("textbox", { name: "Signature field" });
    editor.focus();
    // Alt+F10 moves into the bar; arrows move inside it (one tab stop).
    await userEvent.keyboard("{Alt>}{F10}{/Alt}");
    await expect(canvas.getByRole("button", { name: "Bold" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("button", { name: "Italic" })).toHaveFocus();
    // Escape returns to the editor.
    await userEvent.keyboard("{Escape}");
    await expect(editor).toHaveFocus();
    await expect((window as unknown as { escaped: ReturnType<typeof fn> }).escaped).toHaveBeenCalledTimes(1);
  },
};

export const HiddenWhenClosed: Story = {
  play: async ({ canvas, userEvent }) => {
    await waitFor(() => expect(shown()).toBe(true));
    await userEvent.click(canvas.getByRole("button", { name: "Toggle bar" }));
    await waitFor(() => expect(shown()).toBe(false));
    // Closed: the shortcut does nothing.
    canvas.getByRole("textbox").focus();
    await userEvent.keyboard("{Alt>}{F10}{/Alt}");
    await expect(canvas.getByRole("textbox")).toHaveFocus();
  },
};

function Bubble() {
  const text = useRef<HTMLDivElement>(null);
  const anchor = useSelectionAnchor(text);
  return (
    <div style={{ paddingBlockStart: 120 }}>
      <div ref={text} className="text" style={{ maxInlineSize: 360 }}>
        Select some of these words to format them.
      </div>
      <p className="outside">Outside the editor.</p>
      <FloatingToolbar label="Format" anchor={anchor}>
        {tools}
      </FloatingToolbar>
    </div>
  );
}

const select = (node: Node, from: number, to: number) => {
  const range = document.createRange();
  range.setStart(node, from);
  range.setEnd(node, to);
  const selection = document.getSelection() as Selection;
  selection.removeAllRanges();
  selection.addRange(range);
  return range;
};

export const FollowsATextSelection: Story = {
  render: () => <Bubble />,
  play: async ({ canvasElement }) => {
    await expect(shown()).toBe(false);
    const words = (canvasElement.querySelector(".text") as HTMLElement).firstChild as Text;
    const range = select(words, 15, 20);
    // A formatting bubble above the selected words.
    await waitFor(() => expect(shown()).toBe(true));
    await waitFor(() => expect(box(bar()).bottom).toBeLessThanOrEqual(range.getBoundingClientRect().top));
    // Selecting outside the editor, or collapsing the selection, hides it.
    select((canvasElement.querySelector(".outside") as HTMLElement).firstChild as Text, 0, 7);
    await waitFor(() => expect(shown()).toBe(false));
    select(words, 3, 3);
    await waitFor(() => expect(shown()).toBe(false));
  },
};

function Docked() {
  const target = useRef<HTMLDivElement>(null);
  return (
    <div>
      <div style={{ blockSize: "120vh" }} />
      <div
        ref={target}
        className="target"
        style={{ padding: 12, border: "var(--cy-border-width) solid var(--cy-color-line)" }}
      >
        Text box being edited
      </div>
      <DockedToolbar label="Text style" keepVisible={target} trailing={<Button size="sm">Done</Button>}>
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} style={{ display: "contents" }}>
            {tools}
          </span>
        ))}
      </DockedToolbar>
    </div>
  );
}

const docked = () => document.querySelector(".cy-docked-toolbar") as HTMLElement;

export const DockedAboveTheKeyboard: Story = {
  render: () => <Docked />,
  play: async ({ canvas, canvasElement }) => {
    await waitFor(() => expect(docked().matches(":popover-open")).toBe(true));
    const b = box(docked());
    // Full width, at the bottom of the visible viewport.
    await expect(Math.round(b.bottom)).toBe(window.innerHeight);
    await expect(Math.round(b.width)).toBe(window.innerWidth);
    // One row that scrolls sideways instead of wrapping; Done stays in reach.
    const row = docked().querySelector('[role="toolbar"]') as HTMLElement;
    await expect(row.scrollWidth).toBeGreaterThan(row.clientWidth);
    await expect(canvas.getByRole("button", { name: "Done" })).toBeVisible();
    // The box being edited was scrolled into view above the bar, not covered.
    await waitFor(() =>
      expect(box(canvasElement.querySelector(".target") as Element).bottom).toBeLessThanOrEqual(b.top),
    );
  },
};

export const DockedOpensAndCloses: Story = {
  render: () => {
    function Toggle() {
      const target = useRef<HTMLDivElement>(null);
      const [open, setOpen] = useState(false);
      return (
        <div>
          <div ref={target} className="near">
            Already in view
          </div>
          <Button onClick={() => setOpen((o) => !o)}>Edit</Button>
          <DockedToolbar
            label="Quick tools"
            open={open}
            keepVisible={target}
            className="host-dock"
            hotkey={false}
          >
            {tools}
          </DockedToolbar>
          <FloatingToolbar
            label="Near tools"
            anchor={target}
            open={open}
            className="host-float"
            hotkey={false}
          >
            {tools}
          </FloatingToolbar>
        </div>
      );
    }
    return <Toggle />;
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const dock = canvasElement.querySelector(".host-dock") as HTMLElement;
    await expect(dock.matches(":popover-open")).toBe(false);
    // Closed: no room is reserved at the end of the page.
    await expect((canvasElement.querySelector(".cy-docked-toolbar-room") as HTMLElement).offsetHeight).toBe(
      0,
    );
    const y = window.scrollY;
    await userEvent.click(canvas.getByRole("button", { name: "Edit" }));
    await waitFor(() => expect(dock.matches(":popover-open")).toBe(true));
    await expect(canvasElement.querySelector(".host-float")?.matches(":popover-open")).toBe(true);
    // The box was already above the bar: the page does not move.
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    await expect(window.scrollY).toBe(y);
    // With no hotkey, Alt+F10 leaves focus where it is.
    canvas.getByRole("button", { name: "Edit" }).focus();
    await userEvent.keyboard("{Alt>}{F10}{/Alt}");
    await expect(canvas.getByRole("button", { name: "Edit" })).toHaveFocus();
  },
};

export const TouchTargets: Story = {
  tags: ["touch", "!dev"],
  render: () => <Docked />,
  play: async ({ canvas }) => {
    const first = canvas.getAllByRole("button", { name: "Bold" })[0] as HTMLElement;
    await expect(Number.parseFloat(getComputedStyle(first, "::before").height)).toBeGreaterThanOrEqual(44);
  },
};

export const StableUnderHostileHost: Story = {
  play: async () => {
    await waitFor(() => expect(shown()).toBe(true));
    const { clean, hostile } = computeUnderHostileHost(document, ".cy-floating-toolbar", [
      "position",
      "padding-left",
      "background-color",
      "border-top-width",
      "box-sizing",
      "font-size",
    ]);
    await expect(hostile).toEqual(clean);
  },
};
