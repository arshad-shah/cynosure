import type { Meta, StoryObj } from "@storybook/react-vite";
import { type Ref, useState } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { copy } from "../../icons/copy.js";
import { flag } from "../../icons/flag.js";
import { tag } from "../../icons/tag.js";
import { trash } from "../../icons/trash.js";
import { backdrop, contrast, rgb } from "../../test/color.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { settled, shownFully } from "../../test/settle.js";
import { Button } from "../Button/Button.js";
import type { MenuEntry } from "../Menu/Menu.js";
import { ContextMenu } from "./ContextMenu.js";

const ITEMS: MenuEntry[] = [
  { value: "open", label: "Open" },
  { value: "copy", label: "Copy link", icon: copy, shortcut: ["Ctrl", "C"] },
  { value: "rename", label: "Rename", disabled: true },
  { value: "delete", label: "Delete", icon: trash, tone: "danger" },
];

const meta = {
  title: "Components/Overlays/ContextMenu",
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

const WITH_SUBMENU: MenuEntry[] = [
  { value: "open", label: "Open" },
  {
    value: "open-with",
    label: "Open with",
    items: [
      { value: "viewer", label: "Viewer" },
      { value: "editor", label: "Editor" },
    ],
  },
  { items: [{ value: "delete", label: "Delete", icon: trash, tone: "danger" }] },
];

export const SubmenusOpenBesideTheirItem: Story = {
  args: { items: WITH_SUBMENU },
  play: async ({ args, canvas, userEvent }) => {
    const target = canvas.getByTestId("target");
    target.focus();
    await userEvent.keyboard("{Shift>}{F10}{/Shift}");
    await shownFully(menu());
    // An unlabelled section is set apart by a line.
    await expect(canvas.getAllByRole("separator")).toHaveLength(1);
    const parent = canvas.getByRole("menuitem", { name: "Open with" });
    await expect(parent).toHaveAttribute("aria-haspopup", "menu");
    await userEvent.keyboard("{ArrowDown}{ArrowRight}");
    const sub = canvas.getByRole("menu", { name: "Open with" });
    await shownFully(sub);
    await waitFor(() => expect(canvas.getByRole("menuitem", { name: "Viewer" })).toHaveFocus());
    await expect(sub.getBoundingClientRect().left).toBeGreaterThanOrEqual(
      menu().getBoundingClientRect().right - 2,
    );
    // Escape closes the submenu only.
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(sub.matches(":popover-open")).toBe(false));
    await expect(parent).toHaveFocus();
    await expect(isOpen()).toBe(true);
    // A click on the parent opens it; choosing in it closes everything and focus goes back to the target.
    await userEvent.click(parent);
    await userEvent.click(await canvas.findByRole("menuitem", { name: "Editor" }));
    await expect(args.onSelect).toHaveBeenCalledWith("editor");
    await waitFor(() => expect(isOpen()).toBe(false));
    await expect(sub.matches(":popover-open")).toBe(false);
    await expect(target).toHaveFocus();
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
    await settled(menu());
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

const FILES = ["report.pdf", "notes.md", "photo.png"];
const many = { select: fn(), change: fn() };

function ManyTargets({ disabled = false }: { disabled?: boolean }) {
  return (
    <ContextMenu<string>
      label={(file) => `${file} actions`}
      items={(file) => [
        { value: "open", label: `Open ${file}` },
        { value: "delete", label: "Delete", icon: trash, tone: "danger" },
      ]}
      onSelect={many.select}
      onOpenChange={many.change}
      disabled={disabled}
    >
      {(_, targetFor) => (
        <ul aria-label="Files" style={{ display: "grid", gap: 4, margin: 0, padding: 0, listStyle: "none" }}>
          {FILES.map((file) => (
            <li
              key={file}
              {...targetFor(file)}
              // biome-ignore lint/a11y/noNoninteractiveTabindex: a focusable row, so keyboard users can open its menu
              tabIndex={0}
              data-testid={file}
              style={{ padding: 8, WebkitTouchCallout: "none", userSelect: "none" }}
            >
              {file}
            </li>
          ))}
        </ul>
      )}
    </ContextMenu>
  );
}

export const OneMenuForManyTargets: Story = {
  render: () => <ManyTargets />,
  play: async ({ canvas, userEvent }) => {
    many.select.mockClear();
    many.change.mockClear();
    // One menu, beside the list, for every row: right-click names it and fills it for the row pressed.
    await expect(document.querySelectorAll('[role="menu"]')).toHaveLength(1);
    const notes = canvas.getByTestId("notes.md");
    await expect(notes).toHaveAttribute("aria-keyshortcuts", "Shift+F10");
    await userEvent.pointer({ keys: "[MouseRight]", target: notes });
    await shownFully(menu());
    await expect(menu()).toHaveAccessibleName("notes.md actions");
    await expect(document.activeElement).toHaveTextContent("Open notes.md");
    await expect(many.change).toHaveBeenLastCalledWith(true, "notes.md");
    await userEvent.keyboard("{Enter}");
    await expect(many.select).toHaveBeenLastCalledWith("open", "notes.md");
    await waitFor(() => expect(isOpen()).toBe(false));
    await expect(many.change).toHaveBeenLastCalledWith(false, "notes.md");
    // Focus goes back to the row that opened it.
    await expect(notes).toHaveFocus();
    // Shift+F10 on another row opens the menu for that row; Escape returns focus to it.
    const photo = canvas.getByTestId("photo.png");
    photo.focus();
    await userEvent.keyboard("{Shift>}{F10}{/Shift}");
    await shownFully(menu());
    await expect(menu()).toHaveAccessibleName("photo.png actions");
    await expect(document.activeElement).toHaveTextContent("Open photo.png");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(isOpen()).toBe(false));
    await expect(photo).toHaveFocus();
    // The context menu key too, and the chosen command goes with that row's key.
    await userEvent.keyboard("{ContextMenu}{ArrowDown}{Enter}");
    await expect(many.select).toHaveBeenLastCalledWith("delete", "photo.png");
  },
};

export const ManyTargetsLongPressOnTouch: Story = {
  tags: ["touch", "!dev"],
  render: () => <ManyTargets />,
  play: async ({ canvas, userEvent }) => {
    const report = canvas.getByTestId("report.pdf");
    // A tap does nothing; holding still opens the menu for the row held.
    await userEvent.pointer({ keys: "[TouchA]", target: report });
    await new Promise((r) => setTimeout(r, 650));
    await expect(isOpen()).toBe(false);
    await userEvent.pointer({ keys: "[TouchA>]", target: report });
    await waitFor(() => expect(isOpen()).toBe(true), { timeout: 2000 });
    await userEvent.pointer({ keys: "[/TouchA]", target: report });
    await expect(menu()).toHaveAccessibleName("report.pdf actions");
  },
};

export const ManyTargetsDisabled: Story = {
  render: () => <ManyTargets disabled />,
  play: async ({ canvas, userEvent }) => {
    const notes = canvas.getByTestId("notes.md");
    notes.focus();
    await userEvent.keyboard("{Shift>}{F10}{/Shift}");
    await userEvent.pointer({ keys: "[MouseRight]", target: notes });
    await new Promise((r) => setTimeout(r, 100));
    await expect(isOpen()).toBe(false);
    await expect(notes).toHaveFocus();
  },
};

/** Shapes drawn on one canvas: no element per shape, so the app finds the one under the pointer itself. */
const SHAPES = [
  { id: "circle", label: "Circle", x: 40, y: 30, w: 100, h: 80 },
  { id: "square", label: "Square", x: 200, y: 30, w: 100, h: 80 },
];

function ShapeCanvas({
  onSelect,
  onOpenChange,
}: {
  onSelect: (v: string) => void;
  onOpenChange: (o: boolean) => void;
}) {
  const [menuFor, setMenuFor] = useState<{ shape: (typeof SHAPES)[number]; x: number; y: number } | null>(
    null,
  );
  const [selected, setSelected] = useState(SHAPES[0]);
  const hit = (el: HTMLElement, x: number, y: number) => {
    const r = el.getBoundingClientRect();
    return SHAPES.find(
      (s) => x - r.left >= s.x && x - r.left <= s.x + s.w && y - r.top >= s.y && y - r.top <= s.y + s.h,
    );
  };
  return (
    <>
      <div
        data-testid="canvas"
        // biome-ignore lint/a11y/noNoninteractiveTabindex: the canvas takes focus, as a drawing surface does
        tabIndex={0}
        role="application"
        aria-label={`Drawing, ${selected?.label} selected`}
        style={{ position: "relative", inlineSize: 340, blockSize: 140, background: "var(--cy-color-soft)" }}
        onContextMenu={(event) => {
          const shape = hit(event.currentTarget, event.clientX, event.clientY);
          if (!shape) return;
          event.preventDefault();
          setSelected(shape);
          setMenuFor({ shape, x: event.clientX, y: event.clientY });
        }}
        onKeyDown={(event) => {
          if (!(event.key === "F10" && event.shiftKey) || !selected) return;
          event.preventDefault();
          const r = event.currentTarget.getBoundingClientRect();
          setMenuFor({
            shape: selected,
            x: r.left + selected.x + selected.w / 2,
            y: r.top + selected.y + selected.h / 2,
          });
        }}
      >
        {SHAPES.map((s) => (
          <span
            key={s.id}
            aria-hidden="true"
            style={{
              position: "absolute",
              insetInlineStart: s.x,
              insetBlockStart: s.y,
              inlineSize: s.w,
              blockSize: s.h,
              background: "var(--cy-color-line)",
              borderRadius: s.id === "circle" ? "50%" : 0,
            }}
          />
        ))}
      </div>
      <ContextMenu
        open={menuFor !== null}
        anchor={menuFor ?? undefined}
        onOpenChange={(open) => {
          onOpenChange(open);
          if (!open) setMenuFor(null);
        }}
        label={menuFor ? `${menuFor.shape.label} actions` : ""}
        items={[
          { value: "duplicate", label: "Duplicate", icon: copy },
          { value: "delete", label: "Delete", icon: trash, tone: "danger" },
        ]}
        onSelect={(value) => onSelect(`${value}:${menuFor?.shape.id}`)}
      />
    </>
  );
}

const shapeCanvas: NonNullable<Story["render"]> = (args) => (
  <ShapeCanvas onSelect={args.onSelect} onOpenChange={args.onOpenChange as (o: boolean) => void} />
);

export const OpenedByTheAppAtAPoint: Story = {
  render: shapeCanvas,
  play: async ({ args, canvas, userEvent }) => {
    const area = canvas.getByTestId("canvas");
    area.focus();
    const r = area.getBoundingClientRect();
    const at = { clientX: r.left + 250, clientY: r.top + 70 };
    await userEvent.pointer({ keys: "[MouseRight]", target: area, coords: at });
    await shownFully(menu());
    // The app opened it for the shape under the pointer, with its corner at the pointer.
    await expect(menu()).toHaveAccessibleName("Square actions");
    const panel = menu().getBoundingClientRect();
    await expect(Math.abs(panel.left - at.clientX)).toBeLessThan(6);
    await expect(Math.abs(panel.top - at.clientY)).toBeLessThan(6);
    await expect(document.activeElement).toHaveTextContent("Duplicate");
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect(args.onSelect).toHaveBeenCalledWith("delete:square");
    await waitFor(() => expect(isOpen()).toBe(false));
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
    // Focus goes back to what had it: the canvas.
    await expect(area).toHaveFocus();
  },
};

export const OpenedByTheAppFromTheKeyboard: Story = {
  render: shapeCanvas,
  play: async ({ args, canvas, userEvent }) => {
    const area = canvas.getByTestId("canvas");
    area.focus();
    await userEvent.keyboard("{Shift>}{F10}{/Shift}");
    await shownFully(menu());
    await expect(menu()).toHaveAccessibleName("Circle actions");
    // At the point the app gave: the selected shape's centre.
    const r = area.getBoundingClientRect();
    await expect(Math.abs(menu().getBoundingClientRect().left - (r.left + 90))).toBeLessThan(6);
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(isOpen()).toBe(false));
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
    await expect(area).toHaveFocus();
    // An outside press closes it too, through onOpenChange.
    await userEvent.keyboard("{Shift>}{F10}{/Shift}");
    await shownFully(menu());
    await userEvent.click(document.body);
    await waitFor(() => expect(isOpen()).toBe(false));
  },
};

