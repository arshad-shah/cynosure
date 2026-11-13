import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { expect, fn, waitFor, within } from "storybook/test";
import { archive, copy, download, edit, flag, folder, share, tag, trash } from "../../icons/index.js";
import { createStyleSheet } from "../../styles/inline.js";
import { backdrop, contrast, rgb } from "../../test/color.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { shownFully } from "../../test/settle.js";
import { Button } from "../Button/Button.js";
import { Popover } from "../Popover/Popover.js";
import { Menu, type MenuEntry } from "./Menu.js";

const items: MenuEntry[] = [
  { value: "edit", label: "Edit", icon: edit, shortcut: ["Ctrl", "E"] },
  { value: "copy", label: "Copy path", icon: copy },
  { value: "download", label: "Download", icon: download, disabled: true },
  { value: "archive", label: "Archive", icon: archive, shortcut: "mod+shift+a" },
  {
    label: "Danger zone",
    items: [{ value: "delete", label: "Delete", icon: trash, tone: "danger" }],
  },
];

const meta = {
  title: "Components/Menu",
  component: Menu,
  args: {
    label: "File actions",
    items,
    onSelect: fn(),
    placement: "bottom",
    trigger: (props) => <Button {...props}>Actions</Button>,
  },
  argTypes: { placement: { control: "inline-radio", options: ["top", "bottom", "start", "end"] } },
} satisfies Meta<typeof Menu>;
export default meta;
type Story = StoryObj<typeof meta>;

const isOpen = (el: Element | null) => !!el?.matches(":popover-open");
const settledClosed = (el: Element) =>
  waitFor(() => {
    expect(isOpen(el)).toBe(false);
    expect(getComputedStyle(el).display).toBe("none");
  });

export const KeyboardOpensNavigatesAndSelects: Story = {
  tags: ["visual"],
  play: async ({ args, canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Actions" });
    await expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    trigger.focus();
    await userEvent.keyboard("{ArrowDown}");
    const menu = await canvas.findByRole("menu", { name: "File actions" });
    await shownFully(menu);
    await waitFor(() => expect(canvas.getByRole("menuitem", { name: /Edit/ })).toHaveFocus());
    await userEvent.keyboard("{ArrowDown}");
    await expect(canvas.getByRole("menuitem", { name: "Copy path" })).toHaveFocus();
    // Disabled items are skipped.
    await userEvent.keyboard("{ArrowDown}");
    await expect(canvas.getByRole("menuitem", { name: "Archive" })).toHaveFocus();
    await userEvent.keyboard("{End}");
    await expect(canvas.getByRole("menuitem", { name: "Delete" })).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(canvas.getByRole("menuitem", { name: /Edit/ })).toHaveFocus();
    await userEvent.keyboard("{ArrowUp}{Home}");
    await expect(canvas.getByRole("menuitem", { name: /Edit/ })).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect(args.onSelect).toHaveBeenCalledWith("copy");
    await settledClosed(menu);
    await expect(trigger).toHaveFocus();
  },
};

export const GapFromTheTriggerIsAToken: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 16 }}>
      <Menu {...args} />
      <div style={{ "--cy-menu-offset": "20px" } as React.CSSProperties}>
        <Menu {...args} label="Wide gap" trigger={(props) => <Button {...props}>Spaced</Button>} />
      </div>
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    const gapOf = async (name: string, menuName: string) => {
      const trigger = canvas.getByRole("button", { name });
      await userEvent.click(trigger);
      const menu = await canvas.findByRole("menu", { name: menuName });
      await shownFully(menu);
      const gap = menu.getBoundingClientRect().top - trigger.getBoundingClientRect().bottom;
      await userEvent.keyboard("{Escape}");
      await settledClosed(menu);
      return gap;
    };
    // The default gap is --cy-space-2 (4px); --cy-menu-offset changes it.
    await expect(await gapOf("Actions", "File actions")).toBeCloseTo(4, 0);
    await expect(await gapOf("Spaced", "Wide gap")).toBeCloseTo(20, 0);
  },
};

export const ArrowUpOpensAtTheLastItem: Story = {
  play: async ({ canvas, userEvent }) => {
    canvas.getByRole("button", { name: "Actions" }).focus();
    await userEvent.keyboard("{ArrowUp}");
    await waitFor(() => expect(canvas.getByRole("menuitem", { name: "Delete" })).toHaveFocus());
  },
};

