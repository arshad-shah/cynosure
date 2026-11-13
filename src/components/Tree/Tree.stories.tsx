import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";
import { expect, fn, waitFor, within } from "storybook/test";
import {
  columns,
  copy,
  external,
  eye,
  file,
  folder,
  retry as retryIcon,
  rows,
  table as tableIcon,
} from "../../icons/index.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { realHover } from "../../test/hover.js";
import { shownFully } from "../../test/settle.js";
import { Button } from "../Button/Button.js";
import { IconButton } from "../IconButton/IconButton.js";
import { TextField } from "../TextField/TextField.js";
import { Tree, type TreeHandle, type TreeItem, type TreeItemAction, type TreeProps } from "./Tree.js";

const project: TreeItem[] = [
  {
    id: "src",
    label: "src",
    icon: folder,
    children: [
      {
        id: "components",
        label: "components",
        icon: folder,
        children: [
          { id: "button", label: "Button.tsx", icon: file },
          { id: "card", label: "Card.tsx", icon: file },
          { id: "dialog", label: "Dialog.tsx", icon: file },
        ],
      },
      { id: "index", label: "index.ts", icon: file },
    ],
  },
  { id: "docs", label: "docs", icon: folder, children: [{ id: "readme", label: "README.md", icon: file }] },
  { id: "locked", label: "locked.bin", icon: file, disabled: true },
  { id: "package", label: "package.json", icon: file },
];

const meta = {
  tags: ["serial"],
  title: "Components/Tree",
  component: Tree,
  args: {
    label: "Files",
    items: project,
    defaultExpanded: ["src"],
    selectionMode: "single",
    size: "md",
    onSelectionChange: fn(),
    onExpandedChange: fn(),
  },
  argTypes: {
    selectionMode: { control: "inline-radio", options: ["single", "multiple"] },
    size: { control: "inline-radio", options: ["sm", "md"] },
  },
  decorators: [(Story) => <div style={{ maxWidth: 320 }}>{Story()}</div>],
} satisfies Meta<typeof Tree>;
export default meta;
type Story = StoryObj<typeof meta>;

const visible = (canvasElement: HTMLElement) =>
  [...canvasElement.querySelectorAll('[role="treeitem"]')].map((r) => r.textContent);
const focused = () => document.activeElement?.textContent;

export const KeyboardFollowsTheApgTree: Story = {
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const tree = canvas.getByRole("tree", { name: "Files" });
    await expect(visible(canvasElement)).toEqual([
      "src",
      "components",
      "index.ts",
      "docs",
      "locked.bin",
      "package.json",
    ]);
    // One Tab stop: the first row.
    await userEvent.tab();
    await expect(focused()).toBe("src");
    const src = canvas.getByRole("treeitem", { name: "src" });
    await expect(src).toHaveAttribute("aria-expanded", "true");
    await expect(src).toHaveAttribute("aria-level", "1");
    await expect(src).toHaveAttribute("aria-setsize", "4");
    // Down and Up move through visible rows.
    await userEvent.keyboard("{ArrowDown}");
    await expect(focused()).toBe("components");
    // Right on a closed branch opens it; again moves to its first child.
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("treeitem", { name: "components" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await expect(args.onExpandedChange).toHaveBeenLastCalledWith(["src", "components"]);
    await userEvent.keyboard("{ArrowRight}");
    await expect(focused()).toBe("Button.tsx");
    await expect(canvas.getByRole("treeitem", { name: "Button.tsx" })).toHaveAttribute("aria-level", "3");
    // Left on a leaf goes to its parent; again closes the parent.
    await userEvent.keyboard("{ArrowLeft}");
    await expect(focused()).toBe("components");
    await userEvent.keyboard("{ArrowLeft}");
    await expect(canvas.getByRole("treeitem", { name: "components" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    // End and Home; disabled rows are skipped.
    await userEvent.keyboard("{End}");
    await expect(focused()).toBe("package.json");
    await userEvent.keyboard("{ArrowUp}");
    await expect(focused()).toBe("docs");
    await userEvent.keyboard("{Home}");
    await expect(focused()).toBe("src");
    // Enter selects.
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    await expect(canvas.getByRole("treeitem", { name: "index.ts" })).toHaveAttribute("aria-selected", "true");
    await expect(args.onSelectionChange).toHaveBeenLastCalledWith(["index"]);
    // Only one row is in the Tab order, the focused one.
    await expect(tree.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
  },
};

export const TypeAheadAndStar: Story = {
  args: { defaultExpanded: [] },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.tab();
    // Typing jumps to the next row starting with the text.
    await userEvent.keyboard("p");
    await expect(focused()).toBe("package.json");
    await userEvent.keyboard("{Home}");
    await new Promise((r) => setTimeout(r, 600));
    await userEvent.keyboard("do");
    await expect(focused()).toBe("docs");
    // * opens every sibling branch at this level.
    await userEvent.keyboard("*");
    await expect(canvas.getByRole("treeitem", { name: "src" })).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByRole("treeitem", { name: "docs" })).toHaveAttribute("aria-expanded", "true");
    await expect(visible(canvasElement)).toContain("README.md");
  },
};

export const PointerSelectsAndChevronToggles: Story = {
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByText("index.ts"));
    await expect(canvas.getByRole("treeitem", { name: "index.ts" })).toHaveAttribute("aria-selected", "true");
    await expect(canvas.getByRole("treeitem", { name: "index.ts" })).toHaveFocus();
    // The chevron opens without selecting.
    const docs = canvas.getByRole("treeitem", { name: "docs" });
    await userEvent.click(docs.querySelector(".cy-tree-chevron") as HTMLElement);
    await expect(docs).toHaveAttribute("aria-expanded", "true");
    await expect(docs).toHaveAttribute("aria-selected", "false");
    await expect(visible(canvasElement)).toContain("README.md");
    // Disabled rows cannot be selected, or focused.
    await userEvent.click(canvas.getByText("locked.bin"));
    await expect(args.onSelectionChange).toHaveBeenLastCalledWith(["index"]);
    await expect(canvas.getByRole("treeitem", { name: "locked.bin" })).not.toHaveFocus();
  },
};

export const MultipleSelection: Story = {
  args: { selectionMode: "multiple" },
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByRole("tree")).toHaveAttribute("aria-multiselectable", "true");
    await userEvent.tab();
    // Space toggles one row at a time; Enter selects only the focused row.
    await userEvent.keyboard(" {ArrowDown}{ArrowDown} ");
    await expect(args.onSelectionChange).toHaveBeenLastCalledWith(["src", "index"]);
    await userEvent.keyboard(" ");
    await expect(args.onSelectionChange).toHaveBeenLastCalledWith(["src"]);
    await userEvent.keyboard("{Enter}");
    await expect(args.onSelectionChange).toHaveBeenLastCalledWith(["index"]);
    // Ctrl or Cmd click adds to the selection.
    await userEvent.keyboard("{Control>}");
    await userEvent.click(canvas.getByText("package.json"));
    await userEvent.keyboard("{/Control}");
    await expect(args.onSelectionChange).toHaveBeenLastCalledWith(["index", "package"]);
  },
};

