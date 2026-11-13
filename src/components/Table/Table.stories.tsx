import type { Meta, StoryObj } from "@storybook/react-vite";
import { type CSSProperties, useState } from "react";
import { expect, fn, waitFor, within } from "storybook/test";
import { contrast } from "../../test/color.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { CynosureTheme } from "../../theme/CynosureTheme.js";
import { Badge } from "../Badge/Badge.js";
import { Button } from "../Button/Button.js";
import { Stack } from "../Stack/Stack.js";
import { Table, type TableColumn } from "./Table.js";

interface Member {
  id: string;
  name: string;
  role: string;
  seats: number | null;
}

const ROWS: Member[] = [
  { id: "1", name: "Grace", role: "Owner", seats: 10 },
  { id: "2", name: "ada", role: "Admin", seats: 2 },
  { id: "3", name: "Linus", role: "Member", seats: null },
  { id: "4", name: "Barbara", role: "Member", seats: 100 },
];

const COLUMNS: TableColumn<Member>[] = [
  { key: "name", header: "Name", sortable: true },
  {
    key: "role",
    header: "Role",
    cell: (m) => <Badge tone={m.role === "Owner" ? "accent" : "neutral"}>{m.role}</Badge>,
  },
  { key: "seats", header: "Seats", sortable: true, align: "end", cell: (m) => m.seats ?? "–" },
];

const meta = {
  title: "Components/Table",
  component: Table<Member>,
  args: {
    caption: "Team members",
    columns: COLUMNS,
    rows: ROWS,
    getRowId: (m: Member) => m.id,
    onSortChange: fn(),
    onSelectionChange: fn(),
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    selectable: { control: "boolean" },
    stickyHeader: { control: "boolean" },
  },
  decorators: [(Story) => <div style={{ maxWidth: 560 }}>{Story()}</div>],
} satisfies Meta<typeof Table<Member>>;
export default meta;
type Story = StoryObj<typeof meta>;

const names = (canvasElement: HTMLElement) =>
  [...canvasElement.querySelectorAll("tbody tr")].map((tr) => tr.querySelector("th")?.textContent);

export const ASemanticTable: Story = {
  tags: ["visual"],
  play: async ({ canvas }) => {
    const table = canvas.getByRole("table", { name: "Team members" });
    await expect(
      within(table)
        .getAllByRole("columnheader")
        .map((h) => h.textContent),
    ).toEqual(["Name", "Role", "Seats"]);
    // The first column names each row, so screen readers announce it with every cell.
    await expect(
      within(table)
        .getAllByRole("rowheader")
        .map((h) => h.textContent),
    ).toEqual(["Grace", "ada", "Linus", "Barbara"]);
    await expect(within(table).getAllByRole("cell")).toHaveLength(8);
    // Only sortable columns are buttons, and they say they are unsorted.
    await expect(
      within(table)
        .getAllByRole("button")
        .map((b) => b.textContent),
    ).toEqual(["Name", "Seats"]);
    await expect(within(table).getAllByRole("columnheader")[0]).toHaveAttribute("aria-sort", "none");
    await expect(within(table).getAllByRole("columnheader")[1]).not.toHaveAttribute("aria-sort");
  },
};