export const TypeaheadJumpsToMatchingItems: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Actions" }));
    await waitFor(() => expect(canvas.getByRole("menuitem", { name: /Edit/ })).toHaveFocus());
    await userEvent.keyboard("a");
    await expect(canvas.getByRole("menuitem", { name: "Archive" })).toHaveFocus();
    await userEvent.keyboard("d");
    // "Download" is disabled, so "d" lands on Delete.
    await expect(canvas.getByRole("menuitem", { name: "Delete" })).toHaveFocus();
  },
};

export const PointerSelectsAndShowsStructure: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Actions" }));
    const menu = await canvas.findByRole("menu");
    const group = canvas.getByRole("group", { name: "Danger zone" });
    await expect(group).toContainElement(canvas.getByRole("menuitem", { name: "Delete" }));
    await expect(canvas.getByRole("menuitem", { name: /Edit/ })).toHaveAttribute(
      "aria-keyshortcuts",
      "Control+E",
    );
    // A shortcut string gets this platform's modifier.
    await expect(canvas.getByRole("menuitem", { name: /Archive/ }).getAttribute("aria-keyshortcuts")).toMatch(
      /^(Control|Meta)\+Shift\+A$/,
    );
    await expect(canvas.getByRole("menuitem", { name: "Download" })).toHaveAttribute("aria-disabled", "true");
    const del = canvas.getByRole("menuitem", { name: "Delete" });
    await expect(getComputedStyle(del).color).not.toBe(
      getComputedStyle(canvas.getByRole("menuitem", { name: "Archive" })).color,
    );
    await userEvent.click(canvas.getByRole("menuitem", { name: "Download" }));
    await expect(args.onSelect).not.toHaveBeenCalled();
    await expect(isOpen(menu)).toBe(true);
    await userEvent.click(del);
    await expect(args.onSelect).toHaveBeenCalledWith("delete");
    await settledClosed(menu);
  },
};

export const EscapeAndTabClose: Story = {
  render: (args) => (
    <>
      <Menu {...args} />
      <Button>Next</Button>
    </>
  ),
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Actions" });
    await userEvent.click(trigger);
    const menu = await canvas.findByRole("menu");
    await userEvent.keyboard("{Escape}");
    await settledClosed(menu);
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(isOpen(menu)).toBe(true));
    // Tab closes the menu and moves on, like leaving the button.
    await userEvent.tab();
    await settledClosed(menu);
    await expect(canvas.getByRole("button", { name: "Next" })).toHaveFocus();
  },
};

function Checkable() {
  const [wrap, setWrap] = useState(true);
  const [indent, setIndent] = useState("2");
  return (
    <>
      <Menu
        label="View"
        trigger={(p) => <Button {...p}>View</Button>}
        items={[
          { value: "wrap", label: "Wrap lines", kind: "checkbox", checked: wrap },
          {
            label: "Indent",
            items: [
              { value: "2", label: "2 spaces", kind: "radio", checked: indent === "2" },
              { value: "4", label: "4 spaces", kind: "radio", checked: indent === "4" },
            ],
          },
        ]}
        onSelect={(value) => (value === "wrap" ? setWrap((w) => !w) : setIndent(value))}
      />
      <span data-testid="state">
        {String(wrap)} {indent}
      </span>
    </>
  );
}

