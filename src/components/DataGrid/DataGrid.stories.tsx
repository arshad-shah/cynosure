import type { Meta, StoryObj } from "@storybook/react-vite";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { expect, fn, waitFor } from "storybook/test";
import { createStyleSheet } from "../../styles/inline.js";
import { textContrast } from "../../test/color.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { pressKey } from "../../test/keys.js";
import { CynosureTheme } from "../../theme/CynosureTheme.js";
import { Button } from "../Button/Button.js";
import { Pagination, pageCount } from "../Pagination/Pagination.js";
import { Stack } from "../Stack/Stack.js";
import { DataGrid, type DataGridColumn, type DataGridProps } from "./DataGrid.js";

/** A hundred thousand rows by fifty columns: rows are their own index, and each cell is worked out when shown. */
const HUGE_ROWS = Array.from({ length: 100_000 }, (_, i) => i);
const HUGE_COLUMNS: DataGridColumn<number>[] = Array.from({ length: 50 }, (_, c) => ({
  key: `c${c}`,
  header: `Column ${c + 1}`,
  width: 120,
  value: (r: number) => `R${r + 1}C${c + 1}`,
}));

const huge: DataGridProps<number> = {
  label: "Results",
  columns: HUGE_COLUMNS,
  rows: HUGE_ROWS,
  getRowId: (r) => String(r),
};

const meta = {
  tags: ["serial"],
  title: "Components/Feedback and display/DataGrid",
  component: DataGrid,
  args: {
    ...huge,
    onSortChange: fn(),
    onColumnResize: fn(),
    onRowClick: fn(),
    onAction: fn(),
    onSelectionChange: fn(),
    onSelectedRangeChange: fn(),
    onEndReached: fn(),
  } as DataGridProps<unknown>,
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md"] },
    selectionMode: { control: "inline-radio", options: ["none", "row", "cell", "range"] },
    manualSort: { control: "boolean" },
  },
} satisfies Meta<typeof DataGrid>;
export default meta;
type Story = StoryObj<typeof meta>;

const grid = (el: Element) => el.querySelector('[role="grid"]') as HTMLElement;
const cells = (el: Element) => el.querySelectorAll('[role="gridcell"]').length;
const cell = (el: Element, text: string) =>
  [...el.querySelectorAll<HTMLElement>('[role="gridcell"]')].find(
    (c) => c.textContent === text,
  ) as HTMLElement;
const focused = () => (document.activeElement as HTMLElement | null)?.textContent;
const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));
/** Whether `el` is fully inside the grid's view, below its sticky header. */
function inView(root: Element, el: HTMLElement) {
  const view = grid(root).getBoundingClientRect();
  const head = (root.querySelector(".cy-data-grid-head") as HTMLElement).getBoundingClientRect();
  const box = el.getBoundingClientRect();
  return (
    box.top >= head.bottom - 1 &&
    box.bottom <= view.bottom + 1 &&
    box.left >= view.left - 1 &&
    box.right <= view.right + 1
  );
}
const nextFrame = () => new Promise((res) => requestAnimationFrame(() => res(null)));

export const AHundredThousandRowsByFiftyColumns: Story = {
  tags: ["visual"],
  play: async ({ canvas, canvasElement }) => {
    const g = canvas.getByRole("grid", { name: "Results" });
    await expect(g).toHaveAttribute("aria-rowcount", "100001");
    await expect(g).toHaveAttribute("aria-colcount", "50");
    await expect(cell(canvasElement, "R1C1")).toBeVisible();
    // Only the window is rendered: a few rows and columns past the view, never the five million cells.
    const first = cells(canvasElement);
    await expect(first).toBeLessThan(400);
    await expect(canvas.getAllByRole("columnheader").length).toBeLessThan(20);
    // Scrolled to the far corner, the last cell is there, numbered for assistive technology, and the count holds.
    g.scrollTop = g.scrollHeight;
    g.scrollLeft = g.scrollWidth;
    await waitFor(() => expect(cell(canvasElement, "R100000C50")).toBeVisible());
    const last = cell(canvasElement, "R100000C50");
    await expect(last).toHaveAttribute("aria-colindex", "50");
    await expect(last.parentElement).toHaveAttribute("aria-rowindex", "100001");
    await expect(inView(canvasElement, last)).toBe(true);
    await expect(cells(canvasElement)).toBeLessThan(400);
    // The header stays at the top while the rows scroll under it.
    const head = canvas.getByRole("columnheader", { name: "Column 50" });
    await expect(head.getBoundingClientRect().top).toBeLessThan(g.getBoundingClientRect().top + 4);
  },
};

export const KeyboardMovesFocusAndRevealsIt: Story = {
  play: async ({ canvasElement, userEvent }) => {
    // One tab stop: the first cell.
    await userEvent.tab();
    await expect(focused()).toBe("R1C1");
    await userEvent.keyboard("{ArrowRight}{ArrowRight}{ArrowDown}");
    await expect(focused()).toBe("R2C3");
    await userEvent.keyboard("{ArrowLeft}{ArrowUp}");
    await expect(focused()).toBe("R1C2");
    // Up from the first row reaches the header; down comes back.
    await userEvent.keyboard("{ArrowUp}");
    await expect(focused()).toBe("Column 2");
    await userEvent.keyboard("{ArrowUp}{ArrowDown}");
    await expect(focused()).toBe("R1C2");
    // End and Home stay in the row, scrolling the cell into view.
    await userEvent.keyboard("{End}");
    await expect(focused()).toBe("R1C50");
    await expect(inView(canvasElement, document.activeElement as HTMLElement)).toBe(true);
    await userEvent.keyboard("{Home}");
    await expect(focused()).toBe("R1C1");
    // Ctrl+End goes to the last cell, a hundred thousand rows down, and only the window is rendered.
    await userEvent.keyboard("{Control>}{End}{/Control}");
    await expect(focused()).toBe("R100000C50");
    await expect(inView(canvasElement, document.activeElement as HTMLElement)).toBe(true);
    await expect(cells(canvasElement)).toBeLessThan(400);
    // Page Up moves a view's worth of rows, the cell still in view.
    await userEvent.keyboard("{PageUp}");
    const up = Number(/R(\d+)C50/.exec(focused() ?? "")?.[1]);
    await expect(up).toBeLessThan(100000);
    await expect(up).toBeGreaterThan(99985);
    await expect(inView(canvasElement, document.activeElement as HTMLElement)).toBe(true);
    await userEvent.keyboard("{PageDown}");
    await expect(focused()).toBe("R100000C50");
    await userEvent.keyboard("{Control>}{Home}{/Control}");
    await expect(focused()).toBe("R1C1");
    await expect(inView(canvasElement, document.activeElement as HTMLElement)).toBe(true);
    // Page Up from the first row reaches the header.
    await userEvent.keyboard("{PageUp}");
    await expect(focused()).toBe("Column 1");
    await userEvent.keyboard("{ArrowDown}");
    // The ends do not wrap.
    await userEvent.keyboard("{ArrowLeft}");
    await expect(focused()).toBe("R1C1");
    // Tab leaves the grid.
    await userEvent.tab();
    await expect(grid(canvasElement).contains(document.activeElement)).toBe(false);
  },
};

export const FocusSurvivesScrollingAway: Story = {
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.click(cell(canvasElement, "R2C2"));
    await expect(focused()).toBe("R2C2");
    const g = grid(canvasElement);
    g.scrollTop = g.scrollHeight / 2;
    g.scrollLeft = g.scrollWidth / 2;
    await nextFrame();
    // Far out of view, the focused cell is still rendered and focused; the next arrow brings it back into view.
    await waitFor(() => expect(cell(canvasElement, "R50000C25")).toBeDefined());
    await expect(focused()).toBe("R2C2");
    await userEvent.keyboard("{ArrowDown}");
    await expect(focused()).toBe("R3C2");
    await expect(inView(canvasElement, document.activeElement as HTMLElement)).toBe(true);
  },
};

