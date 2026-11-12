import type { Meta, StoryObj } from "@storybook/react-vite";
import type { Ref } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { copy } from "../../icons/copy.js";
import { flag } from "../../icons/flag.js";
import { tag } from "../../icons/tag.js";
import { trash } from "../../icons/trash.js";
import { backdrop, contrast, rgb } from "../../test/color.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { shownFully } from "../../test/settle.js";
import type { MenuEntry } from "../Menu/Menu.js";
import { ContextMenu } from "./ContextMenu.js";

const ITEMS: MenuEntry[] = [
  { value: "open", label: "Open" },
  { value: "copy", label: "Copy link", icon: copy, shortcut: ["Ctrl", "C"] },
  { value: "rename", label: "Rename", disabled: true },
  { value: "delete", label: "Delete", icon: trash, tone: "danger" },
];

const meta = {
  title: "Components/ContextMenu",
  component: ContextMenu,
  args: {
    label: "File actions",
    items: ITEMS,
    onSelect: fn(),
    onOpenChange: fn(),
    disabled: false,
    children: () => null,
  },
  argTypes: { children: { control: false } },
  render: (args) => (
    <ContextMenu {...args}>
      {(props) => (
        <div
          {...props}
          ref={props.ref as Ref<HTMLDivElement>}
          // biome-ignore lint/a11y/noNoninteractiveTabindex: a focusable row, so keyboard users can open its menu
          tabIndex={0}
          data-testid="target"
          style={{
            inlineSize: 320,
            blockSize: 120,
            padding: 12,
            border: "var(--cy-border-width) dashed var(--cy-color-line)",
            borderRadius: "var(--cy-radius-md)",
            WebkitTouchCallout: "none",
            userSelect: "none",
          }}
        >
          report.pdf: right-click, long-press or Shift+F10
        </div>
      )}
    </ContextMenu>
  ),
} satisfies Meta<typeof ContextMenu>;
export default meta;
type Story = StoryObj<typeof meta>;

const menu = () => document.querySelector('[role="menu"]') as HTMLElement;
const isOpen = () => menu().matches(":popover-open");

export const RightClickOpensWhereYouPoint: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const target = canvas.getByTestId("target");
    const box = target.getBoundingClientRect();
    const at = { clientX: box.left + 100, clientY: box.top + 40 };
    await userEvent.pointer({ keys: "[MouseRight]", target, coords: at });
    await shownFully(menu());
    await expect(menu()).toHaveAccessibleName("File actions");
    // The menu's corner sits at the pointer, not at the target's edge.
    const panel = menu().getBoundingClientRect();
    await expect(Math.abs(panel.left - at.clientX)).toBeLessThan(6);
    await expect(Math.abs(panel.top - at.clientY)).toBeLessThan(6);
    await expect(document.activeElement).toHaveTextContent("Open");
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(true);
  },
};

export const ChoosingRunsTheCommandAndCloses: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const target = canvas.getByTestId("target");
    target.focus();
    await userEvent.pointer({ keys: "[MouseRight]", target });
    await shownFully(menu());
    await userEvent.keyboard("{ArrowDown}");
    await expect(document.activeElement).toHaveTextContent("Copy link");
    // Disabled items are skipped by the arrows.
    await userEvent.keyboard("{ArrowDown}");
    await expect(document.activeElement).toHaveTextContent("Delete");
    await userEvent.keyboard("{Enter}");
    await expect(args.onSelect).toHaveBeenCalledWith("delete");
    await waitFor(() => expect(isOpen()).toBe(false));
    await expect(target).toHaveFocus();
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
  },
};

