import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { expect, fn, waitFor } from "storybook/test";
import { copy, edit, folder, save, search, trash } from "../../icons/index.js";
import { createStyleSheet } from "../../styles/inline.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { shownFully } from "../../test/settle.js";
import { Button } from "../Button/Button.js";
import { Menubar, type MenubarMenu } from "./Menubar.js";

const menus: MenubarMenu[] = [
  {
    label: "File",
    items: [
      { value: "new", label: "New query", icon: edit, shortcut: "mod+n" },
      { value: "open", label: "Open", icon: folder, shortcut: ["Ctrl", "O"] },
      { value: "save", label: "Save", icon: save, shortcut: "mod+s", disabled: true },
      { label: "Danger zone", items: [{ value: "close", label: "Close all", icon: trash, tone: "danger" }] },
    ],
  },
  {
    label: "Edit",
    items: [
      { value: "copy", label: "Copy", icon: copy, shortcut: "mod+c" },
      { value: "find", label: "Find", icon: search, shortcut: "mod+f" },
    ],
  },
  {
    label: "View",
    items: [
      { value: "wrap", label: "Word wrap", kind: "checkbox", checked: true },
      { value: "minimap", label: "Minimap", kind: "checkbox", checked: false },
    ],
  },
];

const meta = {
  title: "Components/Menubar",
  component: Menubar,
  args: { label: "Application", menus, onSelect: fn(), size: "md" },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    menus: { control: "object" },
  },
} satisfies Meta<typeof Menubar>;
export default meta;
type Story = StoryObj<typeof meta>;

const isOpen = (el: Element | null) => !!el?.matches(":popover-open");
const settledClosed = (el: Element) =>
  waitFor(() => {
    expect(isOpen(el)).toBe(false);
    expect(getComputedStyle(el).display).toBe("none");
  });
/** The open menus (only one may be open at a time). */
const openMenus = (root: ParentNode) => [...root.querySelectorAll('[role="menu"]')].filter(isOpen);

export const KeyboardMovesBetweenMenus: Story = {
  tags: ["visual"],
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const bar = canvas.getByRole("menubar", { name: "Application" });
    await expect(bar).toHaveAttribute("aria-orientation", "horizontal");
    const file = canvas.getByRole("menuitem", { name: "File" });
    const edit = canvas.getByRole("menuitem", { name: "Edit" });
    const view = canvas.getByRole("menuitem", { name: "View" });
    await expect(file).toHaveAttribute("aria-haspopup", "menu");
    await expect(file).toHaveAttribute("aria-expanded", "false");
    // One tab stop: the first title.
    await expect([file.tabIndex, edit.tabIndex, view.tabIndex]).toEqual([0, -1, -1]);
    await userEvent.tab();
    await expect(file).toHaveFocus();
    // Left/Right move between titles (wrapping) without opening anything.
    await userEvent.keyboard("{ArrowRight}");
    await expect(edit).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    await expect(view).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(file).toHaveFocus();
    await expect(openMenus(canvasElement)).toHaveLength(0);
    // Down opens the focused menu on its first item.
    await userEvent.keyboard("{ArrowDown}");
    const fileMenu = await canvas.findByRole("menu", { name: "File" });
    await shownFully(fileMenu);
    await waitFor(() => expect(canvas.getByRole("menuitem", { name: /New query/ })).toHaveFocus());
    await expect(file).toHaveAttribute("aria-expanded", "true");
    await expect(file).toHaveAttribute("aria-controls", fileMenu.id);
    // Right in an open menu opens the next menu instead, on its first item; only one is open.
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(canvas.getByRole("menuitem", { name: /Copy/ })).toHaveFocus());
    await expect(isOpen(canvas.getByRole("menu", { name: "Edit" }))).toBe(true);
    await settledClosed(fileMenu);
    await expect(openMenus(canvasElement)).toHaveLength(1);
    await expect(file).toHaveAttribute("aria-expanded", "false");
    await expect(edit).toHaveAttribute("aria-expanded", "true");
    // Left goes back, and wraps from the first menu to the last.
    await userEvent.keyboard("{ArrowLeft}");
    await waitFor(() => expect(canvas.getByRole("menuitem", { name: /New query/ })).toHaveFocus());
    await userEvent.keyboard("{ArrowLeft}");
    await waitFor(() => expect(canvas.getByRole("menuitemcheckbox", { name: "Word wrap" })).toHaveFocus());
    await expect(openMenus(canvasElement)).toHaveLength(1);
    // Up and Down stay inside the open menu.
    await userEvent.keyboard("{ArrowDown}");
    await expect(canvas.getByRole("menuitemcheckbox", { name: "Minimap" })).toHaveFocus();
    // Choosing a command closes the menu and focus returns to its title.
    await userEvent.keyboard("{ArrowRight}{ArrowDown}{Enter}");
    await expect(args.onSelect).toHaveBeenCalledWith("open");
    await settledClosed(fileMenu);
    await expect(file).toHaveFocus();
  },
};