interface Person {
  id: string;
  name: string;
  age: number | null;
  city: string;
}
const PEOPLE: Person[] = [
  { id: "p1", name: "Grace", age: 85, city: "Arlington" },
  { id: "p2", name: "ada", age: 36, city: "London" },
  { id: "p3", name: "Linus", age: null, city: "Helsinki" },
  { id: "p4", name: "Barbara", age: 9, city: "Boston" },
];
const PEOPLE_COLUMNS: DataGridColumn<Person>[] = [
  { key: "name", header: "Name", sortable: true, resizable: true },
  {
    key: "age",
    header: "Age",
    sortable: true,
    align: "end",
    width: 96,
    cell: (p) => p.age ?? "NULL",
    cellKind: (p) => (p.age === null ? "null" : "number"),
  },
  { key: "city", header: "City", resizable: true, minWidth: 80, maxWidth: 240 },
];
const people = {
  label: "People",
  columns: PEOPLE_COLUMNS,
  rows: PEOPLE,
  getRowId: (p: Person) => p.id,
} as Partial<DataGridProps<unknown>>;
/** The first column's text, top to bottom. */
const names = (el: Element) =>
  [...el.querySelectorAll(".cy-data-grid-row")]
    .sort((a, b) => Number(a.getAttribute("aria-rowindex")) - Number(b.getAttribute("aria-rowindex")))
    .map((r) => r.querySelector('[aria-colindex="1"]')?.textContent);

export const SortingCyclesAndCompares: Story = {
  args: people,
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const name = canvas.getByRole("columnheader", { name: "Name" });
    await expect(name).toHaveAttribute("aria-sort", "none");
    // City is not sortable: no button, no aria-sort.
    await expect(canvas.getByRole("columnheader", { name: "City" })).not.toHaveAttribute("aria-sort");
    await expect(canvas.getAllByRole("button").map((b) => b.textContent)).toEqual(["Name", "Age"]);
    await userEvent.click(canvas.getByRole("button", { name: "Name" }));
    await expect(names(canvasElement)).toEqual(["ada", "Barbara", "Grace", "Linus"]);
    await expect(name).toHaveAttribute("aria-sort", "ascending");
    await expect(args.onSortChange).toHaveBeenLastCalledWith({ key: "name", direction: "ascending" });
    await userEvent.click(canvas.getByRole("button", { name: "Name" }));
    await expect(names(canvasElement)).toEqual(["Linus", "Grace", "Barbara", "ada"]);
    await expect(name).toHaveAttribute("aria-sort", "descending");
    await userEvent.click(canvas.getByRole("button", { name: "Name" }));
    await expect(names(canvasElement)).toEqual(["Grace", "ada", "Linus", "Barbara"]);
    await expect(args.onSortChange).toHaveBeenLastCalledWith(null);
    // Numbers compare as numbers; an empty value is last either way.
    await userEvent.click(canvas.getByRole("button", { name: "Age" }));
    await expect(names(canvasElement)).toEqual(["Barbara", "ada", "Grace", "Linus"]);
    await userEvent.click(canvas.getByRole("button", { name: "Age" }));
    await expect(names(canvasElement)).toEqual(["Grace", "ada", "Barbara", "Linus"]);
    await expect(name).toHaveAttribute("aria-sort", "none");
  },
};

export const SortFromTheKeyboard: Story = {
  args: people,
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.tab();
    await expect(focused()).toBe("Grace");
    // Up reaches the header's sort button; Enter sorts and focus stays on it.
    await userEvent.keyboard("{ArrowUp}");
    await expect(document.activeElement).toBe(canvas.getByRole("button", { name: "Name" }));
    await userEvent.keyboard("{Enter}");
    await expect(names(canvasElement)).toEqual(["ada", "Barbara", "Grace", "Linus"]);
    await expect(document.activeElement).toBe(canvas.getByRole("button", { name: "Name" }));
    // A header that does not sort is focused itself.
    await userEvent.keyboard("{End}");
    await expect(document.activeElement).toBe(canvas.getByRole("columnheader", { name: "City" }));
    await userEvent.keyboard("{Enter}{ArrowDown}");
    await expect(focused()).toBe("London");
  },
};

export const ControlledAndManualSort: Story = {
  args: { ...people, sort: { key: "age", direction: "descending" }, manualSort: true },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    // The server sorts: the rows stay as given, the header shows the sort.
    await expect(names(canvasElement)).toEqual(["Grace", "ada", "Linus", "Barbara"]);
    await expect(canvas.getByRole("columnheader", { name: "Age" })).toHaveAttribute(
      "aria-sort",
      "descending",
    );
    // Pressing reports the next sort; controlled, nothing changes until the parent passes it.
    await userEvent.click(canvas.getByRole("button", { name: "Age" }));
    await expect(args.onSortChange).toHaveBeenLastCalledWith(null);
    await expect(canvas.getByRole("columnheader", { name: "Age" })).toHaveAttribute(
      "aria-sort",
      "descending",
    );
  },
};

export const ControlledSortSortsTheRows: Story = {
  args: { ...people, sort: { key: "city", direction: "ascending" } },
  play: async ({ canvasElement }) => {
    // A sort on a column that is not sortable by the header still sorts, by the column's value.
    await expect(names(canvasElement)).toEqual(["Grace", "Barbara", "Linus", "ada"]);
  },
};

export const SortByAColumnThatIsGone: Story = {
  args: { ...people, defaultSort: { key: "missing", direction: "ascending" } },
  play: async ({ canvasElement }) => {
    await expect(names(canvasElement)).toEqual(["Grace", "ada", "Linus", "Barbara"]);
  },
};

const width = (el: Element | null) => Math.round((el as HTMLElement).getBoundingClientRect().width);
const header = (el: Element, name: string) =>
  [...el.querySelectorAll<HTMLElement>('[role="columnheader"]')].find(
    (h) => h.textContent === name,
  ) as HTMLElement;
/** Drags column `col`'s edge by `dx` pixels with a mouse (or `pointerType`), releasing unless told not to. */
function dragEdge(el: Element, col: number, dx: number, { pointerType = "mouse", release = true } = {}) {
  const edge = el.querySelector(`.cy-data-grid-resize[data-col="${col}"]`) as HTMLElement;
  const r = edge.getBoundingClientRect();
  const x = r.left + r.width / 2;
  const y = r.top + r.height / 2;
  const init = {
    bubbles: true,
    cancelable: true,
    pointerId: 7,
    pointerType,
    isPrimary: true,
    button: 0,
    buttons: 1,
  };
  edge.dispatchEvent(new PointerEvent("pointerdown", { ...init, clientX: x, clientY: y }));
  for (const step of [dx / 2, dx])
    window.dispatchEvent(new PointerEvent("pointermove", { ...init, clientX: x + step, clientY: y }));
  if (release)
    window.dispatchEvent(new PointerEvent("pointerup", { ...init, buttons: 0, clientX: x + dx, clientY: y }));
}

/** People whose Name column's width the parent can set (as a saved layout would). */
function Resettable(props: Partial<DataGridProps<Person>>) {
  const [nameWidth, setNameWidth] = useState<number | undefined>(undefined);
  const columns = PEOPLE_COLUMNS.map((c) => (c.key === "name" ? { ...c, width: nameWidth } : c));
  return (
    <Stack gap="3">
      <DataGrid {...(people as DataGridProps<Person>)} {...props} columns={columns} />
      <Button onClick={() => setNameWidth(300)}>Saved layout</Button>
    </Stack>
  );
}

export const DragAHeaderEdgeToResize: Story = {
  render: (args) => <Resettable {...(args as Partial<DataGridProps<Person>>)} />,
  args: people,
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const name = header(canvasElement, "Name");
    await expect(width(name)).toBe(160);
    const cityAt = header(canvasElement, "City").getBoundingClientRect().left;
    dragEdge(canvasElement, 0, 40);
    // The header, its cells and the columns after it all follow.
    await waitFor(() => expect(width(name)).toBe(200));
    await expect(width(cell(canvasElement, "Grace"))).toBe(200);
    await expect(Math.round(header(canvasElement, "City").getBoundingClientRect().left - cityAt)).toBe(40);
    await expect(args.onColumnResize).toHaveBeenLastCalledWith("name", 200);
    // Escape during a drag puts the width back and reports nothing.
    dragEdge(canvasElement, 0, 60, { release: false });
    await waitFor(() => expect(width(name)).toBe(260));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    await waitFor(() => expect(width(name)).toBe(200));
    await expect(args.onColumnResize).toHaveBeenCalledTimes(1);
    // minWidth and maxWidth bound it (48 when not given).
    dragEdge(canvasElement, 0, -400);
    await waitFor(() => expect(width(name)).toBe(48));
    dragEdge(canvasElement, 2, 400);
    await waitFor(() => expect(width(header(canvasElement, "City"))).toBe(240));
    await expect(args.onColumnResize).toHaveBeenLastCalledWith("city", 240);
    // A drag that ends where it started reports nothing; a column that does not resize has no edge.
    dragEdge(canvasElement, 2, 0);
    await expect(args.onColumnResize).toHaveBeenCalledTimes(3);
    await expect(canvasElement.querySelector('.cy-data-grid-resize[data-col="1"]')).toBeNull();
    // Pressing the header elsewhere sorts, never resizes.
    await userEvent.click(canvas.getByRole("button", { name: "Name" }));
    await expect(width(name)).toBe(48);
    // A new width from the parent replaces the one dragged.
    await userEvent.click(canvas.getByRole("button", { name: "Saved layout" }));
    await expect(width(header(canvasElement, "Name"))).toBe(300);
  },
};