/** Children arrive after a delay; the folder named "broken" fails the first time. */
function lazyTree(): Pick<TreeProps, "items" | "loadChildren"> {
  let failures = 0;
  return {
    items: [
      { id: "remote", label: "remote", icon: folder, hasChildren: true },
      { id: "broken", label: "broken", icon: folder, hasChildren: true },
    ],
    loadChildren: (item) =>
      new Promise((resolve, reject) =>
        setTimeout(() => {
          if (item.id === "broken" && failures++ === 0) reject(new Error("offline"));
          else resolve([{ id: `${item.id}-a`, label: `${item.id} child`, icon: file }]);
        }, 200),
      ),
  };
}

export const LazyChildrenLoadFailAndRetry: Story = {
  args: { defaultExpanded: [], ...lazyTree() },
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab();
    // Opening a lazy branch shows a loading row, then the children.
    await userEvent.keyboard("{ArrowRight}");
    const remote = canvas.getByRole("treeitem", { name: "remote" });
    await expect(remote).toHaveAttribute("aria-busy", "true");
    await expect(canvas.getByRole("treeitem", { name: /Loading/ })).toHaveAttribute("aria-disabled", "true");
    await waitFor(() => expect(canvas.getByRole("treeitem", { name: "remote child" })).toBeInTheDocument());
    await expect(remote).not.toHaveAttribute("aria-busy");
    // A failure shows a row that retries with Enter.
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{ArrowRight}");
    const failed = await canvas.findByRole("treeitem", { name: /Could not load/ });
    await userEvent.keyboard("{ArrowDown}");
    await expect(failed).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(canvas.getByRole("treeitem", { name: "broken child" })).toBeInTheDocument());
  },
};

export const RightToLeftSwapsLeftAndRight: Story = {
  args: { defaultExpanded: [] },
  render: (args: TreeProps) => (
    <div dir="rtl">
      <Tree {...args} />
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab();
    // In right-to-left text, Left opens (it points into the tree) and Right closes.
    await userEvent.keyboard("{ArrowLeft}");
    await expect(canvas.getByRole("treeitem", { name: "src" })).toHaveAttribute("aria-expanded", "true");
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("treeitem", { name: "src" })).toHaveAttribute("aria-expanded", "false");
  },
};

const guarded: TreeItem[] = [
  {
    id: "vault",
    label: "vault",
    icon: folder,
    disabled: true,
    children: [{ id: "keys", label: "keys.txt", icon: file }],
  },
  {
    id: "shared",
    label: "shared",
    icon: folder,
    children: [
      { id: "secret", label: "secret.txt", icon: file, disabled: true },
      { id: "notes", label: "notes.txt", icon: file },
    ],
  },
];

export const DisabledRowsNeverTakeTheTabStop: Story = {
  args: { items: guarded, defaultExpanded: ["vault", "shared"], defaultSelected: ["secret"] },
  play: async ({ canvas, userEvent }) => {
    const tree = canvas.getByRole("tree");
    const tabStops = () => tree.querySelectorAll('[tabindex="0"]');
    // A selected disabled row is not the tab stop; the first usable row is.
    await expect(tabStops()).toHaveLength(1);
    await userEvent.tab();
    await expect(focused()).toBe("keys.txt");
    // Left from a child of a disabled parent stays put: the parent cannot take focus.
    await userEvent.keyboard("{ArrowLeft}");
    await expect(focused()).toBe("keys.txt");
    await expect(tabStops()).toHaveLength(1);
    // Right on an open branch whose first child is disabled moves to its first usable child.
    await userEvent.keyboard("{ArrowDown}");
    await expect(focused()).toBe("shared");
    await userEvent.keyboard("{ArrowRight}");
    await expect(focused()).toBe("notes.txt");
    await expect(tabStops()).toHaveLength(1);
    // Focus leaves and comes back to the same row: the tree never drops out of the Tab order.
    await userEvent.tab({ shift: true });
    await userEvent.tab();
    await expect(focused()).toBe("notes.txt");
  },
};

const big: TreeItem[] = Array.from({ length: 10 }, (_, f) => ({
  id: `folder-${f}`,
  label: `Folder ${f}`,
  children: Array.from({ length: 100 }, (_, i) => ({ id: `item-${f}-${i}`, label: `Item ${f}.${i}` })),
}));

let rowRenders = 0;