export const CheckableItemsStayOpen: Story = {
  render: () => <Checkable />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "View" }));
    const menu = await canvas.findByRole("menu");
    const wrapItem = canvas.getByRole("menuitemcheckbox", { name: "Wrap lines" });
    await expect(wrapItem).toHaveAttribute("aria-checked", "true");
    await userEvent.click(wrapItem);
    await expect(canvas.getByTestId("state")).toHaveTextContent("false 2");
    await expect(wrapItem).toHaveAttribute("aria-checked", "false");
    await expect(isOpen(menu)).toBe(true);
    await userEvent.click(canvas.getByRole("menuitemradio", { name: "4 spaces" }));
    await expect(canvas.getByRole("menuitemradio", { name: "4 spaces" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await expect(canvas.getByRole("menuitemradio", { name: "2 spaces" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  },
};

export const InsideAPopoverClosesOnlyItself: Story = {
  render: (args) => (
    <Popover label="Panel" trigger={(p) => <Button {...p}>Panel</Button>}>
      <Menu {...args} />
    </Popover>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Panel" }));
    const panel = await canvas.findByRole("dialog", { name: "Panel" });
    await userEvent.click(await canvas.findByRole("button", { name: "Actions" }));
    const menu = await canvas.findByRole("menu");
    await waitFor(() => expect(isOpen(menu)).toBe(true));
    await userEvent.keyboard("{Escape}");
    await settledClosed(menu);
    await expect(isOpen(panel)).toBe(true);
    await expect(canvas.getByRole("button", { name: "Actions" })).toHaveFocus();
  },
};

export const TouchRows: Story = {
  tags: ["touch", "!dev"],
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.pointer({ keys: "[TouchA]", target: canvas.getByRole("button", { name: "Actions" }) });
    await canvas.findByRole("menu");
    const row = canvas.getByRole("menuitem", { name: "Archive" });
    await waitFor(() => expect(row.getBoundingClientRect().height).toBeGreaterThanOrEqual(44));
    await userEvent.pointer({ keys: "[TouchA]", target: row });
    await expect(args.onSelect).toHaveBeenCalledWith("archive");
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
  args: { label: "Priority", items: coloured, className: "priority-menu" },
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Actions" });
    const danger = token(trigger, "--cy-color-danger");
    const muted = token(trigger, "--cy-color-muted");
    await userEvent.click(trigger);
    const menu = await canvas.findByRole("menu", { name: "Priority" });
    await shownFully(menu);
    const item = (name: string) => canvas.getByRole("menuitem", { name });
    await expect(colourOf(iconOf(item("High priority")))).toEqual(danger);
    await expect(colourOf(iconOf(item("Low priority")))).toEqual(token(trigger, "--cy-color-info"));
    await expect(colourOf(iconOf(item("Garden")))).toEqual(rgb(VIOLET));
    // Unchanged without the props: muted, or the item's own colour on a danger item. Disabled items are muted too.
    await expect(colourOf(iconOf(item("No priority")))).toEqual(muted);
    await expect(colourOf(iconOf(item("Delete")))).toEqual(colourOf(item("Delete")));
    await expect(colourOf(iconOf(item("Locked")))).toEqual(muted);
    await expect(getComputedStyle(item("Locked")).opacity).toBe("0.45");
    // The focused (highlighted) item keeps the icon's colour, readable on the highlight (3:1 for graphics).
    await waitFor(() => expect(item("High priority")).toHaveFocus());
    await expect(colourOf(iconOf(item("High priority")))).toEqual(danger);
    for (const name of ["High priority", "Low priority"]) {
      item(name).focus();
      const ratio = contrast(getComputedStyle(iconOf(item(name))).color, backdrop(item(name)));
      await expect({ name, visible: ratio >= 3 }).toEqual({ name, visible: true });
    }
    await expect(getComputedStyle(item("Low priority")).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    // Closing from the trigger and opening again: the colours are a property of the items, not of one opening.
    await userEvent.click(trigger);
    await settledClosed(menu);
    await expect(menu).toHaveClass("cy-menu", "priority-menu");
    await userEvent.click(trigger);
    await shownFully(menu);
    await expect(colourOf(iconOf(item("Garden")))).toEqual(rgb(VIOLET));
  },
};

export const ItemIconColourIsStableUnderHostileHost: Story = {
  args: { label: "Priority", items: coloured },
  play: async ({ canvasElement }) => {
    for (const selector of [
      '.cy-menu-icon[data-tone="danger"]',
      '.cy-menu-icon[style*="color"]',
      '[aria-disabled="true"] > .cy-menu-icon',
      '[data-label="No priority"] > .cy-menu-icon',
    ]) {
      const icon = computeUnderHostileHost(canvasElement, selector, ["color", "stroke", "width"]);
      await expect({ selector, ...icon.hostile }).toEqual({ selector, ...icon.clean });
    }
    const toned = computeUnderHostileHost(canvasElement, '.cy-menu-icon[data-tone="danger"]', ["color"]);
    await expect(rgb(toned.hostile.color as string)).toEqual(
      token(canvasElement.querySelector(".cy-menu") as Element, "--cy-color-danger"),
    );
  },
};

/** Items with submenus, nested two deep. */
const nested: MenuEntry[] = [
  { value: "open", label: "Open" },
  {
    value: "move",
    label: "Move to",
    icon: folder,
    items: [
      { value: "inbox", label: "Inbox" },
      {
        value: "projects",
        label: "Projects",
        items: [
          { value: "alpha", label: "Alpha" },
          { value: "beta", label: "Beta" },
        ],
      },
      { value: "archived", label: "Archived" },
    ],
  },
  {
    value: "share",
    label: "Share",
    icon: share,
    items: [
      { value: "link", label: "Copy link" },
      { value: "email", label: "Email" },
    ],
  },
  { value: "export", label: "Export", disabled: true, items: [{ value: "pdf", label: "PDF" }] },
  { value: "delete", label: "Delete", icon: trash, tone: "danger" },
];

/** The submenu panel a parent item controls (closed panels are hidden, so not found by role). */
const panelOf = (item: HTMLElement) =>
  (item.getRootNode() as ParentNode).querySelector(
    `[id="${item.getAttribute("aria-controls")}"]`,
  ) as HTMLElement;
const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const SubmenusOpenAndCloseFromTheKeyboard: Story = {
  args: { items: nested },
  play: async ({ args, canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Actions" });
    trigger.focus();
    await userEvent.keyboard("{ArrowDown}");
    const root = await canvas.findByRole("menu", { name: "File actions" });
    await shownFully(root);
    await waitFor(() => expect(canvas.getByRole("menuitem", { name: "Open" })).toHaveFocus());
    const move = canvas.getByRole("menuitem", { name: "Move to" });
    await expect(move).toHaveAttribute("aria-haspopup", "menu");
    await expect(move).toHaveAttribute("aria-expanded", "false");
    // A parent item shows a chevron that points the way the submenu opens.
    await expect(move.querySelector(".cy-menu-chevron")).toHaveAttribute("data-flip-rtl");
    const sub = panelOf(move);
    await expect(sub).toHaveAttribute("role", "menu");
    await expect(sub).toHaveAttribute("aria-label", "Move to");
    // Right opens the submenu on its first item.
    await userEvent.keyboard("{ArrowDown}{ArrowRight}");
    await shownFully(sub);
    await waitFor(() => expect(canvas.getByRole("menuitem", { name: "Inbox" })).toHaveFocus());
    await expect(move).toHaveAttribute("aria-expanded", "true");
    await expect(isOpen(root)).toBe(true);
    // Arrows stay inside the submenu, and type-ahead finds only its items.
    await userEvent.keyboard("{ArrowUp}");
    await expect(canvas.getByRole("menuitem", { name: "Archived" })).toHaveFocus();
    await userEvent.keyboard("i");
    await expect(canvas.getByRole("menuitem", { name: "Inbox" })).toHaveFocus();
    await userEvent.keyboard("d");
    await expect(canvas.getByRole("menuitem", { name: "Inbox" })).toHaveFocus();
    // Left closes it back to its parent item.
    await userEvent.keyboard("{ArrowLeft}");
    await settledClosed(sub);
    await expect(move).toHaveFocus();
    await expect(move).toHaveAttribute("aria-expanded", "false");
    await expect(isOpen(root)).toBe(true);
    // Left in the top menu does nothing.
    await userEvent.keyboard("{ArrowLeft}");
    await expect(move).toHaveFocus();
    await expect(isOpen(root)).toBe(true);
    // Enter and Space open it too.
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(canvas.getByRole("menuitem", { name: "Inbox" })).toHaveFocus());
    await userEvent.keyboard("{ArrowLeft}");
    await settledClosed(sub);
    await userEvent.keyboard(" ");
    await waitFor(() => expect(canvas.getByRole("menuitem", { name: "Inbox" })).toHaveFocus());
    await expect(args.onSelect).not.toHaveBeenCalled();
    // Nested to any depth: Projects opens a third menu.
    await userEvent.keyboard("{ArrowDown}{ArrowRight}");
    const projects = canvas.getByRole("menuitem", { name: "Projects" });
    const third = panelOf(projects);
    await shownFully(third);
    await waitFor(() => expect(canvas.getByRole("menuitem", { name: "Alpha" })).toHaveFocus());
    // Choosing an item at any level calls onSelect with its value and closes the whole tree.
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect(args.onSelect).toHaveBeenCalledWith("beta");
    await settledClosed(root);
    await expect(isOpen(sub)).toBe(false);
    await expect(isOpen(third)).toBe(false);
    await expect(trigger).toHaveFocus();
    await expect(move).toHaveAttribute("aria-expanded", "false");
  },
};

export const EscapeClosesOneLevelAtATime: Story = {
  args: { items: nested },
  render: (args) => (
    <>
      <Menu {...args} />
      <Button>Next</Button>
    </>
  ),
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Actions" });
    await userEvent.click(trigger);
    const root = await canvas.findByRole("menu", { name: "File actions" });
    await waitFor(() => expect(canvas.getByRole("menuitem", { name: "Open" })).toHaveFocus());
    await userEvent.keyboard("{ArrowDown}{ArrowRight}");
    await waitFor(() => expect(canvas.getByRole("menuitem", { name: "Inbox" })).toHaveFocus());
    await userEvent.keyboard("{ArrowDown}{ArrowRight}");
    await waitFor(() => expect(canvas.getByRole("menuitem", { name: "Alpha" })).toHaveFocus());
    const move = canvas.getByRole("menuitem", { name: "Move to" });
    const projects = canvas.getByRole("menuitem", { name: "Projects" });
    const [sub, third] = [panelOf(move), panelOf(projects)];
    await userEvent.keyboard("{Escape}");
    await settledClosed(third);
    await expect(projects).toHaveFocus();
    await expect([isOpen(root), isOpen(sub)]).toEqual([true, true]);
    await userEvent.keyboard("{Escape}");
    await settledClosed(sub);
    await expect(move).toHaveFocus();
    await expect(isOpen(root)).toBe(true);
    await userEvent.keyboard("{Escape}");
    await settledClosed(root);
    await expect(trigger).toHaveFocus();
    // Tab from a submenu closes the whole tree and moves on.
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(canvas.getByRole("menuitem", { name: "Open" })).toHaveFocus());
    await userEvent.keyboard("{ArrowDown}{ArrowRight}");
    await waitFor(() => expect(canvas.getByRole("menuitem", { name: "Inbox" })).toHaveFocus());
    await userEvent.tab();
    await settledClosed(root);
    await expect(isOpen(sub)).toBe(false);
  },
};

/**
 * Moves a mouse pointer onto `to` as a browser reports it: out of the last element and over the next, each naming the
 * other, so leaving an element inside the menu is not leaving the menu. (Testing Library's hover names neither, and
 * moving the real pointer waits for elements to settle, longer than the delays under test.)
 */
function pointer(start: Element) {
  let at = start;
  return (to: Element) => {
    const init = { bubbles: true, composed: true, pointerType: "mouse", pointerId: 1, isPrimary: true };
    at.dispatchEvent(new PointerEvent("pointerout", { ...init, relatedTarget: to }));
    to.dispatchEvent(new PointerEvent("pointerover", { ...init, relatedTarget: at }));
    at = to;
  };
}

export const SubmenusOpenOnHoverAfterADelay: Story = {
  args: { items: nested },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Actions" });
    await userEvent.click(trigger);
    const root = await canvas.findByRole("menu", { name: "File actions" });
    await shownFully(root);
    const item = (name: string) => canvas.getByRole("menuitem", { name });
    const move = item("Move to");
    const sub = panelOf(move);
    const moveTo = pointer(trigger);
    // Passing over a parent item opens nothing; resting on it opens its submenu, without taking focus.
    moveTo(move);
    await pause(100);
    // Moving within the item does not restart the wait.
    moveTo(move.querySelector(".cy-menu-label") as Element);
    await expect(isOpen(sub)).toBe(false);
    await pause(100);
    await expect(isOpen(sub)).toBe(true);
    await shownFully(sub);
    await expect(item("Open")).toHaveFocus();
    // Moving diagonally towards the submenu crosses other items; the submenu stays open.
    const del = item("Delete");
    moveTo(item("Share"));
    moveTo(del);
    await pause(150);
    moveTo(item("Archived"));
    await pause(500);
    await expect(isOpen(sub)).toBe(true);
    // Back on its parent item, it stays open.
    moveTo(del);
    moveTo(move);
    await pause(500);
    await expect(isOpen(sub)).toBe(true);
    // Hovering a nested parent opens the next level; the levels above stay open.
    const projects = item("Projects");
    moveTo(projects);
    const third = panelOf(projects);
    await waitFor(() => expect(isOpen(third)).toBe(true));
    moveTo(item("Alpha"));
    await pause(500);
    await expect([isOpen(root), isOpen(sub), isOpen(third)]).toEqual([true, true, true]);
    // Resting on another parent of the top menu switches to its submenu; on a plain item, closes it.
    const shareItem = item("Share");
    moveTo(shareItem);
    const shareMenu = panelOf(shareItem);
    await waitFor(() => expect(isOpen(shareMenu)).toBe(true));
    await settledClosed(sub);
    await expect(isOpen(third)).toBe(false);
    moveTo(item("Open"));
    await settledClosed(shareMenu);
    // Leaving the menu while a switch is pending cancels it.
    moveTo(move);
    await waitFor(() => expect(isOpen(sub)).toBe(true));
    moveTo(del);
    moveTo(canvasElement);
    await pause(500);
    await expect(isOpen(sub)).toBe(true);
    // Touch pointers pass over items too, but only a tap opens a submenu.
    moveTo(item("Archived"));
    del.dispatchEvent(new PointerEvent("pointerover", { bubbles: true, pointerType: "touch" }));
    await pause(500);
    await expect(isOpen(sub)).toBe(true);
    // A click in a submenu chooses its item and closes everything.
    await userEvent.click(canvas.getByRole("menuitem", { name: "Inbox" }));
    await expect(args.onSelect).toHaveBeenCalledWith("inbox");
    await expect(args.onSelect).toHaveBeenCalledTimes(1);
    await settledClosed(root);
    await expect(isOpen(sub)).toBe(false);
  },
};

export const ClickingAParentOpensItsSubmenu: Story = {
  args: { items: nested },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Actions" }));
    const root = await canvas.findByRole("menu", { name: "File actions" });
    const move = canvas.getByRole("menuitem", { name: "Move to" });
    await userEvent.click(move);
    const sub = panelOf(move);
    await waitFor(() => expect(canvas.getByRole("menuitem", { name: "Inbox" })).toHaveFocus());
    // A parent item is not a command: clicking it again keeps its submenu open.
    await userEvent.click(move);
    await expect(isOpen(sub)).toBe(true);
    await expect(args.onSelect).not.toHaveBeenCalled();
    // A disabled parent opens nothing, by click or by resting the pointer on it.
    const exp = canvas.getByRole("menuitem", { name: "Export" });
    await expect(exp).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(exp);
    await pause(500);
    await expect(isOpen(panelOf(exp))).toBe(false);
    await expect(exp).toHaveAttribute("aria-expanded", "false");
    await expect(isOpen(sub)).toBe(false);
    // Clicking another item of the top menu chooses it and closes everything.
    await userEvent.click(canvas.getByRole("menuitem", { name: "Delete" }));
    await expect(args.onSelect).toHaveBeenCalledWith("delete");
    await settledClosed(root);
    await settledClosed(sub);
  },
};