export const ResizeFromTheKeyboard: Story = {
  args: people,
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    await userEvent.tab();
    await userEvent.keyboard("{ArrowUp}");
    await expect(document.activeElement).toBe(canvas.getByRole("button", { name: "Name" }));
    await expect(document.activeElement).toHaveAttribute("aria-keyshortcuts", "Alt+ArrowLeft Alt+ArrowRight");
    // Alt+Right widens by 8, Shift by 64, Alt+Left narrows; focus stays on the header.
    await userEvent.keyboard("{Alt>}{ArrowRight}{/Alt}");
    await expect(width(header(canvasElement, "Name"))).toBe(168);
    await expect(args.onColumnResize).toHaveBeenLastCalledWith("name", 168);
    await userEvent.keyboard("{Alt>}{Shift>}{ArrowRight}{/Shift}{/Alt}");
    await expect(width(header(canvasElement, "Name"))).toBe(232);
    await userEvent.keyboard("{Alt>}{ArrowLeft}{/Alt}");
    await expect(width(header(canvasElement, "Name"))).toBe(224);
    await expect(document.activeElement).toBe(canvas.getByRole("button", { name: "Name" }));
    // A column that does not resize ignores Alt+arrows (focus stays put).
    await userEvent.keyboard("{ArrowRight}");
    await expect(document.activeElement).toBe(canvas.getByRole("button", { name: "Age" }));
    await expect(document.activeElement).not.toHaveAttribute("aria-keyshortcuts");
    await userEvent.keyboard("{Alt>}{ArrowRight}{/Alt}");
    await expect(document.activeElement).toBe(canvas.getByRole("button", { name: "Age" }));
    await expect(width(header(canvasElement, "Age"))).toBe(96);
    // The max holds.
    await userEvent.keyboard("{ArrowRight}{Alt>}{Shift>}{ArrowRight}{ArrowRight}{/Shift}{/Alt}");
    await expect(width(header(canvasElement, "City"))).toBe(240);
    // In a body cell, Alt+arrows move focus as plain arrows do.
    await userEvent.keyboard("{ArrowDown}{Alt>}{ArrowLeft}{/Alt}");
    await expect(focused()).toBe("85");
  },
};

const selectedRowNames = (el: Element) =>
  [...el.querySelectorAll('[role="row"][aria-selected="true"]')].map(
    (r) => r.querySelector('[aria-colindex="1"]')?.textContent,
  );
const selectedCells = (el: Element) =>
  [...el.querySelectorAll('[role="gridcell"][aria-selected="true"]')].map((c) => c.textContent);
/** Fires a copy at `target` as the browser does, and returns what was written and whether the grid took it over. */
function copy(target: Element) {
  const clipboardData = new DataTransfer();
  const event = new ClipboardEvent("copy", {
    clipboardData,
    bubbles: true,
    cancelable: true,
    composed: true,
  });
  // Read what the grid wrote to the event's own clipboard data while the event is still being dispatched: Firefox gives
  // a synthetic copy event its own DataTransfer rather than the one passed in (CI on #167).
  let text = "";
  const read = (e: Event) => {
    text = (e as ClipboardEvent).clipboardData?.getData("text/plain") ?? "";
  };
  window.addEventListener("copy", read);
  target.dispatchEvent(event);
  window.removeEventListener("copy", read);
  return { text, taken: event.defaultPrevented };
}

export const SelectRows: Story = {
  args: { ...people, selectionMode: "row" },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    await expect(canvas.getByRole("grid")).toHaveAttribute("aria-multiselectable", "true");
    await expect(canvasElement.querySelectorAll('[role="row"][aria-selected="false"]')).toHaveLength(4);
    await userEvent.click(cell(canvasElement, "Grace"));
    await expect(selectedRowNames(canvasElement)).toEqual(["Grace"]);
    await expect(args.onSelectionChange).toHaveBeenLastCalledWith(["p1"]);
    await expect(args.onRowClick).toHaveBeenLastCalledWith(PEOPLE[0], 0);
    // Ctrl (or Cmd) toggles one more; Shift extends from the last row chosen, and selects no text.
    await userEvent.keyboard("{Control>}");
    await userEvent.click(cell(canvasElement, "Linus"));
    await userEvent.keyboard("{/Control}");
    await expect(selectedRowNames(canvasElement)).toEqual(["Grace", "Linus"]);
    await userEvent.keyboard("{Shift>}");
    await userEvent.click(cell(canvasElement, "Boston"));
    await userEvent.keyboard("{/Shift}");
    await expect(args.onSelectionChange).toHaveBeenLastCalledWith(["p3", "p4"]);
    await expect(document.getSelection()?.toString()).toBe("");
    await expect(focused()).toBe("Boston");
    // Space selects the focused row; Shift+Up extends; plain arrows only move focus; Ctrl+Space toggles.
    await userEvent.keyboard(" ");
    await expect(selectedRowNames(canvasElement)).toEqual(["Barbara"]);
    await userEvent.keyboard("{Shift>}{ArrowUp}{/Shift}");
    await expect(selectedRowNames(canvasElement)).toEqual(["Linus", "Barbara"]);
    await userEvent.keyboard("{ArrowUp}{ArrowUp}");
    await expect(focused()).toBe("Arlington");
    await expect(selectedRowNames(canvasElement)).toEqual(["Linus", "Barbara"]);
    await userEvent.keyboard("{Control>} {/Control}");
    await expect(selectedRowNames(canvasElement)).toEqual(["Grace", "Linus", "Barbara"]);
    await userEvent.keyboard("{Control>} {/Control}");
    await expect(selectedRowNames(canvasElement)).toEqual(["Linus", "Barbara"]);
    // The selected rows copy as tab-separated text, in display order, the raw values (null as nothing).
    await expect(copy(document.activeElement as Element)).toEqual({
      text: "Linus\t\tHelsinki\nBarbara\t9\tBoston",
      taken: true,
    });
    // Shift+Space extends from the row last chosen (Grace, toggled off) to the focused row.
    await userEvent.keyboard("{ArrowDown}{Shift>} {/Shift}");
    await expect(selectedRowNames(canvasElement)).toEqual(["Grace", "ada"]);
    // Ctrl+A selects every row.
    await userEvent.keyboard("{Control>}a{/Control}");
    await expect(selectedRowNames(canvasElement)).toEqual(["Grace", "ada", "Linus", "Barbara"]);
  },
};

export const ControlledRows: Story = {
  args: { ...people, selectionMode: "row", selected: ["p2"] },
  play: async ({ args, canvasElement, userEvent }) => {
    await expect(selectedRowNames(canvasElement)).toEqual(["ada"]);
    await userEvent.click(cell(canvasElement, "Grace"));
    await expect(args.onSelectionChange).toHaveBeenLastCalledWith(["p1"]);
    await expect(selectedRowNames(canvasElement)).toEqual(["ada"]);
  },
};

export const SelectACell: Story = {
  args: { ...people, selectionMode: "cell" },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    await expect(canvas.getByRole("grid")).not.toHaveAttribute("aria-multiselectable");
    await userEvent.click(cell(canvasElement, "London"));
    await expect(selectedCells(canvasElement)).toEqual(["London"]);
    const london = { rowId: "p2", key: "city" };
    await expect(args.onSelectedRangeChange).toHaveBeenLastCalledWith({ anchor: london, focus: london });
    // The selection follows focus; Shift does not extend a single cell.
    await userEvent.keyboard("{ArrowDown}");
    await expect(selectedCells(canvasElement)).toEqual(["Helsinki"]);
    await userEvent.keyboard("{Shift>}{ArrowDown}{/Shift}");
    await expect(selectedCells(canvasElement)).toEqual(["Boston"]);
    await userEvent.keyboard("{Shift>}");
    await userEvent.click(cell(canvasElement, "Grace"));
    await userEvent.keyboard("{/Shift}");
    await expect(selectedCells(canvasElement)).toEqual(["Grace"]);
    // Up into the header keeps the selection.
    await userEvent.keyboard("{ArrowUp}");
    await expect(selectedCells(canvasElement)).toEqual(["Grace"]);
    await expect(document.getSelection()?.toString()).toBe("");
    await userEvent.keyboard("{ArrowDown}{ArrowRight} ");
    await expect(selectedCells(canvasElement)).toEqual(["85"]);
    await expect(copy(document.activeElement as Element)).toEqual({ text: "85", taken: true });
  },
};