export const EnterSpaceAndUpOpen: Story = {
  play: async ({ canvas, userEvent }) => {
    const edit = canvas.getByRole("menuitem", { name: "Edit" });
    edit.focus();
    await userEvent.keyboard("{Enter}");
    const menu = await canvas.findByRole("menu", { name: "Edit" });
    await waitFor(() => expect(canvas.getByRole("menuitem", { name: /Copy/ })).toHaveFocus());
    await userEvent.keyboard("{Escape}");
    await settledClosed(menu);
    await expect(edit).toHaveFocus();
    await userEvent.keyboard(" ");
    await waitFor(() => expect(canvas.getByRole("menuitem", { name: /Copy/ })).toHaveFocus());
    await userEvent.keyboard("{Escape}");
    await settledClosed(menu);
    // Up opens on the last item.
    await userEvent.keyboard("{ArrowUp}");
    await waitFor(() => expect(canvas.getByRole("menuitem", { name: /Find/ })).toHaveFocus());
    // Up on the first file menu's title skips nothing: disabled items are never the landing item.
    await userEvent.keyboard("{Escape}");
    await settledClosed(menu);
    await userEvent.keyboard("{Home}");
    await expect(canvas.getByRole("menuitem", { name: "File" })).toHaveFocus();
    await userEvent.keyboard("{End}");
    await expect(canvas.getByRole("menuitem", { name: "View" })).toHaveFocus();
  },
};

export const EscapeReturnsFocusAndTabLeaves: Story = {
  render: (args) => (
    <>
      <Button>Before</Button>
      <Menubar {...args} />
      <Button>After</Button>
    </>
  ),
  play: async ({ canvas, userEvent }) => {
    const view = canvas.getByRole("menuitem", { name: "View" });
    view.focus();
    await userEvent.keyboard("{ArrowDown}");
    const menu = await canvas.findByRole("menu", { name: "View" });
    await shownFully(menu);
    await userEvent.keyboard("{Escape}");
    await settledClosed(menu);
    await expect(view).toHaveFocus();
    // Tab from inside an open menu closes it and leaves the menubar.
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(isOpen(menu)).toBe(true));
    await userEvent.tab();
    await settledClosed(menu);
    await expect(canvas.getByRole("button", { name: "After" })).toHaveFocus();
    // Coming back, the menubar is one tab stop: the title last used.
    await userEvent.tab({ shift: true });
    await expect(view).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(isOpen(menu)).toBe(true));
    await userEvent.tab({ shift: true });
    await settledClosed(menu);
    await expect(canvas.getByRole("button", { name: "Before" })).toHaveFocus();
  },
};