export const LargeTreesRerenderOnlyChangedRows: Story = {
  args: {
    items: big,
    defaultExpanded: big.map((f) => f.id),
    label: "Big",
    // Counts row renders: each visible row calls renderLabel once per render.
    renderLabel: (item: TreeItem) => {
      rowRenders++;
      return item.label;
    },
  },
  play: async ({ canvasElement, userEvent }) => {
    await waitFor(() => expect(canvasElement.querySelectorAll('[role="treeitem"]')).toHaveLength(1010));
    await userEvent.tab();
    // Moving focus re-renders the two rows whose state changed, not a thousand (counted, not timed, so a busy
    // machine cannot make it flaky; without memoised rows this is about 20,000).
    rowRenders = 0;
    for (let i = 0; i < 20; i++) await userEvent.keyboard("{ArrowDown}");
    await expect(focused()).toBe("Item 0.19");
    await expect(rowRenders).toBeLessThanOrEqual(20 * 4);
  },
};

const huge: TreeItem[] = Array.from({ length: 1000 }, (_, f) => ({
  id: `n-${f}`,
  label: `node ${f}`,
  children: Array.from({ length: 99 }, (_, i) => ({ id: `n-${f}-${i}`, label: `leaf ${f}.${i}` })),
}));

export const VirtualHundredThousandRows: Story = {
  args: {
    items: huge,
    defaultExpanded: huge.map((n) => n.id),
    label: "Document",
    virtual: true,
    style: { blockSize: 300 },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const tree = canvas.getByRole("tree", { name: "Document" });
    // 100,000 visible rows, but only the ones in view (and a few either side) are in the page.
    await waitFor(() =>
      expect(canvasElement.querySelectorAll('[role="treeitem"]').length).toBeGreaterThan(5),
    );
    await expect(canvasElement.querySelectorAll('[role="treeitem"]').length).toBeLessThan(60);
    await userEvent.tab();
    await expect(focused()).toBe("node 0");
    // End jumps to the very last row: it is focused, in view and knows its place in the set.
    await userEvent.keyboard("{End}");
    await waitFor(() => expect(focused()).toBe("leaf 999.98"));
    const last = document.activeElement as HTMLElement;
    await expect(last).toHaveAttribute("aria-posinset", "99");
    await expect(last).toHaveAttribute("aria-setsize", "99");
    const box = last.getBoundingClientRect();
    const view = tree.getBoundingClientRect();
    await expect(box.top).toBeGreaterThanOrEqual(view.top - 1);
    await expect(box.bottom).toBeLessThanOrEqual(view.bottom + 1);
    // Scrolling with the mouse keeps the focused row mounted, so the keyboard carries on from it.
    tree.scrollTop = 0;
    await waitFor(() => expect(canvas.getByRole("treeitem", { name: "node 0" })).toBeInTheDocument());
    await userEvent.keyboard("{ArrowUp}");
    await waitFor(() => expect(focused()).toBe("leaf 999.97"));
    await userEvent.keyboard("{Home}");
    await waitFor(() => expect(focused()).toBe("node 0"));
    await expect(tree.scrollTop).toBe(0);
  },
};

export const CustomRowContent: Story = {
  args: {
    items: [
      { id: "name", label: "name" },
      { id: "version", label: "version" },
    ],
    renderLabel: (item: TreeItem) => (
      <>
        <span>{item.label}</span>
        <span data-testid={`value-${item.id}`} style={{ color: "var(--cy-color-muted)" }}>
          {item.id === "name" ? '"cynosure"' : '"0.1.0"'}
        </span>
      </>
    ),
  },
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByTestId("value-version")).toHaveTextContent('"0.1.0"');
    // Type-ahead still uses the plain label.
    await userEvent.tab();
    await userEvent.keyboard("v");
    await expect(document.activeElement).toContainElement(canvas.getByTestId("value-version"));
  },
};

const onSelect = fn();
const onExpand = fn();

export const ControlledAndDefaults: Story = {
  render: () => {
    return (
      <>
        <Tree
          label="Controlled"
          items={project}
          selected={["package"]}
          expanded={["src"]}
          onSelectionChange={onSelect}
          onExpandedChange={onExpand}
          className="host-tree"
        />
        <Tree label="Defaults" items={project.slice(2)} />
      </>
    );
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const controlled = canvas.getByRole("tree", { name: "Controlled" });
    await expect(controlled).toHaveClass("cy-tree", "host-tree");
    // Defaults: single selection, md rows, nothing expanded or selected.
    const defaults = canvas.getByRole("tree", { name: "Defaults" });
    await expect(defaults).toHaveAttribute("data-size", "md");
    await expect(defaults).not.toHaveAttribute("aria-multiselectable");
    // Controlled: callbacks fire, but the tree shows what its owner says.
    await userEvent.click(canvas.getAllByText("index.ts")[0] as HTMLElement);
    await expect(onSelect).toHaveBeenCalledWith(["index"]);
    await expect(canvas.getAllByRole("treeitem", { name: "package.json" })[0]).toHaveAttribute(
      "aria-selected",
      "true",
    );
    const src = canvas.getAllByRole("treeitem", { name: "src" })[0] as HTMLElement;
    await userEvent.click(src.querySelector(".cy-tree-chevron") as HTMLElement);
    await expect(onExpand).toHaveBeenCalledWith([]);
    await expect(src).toHaveAttribute("aria-expanded", "true");
    // Down on the last row stays put.
    (canvasElement.querySelector('[aria-label="Defaults"] [tabindex="0"]') as HTMLElement).focus();
    await userEvent.keyboard("{End}{ArrowDown}");
    await expect(focused()).toBe("package.json");
  },
};

export const EnterActsAndDoubleClickActs: Story = {
  args: { onAction: fn() },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    await expect(canvas.getByRole("treeitem", { name: "index.ts" })).toHaveFocus();
    // Enter runs the item's action; Space still selects.
    await userEvent.keyboard("{Enter}");
    await expect(args.onAction).toHaveBeenLastCalledWith(expect.objectContaining({ id: "index" }));
    await userEvent.dblClick(canvas.getByRole("treeitem", { name: "package.json" }));
    await expect(args.onAction).toHaveBeenLastCalledWith(expect.objectContaining({ id: "package" }));
    await userEvent.dblClick(canvas.getByRole("treeitem", { name: "locked.bin" }));
    await expect(args.onAction).toHaveBeenCalledTimes(2);
  },
};