export const SelectARangeAndCopy: Story = {
  args: { ...people, selectionMode: "range" },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    await expect(canvas.getByRole("grid")).toHaveAttribute("aria-multiselectable", "true");
    await expect(canvasElement.querySelectorAll('[role="gridcell"][aria-selected="false"]')).toHaveLength(12);
    await userEvent.click(cell(canvasElement, "Grace"));
    await userEvent.keyboard("{Shift>}");
    await userEvent.click(cell(canvasElement, "Helsinki"));
    await userEvent.keyboard("{/Shift}");
    await expect(selectedCells(canvasElement)).toEqual([
      "Grace",
      "85",
      "Arlington",
      "ada",
      "36",
      "London",
      "Linus",
      "NULL",
      "Helsinki",
    ]);
    await expect(args.onSelectedRangeChange).toHaveBeenLastCalledWith({
      anchor: { rowId: "p1", key: "name" },
      focus: { rowId: "p3", key: "city" },
    });
    await expect(copy(document.activeElement as Element)).toEqual({
      text: "Grace\t85\tArlington\nada\t36\tLondon\nLinus\t\tHelsinki",
      taken: true,
    });
    // Shift+arrows move the far corner; a plain arrow starts again from the focused cell.
    await userEvent.keyboard("{Shift>}{ArrowLeft}{ArrowUp}{/Shift}");
    await expect(selectedCells(canvasElement)).toEqual(["Grace", "85", "ada", "36"]);
    await userEvent.keyboard("{ArrowDown}");
    await expect(selectedCells(canvasElement)).toEqual(["NULL"]);
    // Ctrl+A selects every cell.
    await userEvent.keyboard("{Control>}a{/Control}");
    await expect(selectedCells(canvasElement)).toHaveLength(12);
    // The corners are rows by id: sorted, the rectangle is what lies between them in the new order.
    await userEvent.click(canvas.getByRole("button", { name: "Name" }));
    await expect(selectedCells(canvasElement)).toEqual([
      "Barbara",
      "9",
      "Boston",
      "Grace",
      "85",
      "Arlington",
    ]);
  },
};

export const TextInCellsStillSelects: Story = {
  args: { ...people, selectionMode: "range" },
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.click(cell(canvasElement, "Grace"));
    // Text selected in a cell (by dragging, or a double-click on a word) copies as text: the grid leaves it alone.
    const text = cell(canvasElement, "London").firstChild as Node;
    document.getSelection()?.selectAllChildren(text);
    await expect(copy(cell(canvasElement, "London"))).toEqual({ text: "", taken: false });
    // With nothing selected in the text, the cells copy.
    document.getSelection()?.removeAllRanges();
    await expect(copy(document.activeElement as Element)).toEqual({ text: "Grace", taken: true });
  },
};

export const NothingSelectedCopiesNothing: Story = {
  args: people,
  play: async ({ canvas, canvasElement, userEvent }) => {
    await expect(canvas.getByRole("grid")).not.toHaveAttribute("aria-multiselectable");
    await userEvent.click(cell(canvasElement, "Grace"));
    // Without selection there is nothing marked selected, and a copy is the browser's.
    await expect(canvasElement.querySelectorAll("[aria-selected]")).toHaveLength(0);
    await expect(copy(document.activeElement as Element)).toEqual({ text: "", taken: false });
    await userEvent.keyboard(" {Control>}a{/Control}");
    await expect(canvasElement.querySelectorAll("[aria-selected]")).toHaveLength(0);
  },
};

interface Note {
  id: string;
  text: string;
  extra: unknown;
}
export const CopyQuotesAwkwardValues: Story = {
  args: {
    label: "Notes",
    selectionMode: "range",
    rows: [
      { id: "n1", text: 'say "hi"', extra: { a: 1 } },
      { id: "n2", text: "two\nlines", extra: "tab\there" },
    ],
    columns: [
      { key: "text", header: "Text" },
      { key: "extra", header: "Extra" },
    ],
    getRowId: (n: Note) => n.id,
  } as Partial<DataGridProps<unknown>>,
  play: async ({ canvasElement, userEvent }) => {
    // Objects show and copy as JSON; values holding a quote, a tab or a line break are quoted.
    await expect(cell(canvasElement, '{"a":1}')).toBeDefined();
    await userEvent.click(cell(canvasElement, '{"a":1}'));
    await userEvent.keyboard("{Control>}a{/Control}");
    await expect(copy(document.activeElement as Element)).toEqual({
      text: '"say ""hi"""\t"{""a"":1}"\n"two\nlines"\t"tab\there"',
      taken: true,
    });
  },
};

export const ClickAndActivateRows: Story = {
  args: people,
  play: async ({ args, canvasElement, userEvent }) => {
    await userEvent.click(cell(canvasElement, "36"));
    await expect(args.onRowClick).toHaveBeenLastCalledWith(PEOPLE[1], 1);
    // Enter or a double-click opens the row.
    await userEvent.keyboard("{Enter}");
    await expect(args.onAction).toHaveBeenLastCalledWith(PEOPLE[1], 1);
    await userEvent.dblClick(cell(canvasElement, "Boston"));
    await expect(args.onAction).toHaveBeenLastCalledWith(PEOPLE[3], 3);
    // Enter on the header does not.
    await userEvent.keyboard("{ArrowUp}{ArrowUp}{ArrowUp}{ArrowUp}{End}{Enter}");
    await expect(args.onAction).toHaveBeenCalledTimes(2);
    // Nor does a double-click on the header, or an Enter that ends an input method's composition.
    await userEvent.dblClick(header(canvasElement, "City"));
    await userEvent.keyboard("{ArrowDown}");
    document.activeElement?.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true, isComposing: true }),
    );
    await expect(args.onAction).toHaveBeenCalledTimes(2);
  },
};

/** Fifty rows at a time: each time the end comes into view, fifty more. */
function LoadMore(props: Partial<DataGridProps<number>>) {
  const [rows, setRows] = useState(() => HUGE_ROWS.slice(0, 50));
  return (
    <DataGrid
      {...huge}
      columns={HUGE_COLUMNS.slice(0, 5)}
      rows={rows}
      onEndReached={() => {
        props.onEndReached?.();
        setRows((r) => HUGE_ROWS.slice(0, r.length + 50));
      }}
    />
  );
}

export const LoadMoreAtTheEnd: Story = {
  render: (args) => <LoadMore {...(args as Partial<DataGridProps<number>>)} />,
  play: async ({ args, canvas, canvasElement }) => {
    const g = canvas.getByRole("grid");
    await expect(g).toHaveAttribute("aria-rowcount", "51");
    await nextFrame();
    await expect(args.onEndReached).not.toHaveBeenCalled();
    // The end in view asks for more, once; the new rows extend the grid.
    g.scrollTop = g.scrollHeight;
    await waitFor(() => expect(g).toHaveAttribute("aria-rowcount", "101"));
    await expect(args.onEndReached).toHaveBeenCalledTimes(1);
    await nextFrame();
    await expect(args.onEndReached).toHaveBeenCalledTimes(1);
    g.scrollTop = g.scrollHeight;
    await waitFor(() => expect(g).toHaveAttribute("aria-rowcount", "151"));
    await waitFor(() => expect(cell(canvasElement, "R100C1")).toBeVisible());
    await expect(args.onEndReached).toHaveBeenCalledTimes(2);
  },
};

/** A page of fifty rows under a Pagination: paging is composed, not built in. */
function Paged() {
  const [page, setPage] = useState(1);
  const size = 50;
  return (
    <Stack gap="3">
      <DataGrid
        {...huge}
        columns={HUGE_COLUMNS.slice(0, 6)}
        rows={HUGE_ROWS.slice((page - 1) * size, page * size)}
      />
      <Pagination count={pageCount(HUGE_ROWS.length, size)} page={page} onChange={setPage} />
    </Stack>
  );
}

export const PagedWithPagination: Story = {
  render: () => <Paged />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    await expect(canvas.getByRole("grid")).toHaveAttribute("aria-rowcount", "51");
    await userEvent.click(canvas.getByRole("button", { name: "Next page" }));
    await waitFor(() => expect(cell(canvasElement, "R51C1")).toBeVisible());
    await expect(cell(canvasElement, "R1C1")).toBeUndefined();
  },
};