export const PointerHoverSwitchesWhileOpen: Story = {
  render: (args) => (
    <>
      <Menubar {...args} />
      <p data-testid="outside">Outside</p>
    </>
  ),
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const file = canvas.getByRole("menuitem", { name: "File" });
    const edit = canvas.getByRole("menuitem", { name: "Edit" });
    // Hovering at rest opens nothing.
    await userEvent.hover(edit);
    await expect(openMenus(canvasElement)).toHaveLength(0);
    await userEvent.click(file);
    const fileMenu = await canvas.findByRole("menu", { name: "File" });
    await shownFully(fileMenu);
    // While a menu is open, hovering another title switches to it.
    await userEvent.hover(edit);
    const editMenu = canvas.getByRole("menu", { name: "Edit" });
    await waitFor(() => expect(isOpen(editMenu)).toBe(true));
    await settledClosed(fileMenu);
    await expect(openMenus(canvasElement)).toHaveLength(1);
    // Clicking the open menu's title closes it.
    await userEvent.click(edit);
    await settledClosed(editMenu);
    await userEvent.click(edit);
    await waitFor(() => expect(isOpen(editMenu)).toBe(true));
    // A disabled item does nothing; an enabled one is chosen.
    await userEvent.click(canvas.getByRole("menuitem", { name: /Find/ }));
    await expect(args.onSelect).toHaveBeenCalledWith("find");
    await settledClosed(editMenu);
    // Clicking outside closes.
    await userEvent.click(file);
    await waitFor(() => expect(isOpen(fileMenu)).toBe(true));
    await userEvent.click(canvas.getByRole("menuitem", { name: /Save/ }));
    await expect(args.onSelect).toHaveBeenCalledTimes(1);
    await expect(isOpen(fileMenu)).toBe(true);
    await userEvent.click(canvas.getByTestId("outside"));
    await settledClosed(fileMenu);
  },
};

function Checkable() {
  const [wrap, setWrap] = useState(true);
  return (
    <Menubar
      label="Application"
      menus={[
        { label: "View", items: [{ value: "wrap", label: "Word wrap", kind: "checkbox", checked: wrap }] },
      ]}
      onSelect={() => setWrap((w) => !w)}
    />
  );
}

export const ItemsAreMenuItems: Story = {
  render: () => <Checkable />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("menuitem", { name: "View" }));
    const menu = await canvas.findByRole("menu", { name: "View" });
    const wrap = canvas.getByRole("menuitemcheckbox", { name: "Word wrap" });
    await expect(wrap).toHaveAttribute("aria-checked", "true");
    // Checkable items keep the menu open, as in Menu.
    await userEvent.click(wrap);
    await expect(wrap).toHaveAttribute("aria-checked", "false");
    await expect(isOpen(menu)).toBe(true);
  },
};

export const ShortcutsAndSections: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("menuitem", { name: "File" }));
    await canvas.findByRole("menu", { name: "File" });
    await expect(canvas.getByRole("menuitem", { name: /Open/ })).toHaveAttribute(
      "aria-keyshortcuts",
      "Control+O",
    );
    await expect(
      canvas.getByRole("menuitem", { name: /New query/ }).getAttribute("aria-keyshortcuts"),
    ).toMatch(/^(Control|Meta)\+N$/);
    await expect(canvas.getByRole("group", { name: "Danger zone" })).toContainElement(
      canvas.getByRole("menuitem", { name: "Close all" }),
    );
  },
};

export const RightToLeft: Story = {
  render: (args) => (
    <div dir="rtl">
      <Menubar {...args} />
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    const file = canvas.getByRole("menuitem", { name: "File" });
    const edit = canvas.getByRole("menuitem", { name: "Edit" });
    // The bar reads right to left: File is right of Edit.
    await expect(file.getBoundingClientRect().left).toBeGreaterThan(edit.getBoundingClientRect().left);
    file.focus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(edit).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(file).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(canvas.getByRole("menuitem", { name: /New query/ })).toHaveFocus());
    // In an open menu, Left opens the next menu (the one on the left).
    await userEvent.keyboard("{ArrowLeft}");
    await waitFor(() => expect(canvas.getByRole("menuitem", { name: /Copy/ })).toHaveFocus());
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(canvas.getByRole("menuitem", { name: /New query/ })).toHaveFocus());
  },
};

const withSubmenus: MenubarMenu[] = [
  {
    label: "File",
    items: [
      { value: "new", label: "New query" },
      {
        value: "recent",
        label: "Open recent",
        items: [
          { value: "orders", label: "orders.sql" },
          { value: "users", label: "users.sql" },
        ],
      },
      { items: [{ value: "close", label: "Close all" }] },
    ],
  },
  ...menus.slice(1),
];