export const SubmenusSitBesideTheirParent: Story = {
  args: { items: nested },
  render: (args) => (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <Menu {...args} />
      <Menu {...args} label="Edge actions" trigger={(p) => <Button {...p}>At the edge</Button>} />
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    const check = async (trigger: string, menu: string, side: "end" | "start") => {
      await userEvent.click(canvas.getByRole("button", { name: trigger }));
      const root = await canvas.findByRole("menu", { name: menu });
      await shownFully(root);
      const move = within(root).getByRole("menuitem", { name: "Move to" });
      await userEvent.click(move);
      const sub = panelOf(move);
      await shownFully(sub);
      const [r, s] = [root.getBoundingClientRect(), sub.getBoundingClientRect()];
      if (side === "end") await expect(s.left).toBeGreaterThanOrEqual(r.right - 2);
      else await expect(s.right).toBeLessThanOrEqual(r.left + 2);
      await expect(sub).toHaveAttribute("data-placement", side);
      // The submenu's first item lines up with its parent item.
      const first = sub.querySelector('[role="menuitem"]') as HTMLElement;
      const drift = Math.abs(first.getBoundingClientRect().top - move.getBoundingClientRect().top);
      await expect(drift).toBeLessThan(2);
      await userEvent.keyboard("{Escape}{Escape}");
      await settledClosed(root);
    };
    await check("Actions", "File actions", "end");
    // Without room at the end of the viewport, the submenu flips to the other side.
    await check("At the edge", "Edge actions", "start");
  },
};