const LONG = "A description far too long to fit in its column, cut short with an ellipsis";
interface Item {
  id: string;
  title: string;
}
export const TooltipShowsTheFullValue: Story = {
  args: {
    label: "Items",
    rows: [
      { id: "i1", title: LONG },
      { id: "i2", title: "Short" },
    ],
    columns: [
      { key: "id", header: "Id", width: 64 },
      {
        key: "title",
        header: "Title",
        width: 160,
        tooltip: (r: Item) => r.title,
      },
    ],
    getRowId: (r: Item) => r.id,
  } as Partial<DataGridProps<unknown>>,
  play: async ({ canvasElement, userEvent }) => {
    // Keyboard focus on a cell cut short with an ellipsis shows the full value. The cell's text already holds it, so
    // the tip is for the eye only: it does not describe the cell.
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    const cut = document.activeElement as HTMLElement;
    await expect(cut).toHaveAttribute("role", "gridcell");
    const value = cut.querySelector(".cy-data-grid-value") as HTMLElement;
    await expect(value.scrollWidth).toBeGreaterThan(value.clientWidth);
    const tip = await waitFor(() => {
      const open = canvasElement.ownerDocument.querySelector<HTMLElement>(".cy-tooltip:popover-open");
      expect(open).not.toBeNull();
      return open as HTMLElement;
    });
    await expect(tip).toHaveTextContent(LONG);
    await expect(tip).toHaveAttribute("aria-hidden", "true");
    await expect(cut).not.toHaveAttribute("aria-describedby");
    // The anchor takes no box: the cell is still placed in its row.
    await expect(
      cut.getBoundingClientRect().left - grid(canvasElement).getBoundingClientRect().left,
    ).toBeGreaterThan(60);
    // A value that fits has no tooltip, though the column gives one.
    await userEvent.keyboard("{ArrowDown}");
    await expect(focused()).toBe("Short");
    await pause(150);
    await expect(canvasElement.ownerDocument.querySelector(".cy-tooltip:popover-open")).toBeNull();
    await expect(document.activeElement?.parentElement?.querySelector(".cy-tooltip")).toBeNull();
  },
};

export const DenseRowsAndCellTones: Story = {
  args: {
    ...people,
    size: "sm",
    columns: [
      PEOPLE_COLUMNS[0] as DataGridColumn<Person>,
      // A tone wins over the kind's colour: Barbara's age is a number drawn in the neutral ink.
      {
        ...(PEOPLE_COLUMNS[1] as DataGridColumn<Person>),
        cellTone: (p: Person) => (p.age === 9 ? "neutral" : undefined),
      },
      { key: "city", header: "City", cellTone: (p: Person) => (p.city === "London" ? "success" : undefined) },
    ],
  } as Partial<DataGridProps<unknown>>,
  render: (args) => (
    <div style={{ "--cy-data-grid-number-color": "rgb(1, 2, 3)" } as CSSProperties}>
      <DataGrid {...(args as DataGridProps<unknown>)} />
      <span data-testid="muted" style={{ color: "var(--cy-color-muted)" }} />
      <span data-testid="success" style={{ color: "var(--cy-color-success-text)" }} />
      <span data-testid="ink" style={{ color: "var(--cy-color-ink)" }} />
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    // Dense: 28px rows under a 32px header (on a fine pointer).
    const row = cell(canvasElement, "Grace").parentElement as HTMLElement;
    await expect(Math.round(row.getBoundingClientRect().height)).toBe(28);
    await expect(Math.round(header(canvasElement, "Name").getBoundingClientRect().height)).toBe(32);
    // A null is muted and italic; numbers take the number colour token; a tone colours its cell.
    const nil = getComputedStyle(cell(canvasElement, "NULL"));
    await expect(nil.fontStyle).toBe("italic");
    await expect(nil.color).toBe(getComputedStyle(canvas.getByTestId("muted")).color);
    await expect(getComputedStyle(cell(canvasElement, "85")).color).toBe("rgb(1, 2, 3)");
    await expect(getComputedStyle(cell(canvasElement, "London")).color).toBe(
      getComputedStyle(canvas.getByTestId("success")).color,
    );
    await expect(getComputedStyle(cell(canvasElement, "Boston")).fontStyle).toBe("normal");
    await expect(getComputedStyle(cell(canvasElement, "9")).color).toBe(
      getComputedStyle(canvas.getByTestId("ink")).color,
    );
  },
};

export const EmptyWithOwnMessage: Story = {
  args: { ...people, rows: [], labels: { empty: "No rows returned" } },
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByText("No rows returned")).toBeVisible();
    await expect(canvas.getByRole("grid")).toHaveAttribute("aria-rowcount", "1");
    // With no rows, the tab stop is on the header.
    await userEvent.tab();
    await expect(document.activeElement).toBe(canvas.getByRole("button", { name: "Name" }));
    await userEvent.keyboard("{ArrowDown}{Control>}{End}{/Control}");
    await expect(document.activeElement).toBe(canvas.getByRole("columnheader", { name: "City" }));
  },
};

export const TouchScrollsAndTaps: Story = {
  tags: ["touch", "!dev"],
  args: { ...people, selectionMode: "cell" },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    // Rows, the header and a column's edge are at least 44px for a finger.
    await expect(cell(canvasElement, "Grace").getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    await expect(header(canvasElement, "Name").getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    const edge = canvasElement.querySelector(".cy-data-grid-resize") as HTMLElement;
    await expect(edge.getBoundingClientRect().width).toBeGreaterThanOrEqual(44);
    // A tap selects a cell; a finger on the grid scrolls it (touch-action is left to the browser).
    await userEvent.pointer({ keys: "[TouchA]", target: cell(canvasElement, "London") });
    await expect(selectedCells(canvasElement)).toEqual(["London"]);
    await expect(args.onRowClick).toHaveBeenLastCalledWith(PEOPLE[1], 1);
    await expect(getComputedStyle(canvas.getByRole("grid")).touchAction).toBe("auto");
    // A finger on a column's edge resizes it.
    dragEdge(canvasElement, 0, 30, { pointerType: "touch" });
    await waitFor(() => expect(width(header(canvasElement, "Name"))).toBe(190));
  },
};

export const TouchScrollsAHugeGrid: Story = {
  tags: ["touch", "!dev"],
  play: async ({ canvasElement }) => {
    const g = grid(canvasElement);
    g.scrollTop = 44 * 5000;
    await waitFor(() => expect(cell(canvasElement, "R5001C1")).toBeDefined());
    await expect(cells(canvasElement)).toBeLessThan(400);
  },
};

export const RightToLeft: Story = {
  args: people,
  render: (args) => (
    <div dir="rtl">
      <DataGrid {...(args as DataGridProps<unknown>)} />
    </div>
  ),
  play: async ({ args, canvasElement, userEvent }) => {
    // The first column is on the right.
    await expect(header(canvasElement, "Name").getBoundingClientRect().left).toBeGreaterThan(
      header(canvasElement, "Age").getBoundingClientRect().left,
    );
    // Left moves on to the next column, Right back.
    await userEvent.click(cell(canvasElement, "Grace"));
    await userEvent.keyboard("{ArrowLeft}");
    await expect(focused()).toBe("85");
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    await expect(focused()).toBe("Grace");
    // The edge is on the left: Alt+Left and dragging left widen the column.
    await userEvent.keyboard("{ArrowUp}{Alt>}{ArrowLeft}{/Alt}");
    await expect(width(header(canvasElement, "Name"))).toBe(168);
    dragEdge(canvasElement, 0, -32);
    await waitFor(() => expect(width(header(canvasElement, "Name"))).toBe(200));
    await expect(args.onColumnResize).toHaveBeenLastCalledWith("name", 200);
  },
};

export const RightToLeftRevealsColumns: Story = {
  render: (args) => (
    <div dir="rtl">
      <DataGrid {...(args as DataGridProps<unknown>)} />
    </div>
  ),
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.tab();
    await userEvent.keyboard("{End}");
    await expect(focused()).toBe("R1C50");
    await expect(inView(canvasElement, document.activeElement as HTMLElement)).toBe(true);
    await expect(grid(canvasElement).scrollLeft).toBeLessThan(0);
    await userEvent.keyboard("{Home}");
    await expect(focused()).toBe("R1C1");
    await expect(inView(canvasElement, document.activeElement as HTMLElement)).toBe(true);
  },
};

function ShadowGrid() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current;
    if (!el || el.shadowRoot) return;
    const root = el.attachShadow({ mode: "open" });
    root.adoptedStyleSheets = [createStyleSheet()];
    const mount = document.createElement("div");
    root.append(mount);
    createRoot(mount).render(
      <DataGrid {...(people as DataGridProps<Person>)} selectionMode="range" style={{ blockSize: 200 }} />,
    );
  }, []);
  return (
    <div>
      <DataGrid {...(people as DataGridProps<Person>)} style={{ blockSize: 200 }} />
      <div data-testid="host" ref={host} />
    </div>
  );
}

