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
  title: "Components/DataGrid",
  component: DataGrid,
  args: {
    ...huge,
    onSortChange: fn(),
    onColumnResize: fn(),
    onRowClick: fn(),
    onRowActivate: fn(),
    onSelectedRowsChange: fn(),
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
    cellTone: (p) => (p.age === null ? "null" : "number"),
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
  [...el.querySelectorAll('[role="row"]')]
    .slice(1)
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
    await expect(args.onSelectedRowsChange).toHaveBeenLastCalledWith(["p1"]);
    await expect(args.onRowClick).toHaveBeenLastCalledWith(PEOPLE[0], 0);
    // Ctrl (or Cmd) toggles one more; Shift extends from the last row chosen, and selects no text.
    await userEvent.keyboard("{Control>}");
    await userEvent.click(cell(canvasElement, "Linus"));
    await userEvent.keyboard("{/Control}");
    await expect(selectedRowNames(canvasElement)).toEqual(["Grace", "Linus"]);
    await userEvent.keyboard("{Shift>}");
    await userEvent.click(cell(canvasElement, "Boston"));
    await userEvent.keyboard("{/Shift}");
    await expect(args.onSelectedRowsChange).toHaveBeenLastCalledWith(["p3", "p4"]);
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
  args: { ...people, selectionMode: "row", selectedRows: ["p2"] },
  play: async ({ args, canvasElement, userEvent }) => {
    await expect(selectedRowNames(canvasElement)).toEqual(["ada"]);
    await userEvent.click(cell(canvasElement, "Grace"));
    await expect(args.onSelectedRowsChange).toHaveBeenLastCalledWith(["p1"]);
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
    await expect(args.onRowActivate).toHaveBeenLastCalledWith(PEOPLE[1], 1);
    await userEvent.dblClick(cell(canvasElement, "Boston"));
    await expect(args.onRowActivate).toHaveBeenLastCalledWith(PEOPLE[3], 3);
    // Enter on the header does not.
    await userEvent.keyboard("{ArrowUp}{ArrowUp}{ArrowUp}{ArrowUp}{End}{Enter}");
    await expect(args.onRowActivate).toHaveBeenCalledTimes(2);
    // Nor does a double-click on the header, or an Enter that ends an input method's composition.
    await userEvent.dblClick(header(canvasElement, "City"));
    await userEvent.keyboard("{ArrowDown}");
    document.activeElement?.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true, isComposing: true }),
    );
    await expect(args.onRowActivate).toHaveBeenCalledTimes(2);
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
        cell: (r: Item) => (r.title.length > 20 ? `${r.title.slice(0, 20)}…` : r.title),
        tooltip: (r: Item) => (r.title.length > 20 ? r.title : null),
      },
    ],
    getRowId: (r: Item) => r.id,
  } as Partial<DataGridProps<unknown>>,
  play: async ({ canvas, canvasElement, userEvent }) => {
    // Keyboard focus on a cut-short cell shows the full value, which also describes the cell.
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    const cut = document.activeElement as HTMLElement;
    await expect(cut).toHaveAttribute("role", "gridcell");
    const tip = await canvas.findByRole("tooltip");
    await waitFor(() => expect(tip).toBeVisible());
    await expect(tip).toHaveTextContent(LONG);
    await expect(cut).toHaveAttribute("aria-describedby", tip.id);
    // The anchor takes no box: the cell is still placed in its row.
    await expect(
      cut.getBoundingClientRect().left - grid(canvasElement).getBoundingClientRect().left,
    ).toBeGreaterThan(60);
    // A short value has no tooltip.
    await userEvent.keyboard("{ArrowDown}");
    await expect(focused()).toBe("Short");
    await expect(document.activeElement).not.toHaveAttribute("aria-describedby");
    await waitFor(() => expect(canvas.queryByRole("tooltip")).toBeNull());
  },
};

export const DenseRowsAndCellTones: Story = {
  args: {
    ...people,
    size: "sm",
    columns: [
      ...PEOPLE_COLUMNS.slice(0, 2),
      { key: "city", header: "City", cellTone: (p: Person) => (p.city === "London" ? "success" : undefined) },
    ],
  } as Partial<DataGridProps<unknown>>,
  render: (args) => (
    <div style={{ "--cy-data-grid-number-color": "rgb(1, 2, 3)" } as CSSProperties}>
      <DataGrid {...(args as DataGridProps<unknown>)} />
      <span data-testid="muted" style={{ color: "var(--cy-color-muted)" }} />
      <span data-testid="success" style={{ color: "var(--cy-color-success-text)" }} />
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
  args: { ...people, selectionMode: "row", defaultSelectedRows: ["p2"], style: { blockSize: 220 } },
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