export const SubmenusInRightToLeft: Story = {
  args: { items: nested },
  render: (args) => (
    <div dir="rtl">
      <Menu {...args} />
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Actions" }));
    const root = await canvas.findByRole("menu", { name: "File actions" });
    await waitFor(() => expect(canvas.getByRole("menuitem", { name: "Open" })).toHaveFocus());
    const move = canvas.getByRole("menuitem", { name: "Move to" });
    const sub = panelOf(move);
    // Right does not open it in right-to-left text: Left does, and the submenu opens to the left.
    await userEvent.keyboard("{ArrowDown}{ArrowRight}");
    await expect(isOpen(sub)).toBe(false);
    await userEvent.keyboard("{ArrowLeft}");
    await shownFully(sub);
    await waitFor(() => expect(canvas.getByRole("menuitem", { name: "Inbox" })).toHaveFocus());
    await expect(sub.getBoundingClientRect().right).toBeLessThanOrEqual(
      root.getBoundingClientRect().left + 2,
    );
    // The chevron points left.
    const chevron = move.querySelector(".cy-menu-chevron") as Element;
    await expect(getComputedStyle(chevron).scale).toBe("-1 1");
    await userEvent.keyboard("{ArrowRight}");
    await settledClosed(sub);
    await expect(move).toHaveFocus();
  },
};

