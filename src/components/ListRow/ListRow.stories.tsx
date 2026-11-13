import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { expect, fn, waitFor } from "storybook/test";
import { Icon } from "../../foundations/Icon/Icon.js";
import { alert, database, history, moreHorizontal, play, trash } from "../../icons/index.js";
import { createStyleSheet } from "../../styles/inline.js";
import { rgb } from "../../test/color.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { realHover } from "../../test/hover.js";
import { shownFully } from "../../test/settle.js";
import { Avatar } from "../Avatar/Avatar.js";
import { Badge } from "../Badge/Badge.js";
import { Button } from "../Button/Button.js";
import { IconButton } from "../IconButton/IconButton.js";
import { IconTile } from "../IconTile/IconTile.js";
import { Menu } from "../Menu/Menu.js";
import { ListRow, ListRows } from "./ListRow.js";

const TONES = ["accent", "neutral", "danger", "success", "warning", "info"] as const;

const actions = (name: string) => (
  <>
    <IconButton icon={play} label={`Open ${name}`} size="sm" variant="ghost" />
    <IconButton icon={trash} label={`Delete ${name}`} size="sm" variant="ghost" />
  </>
);

const meta = {
  tags: ["serial"],
  title: "Components/ListRow",
  component: ListRow,
  args: {
    label: "Query failed on orders",
    description: 'relation "orders_archive" does not exist',
    detail: "SELECT * FROM orders_archive",
    mono: "detail",
    trailing: "2m",
    active: false,
    unread: true,
    dimmed: false,
    tone: "danger",
    wrap: false,
    onClick: fn(),
  },
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
    detail: { control: "text" },
    mono: { control: "inline-radio", options: [undefined, "description", "detail"] },
    trailing: { control: "text" },
    leading: { control: false },
    actions: { control: false },
    active: { control: "boolean" },
    unread: { control: "boolean" },
    dimmed: { control: "boolean" },
    tone: { control: "select", options: [undefined, ...TONES] },
    wrap: { control: "boolean" },
    href: { control: "text" },
    onClick: { control: false },
    className: { control: "text" },
  },
  render: (args) => (
    <ListRows label="Notifications" divided style={{ maxInlineSize: 420 }}>
      <ListRow
        {...args}
        leading={<IconTile icon={alert} size="sm" tone="danger" />}
        actions={actions("first")}
      />
      <ListRow
        label="Saved query updated"
        description="Monthly revenue"
        trailing="1h"
        leading={<IconTile icon={history} size="sm" tone="info" />}
        onClick={() => {}}
        actions={actions("second")}
      />
      <ListRow
        label="Connected to analytics"
        description="ada@db.internal:5432/warehouse"
        mono="description"
        trailing="Yesterday"
        dimmed
        leading={<Badge dot tone="success" label="Connected" />}
        onClick={() => {}}
      />
    </ListRows>
  ),
} satisfies Meta<typeof ListRow>;
export default meta;
type Story = StoryObj<typeof meta>;

const box = (el: Element) => el.getBoundingClientRect();
const rowOf = (el: Element) => el.closest(".cy-list-row") as HTMLElement;
const actionsShown = (row: Element) =>
  getComputedStyle(row.querySelector(".cy-list-row-actions") as Element).opacity === "1";
/** Paints a colour expression through a probe, so it compares with computed colours whatever the engine writes. */
const painted = (value: string) => rgb(value).join(",");
const probe = (canvasElement: HTMLElement, cssColor: string) => {
  const el = document.createElement("span");
  el.style.color = cssColor;
  canvasElement.append(el);
  const out = getComputedStyle(el).color;
  el.remove();
  return painted(out);
};