export const SubmenusFollowTheMenubarRules: Story = {
  args: { menus: withSubmenus },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const file = canvas.getByRole("menuitem", { name: "File" });
    file.focus();
    await userEvent.keyboard("{ArrowDown}");
    const fileMenu = await canvas.findByRole("menu", { name: "File" });
    await waitFor(() => expect(canvas.getByRole("menuitem", { name: "New query" })).toHaveFocus());
    const recent = canvas.getByRole("menuitem", { name: "Open recent" });
    await expect(recent).toHaveAttribute("aria-haspopup", "menu");
    // Right on an item with a submenu opens the submenu; the bar stays on File.
    await userEvent.keyboard("{ArrowDown}{ArrowRight}");
    const sub = canvas.getByRole("menu", { name: "Open recent" });
    await shownFully(sub);
    await waitFor(() => expect(canvas.getByRole("menuitem", { name: "orders.sql" })).toHaveFocus());
    await expect(isOpen(fileMenu)).toBe(true);
    await expect(openMenus(canvasElement)).toEqual([fileMenu, sub]);
    // Left in a submenu closes just the submenu.
    await userEvent.keyboard("{ArrowLeft}");
    await settledClosed(sub);
    await expect(recent).toHaveFocus();
    await expect(isOpen(fileMenu)).toBe(true);
    // Right on an item without a submenu, even inside a submenu, moves to the next menu and closes the whole tree.
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(canvas.getByRole("menuitem", { name: "orders.sql" })).toHaveFocus());
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(canvas.getByRole("menuitem", { name: /Copy/ })).toHaveFocus());
    await settledClosed(fileMenu);
    await expect(isOpen(sub)).toBe(false);
    await expect(openMenus(canvasElement)).toHaveLength(1);
    // Left in a top-level menu still moves to the previous menu.
    await userEvent.keyboard("{ArrowLeft}");
    await waitFor(() => expect(canvas.getByRole("menuitem", { name: "New query" })).toHaveFocus());
    // Escape from a submenu closes one level, then the menu.
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await waitFor(() => expect(canvas.getByRole("menuitem", { name: "orders.sql" })).toHaveFocus());
    await userEvent.keyboard("{Escape}");
    await settledClosed(sub);
    await expect(recent).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await settledClosed(fileMenu);
    await expect(file).toHaveFocus();
    // With the pointer: resting on the parent opens its submenu, a click in it chooses and closes everything.
    await userEvent.click(file);
    await shownFully(fileMenu);
    await userEvent.hover(recent);
    await waitFor(() => expect(isOpen(sub)).toBe(true));
    await userEvent.click(canvas.getByRole("menuitem", { name: "users.sql" }));
    await expect(args.onSelect).toHaveBeenCalledWith("users");
    await settledClosed(fileMenu);
    await expect(isOpen(sub)).toBe(false);
    await expect(file).toHaveFocus();
  },
};

