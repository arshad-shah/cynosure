import type { Meta, StoryObj } from "@storybook/react-vite";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { expect, fn, waitFor, within } from "storybook/test";
import { contrast } from "../../test/color.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { CynosureTheme } from "../../theme/CynosureTheme.js";
import { Badge } from "../Badge/Badge.js";
import { Button } from "../Button/Button.js";
import { Stack } from "../Stack/Stack.js";
import {
  Table,
  TableBody,
  TableCell,
  type TableColumn,
  TableFoot,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "./Table.js";

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
  title: "Components/Feedback and display/Table",
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

/** The same members written as markup: the compound form. */
function StaticMembers({ selected = "", sticky = false }: { selected?: string; sticky?: boolean }) {
  const [sort, setSort] = useState<"ascending" | "descending" | "none">("none");
  const rows =
    sort === "none"
      ? ROWS
      : [...ROWS].sort((a, b) => (sort === "ascending" ? 1 : -1) * a.name.localeCompare(b.name));
  return (
    <Table caption="Members, by hand" stickyHeader={sticky} data-testid="static">
      <TableHead>
        <TableRow>
          <TableHeaderCell
            sort={sort}
            onSort={() =>
              setSort(sort === "ascending" ? "descending" : sort === "descending" ? "none" : "ascending")
            }
          >
            Name
          </TableHeaderCell>
          <TableHeaderCell>Role</TableHeaderCell>
          <TableHeaderCell align="end" width="6rem">
            Seats
          </TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((m) => (
          <TableRow key={m.id} selected={m.id === selected} data-id={m.id}>
            <TableHeaderCell>{m.name}</TableHeaderCell>
            <TableCell>
              <Badge>{m.role}</Badge>
            </TableCell>
            <TableCell align="end">{m.seats ?? "–"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFoot>
        <TableRow>
          <TableHeaderCell colSpan={2}>Total</TableHeaderCell>
          <TableCell align="end">112</TableCell>
        </TableRow>
      </TableFoot>
    </Table>
  );
}

export const CompoundFormIsTheSameTable: Story = {
  render: (args) => (
    <Stack gap="6">
      <Table {...args} />
      <StaticMembers selected="2" />
    </Stack>
  ),
  play: async ({ canvas }) => {
    const table = canvas.getByRole("table", { name: "Members, by hand" });
    // Headers in the head are column headers; in the body and foot, row headers.
    await expect(
      within(table)
        .getAllByRole("columnheader")
        .map((h) => h.textContent),
    ).toEqual(["Name", "Role", "Seats"]);
    await expect(
      within(table)
        .getAllByRole("rowheader")
        .map((h) => h.textContent),
    ).toEqual(["Grace", "ada", "Linus", "Barbara", "Total"]);
    await expect(within(table).getByRole("rowheader", { name: "Total" })).toHaveAttribute("colspan", "2");
    // It looks like the data-driven table: the same paddings, header background, row lines and alignment.
    const data = canvas.getByRole("table", { name: "Team members" });
    const look = (el: Element) => {
      const s = getComputedStyle(el);
      return [
        s.paddingTop,
        s.paddingInlineStart,
        s.backgroundColor,
        s.borderBottomWidth,
        s.fontSize,
        s.fontWeight,
        s.color,
      ];
    };
    const head = (t: HTMLElement) => within(t).getAllByRole("columnheader")[1] as HTMLElement;
    await expect(look(head(table))).toEqual(look(head(data)));
    const rowHeader = (t: HTMLElement) => within(t).getAllByRole("rowheader")[0] as HTMLElement;
    await expect(look(rowHeader(table))).toEqual(look(rowHeader(data)));
    const cell = (t: HTMLElement) => within(t).getAllByRole("cell")[0] as HTMLElement;
    await expect(look(cell(table))).toEqual(look(cell(data)));
    await expect(getComputedStyle(within(table).getAllByRole("cell")[1] as HTMLElement).textAlign).toBe(
      "end",
    );
    await expect(getComputedStyle(table.closest(".cy-table") as Element).borderTopWidth).toBe(
      getComputedStyle(data.closest(".cy-table") as Element).borderTopWidth,
    );
    // A selected row takes the selected background; its id and data-* attributes reach the row.
    const ada = table.querySelector('[data-id="2"]') as HTMLElement;
    await expect(ada).toHaveAttribute("data-selected");
    await expect(getComputedStyle(ada.children[1] as Element).backgroundColor).not.toBe(
      getComputedStyle(table.querySelector('[data-id="1"]')?.children[1] as Element).backgroundColor,
    );
    // The last body row has no line under it; the foot has a line above it.
    const lastBody = table.querySelector("tbody tr:last-child td") as HTMLElement;
    await expect(getComputedStyle(lastBody).borderBottomWidth).toBe("0px");
    const foot = table.querySelector("tfoot td") as HTMLElement;
    await expect(Number.parseFloat(getComputedStyle(foot).borderTopWidth)).toBeGreaterThan(0);
    // `width` sizes the column.
    await expect((within(table).getAllByRole("columnheader")[2] as HTMLElement).style.inlineSize).toBe(
      "6rem",
    );
  },
};

export const CompoundFormSortsWithSortButtons: Story = {
  render: () => <StaticMembers />,
  play: async ({ canvas, userEvent }) => {
    const table = canvas.getByRole("table", { name: "Members, by hand" });
    const name = within(table).getByRole("columnheader", { name: /Name/ });
    await expect(name).toHaveAttribute("aria-sort", "none");
    // Only the header given `onSort` is a button; the others say nothing about sorting.
    await expect(within(table).getAllByRole("button")).toHaveLength(1);
    await expect(within(table).getByRole("columnheader", { name: "Role" })).not.toHaveAttribute("aria-sort");
    await userEvent.click(within(name).getByRole("button"));
    await expect(name).toHaveAttribute("aria-sort", "ascending");
    await expect(within(table).getAllByRole("rowheader")[0]).toHaveTextContent("ada");
    // Keyboard: the sort button is reachable and Enter presses it.
    within(name).getByRole("button").focus();
    await userEvent.keyboard("{Enter}");
    await expect(name).toHaveAttribute("aria-sort", "descending");
    await expect(within(table).getAllByRole("rowheader")[0]).toHaveTextContent("Linus");
  },
};

export const CompoundFormStickyHeaderAndSize: Story = {
  render: () => (
    <Stack gap="6">
      <div style={{ "--cy-table-max-height": "8rem" } as CSSProperties}>
        <StaticMembers sticky />
      </div>
      <Table caption="Small" size="sm">
        <TableBody>
          <TableRow>
            <TableCell>One</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Stack>
  ),
  play: async ({ canvas, userEvent }) => {
    // The sticky form scrolls inside a focusable region named by the caption, and the header stays at the top.
    const region = canvas.getByRole("region", { name: "Members, by hand" });
    await userEvent.tab();
    await expect(region).toHaveFocus();
    region.scrollTop = 40;
    const header = within(region).getAllByRole("columnheader")[1] as HTMLElement;
    await waitFor(() =>
      expect(Math.abs(header.getBoundingClientRect().top - region.getBoundingClientRect().top)).toBeLessThan(
        2,
      ),
    );
    // `size` sets the density of the written cells too.
    const small = within(canvas.getByRole("table", { name: "Small" })).getByRole("cell");
    await expect(Number.parseFloat(getComputedStyle(small).fontSize)).toBeLessThan(
      Number.parseFloat(getComputedStyle(within(region).getAllByRole("cell")[0] as Element).fontSize),
    );
  },
};

export const CompoundFormHeadersAndCorners: Story = {
  render: () => (
    <Table caption="Seats by quarter" className="layout-mine">
      <TableHead>
        <TableRow selected>
          <TableCell />
          <TableHeaderCell scope="colgroup" colSpan={2} className="mine">
            2026
          </TableHeaderCell>
        </TableRow>
        <TableRow>
          <TableCell />
          <TableHeaderCell sort="descending">Q1</TableHeaderCell>
          <TableHeaderCell>Q2</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableHeaderCell scope="row">Seats</TableHeaderCell>
          <TableCell align="end" rowSpan={1}>
            10
          </TableCell>
          <TableCell align="end">12</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
  play: async ({ canvas }) => {
    const table = canvas.getByRole("table", { name: "Seats by quarter" });
    await expect(table.closest(".cy-table")).toHaveClass("layout-mine");
    const year = within(table).getByRole("columnheader", { name: "2026" });
    await expect(year).toHaveAttribute("scope", "colgroup");
    await expect(year).toHaveClass("mine");
    // `selected` marks body rows only.
    await expect(year.closest("tr")).not.toHaveAttribute("data-selected");
    // A sort shown without `onSort` is announced but is no button (the app sorts elsewhere).
    const q1 = within(table).getByRole("columnheader", { name: "Q1" });
    await expect(q1).toHaveAttribute("aria-sort", "descending");
    await expect(within(table).queryByRole("button")).toBeNull();
    // An empty corner cell in the head looks like a header cell.
    const corner = table.querySelector("thead td") as HTMLElement;
    await expect(getComputedStyle(corner).backgroundColor).toBe(getComputedStyle(q1).backgroundColor);
  },
};

export const SelectionCheckboxesTakeOnlyTheirBox: Story = {
  args: { selectable: true },
  play: async ({ canvas }) => {
    for (const name of ["Select all rows", "Select ada"]) {
      const input = canvas.getByRole("checkbox", { name });
      const row = input.closest(".cy-choice") as HTMLElement;
      const box = input.closest(".cy-checkbox") as HTMLElement;
      // The name is a hidden label: no gap or text space beside the box, so the column stays narrow.
      await expect(row.getBoundingClientRect().width - box.getBoundingClientRect().width).toBeLessThan(1);
    }
  },
};

export const RefIsTheRootInBothForms: Story = {
  render: (args) => {
    function Both() {
      const data = useRef<HTMLDivElement>(null);
      const markup = useRef<HTMLDivElement>(null);
      const [seen, setSeen] = useState("");
      useEffect(() => setSeen(`${data.current?.className}|${markup.current?.className}`), []);
      return (
        <Stack gap="4">
          <Table {...args} ref={data} />
          <Table caption="By hand" ref={markup}>
            <TableBody>
              <TableRow>
                <TableCell>One</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <output data-testid="refs">{seen}</output>
        </Stack>
      );
    }
    return <Both />;
  },
  play: async ({ canvas }) => {
    // Each ref is the table's root element: its wrapper, which carries the border and scrolls.
    await expect(canvas.getByTestId("refs")).toHaveTextContent("cy-table|cy-table");
  },
};

const bg = (el: Element | null) => getComputedStyle(el as Element).backgroundColor;

/** `tone` on a column tints all its cells (and its header); a function of the row tints cell by cell (a heat grid). */
export const TintedColumnsAndCells: Story = {
  tags: ["visual"],
  args: {
    columns: [
      { key: "name", header: "Name" },
      { key: "role", header: "Role", tone: "accent" },
      {
        key: "seats",
        header: "Seats",
        align: "end",
        tone: (m: Member) => ((m.seats ?? 0) >= 10 ? "success" : undefined),
      },
    ] satisfies TableColumn<Member>[],
  },
  play: async ({ canvas, canvasElement }) => {
    const plain = bg(canvas.getByRole("cell", { name: "Owner" }).parentElement?.querySelector("th") ?? null);
    const owner = canvas.getByRole("cell", { name: "Owner" });
    await expect(owner).toHaveAttribute("data-tone", "accent");
    await expect(bg(owner)).not.toBe(plain);
    await expect(canvas.getByRole("columnheader", { name: "Role" })).toHaveAttribute("data-tone", "accent");
    // Per row: 10 and 100 seats are tinted, 2 and none are not, and the header is left alone.
    const seats = [...canvasElement.querySelectorAll("tbody tr")].map(
      (tr) => tr.lastElementChild?.getAttribute("data-tone") ?? null,
    );
    await expect(seats).toEqual(["success", null, null, "success"]);
    await expect(canvas.getByRole("columnheader", { name: "Seats" })).not.toHaveAttribute("data-tone");
    // The text keeps its contrast on the tint.
    await expect(contrast(getComputedStyle(owner).color, bg(owner))).toBeGreaterThanOrEqual(4.5);
  },
};

/** The compound form: `tone` on TableCell and TableHeaderCell. */
export const CompoundCellsTakeATone: Story = {
  render: () => (
    <Table caption="Working hours">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Zone</TableHeaderCell>
          <TableHeaderCell tone="success">09:00</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableHeaderCell>London</TableHeaderCell>
          <TableCell tone="success">Working</TableCell>
        </TableRow>
        <TableRow>
          <TableHeaderCell>Tokyo</TableHeaderCell>
          <TableCell tone="danger">Asleep</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
  play: async ({ canvas }) => {
    const working = canvas.getByRole("cell", { name: "Working" });
    const asleep = canvas.getByRole("cell", { name: "Asleep" });
    await expect(working).toHaveAttribute("data-tone", "success");
    await expect(bg(working)).not.toBe(bg(asleep));
    await expect(bg(working)).not.toBe(bg(canvas.getByRole("rowheader", { name: "London" })));
    await expect(canvas.getByRole("columnheader", { name: "09:00" })).toHaveAttribute("data-tone", "success");
  },
};