export const Default: Story = {
  tags: ["visual"],
  play: async ({ canvas, args }) => {
    const list = canvas.getByRole("list", { name: "Notifications" });
    await expect(canvas.getAllByRole("listitem")).toHaveLength(3);
    // The row is one button, named by its title with the tone's word and "Unread", described by the rest.
    const row = canvas.getByRole("button", { name: "Error Query failed on orders Unread" });
    await expect(row).toHaveAccessibleDescription(
      /^\s*relation "orders_archive" does not exist SELECT \* FROM orders_archive 2m$/,
    );
    // A status dot in the leading slot stays a named image in the row.
    const connected = canvas.getByRole("button", { name: "Connected to analytics" });
    await expect(connected).toHaveAccessibleDescription(/ada@db\.internal:5432\/warehouse Yesterday$/);
    const dot = canvas.getByRole("img", { name: "Connected" });
    await expect(rowOf(connected).contains(dot)).toBe(true);
    // A press anywhere on a row without actions (its leading slot, its trailing slot) lands on its button.
    const hit = (el: Element) => {
      const r = box(el);
      return el.ownerDocument.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    };
    await expect(hit(dot)).toBe(connected);
    await expect(hit(canvas.getByText("Yesterday"))).toBe(connected);
    await expect(hit(canvas.getByText("ada@db.internal:5432/warehouse"))).toBe(connected);
    // The trailing slot sits at the row's inline end, the leading slot at its start.
    const time = canvas.getByText("2m");
    await expect(box(time).right).toBeGreaterThan(box(list).right - 40);
    await expect(box(rowOf(row).querySelector(".cy-list-row-leading") as Element).left).toBeLessThan(
      box(list).left + 30,
    );
    // The row's actions are siblings of its button, never inside it.
    const open = canvas.getByRole("button", { name: "Open first" });
    await expect(row.contains(open)).toBe(false);
    await expect(rowOf(open)).toBe(rowOf(row));
    // A line between rows with `divided`.
    const second = rowOf(canvas.getByRole("button", { name: /Saved query updated/ }));
    await expect(Number.parseFloat(getComputedStyle(second).borderTopWidth)).toBeGreaterThan(0);
    await expect(Number.parseFloat(getComputedStyle(rowOf(row)).borderTopWidth)).toBe(0);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

function Inbox({ onOpen, onDelete }: { onOpen: (name: string) => void; onDelete: (name: string) => void }) {
  const [rows, setRows] = useState(["Alpha", "Beta", "Gamma"]);
  return (
    <>
      <Button>Before</Button>
      <ListRows label="Saved queries">
        {rows.map((name, i) => (
          <ListRow
            key={name}
            label={name}
            description={`${name.toLowerCase()}.sql`}
            trailing={`${i + 1}h`}
            active={name === "Beta"}
            onClick={() => onOpen(name)}
            actions={
              <>
                <IconButton
                  icon={play}
                  label={`Run ${name}`}
                  size="sm"
                  variant="ghost"
                  onClick={() => onOpen(`run ${name}`)}
                />
                <IconButton
                  icon={trash}
                  label={`Delete ${name}`}
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(name)}
                />
              </>
            }
          />
        ))}
        <ListRow
          label="Read only"
          description="Cannot be opened"
          actions={<IconButton icon={trash} label="Delete Read only" size="sm" variant="ghost" />}
        />
      </ListRows>
      <Button onClick={() => setRows((r) => [...r, "Delta"])}>Add</Button>
    </>
  );
}

export const KeyboardMovesBetweenRowsAndActions: Story = {
  args: { onClick: fn() },
  render: (args) => <Inbox onOpen={args.onClick as never} onDelete={args.onClick as never} />,
  play: async ({ canvas, userEvent, args }) => {
    const row = (name: string) => canvas.getByRole("button", { name });
    const action = (name: string) => canvas.getByRole("button", { name });
    // One Tab stop for the rows: the active row (aria-current), not the first.
    await expect(row("Beta")).toHaveAttribute("aria-current", "true");
    await userEvent.click(canvas.getByRole("button", { name: "Before" }));
    await userEvent.tab();
    await expect(row("Beta")).toHaveFocus();
    // Focus on a row shows its actions.
    await waitFor(() => expect(actionsShown(rowOf(row("Beta")))).toBe(true));
    await expect(actionsShown(rowOf(row("Alpha")))).toBe(false);
    // Up and Down move between rows (no wrap); Home and End jump; rows that cannot be pressed are skipped.
    await userEvent.keyboard("{ArrowUp}");
    await expect(row("Alpha")).toHaveFocus();
    await userEvent.keyboard("{ArrowUp}");
    await expect(row("Alpha")).toHaveFocus();
    await userEvent.keyboard("{End}");
    await expect(row("Gamma")).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(row("Gamma")).toHaveFocus();
    await userEvent.keyboard("{Home}");
    await expect(row("Alpha")).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(row("Beta")).toHaveFocus();
    // Enter and Space press the row.
    await userEvent.keyboard("{Enter}");
    await expect(args.onClick).toHaveBeenLastCalledWith("Beta");
    await userEvent.keyboard(" ");
    await expect(args.onClick).toHaveBeenCalledTimes(2);
    // Right moves into the row's actions and Left back; nothing past either end.
    await userEvent.keyboard("{ArrowRight}");
    await expect(action("Run Beta")).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(action("Delete Beta")).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(action("Delete Beta")).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    await userEvent.keyboard("{ArrowLeft}");
    await expect(row("Beta")).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(row("Beta")).toHaveFocus();
    // Tab from a row reaches its own actions, then the actions of the row that cannot be pressed, then leaves.
    await userEvent.tab();
    await expect(action("Run Beta")).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onClick).toHaveBeenLastCalledWith("run Beta");
    await userEvent.tab();
    await expect(action("Delete Beta")).toHaveFocus();
    await userEvent.tab();
    await expect(action("Delete Read only")).toHaveFocus();
    // A row that cannot be pressed has only its actions to move between.
    await userEvent.keyboard("{ArrowLeft}");
    await expect(action("Delete Read only")).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Add" })).toHaveFocus();
    // Other rows' actions are reached with the arrows only.
    for (const name of ["Run Alpha", "Delete Alpha", "Run Gamma", "Delete Gamma"])
      await expect(action(name)).toHaveAttribute("tabindex", "-1");
    // The actions follow the Tab stop.
    row("Alpha").focus();
    await waitFor(() => expect(action("Run Alpha")).toHaveAttribute("tabindex", "0"));
    await expect(action("Run Beta")).toHaveAttribute("tabindex", "-1");
    // A row added later joins the arrows, and its actions stay out of the Tab order.
    await userEvent.click(canvas.getByRole("button", { name: "Add" }));
    await waitFor(() => expect(action("Run Delta")).toHaveAttribute("tabindex", "-1"));
    row("Gamma").focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(row("Delta")).toHaveFocus();
  },
};