export const SearchMovesTheSelection: Story = {
  render: () => {
    function Search() {
      const hits = huge.flatMap((n) =>
        (n.children ?? []).filter((c) => c.label.endsWith(".5")).map((c) => c.id),
      );
      const [at, setAt] = useState(-1);
      return (
        <div style={{ display: "grid", gap: 8 }}>
          <Button onClick={() => setAt((a) => Math.min(hits.length - 1, a + 400))}>Next match</Button>
          <Tree
            label="Document"
            items={huge}
            defaultExpanded={huge.map((n) => n.id)}
            virtual
            selected={at < 0 ? [] : [hits[at] as string]}
            style={{ blockSize: 300 }}
          />
        </div>
      );
    }
    return <Search />;
  },
  play: async ({ canvas, userEvent }) => {
    const next = canvas.getByRole("button", { name: "Next match" });
    await userEvent.click(next);
    await userEvent.click(next);
    // The selected match is scrolled into view far down the tree, and focus stays on the search control.
    const row = await canvas.findByRole("treeitem", { name: "leaf 799.5" });
    await expect(row).toHaveAttribute("aria-selected", "true");
    const tree = canvas.getByRole("tree").getBoundingClientRect();
    await expect(row.getBoundingClientRect().top).toBeGreaterThanOrEqual(tree.top - 1);
    await expect(row.getBoundingClientRect().bottom).toBeLessThanOrEqual(tree.bottom + 1);
    await expect(next).toHaveFocus();
    // Tab goes to the match.
    await userEvent.tab();
    await expect(row).toHaveFocus();
  },
};

export const StableUnderHostileHost: Story = {
  args: { defaultSelected: ["index"] },
  play: async ({ canvasElement }) => {
    for (const selector of [".cy-tree", ".cy-tree-row", ".cy-tree-label"]) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, [
        "display",
        "height",
        "padding-left",
        "font-size",
        "box-sizing",
        "color",
        "text-transform",
        "letter-spacing",
      ]);
      await expect(hostile).toEqual(clean);
    }
  },
};

export const TouchRows: Story = {
  tags: ["touch", "!dev"],
  play: async ({ args, canvas, userEvent }) => {
    const row = canvas.getByRole("treeitem", { name: "index.ts" });
    await expect(row.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    await userEvent.pointer({ keys: "[TouchA]", target: row });
    await expect(args.onSelectionChange).toHaveBeenLastCalledWith(["index"]);
  },
};

// ── Schema explorer: groups, trailing counts, icon colours, payloads, row actions and context menus ──

interface SchemaObject {
  schema: string;
  type: "table" | "view" | "column";
}

const tableActions: TreeItemAction[] = [
  { value: "view", label: "View data", icon: rows },
  { value: "open", label: "Open in query tab", icon: external },
];
const tableMenu = [
  { value: "view", label: "View data", icon: rows },
  { value: "copy", label: "Copy name", icon: copy },
];
const column = (table: string, name: string): TreeItem<SchemaObject> => ({
  id: `${table}.${name}`,
  label: name,
  icon: columns,
  data: { schema: "public", type: "column" },
});
const table = (name: string, count: string, cols: string[]): TreeItem<SchemaObject> => ({
  id: name,
  label: name,
  icon: tableIcon,
  iconTone: "accent",
  trailing: count,
  data: { schema: "public", type: "table" },
  actions: tableActions,
  contextMenu: tableMenu,
  children: cols.map((c) => column(name, c)),
});
const explorer: TreeItem<SchemaObject>[] = [
  {
    id: "tables",
    label: "Tables",
    kind: "group",
    children: [
      table("users", "1.2k", ["id", "email"]),
      table("orders", "880", ["id", "user_id", "total"]),
      table("order_items", "3.1k", ["order_id", "sku"]),
    ],
  },
  {
    id: "views",
    label: "Views",
    kind: "group",
    children: [
      {
        id: "active_users",
        label: "active_users",
        icon: eye,
        iconColor: "rgb(0, 128, 0)",
        data: { schema: "public", type: "view" },
      },
      { id: "old_view", label: "old_view", icon: eye, iconTone: "danger", disabled: true },
    ],
  },
];

const row = (root: HTMLElement, name: string | RegExp) =>
  within(root).getByRole("treeitem", { name }) as HTMLElement;
const actionsOf = (el: HTMLElement) => el.querySelector(".cy-tree-actions") as HTMLElement;
// Shown: not hidden by opacity (a reveal may still be easing in).
const shows = (el: HTMLElement) => getComputedStyle(el).opacity !== "0";

export const GroupRowsOpenAndCountButNeverSelect: Story = {
  args: { label: "Schema", items: explorer, defaultExpanded: ["tables", "views"] },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    // A group is named with its count, and is not selectable.
    const tables = row(canvasElement, "Tables 3");
    await expect(tables).not.toHaveAttribute("aria-selected");
    await expect(tables).toHaveAttribute("aria-expanded", "true");
    await expect(row(canvasElement, "Views 2")).toBeInTheDocument();
    // A click opens and closes it, without selecting.
    await userEvent.click(within(tables).getByText("Tables"));
    await expect(tables).toHaveAttribute("aria-expanded", "false");
    await expect(args.onSelectionChange).not.toHaveBeenCalled();
    await expect(tables).toHaveFocus();
    // Enter and Space open and close it too.
    await userEvent.keyboard("{Enter}");
    await expect(tables).toHaveAttribute("aria-expanded", "true");
    await userEvent.keyboard(" ");
    await expect(tables).toHaveAttribute("aria-expanded", "false");
    await expect(args.onSelectionChange).not.toHaveBeenCalled();
    await userEvent.keyboard("{ArrowRight}{ArrowDown}");
    // Items still select; their trailing text is part of their name.
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("treeitem", { name: "users 1.2k" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(args.onSelectionChange).toHaveBeenLastCalledWith(["users"]);
  },
};

export const IconsTakeATone: Story = {
  args: { label: "Schema", items: explorer, defaultExpanded: ["tables", "views"] },
  play: async ({ canvasElement }) => {
    const iconOf = (name: string | RegExp) =>
      row(canvasElement, name).querySelector(".cy-tree-icon") as Element;
    // iconTone is Icon's own tone; iconColor any colour; a disabled row's icon is muted with the row.
    await expect(iconOf(/^users/)).toHaveAttribute("data-tone", "accent");
    await expect(getComputedStyle(iconOf("active_users")).color).toBe("rgb(0, 128, 0)");
    await expect(iconOf("old_view")).not.toHaveAttribute("data-tone");
    await expect((iconOf("old_view") as HTMLElement).style.color).toBe("");
  },
};

export const RowActionsFromTheKeyboard: Story = {
  args: { label: "Schema", items: explorer, defaultExpanded: ["tables"], onCommand: fn() },
  play: async ({ args, canvasElement, userEvent }) => {
    const users = row(canvasElement, "users 1.2k");
    const orders = row(canvasElement, "orders 880");
    // Hidden until the row is hovered, focused or selected.
    await expect(shows(actionsOf(users))).toBe(false);
    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}");
    await expect(users).toHaveFocus();
    await waitFor(() => expect(shows(actionsOf(users))).toBe(true));
    // The row's name is its label and trailing text, not its buttons'.
    await expect(users).toHaveAccessibleName("users 1.2k");
    // Tab reaches the focused row's buttons; Enter presses one, with the item and its payload, and selects nothing.
    await userEvent.tab();
    const view = within(users).getByRole("button", { name: "View data" });
    await expect(view).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onCommand).toHaveBeenLastCalledWith(
      "view",
      expect.objectContaining({ id: "users", data: { schema: "public", type: "table" } }),
    );
    await expect(args.onSelectionChange).not.toHaveBeenCalled();
    await userEvent.tab();
    await expect(within(users).getByRole("button", { name: "Open in query tab" })).toHaveFocus();
    // Shift+Tab goes back through them to the row; Escape goes straight back.
    await userEvent.tab({ shift: true });
    await userEvent.tab({ shift: true });
    await expect(users).toHaveFocus();
    await userEvent.tab();
    await userEvent.keyboard("{Escape}");
    await expect(users).toHaveFocus();
    // Letters typed in a button are not type-ahead; arrows move between rows from there.
    await userEvent.tab();
    await userEvent.keyboard("o");
    await expect(view).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(orders).toHaveFocus();
    // Only the focused row's buttons are in the Tab order.
    const tabbable = [...canvasElement.querySelectorAll<HTMLElement>("[tabindex='0']")];
    await expect(tabbable).toEqual([orders, ...within(orders).getAllByRole("button")]);
  },
};