const sectioned: MenuEntry[] = [
  {
    items: [
      { value: "undo", label: "Undo" },
      { value: "redo", label: "Redo" },
    ],
  },
  {
    items: [
      { value: "cut", label: "Cut" },
      { value: "copy", label: "Copy" },
    ],
  },
  { value: "select", label: "Select all" },
  { label: "Danger zone", items: [{ value: "delete", label: "Delete", tone: "danger" }] },
];

export const SectionsWithoutALabelAreSeparated: Story = {
  args: { items: sectioned, label: "Edit" },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Actions" }));
    const menu = await canvas.findByRole("menu", { name: "Edit" });
    await shownFully(menu);
    // Unlabelled sections are not groups; a line separates them from what comes before and after.
    await expect(canvas.getAllByRole("group")).toHaveLength(1);
    const lines = within(menu).getAllByRole("separator");
    await expect(lines).toHaveLength(3);
    const order = [...menu.querySelectorAll('[role="menuitem"], hr')].map((el) =>
      el.matches("hr") ? "|" : el.textContent,
    );
    await expect(order).toEqual(["Undo", "Redo", "|", "Cut", "Copy", "|", "Select all", "|", "Delete"]);
    await expect(lines[0]?.getBoundingClientRect().height).toBeGreaterThan(0);
    // Their items are ordinary items.
    await waitFor(() => expect(canvas.getByRole("menuitem", { name: "Undo" })).toHaveFocus());
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    await expect(args.onSelect).toHaveBeenCalledWith("cut");
  },
};

