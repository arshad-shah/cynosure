import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { expect, waitFor } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { Card } from "../Card/Card.js";
import { Grid, GridItem } from "./Grid.js";

const SPACES = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

const meta = {
  title: "Components/Grid",
  component: Grid,
  args: { columns: 3, gap: "4", as: "div" },
  argTypes: {
    columns: { control: { type: "number", min: 1, max: 12 } },
    minItemWidth: { control: "text" },
    gap: { control: "select", options: SPACES },
    rowGap: { control: "select", options: SPACES },
    align: { control: "inline-radio", options: ["start", "center", "end", "stretch"] },
    as: { control: "select", options: ["div", "section", "ul", "ol", "nav", "aside", "header", "footer"] },
  },
  render: (args) => (
    <Grid {...args} data-testid="grid">
      {cells(6)}
    </Grid>
  ),
} satisfies Meta<typeof Grid>;
export default meta;
type Story = StoryObj<typeof meta>;

function cells(n: number, tag?: "li"): ReactNode[] {
  return Array.from({ length: n }, (_, i) =>
    tag ? (
      <GridItem as="li" key={`item-${i + 1}`}>
        <Card>Item {i + 1}</Card>
      </GridItem>
    ) : (
      <Card key={`item-${i + 1}`}>Item {i + 1}</Card>
    ),
  );
}

const items = (grid: Element) => [...grid.children] as HTMLElement[];
const box = (el: Element) => el.getBoundingClientRect();
/** How many columns the first row has: items that share the first item's top edge. */
const columnsOf = (grid: Element) => {
  const [first, ...rest] = items(grid).map(box);
  return 1 + rest.filter((b) => Math.abs(b.top - (first as DOMRect).top) < 1).length;
};
const fitsWidth = (grid: HTMLElement) => grid.scrollWidth <= grid.clientWidth;

export const FixedColumns: Story = {
  tags: ["visual"],
  play: async ({ canvas }) => {
    const grid = canvas.getByTestId("grid");
    await expect(columnsOf(grid)).toBe(3);
    const [a, b, , d] = items(grid).map(box);
    // Equal columns, separated by the gap token (space 4 = 8px), wrapping to a second row.
    await expect(Math.abs((a?.width as number) - (b?.width as number))).toBeLessThan(1);
    await expect((b?.left as number) - (a?.right as number)).toBeCloseTo(8, 0);
    await expect(d?.top).toBeGreaterThan(a?.bottom as number);
    await expect(d?.left).toBeCloseTo(a?.left as number, 0);
  },
};

export const FitsAsManyAsTheWidthAllows: Story = {
  args: { columns: undefined, minItemWidth: "150px" },
  render: (args) => (
    <div className="frame" style={{ inlineSize: 700 }}>
      <Grid {...args} data-testid="grid">
        {cells(6)}
      </Grid>
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const grid = canvas.getByTestId("grid");
    const frame = canvasElement.querySelector(".frame") as HTMLElement;
    // 700px holds four 150px columns with 8px gaps; the columns share the spare width.
    await expect(columnsOf(grid)).toBe(4);
    await expect(box(items(grid)[0] as Element).width).toBeGreaterThan(150);
    frame.style.inlineSize = "330px";
    await waitFor(() => expect(columnsOf(grid)).toBe(2));
    frame.style.inlineSize = "100px";
    // Narrower than one column: a single column the width of the grid, never overflowing.
    await waitFor(() => expect(columnsOf(grid)).toBe(1));
    await expect(box(items(grid)[0] as Element).width).toBeCloseTo(100, 0);
    await expect(fitsWidth(grid)).toBe(true);
  },
};

export const ColumnsCapTheFit: Story = {
  args: { columns: 2, minItemWidth: "80px" },
  render: (args) => (
    <div className="frame" style={{ inlineSize: 700 }}>
      <Grid {...args} data-testid="grid">
        {cells(6)}
      </Grid>
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const grid = canvas.getByTestId("grid");
    // Room for seven 80px columns, but never more than two.
    await expect(columnsOf(grid)).toBe(2);
    (canvasElement.querySelector(".frame") as HTMLElement).style.inlineSize = "120px";
    await waitFor(() => expect(columnsOf(grid)).toBe(1));
  },
};

export const ItemsSpanColumnsAndRows: Story = {
  render: () => (
    <Grid columns={3} data-testid="grid">
      <GridItem span={2} data-testid="wide">
        <Card>Two columns</Card>
      </GridItem>
      <GridItem rowSpan={2} data-testid="tall">
        <Card>Two rows</Card>
      </GridItem>
      <Card>Four</Card>
      <Card>Five</Card>
      <GridItem span="full" data-testid="full">
        <Card>Whole row</Card>
      </GridItem>
      <GridItem span={9} data-testid="too-wide">
        <Card>Asked for nine</Card>
      </GridItem>
    </Grid>
  ),
  play: async ({ canvas }) => {
    const grid = canvas.getByTestId("grid");
    const column = (box(grid).width - 2 * 8) / 3;
    await expect(box(canvas.getByTestId("wide")).width).toBeCloseTo(2 * column + 8, 0);
    const four = box(canvas.getByText("Four").closest(".cy-card") as Element);
    await expect(box(canvas.getByTestId("tall")).bottom).toBeCloseTo(four.bottom, 0);
    await expect(box(canvas.getByTestId("full")).width).toBeCloseTo(box(grid).width, 0);
    // More columns than the grid has: clamped to the whole row, no overflow.
    await expect(box(canvas.getByTestId("too-wide")).width).toBeCloseTo(box(grid).width, 0);
    await expect(fitsWidth(grid)).toBe(true);
  },
};