export const RowActionsByPointer: Story = {
  args: { label: "Schema", items: explorer, defaultExpanded: ["tables"], onCommand: fn(), onAction: fn() },
  play: async ({ args, canvasElement, userEvent }) => {
    const users = row(canvasElement, "users 1.2k");
    const orders = row(canvasElement, "orders 880");
    // A selected row shows its buttons; a press runs the command and leaves the selection alone.
    await userEvent.click(within(orders).getByText("orders"));
    await waitFor(() => expect(shows(actionsOf(orders))).toBe(true));
    await expect(shows(actionsOf(users))).toBe(false);
    await userEvent.click(within(orders).getByRole("button", { name: "Open in query tab" }));
    await expect(args.onCommand).toHaveBeenLastCalledWith("open", expect.objectContaining({ id: "orders" }));
    await expect(args.onSelectionChange).toHaveBeenCalledTimes(1);
    // A double-click on a button is not the row's default action.
    await userEvent.dblClick(within(orders).getByRole("button", { name: "View data" }));
    await expect(args.onAction).not.toHaveBeenCalled();
  },
};

export const RowActionsShowOnHover: Story = {
  tags: ["!dev"],
  args: { label: "Schema", items: explorer, defaultExpanded: ["tables"] },
  play: async ({ canvasElement }) => {
    const users = row(canvasElement, "users 1.2k");
    if (!(await realHover(users))) return;
    await waitFor(() => expect(shows(actionsOf(users))).toBe(true));
    await realHover(users, false);
    await waitFor(() => expect(shows(actionsOf(users))).toBe(false));
  },
};

const menuPanel = () => document.querySelector('[role="menu"]:popover-open') as HTMLElement | null;