export const SortingCyclesAndCompares: Story = {
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const nameHeader = canvas.getAllByRole("columnheader")[0] as HTMLElement;
    await userEvent.click(canvas.getByRole("button", { name: "Name" }));
    // Text sorts in the locale's order, ignoring case.
    await expect(nameHeader).toHaveAttribute("aria-sort", "ascending");
    await expect(names(canvasElement)).toEqual(["ada", "Barbara", "Grace", "Linus"]);
    await expect(args.onSortChange).toHaveBeenLastCalledWith({ key: "name", direction: "ascending" });
    await userEvent.click(canvas.getByRole("button", { name: "Name" }));
    await expect(nameHeader).toHaveAttribute("aria-sort", "descending");
    await expect(names(canvasElement)).toEqual(["Linus", "Grace", "Barbara", "ada"]);
    // A third press goes back to the original order.
    await userEvent.click(canvas.getByRole("button", { name: "Name" }));
    await expect(nameHeader).toHaveAttribute("aria-sort", "none");
    await expect(names(canvasElement)).toEqual(["Grace", "ada", "Linus", "Barbara"]);
    await expect(args.onSortChange).toHaveBeenLastCalledWith(null);
    // Numbers sort as numbers; empty values go last whichever way.
    const seats = canvas.getByRole("button", { name: "Seats" });
    seats.focus();
    await userEvent.keyboard("{Enter}");
    await expect(names(canvasElement)).toEqual(["ada", "Grace", "Barbara", "Linus"]);
    await userEvent.keyboard(" ");
    await expect(names(canvasElement)).toEqual(["Barbara", "Grace", "ada", "Linus"]);
  },
};

export const ManualSort: Story = {
  args: { manualSort: true, defaultSort: { key: "seats", direction: "descending" } },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    // The rows are left in the order given (a server sorts them); the header still shows the sort.
    await expect(names(canvasElement)).toEqual(["Grace", "ada", "Linus", "Barbara"]);
    await expect(canvas.getAllByRole("columnheader")[2]).toHaveAttribute("aria-sort", "descending");
    await userEvent.click(canvas.getByRole("button", { name: "Name" }));
    await expect(args.onSortChange).toHaveBeenLastCalledWith({ key: "name", direction: "ascending" });
    await expect(names(canvasElement)).toEqual(["Grace", "ada", "Linus", "Barbara"]);
  },
};

export const SelectingRows: Story = {
  args: { selectable: true },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const all = canvas.getByRole("checkbox", { name: "Select all rows" });
    await userEvent.click(canvas.getByRole("checkbox", { name: "Select ada" }));
    await expect(args.onSelectionChange).toHaveBeenLastCalledWith(["2"]);
    // Some selected: the select-all is mixed.
    await expect(all).toBePartiallyChecked();
    await expect(canvasElement.querySelector("tr[data-selected] th")).toHaveTextContent("ada");
    await userEvent.click(all);
    await expect(args.onSelectionChange).toHaveBeenLastCalledWith(["1", "2", "3", "4"]);
    await expect(all).toBeChecked();
    await userEvent.click(all);
    await expect(args.onSelectionChange).toHaveBeenLastCalledWith([]);
    // Keyboard: Space toggles the focused checkbox.
    canvas.getByRole("checkbox", { name: "Select Linus" }).focus();
    await userEvent.keyboard(" ");
    await expect(args.onSelectionChange).toHaveBeenLastCalledWith(["3"]);
  },
};

export const ControlledSelectionSurvivesSorting: Story = {
  args: { selectable: true },
  render: (args) => {
    function Picker() {
      const [selected, setSelected] = useState(["4"]);
      return (
        <Stack gap="4">
          <Table {...args} selected={selected} onSelectionChange={setSelected} />
          <output data-testid="out">{selected.join(",")}</output>
        </Stack>
      );
    }
    return <Picker />;
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Name" }));
    await expect(canvas.getByRole("checkbox", { name: "Select Barbara" })).toBeChecked();
    await userEvent.click(canvas.getByRole("checkbox", { name: "Select Grace" }));
    // Selection is reported in the rows' own order, whatever the sort.
    await expect(canvas.getByTestId("out")).toHaveTextContent("1,4");
  },
};