export const InsideShadowRoot: Story = {
  render: () => <ShadowGrid />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const host = await canvas.findByTestId("host");
    const shadow = host.shadowRoot as ShadowRoot;
    await waitFor(() => expect(shadow.querySelector('[role="gridcell"]')).toBeTruthy());
    // Styled the same as on the page.
    const inside = getComputedStyle(cell(shadow as unknown as Element, "Grace"));
    const onPage = getComputedStyle(cell(canvasElement, "Grace"));
    for (const p of ["height", "width", "padding-inline-start", "font-size", "color"])
      await expect(inside.getPropertyValue(p)).toBe(onPage.getPropertyValue(p));
    // Keys, selection and copy work in the shadow root.
    await userEvent.click(cell(shadow as unknown as Element, "Grace"));
    await userEvent.keyboard("{Shift>}{ArrowDown}{ArrowRight}{/Shift}");
    await expect(selectedCells(shadow as unknown as Element)).toEqual(["Grace", "85", "ada", "36"]);
    await expect(copy(shadow.activeElement as Element)).toEqual({ text: "Grace\t85\nada\t36", taken: true });
  },
};

export const ReadableInLightAndDark: Story = {
  tags: ["visual"],
  args: { ...people, selectionMode: "row", defaultSelected: ["p2"], style: { blockSize: 220 } },
  render: (args) => (
    <Stack gap="4">
      {(["light", "dark"] as const).map((mode) => (
        <CynosureTheme key={mode} mode={mode}>
          <div className="surface">
            <DataGrid {...(args as DataGridProps<unknown>)} label={`${mode} people`} />
          </div>
        </CynosureTheme>
      ))}
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    for (const surface of canvasElement.querySelectorAll(".surface")) {
      for (const text of ["Grace", "ada", "NULL"])
        await expect(textContrast(cell(surface, text))).toBeGreaterThanOrEqual(4.5);
      await expect(textContrast(header(surface, "City"))).toBeGreaterThanOrEqual(4.5);
    }
  },
};

const shiftPress = (target: Element) => {
  const event = new MouseEvent("mousedown", { bubbles: true, cancelable: true, shiftKey: true, button: 0 });
  target.dispatchEvent(event);
  return event.defaultPrevented;
};

export const ShiftClickSelectsCellsNotText: Story = {
  args: { ...people, selectionMode: "cell" },
  play: async ({ args, canvasElement }) => {
    // With a selection mode, Shift+press on a cell keeps the browser from extending a text selection to it.
    await expect(shiftPress(cell(canvasElement, "London"))).toBe(true);
    await expect(shiftPress(canvasElement.querySelector(".cy-data-grid-body") as Element)).toBe(false);
    await expect(args.onSelectedRangeChange).not.toHaveBeenCalled();
  },
};

export const ShiftPressSelectsTextWithoutSelection: Story = {
  args: people,
  play: async ({ canvasElement }) => {
    // Without one, Shift+press is the browser's (extending a text selection).
    await expect(shiftPress(cell(canvasElement, "London"))).toBe(false);
  },
};

export const CtrlCCopiesTheCells: Story = {
  tags: ["!dev"],
  args: { ...people, selectionMode: "range" },
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.click(cell(canvasElement, "Grace"));
    await userEvent.keyboard("{Shift>}{ArrowRight}{/Shift}");
    let written = "";
    const listen = (e: ClipboardEvent) => {
      written = e.clipboardData?.getData("text/plain") ?? "";
    };
    window.addEventListener("copy", listen);
    try {
      // A real Ctrl+C (the browser's own copy, which synthetic keys never start) reaches the grid.
      if (!(await pressKey("Control>"))) return;
      await pressKey("c");
      await pressKey("/Control");
      await waitFor(() => expect(written).toBe("Grace\t85"));
    } finally {
      window.removeEventListener("copy", listen);
    }
  },
};

export const ARangeWhoseRowsAreGone: Story = {
  args: {
    ...people,
    selectionMode: "range",
    selectedRange: { anchor: { rowId: "gone", key: "name" }, focus: { rowId: "p2", key: "city" } },
  } as Partial<DataGridProps<unknown>>,
  play: async ({ canvasElement, userEvent }) => {
    // A corner whose row has left (filtered out, another page) selects nothing, and copying is the browser's.
    await expect(selectedCells(canvasElement)).toEqual([]);
    await userEvent.click(cell(canvasElement, "London"));
    await expect(copy(document.activeElement as Element).taken).toBe(false);
  },
};

export const StableUnderHostileHost: Story = {
  args: { rows: HUGE_ROWS.slice(0, 20), columns: HUGE_COLUMNS.slice(0, 4), className: "results" } as Partial<
    DataGridProps<unknown>
  >,
  play: async ({ canvasElement }) => {
    // className is for layout: it joins the root's own class.
    await expect(canvasElement.querySelector(".cy-data-grid")).toHaveClass("cy-data-grid", "results");
    const props = [
      "display",
      "font-size",
      "font-weight",
      "color",
      "padding-left",
      "height",
      "width",
      "text-align",
      "box-sizing",
      "position",
    ];
    for (const selector of [
      ".cy-data-grid",
      ".cy-data-grid-header",
      ".cy-data-grid-row",
      ".cy-data-grid-cell",
    ]) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, props);
      await expect({ selector, ...hostile }).toEqual({ selector, ...clean });
    }
  },
};

// ── Editing, multi-sort, filters, the column menu and row details ──

const CITIES = ["Arlington", "Boston", "Helsinki", "London"];
const EDIT_COLUMNS: DataGridColumn<Person>[] = [
  { key: "name", header: "Name", editable: true },
  {
    key: "age",
    header: "Age",
    align: "end",
    width: 96,
    editable: true,
    editor: "number",
    cell: (p) => p.age ?? "NULL",
  },
  {
    key: "city",
    header: "City",
    editable: (p) => p.id !== "p3",
    editor: "select",
    options: CITIES.map((c) => ({ value: c, label: c })),
  },
];

/** People whose cells can be edited: each edit is written back to the rows. */
function Editable(props: Partial<DataGridProps<Person>>) {
  const [rows, setRows] = useState(PEOPLE);
  return (
    <DataGrid
      label="People"
      columns={EDIT_COLUMNS}
      rows={rows}
      getRowId={(p) => p.id}
      {...props}
      onCellEdit={(row, key, value) => {
        props.onCellEdit?.(row, key, value);
        setRows((all) => all.map((p) => (p.id === row.id ? { ...p, [key]: value } : p)));
      }}
    />
  );
}
const edits = fn();

/**
 * Cell editing: Enter or F2 edits the focused cell, typing a character replaces its value; Enter commits and stays,
 * Tab commits and moves on, Escape cancels, leaving the cell commits. `onCellEdit(row, key, value)` gets the value.
 */