export const ControlledWithATarget: Story = {
  render: (args) => {
    function Controlled() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setOpen(true)}>Show actions</Button>
          <ContextMenu
            {...args}
            open={open}
            onOpenChange={(o) => {
              args.onOpenChange?.(o, undefined);
              setOpen(o);
            }}
          >
            {(props) => (
              <div
                {...props}
                ref={props.ref as Ref<HTMLDivElement>}
                // biome-ignore lint/a11y/noNoninteractiveTabindex: a focusable row, so keyboard users can open its menu
                tabIndex={0}
                data-testid="target"
                style={{ inlineSize: 320, blockSize: 60 }}
              >
                report.pdf
              </div>
            )}
          </ContextMenu>
        </>
      );
    }
    return <Controlled />;
  },
  play: async ({ args, canvas, userEvent }) => {
    // Opened by the app without a point: it sits under its target.
    await userEvent.click(canvas.getByRole("button", { name: "Show actions" }));
    await shownFully(menu());
    const box = canvas.getByTestId("target").getBoundingClientRect();
    await expect(menu().getBoundingClientRect().top).toBeGreaterThanOrEqual(box.bottom);
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(isOpen()).toBe(false));
    await expect(canvas.getByRole("button", { name: "Show actions" })).toHaveFocus();
    // A right-click still asks to open; controlled, it opens because the app agrees.
    await userEvent.pointer({ keys: "[MouseRight]", target: canvas.getByTestId("target") });
    await shownFully(menu());
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(true, undefined);
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(isOpen()).toBe(false));
    await expect(canvas.getByTestId("target")).toHaveFocus();
  },
};