export const SubmenusInRightToLeft: Story = {
  args: { menus: withSubmenus },
  render: (args) => (
    <div dir="rtl">
      <Menubar {...args} />
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    canvas.getByRole("menuitem", { name: "File" }).focus();
    await userEvent.keyboard("{ArrowDown}");
    const fileMenu = await canvas.findByRole("menu", { name: "File" });
    await waitFor(() => expect(canvas.getByRole("menuitem", { name: "New query" })).toHaveFocus());
    // Left opens the submenu, to the left of its menu.
    await userEvent.keyboard("{ArrowDown}{ArrowLeft}");
    const sub = canvas.getByRole("menu", { name: "Open recent" });
    await shownFully(sub);
    await waitFor(() => expect(canvas.getByRole("menuitem", { name: "orders.sql" })).toHaveFocus());
    await expect(sub.getBoundingClientRect().right).toBeLessThanOrEqual(
      fileMenu.getBoundingClientRect().left + 2,
    );
    // Right closes it; Right again (top-level menu) moves to the previous menu.
    await userEvent.keyboard("{ArrowRight}");
    await settledClosed(sub);
    await expect(canvas.getByRole("menuitem", { name: "Open recent" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(canvas.getByRole("menuitemcheckbox", { name: "Word wrap" })).toHaveFocus());
    await settledClosed(fileMenu);
  },
};

export const Sizes: Story = {
  render: (args) => (
    <>
      <Menubar {...args} label="Small" size="sm" />
      <Menubar {...args} label="Medium" size="md" />
      <Menubar {...args} label="Large" size="lg" />
    </>
  ),
  play: async ({ canvas }) => {
    const height = (bar: string) =>
      (
        canvas.getByRole("menubar", { name: bar }).querySelector('[role="menuitem"]') as HTMLElement
      ).getBoundingClientRect().height;
    const [sm, md, lg] = [height("Small"), height("Medium"), height("Large")];
    await expect(sm).toBeLessThan(md);
    await expect(md).toBeLessThan(lg);
    // Every title's hit area is at least 24px, however small it looks.
    const small = canvas
      .getByRole("menubar", { name: "Small" })
      .querySelector('[role="menuitem"]') as HTMLElement;
    const hit = getComputedStyle(small, "::before");
    await expect(Number.parseFloat(hit.height)).toBeGreaterThanOrEqual(24);
    await expect(Number.parseFloat(hit.width)).toBeGreaterThanOrEqual(24);
  },
};

export const TouchTap: Story = {
  tags: ["touch", "!dev"],
  play: async ({ args, canvas, userEvent }) => {
    const file = canvas.getByRole("menuitem", { name: "File" });
    const hit = getComputedStyle(file, "::before");
    await expect(Number.parseFloat(hit.height)).toBeGreaterThanOrEqual(44);
    await userEvent.pointer({ keys: "[TouchA]", target: file });
    const menu = await canvas.findByRole("menu", { name: "File" });
    await shownFully(menu);
    const row = canvas.getByRole("menuitem", { name: /Open/ });
    await waitFor(() => expect(row.getBoundingClientRect().height).toBeGreaterThanOrEqual(44));
    // Tapping another title switches menus.
    await userEvent.pointer({ keys: "[TouchA]", target: canvas.getByRole("menuitem", { name: "Edit" }) });
    const editMenu = canvas.getByRole("menu", { name: "Edit" });
    await waitFor(() => expect(isOpen(editMenu)).toBe(true));
    await settledClosed(menu);
    await userEvent.pointer({ keys: "[TouchA]", target: canvas.getByRole("menuitem", { name: "File" }) });
    await shownFully(menu);
    await userEvent.pointer({ keys: "[TouchA]", target: row });
    await expect(args.onSelect).toHaveBeenCalledWith("open");
    await settledClosed(menu);
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    const props = ["display", "gap", "font-size", "box-sizing", "padding-inline-start", "background-color"];
    const bar = computeUnderHostileHost(canvasElement, ".cy-menubar", props);
    await expect(bar.hostile).toEqual(bar.clean);
    const title = computeUnderHostileHost(canvasElement, ".cy-menubar-item", [
      ...props,
      "height",
      "color",
      "border-top-width",
      "text-transform",
      "letter-spacing",
    ]);
    await expect(title.hostile).toEqual(title.clean);
  },
};

function ShadowMenubar() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current;
    if (!el || el.shadowRoot) return;
    const root = el.attachShadow({ mode: "open" });
    root.adoptedStyleSheets = [createStyleSheet()];
    const mount = document.createElement("div");
    root.append(mount);
    createRoot(mount).render(<Menubar label="Shadow" menus={menus} onSelect={() => {}} />);
  }, []);
  return <div data-testid="host" ref={host} style={{ paddingBlockEnd: 200 }} />;
}

export const WorksInsideAShadowRoot: Story = {
  render: () => <ShadowMenubar />,
  play: async ({ canvas, userEvent }) => {
    const host = await canvas.findByTestId("host");
    await waitFor(() => expect(host.shadowRoot?.querySelector('[role="menuitem"]')).toBeTruthy());
    const root = host.shadowRoot as ShadowRoot;
    const [file, edit] = [...root.querySelectorAll<HTMLElement>('[role="menubar"] > [role="menuitem"]')];
    file?.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(root.activeElement).toBe(edit);
    await userEvent.keyboard("{ArrowDown}");
    const editMenu = root.querySelector('[role="menu"][aria-label="Edit"]') as HTMLElement;
    await waitFor(() => expect(isOpen(editMenu)).toBe(true));
    await waitFor(() => expect(root.activeElement?.textContent).toMatch(/Copy/));
    await userEvent.keyboard("{ArrowLeft}");
    const fileMenu = root.querySelector('[role="menu"][aria-label="File"]') as HTMLElement;
    await waitFor(() => expect(isOpen(fileMenu)).toBe(true));
    await settledClosed(editMenu);
    await userEvent.keyboard("{Escape}");
    await settledClosed(fileMenu);
    await expect(root.activeElement).toBe(file);
  },
};
