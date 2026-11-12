import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { Button } from "../Button/Button.js";
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

export const StableUnderHostileHost: Story = {
  args: { rows: HUGE_ROWS.slice(0, 20), columns: HUGE_COLUMNS.slice(0, 4) } as Partial<
    DataGridProps<unknown>
  >,
  play: async ({ canvasElement }) => {
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