export const ContextMenuOnRows: Story = {
  args: { label: "Schema", items: explorer, defaultExpanded: ["tables"], onCommand: fn() },
  play: async ({ args, canvasElement, userEvent }) => {
    const orders = row(canvasElement, "orders 880");
    await expect(orders).toHaveAttribute("aria-keyshortcuts", "Shift+F10");
    await expect(row(canvasElement, "Tables 3")).not.toHaveAttribute("aria-keyshortcuts");
    // Right-click opens the row's menu, beside the tree (a tree holds only tree items).
    await userEvent.pointer({ keys: "[MouseRight]", target: orders });
    await waitFor(() => expect(menuPanel()).not.toBeNull());
    await shownFully(menuPanel() as HTMLElement);
    await expect(menuPanel()).toHaveAccessibleName("orders actions");
    await expect((menuPanel() as HTMLElement).closest('[role="tree"]')).toBeNull();
    await userEvent.click(within(menuPanel() as HTMLElement).getByRole("menuitem", { name: "Copy name" }));
    await expect(args.onCommand).toHaveBeenLastCalledWith("copy", expect.objectContaining({ id: "orders" }));
    await waitFor(() => expect(menuPanel()).toBeNull());
    // Shift+F10 on the focused row opens it there; Escape puts focus back on the row.
    const users = row(canvasElement, "users 1.2k");
    users.focus();
    await userEvent.keyboard("{Shift>}{F10}{/Shift}");
    await waitFor(() => expect(menuPanel()).toHaveAccessibleName("users actions"));
    await waitFor(() => expect(document.activeElement).toHaveTextContent("View data"));
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(menuPanel()).toBeNull());
    await expect(users).toHaveFocus();
    // The context menu key too; the chosen command goes with the row's item.
    await userEvent.keyboard("{ContextMenu}");
    await waitFor(() => expect(menuPanel()).not.toBeNull());
    await userEvent.keyboard("{Enter}");
    await expect(args.onCommand).toHaveBeenLastCalledWith("view", expect.objectContaining({ id: "users" }));
    await waitFor(() => expect(users).toHaveFocus());
    // Arrows still move between rows while no menu is open.
    await userEvent.keyboard("{ArrowDown}");
    await expect(orders).toHaveFocus();
  },
};

export const ContextMenuNameOverride: Story = {
  args: {
    label: "Schéma",
    items: explorer,
    defaultExpanded: ["tables"],
    labels: { menu: (name: string) => `Actions de ${name}` },
  },
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.pointer({ keys: "[MouseRight]", target: row(canvasElement, "users 1.2k") });
    await waitFor(() => expect(menuPanel()).toHaveAccessibleName("Actions de users"));
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(menuPanel()).toBeNull());
  },
};

// ── Loading driven from outside: the handle's reload, and loadingIds / errorIds from a store ──

function Reloadable() {
  const tree = useRef<TreeHandle>(null);
  const loads = useRef(0);
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <Button onClick={() => tree.current?.reload("remote")}>Reload remote</Button>
      <Button onClick={() => tree.current?.reload("nowhere")}>Reload nothing</Button>
      <Button onClick={() => tree.current?.reload("static")}>Reload static</Button>
      <Tree
        handle={tree}
        label="Remote"
        items={[
          { id: "remote", label: "remote", hasChildren: true },
          { id: "static", label: "static", children: [{ id: "s1", label: "s1" }] },
        ]}
        loadChildren={(item) =>
          new Promise((resolve) => {
            const n = ++loads.current;
            setTimeout(() => resolve([{ id: `${item.id}-${n}`, label: `${item.id} load ${n}` }]), 100);
          })
        }
      />
    </div>
  );
}

export const ReloadRunsLoadChildrenAgain: Story = {
  render: () => <Reloadable />,
  play: async ({ canvas, userEvent }) => {
    const remote = canvas.getByRole("treeitem", { name: "remote" });
    await userEvent.click(remote.querySelector(".cy-tree-chevron") as HTMLElement);
    await canvas.findByRole("treeitem", { name: "remote load 1" });
    // Open: the children go, a loading row shows, then the new children.
    await userEvent.click(canvas.getByRole("button", { name: "Reload remote" }));
    await expect(await canvas.findByRole("treeitem", { name: /Loading/ })).toBeInTheDocument();
    await canvas.findByRole("treeitem", { name: "remote load 2" });
    await expect(canvas.queryByRole("treeitem", { name: "remote load 1" })).toBeNull();
    // Closed: they load again the next time it opens.
    await userEvent.click(remote.querySelector(".cy-tree-chevron") as HTMLElement);
    await userEvent.click(canvas.getByRole("button", { name: "Reload remote" }));
    await userEvent.click(remote.querySelector(".cy-tree-chevron") as HTMLElement);
    await canvas.findByRole("treeitem", { name: "remote load 3" });
    // Unknown ids and items with fixed children are left alone.
    await userEvent.click(canvas.getByRole("button", { name: "Reload nothing" }));
    await userEvent.click(canvas.getByRole("button", { name: "Reload static" }));
    await expect(canvas.getByRole("treeitem", { name: "remote load 3" })).toBeInTheDocument();
  },
};

const retried = fn();

function StoreDriven() {
  const [columnsOf, setColumns] = useState<Record<string, string[]>>({ empty: [] });
  const [loading, setLoading] = useState<string[]>([]);
  const [failed, setFailed] = useState<string[]>([]);
  const attempts = useRef(0);
  const fetchColumns = (id: string) => {
    setFailed((f) => f.filter((x) => x !== id));
    setLoading((l) => [...l, id]);
    setTimeout(() => {
      setLoading((l) => l.filter((x) => x !== id));
      if (id === "broken" && attempts.current++ === 0) setFailed((f) => [...f, id]);
      else setColumns((c) => ({ ...c, [id]: ["id", "name"] }));
    }, 150);
  };
  const item = (id: string): TreeItem => {
    const cols = columnsOf[id];
    return {
      id,
      label: id,
      hasChildren: true,
      ...(cols && { children: cols.map((c) => ({ id: `${id}.${c}`, label: c })) }),
    };
  };
  return (
    <Tree
      label="Store"
      items={[item("users"), item("broken"), item("empty")]}
      loadingIds={loading}
      errorIds={failed}
      onExpandedChange={(ids) => {
        for (const id of ids)
          if (!columnsOf[id] && !loading.includes(id) && !failed.includes(id)) fetchColumns(id);
      }}
      onRetry={(it) => {
        retried(it.id);
        fetchColumns(it.id);
      }}
      renderError={(it, retry) => (
        <>
          <span>Could not load the columns of {it.label}</span>
          <IconButton
            icon={retryIcon}
            label="Retry"
            size="xs"
            variant="ghost"
            tabIndex={-1}
            onClick={retry}
          />
        </>
      )}
      renderEmpty={(it) => `No columns in ${it.label}`}
    />
  );
}