function Controlled({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open from a shortcut</Button>
      <Menu
        label="Controlled"
        items={nested}
        onSelect={() => {}}
        open={open}
        onOpenChange={(next) => {
          onOpenChange(next);
          setOpen(next);
        }}
        trigger={(p) => <Button {...p}>Actions</Button>}
      />
    </>
  );
}

export const ControlledOpen: Story = {
  args: { onOpenChange: fn() },
  render: (args) => <Controlled onOpenChange={args.onOpenChange as (open: boolean) => void} />,
  play: async ({ args, canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Actions" });
    // The app opens the menu (from a shortcut, say): it shows on its first item.
    await userEvent.click(canvas.getByRole("button", { name: "Open from a shortcut" }));
    const menu = await canvas.findByRole("menu", { name: "Controlled" });
    await shownFully(menu);
    await waitFor(() => expect(canvas.getByRole("menuitem", { name: "Open" })).toHaveFocus());
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    // Closing goes through the app.
    await userEvent.keyboard("{Escape}");
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
    await settledClosed(menu);
    await userEvent.click(trigger);
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(true);
    await waitFor(() => expect(isOpen(menu)).toBe(true));
  },
};

export const ControlledOpenStaysWithTheApp: Story = {
  args: { open: true, onOpenChange: fn() },
  play: async ({ args, canvas, userEvent }) => {
    const menu = await canvas.findByRole("menu", { name: "File actions" });
    await shownFully(menu);
    // Escape asks to close, but the app keeps it open.
    await userEvent.keyboard("{Escape}");
    await expect(args.onOpenChange).toHaveBeenCalledWith(false);
    await pause(100);
    await expect(isOpen(menu)).toBe(true);
  },
};

export const DefaultOpen: Story = {
  args: { defaultOpen: true, onOpenChange: fn() },
  play: async ({ args, canvas, userEvent }) => {
    const menu = await canvas.findByRole("menu", { name: "File actions" });
    await shownFully(menu);
    await waitFor(() => expect(canvas.getByRole("menuitem", { name: /Edit/ })).toHaveFocus());
    await userEvent.keyboard("{Escape}");
    await settledClosed(menu);
    await expect(args.onOpenChange).toHaveBeenCalledWith(false);
  },
};

export const TouchOpensSubmenus: Story = {
  tags: ["touch", "!dev"],
  args: { items: nested },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.pointer({ keys: "[TouchA]", target: canvas.getByRole("button", { name: "Actions" }) });
    const root = await canvas.findByRole("menu", { name: "File actions" });
    await shownFully(root);
    const move = canvas.getByRole("menuitem", { name: "Move to" });
    await expect(move.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    // A tap on a parent opens its submenu (touch has no hover).
    await userEvent.pointer({ keys: "[TouchA]", target: move });
    const sub = panelOf(move);
    await shownFully(sub);
    const inbox = canvas.getByRole("menuitem", { name: "Inbox" });
    await expect(inbox.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    await userEvent.pointer({ keys: "[TouchA]", target: inbox });
    await expect(args.onSelect).toHaveBeenCalledWith("inbox");
    await settledClosed(root);
  },
};

export const SubmenuPartsStableUnderHostileHost: Story = {
  args: { items: [...nested, { items: [{ value: "last", label: "Last" }] }] },
  play: async ({ canvasElement }) => {
    const chevron = computeUnderHostileHost(canvasElement, ".cy-menu-chevron", [
      "width",
      "height",
      "color",
      "margin-inline-start",
    ]);
    await expect(chevron.hostile).toEqual(chevron.clean);
    const line = computeUnderHostileHost(canvasElement, ".cy-menu-separator", [
      "height",
      "margin-top",
      "background-color",
      "border-top-width",
      "box-sizing",
    ]);
    await expect(line.hostile).toEqual(line.clean);
  },
};

function ShadowMenu({ onSelect }: { onSelect: (value: string) => void }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current;
    if (!el || el.shadowRoot) return;
    const root = el.attachShadow({ mode: "open" });
    root.adoptedStyleSheets = [createStyleSheet()];
    const mount = document.createElement("div");
    root.append(mount);
    createRoot(mount).render(
      <Menu
        label="Shadow"
        items={nested}
        onSelect={onSelect}
        trigger={(p) => <Button {...p}>Actions</Button>}
      />,
    );
  }, [onSelect]);
  return <div data-testid="host" ref={host} />;
}