export const KeyboardOpensAtTheTarget: Story = {
  play: async ({ canvas, userEvent }) => {
    const target = canvas.getByTestId("target");
    await expect(target).toHaveAttribute("aria-keyshortcuts", "Shift+F10");
    target.focus();
    await userEvent.keyboard("{Shift>}{F10}{/Shift}");
    await shownFully(menu());
    // No pointer: the menu opens under the target.
    const box = target.getBoundingClientRect();
    await expect(menu().getBoundingClientRect().top).toBeGreaterThanOrEqual(box.bottom);
    await expect(document.activeElement).toHaveTextContent("Open");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(isOpen()).toBe(false));
    await expect(target).toHaveFocus();
    // The context menu key does the same.
    await userEvent.keyboard("{ContextMenu}");
    await waitFor(() => expect(isOpen()).toBe(true));
    await userEvent.keyboard("{Escape}");
  },
};

export const ClickingElsewhereCloses: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const target = canvas.getByTestId("target");
    await userEvent.pointer({ keys: "[MouseRight]", target });
    await shownFully(menu());
    await userEvent.click(canvasElement);
    await waitFor(() => expect(isOpen()).toBe(false));
  },
};

export const StaysOnScreenNearTheEdge: Story = {
  play: async ({ canvas, userEvent }) => {
    const target = canvas.getByTestId("target");
    const box = target.getBoundingClientRect();
    // Squeeze the window's space below the pointer: right-click near the bottom of the viewport.
    target.style.marginBlockStart = `${window.innerHeight - box.bottom - 20 + box.top}px`;
    const moved = target.getBoundingClientRect();
    await userEvent.pointer({
      keys: "[MouseRight]",
      target,
      coords: { clientX: moved.left + 20, clientY: moved.bottom - 4 },
    });
    await shownFully(menu());
    const panel = menu().getBoundingClientRect();
    await expect(panel.bottom).toBeLessThanOrEqual(window.innerHeight);
    await expect(panel.top).toBeGreaterThanOrEqual(0);
    await userEvent.keyboard("{Escape}");
  },
};

export const DisabledLeavesTheBrowserMenu: Story = {
  args: { disabled: true },
  play: async ({ args, canvas, userEvent }) => {
    const target = canvas.getByTestId("target");
    const event = new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      clientX: 20,
      clientY: 20,
    });
    // Not cancelled, so the browser's own menu would show.
    await expect(target.dispatchEvent(event)).toBe(true);
    target.focus();
    await userEvent.keyboard("{Shift>}{F10}{/Shift}");
    await expect(isOpen()).toBe(false);
    await expect(args.onOpenChange).not.toHaveBeenCalled();
  },
};