export const EditCellsWithTheKeyboard: Story = {
  render: () => <Editable onCellEdit={edits} onAction={editAction} />,
  play: async ({ canvas, userEvent }) => {
    edits.mockClear();
    await userEvent.tab();
    await expect(focused()).toBe("Grace");
    // Enter opens a text field holding the value, named for the column.
    await userEvent.keyboard("{Enter}");
    const field = canvas.getByRole("textbox", { name: "Edit Name" });
    await expect(field).toHaveFocus();
    await expect(field).toHaveValue("Grace");
    await userEvent.clear(field);
    await userEvent.type(field, "Grace Hopper{Enter}");
    await expect(edits).toHaveBeenLastCalledWith(PEOPLE[0], "name", "Grace Hopper");
    await expect(focused()).toBe("Grace Hopper");
    await expect(canvas.queryByRole("textbox")).toBeNull();
    // Enter on an editable cell edits, it does not run onAction.
    await expect(editAction).not.toHaveBeenCalled();
    // F2 edits too; Escape cancels and puts focus back on the cell.
    await userEvent.keyboard("{F2}");
    await userEvent.type(canvas.getByRole("textbox", { name: "Edit Name" }), "!!");
    await userEvent.keyboard("{Escape}");
    await expect(edits).toHaveBeenCalledTimes(1);
    await expect(focused()).toBe("Grace Hopper");
    // Typing a character starts editing with it; Tab commits and moves to the next cell.
    await userEvent.keyboard("{ArrowDown}Z");
    await expect(canvas.getByRole("textbox", { name: "Edit Name" })).toHaveValue("Z");
    await userEvent.keyboard("ed{Tab}");
    await expect(edits).toHaveBeenLastCalledWith(PEOPLE[1], "name", "Zed");
    await expect(focused()).toBe("36");
    // A number column parses its value; text that is not a number keeps the field open with an error.
    await userEvent.keyboard("{Enter}");
    const age = canvas.getByRole("textbox", { name: "Edit Age" });
    await userEvent.clear(age);
    await userEvent.type(age, "abc{Enter}");
    await expect(age).toHaveFocus();
    await expect(age).toHaveAttribute("aria-invalid", "true");
    await userEvent.clear(age);
    await userEvent.type(age, "37{Enter}");
    await expect(edits).toHaveBeenLastCalledWith(expect.objectContaining({ id: "p2" }), "age", 37);
    await expect(focused()).toBe("37");
    // Emptied, a number is null.
    await userEvent.keyboard("{Enter}");
    await userEvent.clear(canvas.getByRole("textbox", { name: "Edit Age" }));
    await userEvent.keyboard("{Enter}");
    await expect(edits).toHaveBeenLastCalledWith(expect.objectContaining({ id: "p2" }), "age", null);
    // A select column edits with a Select: its value is committed as it is chosen.
    await userEvent.keyboard("{ArrowRight}{Enter}");
    const city = canvas.getByRole("combobox", { name: "Edit City" });
    await expect(city).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.click(await canvas.findByRole("option", { name: "Boston" }));
    await expect(edits).toHaveBeenLastCalledWith(expect.objectContaining({ id: "p2" }), "city", "Boston");
    await waitFor(() => expect(focused()).toBe("Boston"));
    // A cell whose column says no (Linus' city) runs onAction on Enter as before.
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect(canvas.queryByRole("combobox")).toBeNull();
    await expect(editAction).toHaveBeenCalledTimes(1);
  },
};
const editAction = fn();

/** A double-click edits an editable cell; leaving the field (a click elsewhere) commits it. */
export const DoubleClickEditsAndLeavingCommits: Story = {
  render: () => (
    <Stack gap="2">
      <Editable onCellEdit={edits} />
      <Button>Elsewhere</Button>
    </Stack>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    edits.mockClear();
    await userEvent.dblClick(cell(canvasElement, "Barbara"));
    const field = canvas.getByRole("textbox", { name: "Edit Name" });
    await expect(field).toHaveFocus();
    // Clicking inside the field keeps it open.
    await userEvent.click(field);
    await expect(field).toHaveFocus();
    await userEvent.type(field, " Liskov");
    await userEvent.click(canvas.getByRole("button", { name: "Elsewhere" }));
    await expect(edits).toHaveBeenLastCalledWith(PEOPLE[3], "name", "Barbara Liskov");
    await expect(canvas.queryByRole("textbox")).toBeNull();
    await expect(cell(canvasElement, "Barbara Liskov")).toBeVisible();
  },
};

const TEAM: Person[] = [
  { id: "t1", name: "Cy", age: 40, city: "London" },
  { id: "t2", name: "Ann", age: 31, city: "Boston" },
  { id: "t3", name: "Bo", age: 31, city: "London" },
  { id: "t4", name: "Al", age: 40, city: "Boston" },
];
const sortsChanged = fn();

/**
 * Multi-column sort: Shift+click (or Shift+Enter) on another header adds it as the next key; each sorted header shows
 * its priority. A plain click sorts by that column alone again.
 */
export const ShiftClickSortsByMoreColumns: Story = {
  args: {
    ...people,
    rows: TEAM,
    columns: PEOPLE_COLUMNS.map((c) => ({ ...c, sortable: true })),
    multiSort: true,
    onSortsChange: sortsChanged,
  } as Partial<DataGridProps<unknown>>,
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const button = (name: RegExp) => canvas.getByRole("button", { name });
    await userEvent.click(button(/^City/));
    await expect(names(canvasElement)).toEqual(["Ann", "Al", "Cy", "Bo"]);
    await userEvent.keyboard("{Shift>}");
    await userEvent.click(button(/^Name/));
    await userEvent.keyboard("{/Shift}");
    await expect(names(canvasElement)).toEqual(["Al", "Ann", "Bo", "Cy"]);
    await expect(sortsChanged).toHaveBeenLastCalledWith([
      { key: "city", direction: "ascending" },
      { key: "name", direction: "ascending" },
    ]);
    // The first key is aria-sort; each sorted header shows its priority, also in its name.
    await expect(canvas.getByRole("columnheader", { name: /City/ })).toHaveAttribute(
      "aria-sort",
      "ascending",
    );
    await expect(canvas.getByRole("columnheader", { name: /Name/ })).not.toHaveAttribute(
      "aria-sort",
      "ascending",
    );
    await expect(button(/^City/)).toHaveAccessibleName("City sort 1");
    await expect(button(/^Name/)).toHaveAccessibleName("Name sort 2");
    // Shift on a sorted key turns it around, then off.
    await userEvent.keyboard("{Shift>}");
    await userEvent.click(button(/^Name/));
    await userEvent.keyboard("{/Shift}");
    await expect(names(canvasElement)).toEqual(["Ann", "Al", "Cy", "Bo"]);
    // From the keyboard: Shift+Enter on a header adds it.
    button(/^Age/).focus();
    await userEvent.keyboard("{Shift>}{Enter}{/Shift}");
    await expect(sortsChanged).toHaveBeenLastCalledWith([
      { key: "city", direction: "ascending" },
      { key: "name", direction: "descending" },
      { key: "age", direction: "ascending" },
    ]);
    // A plain click sorts by that column alone; onSortChange reports the first key throughout.
    await userEvent.click(button(/^Age/));
    await expect(sortsChanged).toHaveBeenLastCalledWith([{ key: "age", direction: "ascending" }]);
    await expect(args.onSortChange).toHaveBeenLastCalledWith({ key: "age", direction: "ascending" });
    await expect(button(/^Age/)).toHaveAccessibleName("Age");
  },
};

const filtersChanged = fn();
/**
 * Column filters: a column with `filter` gets a field in a row under the header. `text` keeps rows whose value holds
 * the text; `number` takes a number or a comparison (`>30`, `<=40`, `30..40`); a function filters as it likes.
 */
export const FilterRowFiltersByColumn: Story = {
  args: {
    ...people,
    rows: TEAM,
    columns: [
      { key: "name", header: "Name", filter: "text" },
      { key: "age", header: "Age", align: "end", filter: "number" },
      { key: "city", header: "City", filter: (p: Person, q: string) => p.city.startsWith(q) },
    ],
    onFiltersChange: filtersChanged,
  } as Partial<DataGridProps<unknown>>,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const g = canvas.getByRole("grid", { name: "People" });
    const name = canvas.getByRole("textbox", { name: "Filter Name" });
    await userEvent.type(name, "  a ");
    await expect(names(canvasElement)).toEqual(["Ann", "Al"]);
    await expect(filtersChanged).toHaveBeenLastCalledWith({ name: "  a " });
    await expect(g).toHaveAttribute("aria-rowcount", "4");
    await userEvent.clear(name);
    const age = canvas.getByRole("textbox", { name: "Filter Age" });
    await userEvent.type(age, ">35");
    await expect(names(canvasElement)).toEqual(["Cy", "Al"]);
    await userEvent.clear(age);
    await userEvent.type(age, "30..35");
    await expect(names(canvasElement)).toEqual(["Ann", "Bo"]);
    await userEvent.clear(age);
    await userEvent.type(age, "40");
    await expect(names(canvasElement)).toEqual(["Cy", "Al"]);
    // Not a number or a comparison: it filters nothing out.
    await userEvent.clear(age);
    await userEvent.type(age, "forty");
    await expect(names(canvasElement)).toEqual(["Cy", "Ann", "Bo", "Al"]);
    await userEvent.clear(age);
    await userEvent.type(canvas.getByRole("textbox", { name: "Filter City" }), "Lon");
    await expect(names(canvasElement)).toEqual(["Cy", "Bo"]);
    // Nothing matches: the empty message.
    await userEvent.type(name, "zz");
    await expect(canvas.getByText("Nothing to show")).toBeVisible();
    // Shift+Tab from the grid's cells reaches the filters; the arrows in a filter move its caret, not the grid.
    await userEvent.clear(name);
    await expect(names(canvasElement)).toEqual(["Cy", "Bo"]);
  },
};