export const SelectionSurvivesPaging: Story = {
  args: { selectable: true },
  render: (args) => {
    function Paged() {
      const [page, setPage] = useState(0);
      return (
        <Stack gap="4">
          <Table {...args} rows={ROWS.slice(page * 2, page * 2 + 2)} />
          <Button onClick={() => setPage(1 - page)}>{page ? "Previous page" : "Next page"}</Button>
        </Stack>
      );
    }
    return <Paged />;
  },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("checkbox", { name: "Select Grace" }));
    await userEvent.click(canvas.getByRole("button", { name: "Next page" }));
    // Rows on another page (or filtered out) stay selected while you choose more here.
    await userEvent.click(canvas.getByRole("checkbox", { name: "Select Linus" }));
    await expect(args.onSelectionChange).toHaveBeenLastCalledWith(["1", "3"]);
    // Select-all and its undo act on the rows shown.
    const all = canvas.getByRole("checkbox", { name: "Select all rows" });
    await userEvent.click(all);
    await expect(args.onSelectionChange).toHaveBeenLastCalledWith(["1", "3", "4"]);
    await userEvent.click(all);
    await expect(args.onSelectionChange).toHaveBeenLastCalledWith(["1"]);
    await userEvent.click(canvas.getByRole("button", { name: "Previous page" }));
    await expect(canvas.getByRole("checkbox", { name: "Select Grace" })).toBeChecked();
    await expect(canvas.getByRole("checkbox", { name: "Select all rows" })).toBePartiallyChecked();
  },
};

export const StickyHeaderScrolls: Story = {
  args: {
    stickyHeader: true,
    rows: Array.from({ length: 40 }, (_, i) => ({
      id: String(i),
      name: `Person ${i + 1}`,
      role: "Member",
      seats: i,
    })),
    style: { "--cy-table-max-height": "200px" } as CSSProperties,
  },
  play: async ({ canvas, canvasElement }) => {
    // A scrolling table is a focusable region named by its caption.
    const region = canvas.getByRole("region", { name: "Team members" });
    await expect(region).toHaveAttribute("tabindex", "0");
    region.scrollTop = 300;
    const header = canvasElement.querySelector("thead th") as HTMLElement;
    await waitFor(() =>
      expect(Math.abs(header.getBoundingClientRect().top - region.getBoundingClientRect().top)).toBeLessThan(
        2,
      ),
    );
  },
};

export const EmptyAndHiddenCaption: Story = {
  args: { rows: [], captionHidden: true, selectable: true, labels: { empty: "No members yet" } },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("table", { name: "Team members" })).toBeVisible();
    const caption = canvas.getByText("Team members");
    await expect(caption.getBoundingClientRect().width).toBeLessThanOrEqual(1);
    const cell = canvas.getByRole("cell", { name: "No members yet" });
    await expect(cell).toHaveAttribute("colspan", "4");
    await expect(canvas.getByRole("checkbox", { name: "Select all rows" })).toBeDisabled();
  },
};

