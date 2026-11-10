import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, waitFor } from "storybook/test";
import { file, folder } from "../../icons/index.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { Tree, type TreeItem, type TreeProps } from "./Tree.js";

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

const big: TreeItem[] = Array.from({ length: 50 }, (_, f) => ({
  id: `folder-${f}`,
  label: `Folder ${f}`,
  children: Array.from({ length: 100 }, (_, i) => ({ id: `item-${f}-${i}`, label: `Item ${f}.${i}` })),
}));

let rowRenders = 0;

export const FiveThousandRowsStayResponsive: Story = {
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
    await waitFor(() => expect(canvasElement.querySelectorAll('[role="treeitem"]')).toHaveLength(5050));
    await userEvent.tab();
    // Moving focus re-renders the two rows whose state changed, not five thousand (counted, not timed, so a busy
    // machine cannot make it flaky).
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