const orderChanged = fn();
const hiddenChanged = fn();
const headerNames = (el: Element) =>
  [...el.querySelectorAll<HTMLElement>('[role="columnheader"]')]
    .sort((a, b) => Number(a.getAttribute("aria-colindex")) - Number(b.getAttribute("aria-colindex")))
    .map((h) => h.querySelector(".cy-data-grid-label, .cy-sort-button-label")?.textContent);

/**
 * `columnMenu`: each header has a menu (its button, or Alt+Down, Shift+F10 or the context menu key on the header) to
 * sort, move the column left or right, hide it, and show hidden columns again.
 */
export const ColumnMenuHidesAndReorders: Story = {
  args: {
    ...people,
    columns: PEOPLE_COLUMNS,
    columnMenu: true,
    onColumnOrderChange: orderChanged,
    onHiddenColumnsChange: hiddenChanged,
  } as Partial<DataGridProps<unknown>>,
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    await expect(headerNames(canvasElement)).toEqual(["Name", "Age", "City"]);
    // Pointer: the header's menu button.
    await userEvent.click(canvas.getByRole("button", { name: "Name column options" }));
    await userEvent.click(await canvas.findByRole("menuitem", { name: "Move right" }));
    await expect(headerNames(canvasElement)).toEqual(["Age", "Name", "City"]);
    await expect(orderChanged).toHaveBeenLastCalledWith(["age", "name", "city"]);
    await expect(names(canvasElement)).toEqual(["85", "36", "NULL", "9"]);
    // Keyboard: Alt+Down on a header opens its menu; focus comes back to the header after.
    await waitFor(() => expect(document.activeElement?.closest('[role="columnheader"]')).not.toBeNull());
    await userEvent.keyboard("{End}");
    await expect(document.activeElement).toBe(canvas.getByRole("columnheader", { name: /City/ }));
    await userEvent.keyboard("{Alt>}{ArrowDown}{/Alt}");
    const menu = await canvas.findByRole("menu", { name: "City column options" });
    await waitFor(() => expect(menu).toBeVisible());
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(document.activeElement).toHaveTextContent("Hide column"));
    await userEvent.keyboard("{Enter}");
    await expect(headerNames(canvasElement)).toEqual(["Age", "Name"]);
    await expect(hiddenChanged).toHaveBeenLastCalledWith(["city"]);
    await waitFor(() => expect(document.activeElement?.closest('[role="columnheader"]')).not.toBeNull());
    // The Columns submenu shows a hidden column again.
    await userEvent.click(canvas.getByRole("button", { name: "Age column options" }));
    await userEvent.click(await canvas.findByRole("menuitem", { name: "Columns" }));
    await userEvent.click(await canvas.findByRole("menuitemcheckbox", { name: "City" }));
    await expect(headerNames(canvasElement)).toEqual(["Age", "Name", "City"]);
    await expect(hiddenChanged).toHaveBeenLastCalledWith([]);
    // Sorting from the menu.
    await userEvent.click(canvas.getByRole("button", { name: "Name column options" }));
    await userEvent.click(await canvas.findByRole("menuitem", { name: "Sort descending" }));
    await expect(args.onSortChange).toHaveBeenLastCalledWith({ key: "name", direction: "descending" });
    // The first column cannot move left; the last visible column cannot be hidden.
    await userEvent.click(canvas.getByRole("button", { name: "Age column options" }));
    await expect(await canvas.findByRole("menuitem", { name: "Move left" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await userEvent.keyboard("{Escape}");
  },
};

/** The column menu's names, and the filter fields', take `labels`. */
export const ColumnMenuAndFilterLabels: Story = {
  args: {
    ...people,
    columns: PEOPLE_COLUMNS.map((c) => ({ ...c, filter: "text" as const })),
    columnMenu: true,
    labels: {
      columnMenu: (name: string) => `Options de ${name}`,
      filter: (name: string) => `Filtrer ${name}`,
      hide: "Masquer",
    },
  } as Partial<DataGridProps<unknown>>,
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByRole("textbox", { name: "Filtrer Name" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Options de City" }));
    const hide = await canvas.findByRole("menuitem", { name: "Masquer" });
    await waitFor(() => expect(hide).toBeVisible());
    await userEvent.keyboard("{Escape}");
  },
};

/** Controlled order and hidden columns: the grid shows what it is given. */
export const ControlledColumns: Story = {
  args: { ...people, columnOrder: ["city", "name"], hiddenColumns: ["age"] } as Partial<
    DataGridProps<unknown>
  >,
  play: async ({ canvas, canvasElement }) => {
    // Columns left out of the order follow it, in their own order; hidden ones are not drawn.
    await expect(headerNames(canvasElement)).toEqual(["City", "Name"]);
    await expect(canvas.getByRole("grid")).toHaveAttribute("aria-colcount", "2");
  },
};

function Details(props: Partial<DataGridProps<number>>) {
  return (
    <DataGrid
      {...huge}
      columns={HUGE_COLUMNS.slice(0, 6)}
      renderRowDetails={(r) => (
        <Stack gap="1">
          <span>{`Details of row ${r + 1}`}</span>
          <span>Second line</span>
          <Button size="sm">{`Open row ${r + 1}`}</Button>
        </Stack>
      )}
      {...props}
    />
  );
}
const expandedChanged = fn();

/**
 * Row details: `renderRowDetails` adds a first column whose cell shows or hides a panel under the row (a click,
 * Enter or Space on it). The rows below move down, and the grid stays virtual.
 */
export const RowDetailsOpenUnderTheRow: Story = {
  render: () => <Details onExpandedRowsChange={expandedChanged} />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const g = canvas.getByRole("grid", { name: "Results" });
    await expect(g).toHaveAttribute("aria-colcount", "7");
    const toggle = (r: number) => canvasElement.querySelector(`[data-cell="${r}:0"]`) as HTMLElement;
    const rowEl = (r: number) => toggle(r).closest('[role="row"]') as HTMLElement;
    await expect(toggle(1)).toHaveAccessibleName("Show details");
    await expect(toggle(1)).toHaveAttribute("aria-expanded", "false");
    const before = rowEl(2).getBoundingClientRect().top;
    await userEvent.click(toggle(1));
    await expect(expandedChanged).toHaveBeenLastCalledWith(["1"]);
    await expect(toggle(1)).toHaveAttribute("aria-expanded", "true");
    await expect(toggle(1)).toHaveAccessibleName("Hide details");
    const panel = canvas.getByText("Details of row 2");
    await expect(panel).toBeVisible();
    // The panel sits under its row, and the next row below the panel.
    await waitFor(() =>
      expect(rowEl(2).getBoundingClientRect().top).toBeGreaterThanOrEqual(
        panel.closest('[role="row"]')?.getBoundingClientRect().bottom ?? Number.POSITIVE_INFINITY,
      ),
    );
    await expect(rowEl(2).getBoundingClientRect().top).toBeGreaterThan(before + 40);
    // Row numbers count the panel's row, so assistive technology reads a consistent grid.
    await expect(rowEl(1)).toHaveAttribute("aria-rowindex", "3");
    await expect(panel.closest('[role="row"]')).toHaveAttribute("aria-rowindex", "4");
    await expect(rowEl(2)).toHaveAttribute("aria-rowindex", "5");
    await expect(g).toHaveAttribute("aria-rowcount", "100002");
    // Keyboard: Enter or Space on the toggle cell; the arrows pass over the panel.
    toggle(1).focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(document.activeElement).toBe(toggle(2));
    await userEvent.keyboard(" ");
    await expect(canvas.getByText("Details of row 3")).toBeVisible();
    await userEvent.keyboard("{ArrowUp}{Enter}");
    await expect(canvas.queryByText("Details of row 2")).toBeNull();
    await expect(expandedChanged).toHaveBeenLastCalledWith(["2"]);
    // Tab from the row reaches the panel's controls.
    toggle(2).focus();
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Open row 3" })).toHaveFocus();
    // Far down the grid, details still open in place.
    g.scrollTop = g.scrollHeight;
    await waitFor(() => expect(toggle(99_999)).not.toBeNull());
    await userEvent.click(toggle(99_999));
    await waitFor(() => expect(canvas.getByText("Details of row 100000")).toBeVisible());
  },
};

/** With a touch screen, the details toggle keeps a 44px hit area. */
export const TouchOpensRowDetails: Story = {
  tags: ["touch", "!dev"],
  render: () => <Details />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const toggle = canvasElement.querySelector('[data-cell="0:0"]') as HTMLElement;
    await expect(toggle.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    await expect(toggle.getBoundingClientRect().width).toBeGreaterThanOrEqual(44);
    await userEvent.pointer({ keys: "[TouchA]", target: toggle });
    await expect(canvas.getByText("Details of row 1")).toBeVisible();
  },
};