export const LoadingAndErrorsFromAStore: Story = {
  render: () => <StoreDriven />,
  play: async ({ canvas, userEvent }) => {
    retried.mockClear();
    await userEvent.tab();
    // The store says it is loading: a loading row, the item busy; then the children it put in `children`.
    await userEvent.keyboard("{ArrowRight}");
    const users = canvas.getByRole("treeitem", { name: "users" });
    await waitFor(() => expect(users).toHaveAttribute("aria-busy", "true"));
    await expect(canvas.getByRole("treeitem", { name: /Loading/ })).toHaveAttribute("aria-disabled", "true");
    await canvas.findByRole("treeitem", { name: "name" });
    await expect(users).not.toHaveAttribute("aria-busy");
    // The store says it failed: the error row shows your content and retries with Enter.
    const broken = canvas.getByRole("treeitem", { name: "broken" });
    broken.focus();
    await userEvent.keyboard("{ArrowRight}");
    const error = await canvas.findByRole("treeitem", { name: /Could not load the columns of broken/ });
    await userEvent.keyboard("{ArrowDown}");
    await expect(error).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(retried).toHaveBeenCalledTimes(1);
    await expect(retried).toHaveBeenLastCalledWith("broken");
    await canvas.findByRole("treeitem", { name: "id" });
    // An open item with no children shows your empty row, which can take focus.
    const empty = canvas.getByRole("treeitem", { name: "empty" });
    empty.focus();
    await userEvent.keyboard("{ArrowRight}{ArrowDown}");
    await expect(canvas.getByRole("treeitem", { name: "No columns in empty" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("treeitem", { name: "No columns in empty" })).not.toHaveAttribute(
      "aria-selected",
    );
  },
};

export const RetryButtonInTheErrorRowRetriesOnce: Story = {
  render: () => <StoreDriven />,
  play: async ({ canvas, userEvent }) => {
    retried.mockClear();
    const broken = canvas.getByRole("treeitem", { name: "broken" });
    await userEvent.click(broken.querySelector(".cy-tree-chevron") as HTMLElement);
    const error = await canvas.findByRole("treeitem", { name: /Could not load the columns/ });
    await userEvent.click(within(error).getByRole("button", { name: "Retry" }));
    await expect(retried).toHaveBeenCalledTimes(1);
    await canvas.findByRole("treeitem", { name: "id" });
  },
};

export const ErrorRowRetriesLoadChildrenByClick: Story = {
  args: {
    defaultExpanded: [],
    ...lazyTree(),
    onRetry: fn(),
    renderError: (item: TreeItem, retry: () => void) => (
      <Button size="sm" variant="ghost" tabIndex={-1} onClick={retry}>
        Retry {item.label}
      </Button>
    ),
  },
  play: async ({ args, canvas, userEvent }) => {
    const broken = canvas.getByRole("treeitem", { name: "broken" });
    await userEvent.click(broken.querySelector(".cy-tree-chevron") as HTMLElement);
    const button = await canvas.findByRole("button", { name: "Retry broken" });
    await userEvent.click(button);
    await expect(args.onRetry).toHaveBeenCalledWith(expect.objectContaining({ id: "broken" }));
    await canvas.findByRole("treeitem", { name: "broken child" });
  },
};

// ── Filtering ──

function Filtered() {
  const [filter, setFilter] = useState("");
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <TextField label="Filter" value={filter} onChange={setFilter} />
      <Tree label="Schema" items={explorer} defaultExpanded={["views"]} filter={filter} />
    </div>
  );
}

const shownRows = (root: HTMLElement) =>
  [...root.querySelectorAll<HTMLElement>('[role="treeitem"] .cy-tree-label')].map((l) => l.textContent);
const marksIn = (root: HTMLElement) => [...root.querySelectorAll("mark")].map((m) => m.textContent);

export const FilterShowsMatchesWithTheirAncestors: Story = {
  render: () => <Filtered />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const tree = canvas.getByRole("tree");
    await expect(shownRows(tree)).toEqual(["Tables", "Views", "active_users", "old_view"]);
    // Matches show with their ancestors opened (expansion is not changed), the rest are hidden, matches are marked.
    await userEvent.type(canvas.getByRole("textbox", { name: "Filter" }), "ORD");
    // order_items opens too, for its column order_id; sku shows as it is under a match.
    await expect(shownRows(tree)).toEqual(["Tables", "orders", "order_items", "order_id", "sku"]);
    await expect(marksIn(tree)).toEqual(["ord", "ord", "ord"]);
    // A group counts the children it shows; positions in the set follow what is shown.
    await expect(row(canvasElement, "Tables 2")).toHaveAttribute("aria-expanded", "true");
    await expect(row(canvasElement, "order_items 3.1k")).toHaveAttribute("aria-setsize", "2");
    await expect(row(canvasElement, "order_items 3.1k")).toHaveAttribute("aria-posinset", "2");
    // Everything under a match shows when it is opened.
    await userEvent.click(row(canvasElement, "orders 880").querySelector(".cy-tree-chevron") as HTMLElement);
    await expect(shownRows(tree)).toEqual([
      "Tables",
      "orders",
      "id",
      "user_id",
      "total",
      "order_items",
      "order_id",
      "sku",
    ]);
    // An opened ancestor can still be closed, and opened again.
    const tables = row(canvasElement, "Tables 2");
    await userEvent.click(tables.querySelector(".cy-tree-chevron") as HTMLElement);
    await expect(shownRows(tree)).toEqual(["Tables"]);
    tables.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(shownRows(tree)).toContain("order_items");
    // A match deeper down: columns are searched too.
    await userEvent.clear(canvas.getByRole("textbox", { name: "Filter" }));
    await userEvent.type(canvas.getByRole("textbox", { name: "Filter" }), "sku");
    await expect(shownRows(tree)).toEqual(["Tables", "order_items", "sku"]);
    // Nothing matches: nothing shows.
    await userEvent.type(canvas.getByRole("textbox", { name: "Filter" }), "zz");
    await expect(shownRows(tree)).toEqual([]);
    // Cleared: everything shows again, unmarked; branches opened by hand while filtering stay open.
    await userEvent.clear(canvas.getByRole("textbox", { name: "Filter" }));
    await expect(marksIn(tree)).toEqual([]);
    await expect(shownRows(tree)).toEqual([
      "Tables",
      "users",
      "orders",
      "id",
      "user_id",
      "total",
      "order_items",
      "Views",
      "active_users",
      "old_view",
    ]);
  },
};