export const LongPressOpensOnTouch: Story = {
  tags: ["touch", "!dev"],
  play: async ({ canvas, userEvent }) => {
    const target = canvas.getByTestId("target");
    const box = target.getBoundingClientRect();
    const at = { clientX: box.left + 60, clientY: box.top + 30 };
    // A quick tap does nothing.
    await userEvent.pointer({ keys: "[TouchA]", target, coords: at });
    await new Promise((r) => setTimeout(r, 650));
    await expect(isOpen()).toBe(false);
    // A drag (scrolling) does nothing either.
    await userEvent.pointer([
      { keys: "[TouchA>]", target, coords: at },
      { pointerName: "TouchA", target, coords: { clientX: at.clientX, clientY: at.clientY + 40 } },
    ]);
    await new Promise((r) => setTimeout(r, 650));
    await userEvent.pointer({ keys: "[/TouchA]", target });
    await expect(isOpen()).toBe(false);
    // Holding still opens the menu at the finger.
    await userEvent.pointer({ keys: "[TouchA>]", target, coords: at });
    await waitFor(() => expect(isOpen()).toBe(true), { timeout: 2000 });
    await userEvent.pointer({ keys: "[/TouchA]", target });
    const panel = menu().getBoundingClientRect();
    await expect(Math.abs(panel.left - at.clientX)).toBeLessThan(6);
    // Rows are big enough for a finger.
    for (const item of menu().querySelectorAll('[role="menuitem"]')) {
      await expect(Math.round(item.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
    }
  },
};

export const MouseMovesAndCallbacksAreOptional: Story = {
  render: ({ onOpenChange: _onOpenChange, ...args }) => (
    <ContextMenu {...args}>
      {(props) => (
        <div
          {...props}
          ref={props.ref as Ref<HTMLDivElement>}
          data-testid="target"
          style={{ inlineSize: 320, blockSize: 120 }}
        >
          report.pdf
        </div>
      )}
    </ContextMenu>
  ),
  play: async ({ canvas, userEvent }) => {
    const target = canvas.getByTestId("target");
    // Ordinary mouse movement and clicks over the target do nothing.
    await userEvent.hover(target);
    await userEvent.click(target);
    await expect(isOpen()).toBe(false);
    // Without onOpenChange the menu still opens and closes.
    await userEvent.pointer({ keys: "[MouseRight]", target });
    await shownFully(menu());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(isOpen()).toBe(false));
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.pointer({ keys: "[MouseRight]", target: canvas.getByTestId("target") });
    await shownFully(menu());
    for (const selector of ['[role="menu"]', '[role="menuitem"]']) {
      const { clean, hostile } = computeUnderHostileHost(document, selector, [
        "font-size",
        "height",
        "padding-left",
        "background-color",
        "color",
        "border-top-width",
        "box-sizing",
      ]);
      await expect(hostile).toEqual(clean);
    }
    await userEvent.keyboard("{Escape}");
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

const coloured: MenuEntry[] = [
  { value: "high", label: "High priority", icon: flag, iconTone: "danger" },
  { value: "low", label: "Low priority", icon: flag, iconTone: "info" },
  { value: "garden", label: "Garden", icon: tag, iconColor: VIOLET },
  { value: "locked", label: "Locked", icon: flag, iconTone: "danger", iconColor: VIOLET, disabled: true },
  { value: "plain", label: "No priority", icon: flag },
  { label: "Danger zone", items: [{ value: "delete", label: "Delete", icon: trash, tone: "danger" }] },
];
const iconOf = (item: HTMLElement) => item.querySelector(".cy-menu-icon") as SVGElement;
const colourOf = (el: Element) => rgb(getComputedStyle(el).color);

export const ItemIconsKeepTheirColour: Story = {
  args: { label: "Task", items: coloured },
  play: async ({ canvas, userEvent }) => {
    const target = canvas.getByTestId("target");
    const danger = token(target, "--cy-color-danger");
    const muted = token(target, "--cy-color-muted");
    await userEvent.pointer({ keys: "[MouseRight]", target });
    await shownFully(menu());
    const item = (name: string) => canvas.getByRole("menuitem", { name });
    // The same item type as Menu, so the same props colour the icons here.
    await expect(colourOf(iconOf(item("High priority")))).toEqual(danger);
    await expect(colourOf(iconOf(item("Low priority")))).toEqual(token(target, "--cy-color-info"));
    await expect(colourOf(iconOf(item("Garden")))).toEqual(rgb(VIOLET));
    await expect(colourOf(iconOf(item("No priority")))).toEqual(muted);
    await expect(colourOf(iconOf(item("Delete")))).toEqual(colourOf(item("Delete")));
    await expect(colourOf(iconOf(item("Locked")))).toEqual(muted);
    // The focused first item keeps the icon's colour, readable on the highlight (3:1 for graphics).
    await waitFor(() => expect(item("High priority")).toHaveFocus());
    await expect(colourOf(iconOf(item("High priority")))).toEqual(danger);
    const ratio = contrast(
      getComputedStyle(iconOf(item("High priority"))).color,
      backdrop(item("High priority")),
    );
    await expect(ratio).toBeGreaterThanOrEqual(3);
  },
};

export const ItemIconColourIsStableUnderHostileHost: Story = {
  args: { label: "Task", items: coloured },
  play: async ({ canvasElement }) => {
    for (const selector of [
      '.cy-menu-icon[data-tone="info"]',
      '.cy-menu-icon[style*="color"]',
      '[aria-disabled="true"] > .cy-menu-icon',
    ]) {
      const icon = computeUnderHostileHost(canvasElement, selector, ["color", "stroke", "width"]);
      await expect({ selector, ...icon.hostile }).toEqual({ selector, ...icon.clean });
    }
  },
};