export const PointerPressesTheRowOrAnAction: Story = {
  tags: ["!dev"],
  args: { onClick: fn() },
  render: (args) => <Inbox onOpen={args.onClick as never} onDelete={args.onClick as never} />,
  play: async ({ canvas, userEvent, args }) => {
    const alpha = canvas.getByRole("button", { name: "Alpha" });
    // A click on the text presses the row; one on an action runs only the action.
    // A press anywhere on the row (its text, its trailing slot) lands on its button.
    const hit = (el: Element) => {
      const r = box(el);
      return el.ownerDocument.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    };
    await expect(hit(canvas.getByText("alpha.sql"))).toBe(alpha);
    // The actions are drawn over the trailing slot, so a press there is the action's.
    const actionsOf = rowOf(alpha).querySelector(".cy-list-row-actions") as Element;
    await expect(actionsOf.contains(hit(canvas.getByText("1h")))).toBe(true);
    await expect(hit(canvas.getByText("Alpha"))).toBe(alpha);
    await userEvent.click(alpha);
    await expect(args.onClick).toHaveBeenLastCalledWith("Alpha");
    await userEvent.click(canvas.getByRole("button", { name: "Delete Alpha" }));
    await expect(args.onClick).toHaveBeenLastCalledWith("Alpha");
    await expect(args.onClick).toHaveBeenCalledTimes(2);
    alpha.blur();
    (canvas.getByRole("button", { name: "Delete Alpha" }) as HTMLElement).blur();
    // The actions show only while the row is hovered (with a real pointer), over the trailing slot.
    if (!(await realHover(rowOf(alpha)))) return;
    await waitFor(() => expect(actionsShown(rowOf(alpha))).toBe(true));
    await expect(actionsShown(rowOf(canvas.getByRole("button", { name: "Gamma" })))).toBe(false);
    const actionsBox = box(rowOf(alpha).querySelector(".cy-list-row-actions") as Element);
    await expect(actionsBox.right).toBeGreaterThan(box(canvas.getByText("1h")).left);
    // The hovered row of a clickable row takes a hover wash; a row that cannot be pressed does not.
    const rest = getComputedStyle(rowOf(canvas.getByRole("button", { name: "Gamma" }))).backgroundColor;
    await waitFor(() => expect(getComputedStyle(rowOf(alpha)).backgroundColor).not.toBe(rest));
    const readOnly = rowOf(canvas.getByText("Read only"));
    const readOnlyRest = getComputedStyle(readOnly).backgroundColor;
    await realHover(readOnly);
    await waitFor(() => expect(actionsShown(readOnly)).toBe(true));
    await expect(getComputedStyle(readOnly).backgroundColor).toBe(readOnlyRest);
    await realHover(null);
    await waitFor(() => expect(actionsShown(readOnly)).toBe(false));
  },
};

