import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, waitFor } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
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