export const SubmenusInsideAShadowRoot: Story = {
  render: (args) => <ShadowMenu onSelect={args.onSelect} />,
  play: async ({ args, canvas, userEvent }) => {
    const host = await canvas.findByTestId("host");
    await waitFor(() => expect(host.shadowRoot?.querySelector("button")).toBeTruthy());
    const root = host.shadowRoot as ShadowRoot;
    (root.querySelector("button") as HTMLElement).focus();
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(root.activeElement?.textContent).toBe("Open"));
    await userEvent.keyboard("{ArrowDown}");
    const move = root.activeElement as HTMLElement;
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(root.activeElement?.textContent).toBe("Inbox"));
    const sub = panelOf(move);
    await expect(isOpen(sub)).toBe(true);
    await userEvent.keyboard("{Escape}");
    await settledClosed(sub);
    await expect(root.activeElement).toBe(move);
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(root.activeElement?.textContent).toBe("Inbox"));
    await userEvent.keyboard("{ArrowDown}{ArrowRight}");
    await waitFor(() => expect(root.activeElement?.textContent).toBe("Alpha"));
    await userEvent.keyboard("{Enter}");
    await expect(args.onSelect).toHaveBeenCalledWith("alpha");
    await waitFor(() => expect(root.activeElement?.textContent).toBe("Actions"));
    await settledClosed(root.querySelector('[role="menu"]') as HTMLElement);
    await expect(isOpen(sub)).toBe(false);
  },
};