export const ActionMenuKeepsItsRowOpen: Story = {
  tags: ["!dev"],
  args: { onClick: fn() },
  render: (args) => (
    <ListRows label="Connections">
      {["main-db", "replica"].map((name) => (
        <ListRow
          key={name}
          label={name}
          description="postgres"
          leading={<Icon icon={database} />}
          onClick={() => args.onClick?.(name as never)}
          actions={
            <Menu
              label={`${name} actions`}
              items={[
                { value: "edit", label: "Edit" },
                { value: "delete", label: "Delete" },
              ]}
              onSelect={(v) => args.onClick?.(`${v} ${name}` as never)}
              trigger={(p) => (
                <IconButton
                  {...p}
                  icon={moreHorizontal}
                  label={`More for ${name}`}
                  size="sm"
                  variant="ghost"
                />
              )}
            />
          }
        />
      ))}
    </ListRows>
  ),
  play: async ({ canvas, userEvent, args }) => {
    const main = canvas.getByRole("button", { name: "main-db" });
    main.focus();
    await userEvent.keyboard("{ArrowRight}");
    const more = canvas.getByRole("button", { name: "More for main-db" });
    await expect(more).toHaveFocus();
    // Down opens the menu (it is the menu button's key, not the list's).
    await userEvent.keyboard("{ArrowDown}");
    const menu = await canvas.findByRole("menu", { name: "main-db actions" });
    await shownFully(menu);
    await waitFor(() => expect(canvas.getByRole("menuitem", { name: "Edit" })).toHaveFocus());
    // Arrows inside the open menu belong to it.
    await userEvent.keyboard("{ArrowDown}");
    await expect(canvas.getByRole("menuitem", { name: "Delete" })).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(canvas.getByRole("menuitem", { name: "Delete" })).toHaveFocus();
    // While the menu is open, the actions stay shown even without focus or hover in the row.
    await realHover(null);
    await expect(actionsShown(rowOf(main))).toBe(true);
    await userEvent.keyboard("{Enter}");
    await expect(args.onClick).toHaveBeenLastCalledWith("delete main-db");
    await waitFor(() => expect(more).toHaveFocus());
  },
};

export const RowsAsLinks: Story = {
  render: () => (
    <ListRows label="Charts">
      <ListRow
        label="Revenue"
        description="Line chart"
        href="#revenue"
        active
        leading={<Icon icon={database} />}
      />
      <ListRow label="Signups" description="Bar chart" href="#signups" />
      {/* biome-ignore lint/security/noScriptUrl: the story checks that an unsafe URL is not linked */}
      <ListRow label="Unsafe" href="javascript:alert(1)" />
    </ListRows>
  ),
  play: async ({ canvas, userEvent }) => {
    const revenue = canvas.getByRole("link", { name: "Revenue" });
    // The active link is the current page, and the first Tab stop.
    await expect(revenue).toHaveAttribute("aria-current", "page");
    await expect(revenue).toHaveAttribute("href", "#revenue");
    await expect(revenue).toHaveAttribute("tabindex", "0");
    revenue.focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(canvas.getByRole("link", { name: "Signups" })).toHaveFocus();
    // An unsafe scheme is not linked.
    await expect(canvas.getByText("Unsafe").closest(".cy-list-row-main")).not.toHaveAttribute("href");
  },
};