/** A tiny subsequence matcher, as fuzzy finders work: the positions of the query's letters in order, or null. */
const fuzzy = (query: string) => (item: TreeItem) => {
  const at: number[] = [];
  let from = 0;
  for (const ch of query) {
    const i = item.label.indexOf(ch, from);
    if (i < 0) return null;
    at.push(i);
    from = i + 1;
  }
  return at;
};
const byAcu = fuzzy("acu");
const anyView = (item: TreeItem) => item.id === "active_users";

export const FilterWithAFunctionMarksItsPositions: Story = {
  args: { label: "Schema", items: explorer, filter: byAcu },
  play: async ({ canvasElement }) => {
    const tree = canvasElement.querySelector('[role="tree"]') as HTMLElement;
    await expect(shownRows(tree)).toEqual(["Views", "active_users"]);
    // Exactly the positions the function returned are marked (neighbours in one mark).
    await expect(marksIn(tree)).toEqual(["ac", "u"]);
    await expect(row(canvasElement, "active_users")).toHaveAccessibleName("active_users");
  },
};

export const FilterReturningTrueMatchesWithoutMarks: Story = {
  args: { label: "Schema", items: explorer, filter: anyView },
  play: async ({ canvasElement }) => {
    const tree = canvasElement.querySelector('[role="tree"]') as HTMLElement;
    await expect(shownRows(tree)).toEqual(["Views", "active_users"]);
    await expect(marksIn(tree)).toEqual([]);
  },
};

const hugeFilter = (item: TreeItem) => (item.label.endsWith(".42") ? true : null);

export const VirtualTreesFilterToo: Story = {
  args: {
    items: huge,
    label: "Document",
    virtual: true,
    filter: hugeFilter,
    style: { blockSize: 300 },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    // 1,000 matches and their 1,000 parents: 2,000 rows, but only the ones in view are in the page.
    await waitFor(() =>
      expect(canvasElement.querySelectorAll('[role="treeitem"]').length).toBeGreaterThan(5),
    );
    await expect(canvasElement.querySelectorAll('[role="treeitem"]').length).toBeLessThan(60);
    await expect(canvas.getByRole("treeitem", { name: "leaf 0.42" })).toHaveAttribute("aria-level", "2");
    await userEvent.tab();
    await userEvent.keyboard("{End}");
    await waitFor(() => expect(canvas.getByRole("treeitem", { name: "leaf 999.42" })).toHaveFocus());
  },
};

export const RowEndsFollowTheTextDirection: Story = {
  args: { label: "Schema", items: explorer, defaultExpanded: ["tables"], defaultSelected: ["users"] },
  render: (args: TreeProps) => (
    <div dir="rtl">
      <Tree {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const users = row(canvasElement, "users 1.2k");
    const label = (users.querySelector(".cy-tree-label") as HTMLElement).getBoundingClientRect();
    const trailing = (users.querySelector(".cy-tree-trailing") as HTMLElement).getBoundingClientRect();
    const actions = actionsOf(users).getBoundingClientRect();
    // In right-to-left text the count and the buttons sit at the left end, the buttons last.
    await expect(trailing.right).toBeLessThanOrEqual(label.left + 1);
    await expect(actions.right).toBeLessThanOrEqual(trailing.left + 1);
  },
};

export const RowPartsStableUnderHostileHost: Story = {
  args: { label: "Schema", items: explorer, defaultExpanded: ["tables"], defaultSelected: ["users"] },
  play: async ({ canvasElement }) => {
    for (const selector of [".cy-tree-trailing", ".cy-tree-actions", ".cy-tree-row[data-group]"]) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, [
        "display",
        "font-size",
        "font-weight",
        "color",
        "visibility",
        "text-transform",
        "letter-spacing",
        "box-sizing",
      ]);
      await expect(hostile).toEqual(clean);
    }
  },
};

export const TouchShowsActionsAndLongPressOpensTheMenu: Story = {
  tags: ["touch", "!dev"],
  args: { label: "Schema", items: explorer, defaultExpanded: ["tables"], onCommand: fn() },
  play: async ({ args, canvasElement, userEvent }) => {
    const orders = row(canvasElement, "orders 880");
    // No hover on a touch screen: the buttons always show, and are big enough for a finger.
    await waitFor(() => expect(shows(actionsOf(orders))).toBe(true));
    const button = within(orders).getByRole("button", { name: "View data" });
    const hit = getComputedStyle(button, "::before");
    await expect(Number.parseFloat(hit.height)).toBeGreaterThanOrEqual(44);
    await userEvent.pointer({ keys: "[TouchA]", target: button });
    await expect(args.onCommand).toHaveBeenLastCalledWith("view", expect.objectContaining({ id: "orders" }));
    // A long press opens the row's menu.
    await userEvent.pointer([{ keys: "[TouchA>]", target: orders }]);
    await waitFor(() => expect(menuPanel()).not.toBeNull(), { timeout: 2000 });
    await userEvent.pointer([{ keys: "[/TouchA]", target: orders }]);
    await expect(menuPanel()).toHaveAccessibleName("orders actions");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(menuPanel()).toBeNull());
  },
};