export const NumbersLineUpAtTheEnd: Story = {
  render: (args) => (
    <div dir="rtl">
      <Table {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    // End-aligned cells hug the inline end: the left edge in right-to-left text.
    const cell = canvasElement.querySelector('td[data-align="end"]') as HTMLElement;
    await expect(getComputedStyle(cell).textAlign).toBe("end");
    await expect(canvasElement.querySelector("thead th")?.getBoundingClientRect().left).toBeGreaterThan(
      cell.getBoundingClientRect().left,
    );
  },
};

export const ControlledSortAndCustomColumns: Story = {
  render: (args) => {
    function Sorted() {
      const [sort, setSort] = useState<{ key: string; direction: "ascending" | "descending" } | null>({
        key: "missing",
        direction: "ascending",
      });
      return (
        <Stack gap="4">
          <Table
            {...args}
            className="host-table"
            selectable
            sort={sort}
            onSortChange={setSort}
            rows={[...ROWS, { id: "5", name: "Edsger", role: "Member", seats: null }]}
            columns={[
              { key: "role", header: "Role", width: "8rem" },
              {
                key: "name",
                header: "Person",
                rowHeader: true,
                sortable: true,
                // Sort by name length instead of the name.
                sortValue: (m) => m.name.length,
                cell: (m) => <strong>{m.name}</strong>,
              },
              { key: "seats", header: "Seats", sortable: true, align: "end" },
            ]}
          />
          <output data-testid="sort">{sort ? `${sort.key} ${sort.direction}` : "none"}</output>
        </Stack>
      );
    }
    return <Sorted />;
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const table = canvasElement.querySelector(".host-table") as HTMLElement;
    await expect(table).not.toBeNull();
    // A sort on a key no column has leaves the order alone.
    await expect(names(canvasElement)).toEqual(["Grace", "ada", "Linus", "Barbara", "Edsger"]);
    // The marked column is the row header even though it is not first, and sets its width elsewhere.
    await expect((canvasElement.querySelector("thead th:nth-child(2)") as HTMLElement).style.inlineSize).toBe(
      "8rem",
    );
    // A row header that is an element gives a generic checkbox name.
    await expect(canvas.getAllByRole("checkbox", { name: "Select row" })).toHaveLength(5);
    await userEvent.click(canvas.getByRole("button", { name: "Person" }));
    await expect(canvas.getByTestId("sort")).toHaveTextContent("name ascending");
    await expect(names(canvasElement)).toEqual(["ada", "Grace", "Linus", "Edsger", "Barbara"]);
    // Two empty seat counts stay together at the end.
    await userEvent.click(canvas.getByRole("button", { name: "Seats" }));
    await expect(names(canvasElement).slice(-2)).toEqual(["Linus", "Edsger"]);
    // Selecting and unselecting a row.
    const first = canvas.getAllByRole("checkbox", { name: "Select row" })[0] as HTMLElement;
    await userEvent.click(first);
    await expect(first).toBeChecked();
    await userEvent.click(first);
    await expect(first).not.toBeChecked();
  },
};

export const EmptyWithoutSelection: Story = {
  args: { rows: [] },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("cell", { name: "Nothing to show" })).toHaveAttribute("colspan", "3");
  },
};

export const TouchSort: Story = {
  tags: ["touch", "!dev"],
  play: async ({ canvas, canvasElement, userEvent }) => {
    const button = canvas.getByRole("button", { name: "Name" });
    await expect(button.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    await userEvent.pointer({ keys: "[TouchA]", target: button });
    await expect(names(canvasElement)).toEqual(["ada", "Barbara", "Grace", "Linus"]);
  },
};

export const ReadableInLightAndDark: Story = {
  args: { selectable: true, defaultSelected: ["1"] },
  render: (args) => (
    <Stack gap="4">
      {(["light", "dark"] as const).map((mode) => (
        <CynosureTheme key={mode} mode={mode}>
          <div className="surface">
            <Table {...args} caption={`${mode} members`} />
          </div>
        </CynosureTheme>
      ))}
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    for (const surface of canvasElement.querySelectorAll(".surface")) {
      const check = (el: Element, bg: Element) =>
        contrast(getComputedStyle(el).color, getComputedStyle(bg).backgroundColor);
      const th = surface.querySelector("thead th:nth-child(2)") as Element;
      await expect(check(th, th)).toBeGreaterThanOrEqual(4.5);
      const selected = surface.querySelector("tr[data-selected] th") as Element;
      await expect(check(selected, selected)).toBeGreaterThanOrEqual(4.5);
      const plain = surface.querySelector("tr:not([data-selected]) td:last-child") as Element;
      await expect(check(plain, surface.querySelector(".cy-table") as Element)).toBeGreaterThanOrEqual(4.5);
    }
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    const props = [
      "display",
      "font-size",
      "font-weight",
      "color",
      "padding-left",
      "text-align",
      "border-bottom-width",
      "box-sizing",
    ];
    for (const selector of [".cy-table", "thead th", "tbody th", "tbody td", ".cy-sort-button"]) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, props);
      await expect({ selector, ...hostile }).toEqual({ selector, ...clean });
    }
  },
};