export const NestedGridsKeepTheirOwnColumns: Story = {
  render: () => (
    <Grid columns={2} data-testid="outer">
      <GridItem span={2}>
        <Grid data-testid="inner" gap="2">
          <Card>Inner one</Card>
          <Card>Inner two</Card>
        </Grid>
      </GridItem>
      <Card>Outer</Card>
    </Grid>
  ),
  play: async ({ canvas }) => {
    await expect(columnsOf(canvas.getByTestId("outer"))).toBe(1);
    // The inner grid has no columns of its own: one column, not the outer grid's two.
    await expect(columnsOf(canvas.getByTestId("inner"))).toBe(1);
    await expect(getComputedStyle(canvas.getByTestId("inner")).columnGap).toBe("4px");
  },
};

export const ListsKeepTheirSemantics: Story = {
  args: { as: "ul", columns: 2 },
  render: (args) => (
    <Grid {...args} data-testid="grid">
      {cells(4, "li")}
    </Grid>
  ),
  play: async ({ canvas }) => {
    const list = canvas.getByRole("list");
    await expect(canvas.getAllByRole("listitem")).toHaveLength(4);
    // No bullets or indentation from the browser.
    await expect(getComputedStyle(list).listStyleType).toBe("none");
    await expect(getComputedStyle(list).paddingInlineStart).toBe("0px");
    await expect(columnsOf(list)).toBe(2);
  },
};

export const SeparateRowGapAndAlignment: Story = {
  args: { gap: "2", rowGap: "8", align: "start" },
  render: (args) => (
    <Grid {...args} data-testid="grid">
      <Card>Short</Card>
      <Card>
        Taller
        <br />
        item
      </Card>
      <Card>Short</Card>
      <Card>Next row</Card>
    </Grid>
  ),
  play: async ({ canvas }) => {
    const grid = canvas.getByTestId("grid");
    await expect(getComputedStyle(grid).columnGap).toBe("4px");
    await expect(getComputedStyle(grid).rowGap).toBe("24px");
    const [first, second] = items(grid).map(box);
    // align="start": items keep their own height instead of stretching to the row.
    await expect(first?.height).toBeLessThan(second?.height as number);
  },
};

export const FollowsTheTextDirection: Story = {
  render: (args) => (
    <div dir="rtl">
      <Grid {...args} data-testid="grid">
        {cells(3)}
      </Grid>
    </div>
  ),
  play: async ({ canvas }) => {
    const [first, second] = items(canvas.getByTestId("grid")).map(box);
    await expect(first?.left).toBeGreaterThan(second?.left as number);
  },
};

export const DefaultsAndBadInput: Story = {
  render: () => (
    <>
      <Grid data-testid="plain" className="host-grid">
        {cells(2)}
      </Grid>
      <Grid columns={0} data-testid="zero">
        {cells(2)}
      </Grid>
      <Grid columns={Number.NaN} data-testid="nan">
        {cells(2)}
      </Grid>
      <Grid columns={2.8} data-testid="fraction">
        <GridItem span={0}>
          <Card>Zero span</Card>
        </GridItem>
        <Card>Two</Card>
      </Grid>
    </>
  ),
  play: async ({ canvas }) => {
    // One column and the space-4 gap by default; nonsense column counts fall back to one.
    const plain = canvas.getByTestId("plain");
    await expect(plain).toHaveClass("host-grid");
    await expect(columnsOf(plain)).toBe(1);
    await expect(getComputedStyle(plain).rowGap).toBe("8px");
    await expect(columnsOf(canvas.getByTestId("zero"))).toBe(1);
    await expect(columnsOf(canvas.getByTestId("nan"))).toBe(1);
    // Fractions round down; a zero span takes one column.
    await expect(columnsOf(canvas.getByTestId("fraction"))).toBe(2);
  },
};

export const StableUnderHostileHost: Story = {
  render: () => (
    <Grid columns={2}>
      <GridItem span={2}>
        <Card>One</Card>
      </GridItem>
      <Card>Two</Card>
    </Grid>
  ),
  play: async ({ canvasElement }) => {
    for (const selector of [".cy-grid", ".cy-grid-item"]) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, [
        "display",
        "grid-template-columns",
        "column-gap",
        "grid-column-end",
        "box-sizing",
        "margin-top",
        "padding-left",
      ]);
      await expect(hostile).toEqual(clean);
    }
  },
};