export const ActiveUnreadDimmedAndTones: Story = {
  tags: ["visual"],
  render: () => (
    <ListRows label="Activity" style={{ maxInlineSize: 420 }} labels={{ warning: "Slow" }}>
      <ListRow label="Plain" description="At rest" onClick={() => {}} />
      <ListRow label="Active" description="Open in the drawer" active onClick={() => {}} />
      <ListRow label="Unread" description="New" unread trailing="now" onClick={() => {}} />
      <ListRow
        label="Dimmed"
        description="Read"
        dimmed
        leading={<Avatar name="Ada Lovelace" size="sm" />}
        onClick={() => {}}
      />
      {TONES.map((tone) => (
        <ListRow key={tone} label={`Tone ${tone}`} description={tone} tone={tone} onClick={() => {}} />
      ))}
    </ListRows>
  ),
  play: async ({ canvas, canvasElement }) => {
    const row = (name: string | RegExp) => rowOf(canvas.getByRole("button", { name }));
    const style = (name: string | RegExp) => getComputedStyle(row(name));
    const rail = (name: string | RegExp) => painted(style(name).borderLeftColor);
    const railWidth = (name: string | RegExp) => Number.parseFloat(style(name).borderLeftWidth);
    // Active: an accent rail on the inline start, a tinted background, aria-current.
    await expect(canvas.getByRole("button", { name: "Active" })).toHaveAttribute("aria-current", "true");
    await expect(canvas.getByRole("button", { name: "Plain" })).not.toHaveAttribute("aria-current");
    await expect(railWidth("Active")).toBeGreaterThan(0);
    await expect(rail("Active")).toBe(probe(canvasElement, "var(--cy-color-accent)"));
    await expect(style("Plain").borderLeftColor).toBe("rgba(0, 0, 0, 0)");
    await expect(style("Active").backgroundColor).not.toBe(style("Plain").backgroundColor);
    // Unread: a bold title and an accent dot, read after the title.
    const unread = canvas.getByRole("button", { name: "Unread Unread" });
    const weight = (el: Element) =>
      Number(getComputedStyle(el.querySelector(".cy-list-row-label") as Element).fontWeight);
    await expect(weight(unread)).toBeGreaterThan(weight(canvas.getByRole("button", { name: "Plain" })));
    const dot = rowOf(unread).querySelector(".cy-list-row-dot") as HTMLElement;
    await expect(dot).toBeVisible();
    await expect(dot).toHaveAttribute("aria-hidden", "true");
    await expect(
      rowOf(canvas.getByRole("button", { name: "Plain" })).querySelector(".cy-list-row-dot"),
    ).toBeNull();
    // Dimmed: a muted title and a grey leading slot (never faded, so an avatar's initials stay readable).
    const dimmed = canvas.getByRole("button", { name: "Dimmed" });
    const labelColour = (el: Element) =>
      getComputedStyle(el.querySelector(".cy-list-row-label") as Element).color;
    await expect(painted(labelColour(dimmed))).toBe(probe(canvasElement, "var(--cy-color-muted)"));
    await expect(labelColour(canvas.getByRole("button", { name: "Plain" }))).not.toBe(labelColour(dimmed));
    const leading = getComputedStyle(rowOf(dimmed).querySelector(".cy-list-row-leading") as Element);
    await expect(leading.filter).toBe("grayscale(1)");
    await expect(leading.opacity).toBe("1");
    // Tones: a rail and a wash of their own colour each; the danger rail is the danger colour.
    const rails = TONES.map((tone) => rail(new RegExp(`Tone ${tone}$`)));
    await expect(new Set(rails).size).toBe(TONES.length);
    await expect(rail(/Tone danger$/)).toBe(probe(canvasElement, "var(--cy-color-danger)"));
    const washes = TONES.map((tone) => style(new RegExp(`Tone ${tone}$`)).backgroundColor);
    await expect(new Set([...washes, style("Plain").backgroundColor]).size).toBe(TONES.length + 1);
    // The tone's word is read before the title; `labels` replaces it; accent and neutral add none.
    await expect(canvas.getByRole("button", { name: "Error Tone danger" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Slow Tone warning" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Success Tone success" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Info Tone info" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Tone accent" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Tone neutral" })).toBeVisible();
  },
};

const LONG = "A very long notification title that cannot fit on one line of this narrow list";

export const MetaLinesAndWrapping: Story = {
  render: () => (
    <ListRows label="History" size="sm" style={{ inlineSize: 260 }}>
      <ListRow
        label={LONG}
        description="analytics"
        detail="SELECT count(*) FROM events"
        mono="detail"
        onClick={() => {}}
      />
      <ListRow
        label={`${LONG} (wrapped)`}
        description="user@host:5432/db"
        detail="Plain detail"
        mono="description"
        wrap
        onClick={() => {}}
      />
    </ListRows>
  ),
  play: async ({ canvas }) => {
    const cut = canvas.getByText(LONG);
    // The title is cut with an ellipsis on one line…
    await expect(getComputedStyle(cut).textOverflow).toBe("ellipsis");
    await expect(cut.scrollWidth).toBeGreaterThan(cut.clientWidth);
    // …unless the row wraps.
    const wrapped = canvas.getByText(`${LONG} (wrapped)`);
    await expect(box(wrapped).height).toBeGreaterThan(box(cut).height * 1.5);
    // One meta line may be monospace.
    const family = (text: string) => getComputedStyle(canvas.getByText(text)).fontFamily;
    await expect(family("SELECT count(*) FROM events")).toMatch(/monospace/);
    await expect(family("analytics")).not.toMatch(/monospace/);
    await expect(family("user@host:5432/db")).toMatch(/monospace/);
    await expect(family("Plain detail")).not.toMatch(/monospace/);
    // Meta lines are smaller and quieter than the title.
    const size = (el: Element) => Number.parseFloat(getComputedStyle(el).fontSize);
    await expect(size(canvas.getByText("analytics"))).toBeLessThan(size(cut));
  },
};

export const Sizes: Story = {
  render: () => (
    <>
      {(["sm", "md", "lg"] as const).map((size) => (
        <ListRows
          key={size}
          label={size}
          size={size}
          className={`rows-${size}`}
          ref={(el) => el?.setAttribute("data-ref", "")}
        >
          <ListRow label={`Title ${size}`} onClick={() => {}} className={`row-${size}`} />
        </ListRows>
      ))}
    </>
  ),
  play: async ({ canvas }) => {
    const size = (s: string) => Number.parseFloat(getComputedStyle(canvas.getByText(`Title ${s}`)).fontSize);
    const height = (s: string) => box(rowOf(canvas.getByRole("button", { name: `Title ${s}` }))).height;
    await expect(size("sm")).toBeLessThan(size("md"));
    await expect(size("md")).toBeLessThan(size("lg"));
    await expect(height("sm")).toBeLessThan(height("lg"));
    // Even the small row is at least 24px to press.
    await expect(height("sm")).toBeGreaterThanOrEqual(24);
    // `className` lands on the list and the row, beside their own classes.
    await expect(canvas.getByRole("list", { name: "sm" })).toHaveClass("cy-list-rows", "rows-sm");
    // A ref on the list reaches the list element.
    await expect(canvas.getByRole("list", { name: "sm" })).toHaveAttribute("data-ref");
    await expect(rowOf(canvas.getByRole("button", { name: "Title sm" }))).toHaveClass(
      "cy-list-row",
      "row-sm",
    );
  },
};

export const TouchShowsActions: Story = {
  tags: ["touch", "!dev"],
  args: { onClick: fn() },
  render: (args) => <Inbox onOpen={args.onClick as never} onDelete={args.onClick as never} />,
  play: async ({ canvas, userEvent, args }) => {
    const alpha = canvas.getByRole("button", { name: "Alpha" });
    const row = rowOf(alpha);
    // Without hover, every row's actions are shown in a cell of their own, beside the trailing slot, not over it.
    await expect(actionsShown(row)).toBe(true);
    const actionsBox = box(row.querySelector(".cy-list-row-actions") as Element);
    await expect(actionsBox.left).toBeGreaterThanOrEqual(box(canvas.getByText("1h")).right);
    // Rows and actions are 44px to press.
    await expect(box(row).height).toBeGreaterThanOrEqual(44);
    const hit = getComputedStyle(canvas.getByRole("button", { name: "Delete Alpha" }), "::before");
    await expect(Number.parseFloat(hit.height)).toBeGreaterThanOrEqual(44);
    // A tap on the row presses it; a tap on an action runs only the action.
    await userEvent.pointer({ keys: "[TouchA]", target: alpha });
    await expect(args.onClick).toHaveBeenLastCalledWith("Alpha");
    await userEvent.pointer({
      keys: "[TouchA]",
      target: canvas.getByRole("button", { name: "Delete Gamma" }),
    });
    await expect(args.onClick).toHaveBeenLastCalledWith("Gamma");
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};

export const RightToLeft: Story = {
  render: () => (
    <div dir="rtl" style={{ maxInlineSize: 360 }}>
      <ListRows label="RTL">
        <ListRow label="First" trailing="1m" active onClick={() => {}} actions={actions("First")} />
        <ListRow label="Second" trailing="2m" onClick={() => {}} />
      </ListRows>
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    const first = canvas.getByRole("button", { name: "First" });
    const row = rowOf(first);
    // The rail is on the right (the inline start), the trailing slot on the left.
    await expect(Number.parseFloat(getComputedStyle(row).borderRightWidth)).toBeGreaterThan(0);
    await expect(Number.parseFloat(getComputedStyle(row).borderLeftWidth)).toBe(0);
    await expect(box(canvas.getByText("1m")).left).toBeLessThan(box(canvas.getByText("First")).left);
    // Left moves into the actions, Right back.
    first.focus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(canvas.getByRole("button", { name: "Open First" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(first).toHaveFocus();
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    const base = [
      "display",
      "box-sizing",
      "font-size",
      "font-weight",
      "line-height",
      "letter-spacing",
      "color",
    ];
    for (const [selector, extra] of [
      [".cy-list-rows", ["padding-left", "margin-top"]],
      [".cy-list-row", ["border-left-width", "background-color", "padding-top"]],
      [
        ".cy-list-row-main",
        ["padding-left", "padding-top", "border-top-width", "background-color", "height"],
      ],
      [".cy-list-row-label", ["text-transform", "font-family"]],
      [".cy-list-row-description", ["text-transform"]],
      [".cy-list-row-detail", ["text-transform", "font-family"]],
      [".cy-list-row-trailing", ["text-transform"]],
      [".cy-list-row-trailing-content", ["text-transform"]],
      [".cy-list-row-actions", ["gap"]],
    ] as const) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, [...base, ...extra]);
      await expect(hostile, selector).toEqual(clean);
    }
  },
};

function ShadowList() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current;
    if (!el || el.shadowRoot) return;
    const root = el.attachShadow({ mode: "open" });
    root.adoptedStyleSheets = [createStyleSheet()];
    const mount = document.createElement("div");
    root.append(mount);
    createRoot(mount).render(
      <ListRows label="Shadow">
        <ListRow label="One" onClick={() => {}} actions={actions("One")} />
        <ListRow label="Two" onClick={() => {}} actions={actions("Two")} />
      </ListRows>,
    );
  }, []);
  return <div data-testid="host" ref={host} />;
}

export const WorksInsideAShadowRoot: Story = {
  render: () => <ShadowList />,
  play: async ({ canvas, userEvent }) => {
    const host = await canvas.findByTestId("host");
    await waitFor(() => expect(host.shadowRoot?.querySelector(".cy-list-row-main")).toBeTruthy());
    const root = host.shadowRoot as ShadowRoot;
    const [one, two] = [...root.querySelectorAll<HTMLElement>(".cy-list-row-main")];
    const open = (name: string) => root.querySelector(`[aria-label="Open ${name}"]`) as HTMLElement;
    await waitFor(() => expect(open("Two").tabIndex).toBe(-1));
    one?.focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(root.activeElement).toBe(two);
    await waitFor(() => expect(open("Two").tabIndex).toBe(0));
    await userEvent.keyboard("{ArrowRight}");
    await expect(root.activeElement).toBe(open("Two"));
    await expect(getComputedStyle(two as Element).fontFamily).not.toBe("");
  },
};
