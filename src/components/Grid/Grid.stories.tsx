import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, waitFor } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { BREAKPOINT_NAMES, expectVisibilityFollowsTheWindow } from "../../test/visibility.js";
import { Card } from "../Card/Card.js";
import { Link } from "../Link/Link.js";
import { GRID_BREAKPOINTS, Grid, type GridBreakpoint, GridItem } from "./Grid.js";

const SPACES = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

const meta = {
  title: "Components/Grid",
  component: Grid,
  args: { columns: 3, gap: "4", as: "div" },
  argTypes: {
    columns: { control: "object" },
    minItemWidth: { control: "text" },
    gap: { control: "select", options: SPACES },
    rowGap: { control: "select", options: SPACES },
    padding: { control: "select", options: SPACES },
    paddingInline: { control: "select", options: SPACES },
    paddingBlock: { control: "select", options: SPACES },
    grow: { control: "boolean" },
    shrink: { control: "boolean" },
    fill: { control: "boolean" },
    minSize: { control: "inline-radio", options: [undefined, "0"] },
    overflow: { control: "inline-radio", options: [undefined, "hidden", "auto", "visible"] },
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

/** A breakpoint of the scale in px, at the page's root font size. */
const px = (name: GridBreakpoint) =>
  Number.parseFloat(GRID_BREAKPOINTS[name]) *
  Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
const paddingOf = (el: Element) => {
  const style = getComputedStyle(el);
  return [style.paddingBlockStart, style.paddingInlineEnd, style.paddingBlockEnd, style.paddingInlineStart];
};
/**
 * How far the items poke out of the grid's sides, in px (0 when none does). Engines round fractional tracks
 * differently (Firefox lays out in sixtieths of a pixel), so a column grid at a fractional width can be out by a
 * fraction of a pixel; half a pixel is the line between rounding and a column too many.
 */
const overflowOf = (grid: Element) =>
  Math.max(
    0,
    ...items(grid).flatMap((item) => [box(grid).left - box(item).left, box(item).right - box(grid).right]),
  );
const itemsInside = (grid: Element) => overflowOf(grid) < 0.5;
/** Sets the frame's width and waits for the grid inside it to show `columns` columns without overflowing. */
async function expectColumnsAt(frame: HTMLElement, grid: HTMLElement, width: number, columns: number) {
  frame.style.inlineSize = `${width}px`;
  await waitFor(() => expect(`${width}px: ${columnsOf(grid)}`).toBe(`${width}px: ${columns}`));
  await expect(overflowOf(grid), `items poke out of a ${width}px grid`).toBeLessThan(0.5);
}

export const ColumnsPerBreakpoint: Story = {
  args: { columns: { base: 1, sm: 2, lg: 4 } },
  render: (args) => (
    <div className="frame" style={{ inlineSize: 320 }}>
      <Grid {...args} data-testid="grid">
        {cells(8)}
      </Grid>
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const grid = canvas.getByTestId("grid");
    const frame = canvasElement.querySelector(".frame") as HTMLElement;
    // The scale is 30, 45, 60 and 75rem of the grid's own width: 480, 720, 960 and 1200px here.
    await expect([px("sm"), px("md"), px("lg"), px("xl")]).toEqual([480, 720, 960, 1200]);
    // Below sm: `base`. The frame, not the window, sets the width.
    await expectColumnsAt(frame, grid, 320, 1);
    await expectColumnsAt(frame, grid, px("sm") - 1, 1);
    // A breakpoint applies from exactly its width upwards.
    await expectColumnsAt(frame, grid, px("sm"), 2);
    // md is not given: it keeps the count of sm, up to the last pixel before lg.
    await expectColumnsAt(frame, grid, px("md") + 40, 2);
    await expectColumnsAt(frame, grid, px("lg") - 1, 2);
    await expectColumnsAt(frame, grid, px("lg"), 4);
    // xl is not given either: it keeps lg's four.
    await expectColumnsAt(frame, grid, px("xl") + 100, 4);
    // Columns are equal and separated by the gap token (space 4 = 8px).
    const [a, b] = items(grid).map(box);
    await expect(Math.abs((a?.width as number) - (b?.width as number))).toBeLessThan(1);
    await expect((b?.left as number) - (a?.right as number)).toBeCloseTo(8, 0);
    await expect(a?.width).toBeCloseTo((px("xl") + 100 - 3 * 8) / 4, 0);
    // And back down again.
    await expectColumnsAt(frame, grid, 320, 1);
  },
};

/** Twelve items with almost no width of their own, so that only the grid decides how wide they are. */
const numbers = Array.from({ length: 12 }, (_, i) => <div key={`n-${i + 1}`}>{i + 1}</div>);

export const EveryBreakpointAndEveryCount: Story = {
  render: () => (
    <div className="frame" style={{ inlineSize: 300 }}>
      <Grid columns={{ base: 2, sm: 3, md: 5, lg: 7, xl: 12 }} gap="5" data-testid="grid">
        {numbers}
      </Grid>
      <Grid columns={{ base: 6, sm: 1, md: 11, lg: 2, xl: 9 }} gap="0" rowGap="2" data-testid="odd">
        {numbers}
      </Grid>
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const frame = canvasElement.querySelector(".frame") as HTMLElement;
    const [grid, odd] = [canvas.getByTestId("grid"), canvas.getByTestId("odd")];
    // Whole, fractional and awkward widths in every range, including one sub-pixel either side of each breakpoint:
    // the count is always exactly the one asked for (never one fewer through rounding) and nothing overflows.
    const ranges: [number, number, number, number][] = [
      [120, px("sm") - 0.5, 2, 6],
      [px("sm"), px("md") - 0.5, 3, 1],
      [px("md"), px("lg") - 0.5, 5, 11],
      [px("lg"), px("xl") - 0.5, 7, 2],
      [px("xl"), 1900, 12, 9],
    ];
    for (const [from, to, columns, oddColumns] of ranges)
      for (const width of [from, from + 0.5, from + 13.37, (from + to) / 2 + 0.33, to - 7.77, to]) {
        await expectColumnsAt(frame, grid, width, columns);
        await expect(`${width}px: ${columnsOf(odd)}`).toBe(`${width}px: ${oddColumns}`);
        await expect(`${width}px: ${itemsInside(odd)}`).toBe(`${width}px: true`);
      }
  },
};

export const SpansClampToTheColumnsAtEachWidth: Story = {
  render: () => (
    <div className="frame" style={{ inlineSize: 300 }}>
      <Grid columns={{ base: 1, sm: 2, lg: 4 }} data-testid="grid">
        <GridItem span={3} data-testid="three">
          <Card>Three columns</Card>
        </GridItem>
        <Card>Plain</Card>
        <GridItem span="full" data-testid="full">
          <Card>Whole row</Card>
        </GridItem>
        {cells(4)}
      </Grid>
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const grid = canvas.getByTestId("grid");
    const frame = canvasElement.querySelector(".frame") as HTMLElement;
    const widthOf = (id: string) => box(canvas.getByTestId(id)).width;
    // One column: the span of three is clamped to one, the whole width.
    frame.style.inlineSize = "300px";
    await waitFor(() => expect(widthOf("three")).toBeCloseTo(300, 0));
    await expect(fitsWidth(grid)).toBe(true);
    // Two columns: clamped to two, still the whole width, and no third column appears.
    frame.style.inlineSize = `${px("sm") + 20}px`;
    await waitFor(() => expect(widthOf("three")).toBeCloseTo(px("sm") + 20, 0));
    await expect(fitsWidth(grid)).toBe(true);
    await expect(box(canvas.getByText("Plain").closest(".cy-card") as Element).width).toBeCloseTo(
      (px("sm") + 20 - 8) / 2,
      0,
    );
    // Four columns: the real span of three, with the plain item beside it in the fourth.
    frame.style.inlineSize = `${px("lg")}px`;
    const column = (px("lg") - 3 * 8) / 4;
    await waitFor(() => expect(widthOf("three")).toBeCloseTo(3 * column + 2 * 8, 0));
    const plain = box(canvas.getByText("Plain").closest(".cy-card") as Element);
    await expect(plain.top).toBeCloseTo(box(canvas.getByTestId("three")).top, 0);
    await expect(widthOf("full")).toBeCloseTo(px("lg"), 0);
    await expect(fitsWidth(grid)).toBe(true);
  },
};

export const BreakpointsWithMinItemWidth: Story = {
  render: () => (
    <div className="frame" style={{ inlineSize: 300 }}>
      <Grid columns={{ base: 2, md: 6 }} minItemWidth="200px" data-testid="grid">
        {cells(12)}
      </Grid>
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const grid = canvas.getByTestId("grid");
    const frame = canvasElement.querySelector(".frame") as HTMLElement;
    // `columns` is the most there can be at each width; `minItemWidth` still decides how many fit under that.
    await expectColumnsAt(frame, grid, 150, 1);
    await expectColumnsAt(frame, grid, 300, 1);
    await expectColumnsAt(frame, grid, 450, 2);
    // 700px would hold three 200px columns, but base allows two.
    await expectColumnsAt(frame, grid, 700, 2);
    // From md up to six are allowed: 800px holds three, 1300px holds six, and 2000px still six.
    await expectColumnsAt(frame, grid, 800, 3);
    await expectColumnsAt(frame, grid, 1300, 6);
    await expectColumnsAt(frame, grid, 2000, 6);
  },
};

export const BreakpointsMeasureInsideThePadding: Story = {
  render: () => (
    <div className="frame" style={{ inlineSize: 300 }}>
      <Grid columns={{ base: 1, sm: 2 }} padding="6" data-testid="grid">
        {cells(4)}
      </Grid>
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const grid = canvas.getByTestId("grid");
    const frame = canvasElement.querySelector(".frame") as HTMLElement;
    await expect(paddingOf(grid)).toEqual(["16px", "16px", "16px", "16px"]);
    // The width that counts is the room the columns have: the grid less its 16px padding on each side.
    await expectColumnsAt(frame, grid, px("sm") + 31, 1);
    await expectColumnsAt(frame, grid, px("sm") + 32, 2);
    const [first] = items(grid).map(box);
    await expect((first?.left as number) - box(grid).left).toBeCloseTo(16, 0);
    await expect(first?.width).toBeCloseTo((px("sm") - 8) / 2, 0);
  },
};

export const NestedBreakpointGridsKeepTheirOwnColumns: Story = {
  render: () => (
    <div className="frame" style={{ inlineSize: 1000 }}>
      <Grid columns={{ base: 1, lg: 2 }} data-testid="outer">
        <GridItem span={2} data-testid="outer-item">
          <Grid columns={{ base: 3, md: 1 }} data-testid="inner">
            <GridItem span={5} data-testid="inner-item">
              <Card>Inner wide</Card>
            </GridItem>
            <Card>Inner two</Card>
            <Card>Inner three</Card>
            <Card>Inner four</Card>
          </Grid>
        </GridItem>
        <GridItem>
          <Grid columns={3} data-testid="fixed">
            <GridItem span={2} data-testid="fixed-item">
              <Card>Fixed wide</Card>
            </GridItem>
            <Card>Fixed two</Card>
          </Grid>
        </GridItem>
        <Grid data-testid="plain">
          <Card>Plain one</Card>
          <Card>Plain two</Card>
        </Grid>
      </Grid>
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const frame = canvasElement.querySelector(".frame") as HTMLElement;
    const widthOf = (id: string) => box(canvas.getByTestId(id)).width;
    // 1000px: the outer grid is at lg (two columns); the inner one fills it, so it is at md (one column).
    await waitFor(() => expect(widthOf("inner")).toBeCloseTo(1000, 0));
    await expect(columnsOf(canvas.getByTestId("inner"))).toBe(1);
    await expect(widthOf("inner-item")).toBeCloseTo(1000, 0);
    // The fixed grid in the half-width cell keeps its three columns and its real span of two.
    const half = (1000 - 8) / 2;
    await expect(widthOf("fixed")).toBeCloseTo(half, 0);
    await expect(widthOf("fixed-item")).toBeCloseTo(((half - 16) / 3) * 2 + 8, 0);
    await expect(columnsOf(canvas.getByTestId("plain"))).toBe(1);
    // 600px: outer at base (one column, its span of two clamped), inner at base (three columns, span clamped to 3).
    frame.style.inlineSize = "600px";
    await waitFor(() => expect(widthOf("outer-item")).toBeCloseTo(600, 0));
    await waitFor(() => expect(widthOf("inner-item")).toBeCloseTo(600, 0));
    await expect(box(canvas.getByText("Inner three").closest(".cy-card") as Element).width).toBeCloseTo(
      (600 - 16) / 3,
      0,
    );
    await expect(widthOf("fixed-item")).toBeCloseTo(((600 - 16) / 3) * 2 + 8, 0);
    for (const id of ["outer", "inner", "fixed", "plain"])
      await expect(fitsWidth(canvas.getByTestId(id))).toBe(true);
  },
};

export const ServerMarkupNeedsNoScript: Story = {
  render: () => <div className="frame" style={{ inlineSize: 1000 }} />,
  play: async ({ canvasElement }) => {
    const frame = canvasElement.querySelector(".frame") as HTMLElement;
    // Static HTML, as a server sends it: no React on the page for this grid, no effects, nothing measured.
    frame.innerHTML = renderToStaticMarkup(
      <Grid columns={{ base: 1, sm: 2, lg: 4 }} padding="4" data-testid="static">
        <GridItem span={3}>
          <Card>Wide</Card>
        </GridItem>
        {cells(5)}
      </Grid>,
    );
    const grid = frame.firstElementChild as HTMLElement;
    // The column count is in the markup and the stylesheet alone, so the first paint is already right.
    await expect(columnsOf(grid)).toBe(2);
    await expect(box(items(grid)[0] as Element).width).toBeCloseTo(((1000 - 16 - 3 * 8) / 4) * 3 + 16, 0);
    frame.style.inlineSize = "400px";
    await expect(columnsOf(grid)).toBe(1);
    await expect(box(items(grid)[0] as Element).width).toBeCloseTo(400 - 16, 0);
  },
};

export const BreakpointDefaultsAndBadInput: Story = {
  render: () => (
    <div className="frame" style={{ inlineSize: 800 }}>
      <Grid columns={{}} data-testid="empty">
        {cells(3)}
      </Grid>
      <Grid columns={{ md: 3 }} data-testid="no-base">
        {cells(3)}
      </Grid>
      <Grid columns={{ base: 0, sm: Number.NaN, md: 2.9, lg: -4 }} data-testid="nonsense">
        {cells(3)}
      </Grid>
      <Grid columns={{ base: 3, sm: undefined, md: 0 }} data-testid="gaps">
        {cells(3)}
      </Grid>
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const frame = canvasElement.querySelector(".frame") as HTMLElement;
    const at = async (width: number, expected: Record<string, number>) => {
      frame.style.inlineSize = `${width}px`;
      for (const [id, columns] of Object.entries(expected))
        await waitFor(() => expect(`${id}: ${columnsOf(canvas.getByTestId(id))}`).toBe(`${id}: ${columns}`));
    };
    // No base: one column until the first breakpoint given. Nonsense counts are skipped (the count below stays);
    // fractions round down.
    await at(800, { empty: 1, "no-base": 3, nonsense: 2, gaps: 3 });
    await at(600, { empty: 1, "no-base": 1, nonsense: 1, gaps: 3 });
    await at(1000, { empty: 1, "no-base": 3, nonsense: 2, gaps: 3 });
  },
};

export const PaddingUsesSpaceTokens: Story = {
  render: () => (
    <div className="frame" style={{ inlineSize: 400 }}>
      <Grid columns={2} padding="6" data-testid="all">
        {cells(2)}
      </Grid>
      <Grid columns={2} padding="4" paddingInline="8" data-testid="inline-wins">
        {cells(2)}
      </Grid>
      <Grid columns={2} padding="4" paddingBlock="0" data-testid="block-wins">
        <Grid data-testid="nested">{cells(1)}</Grid>
        <Card>Two</Card>
      </Grid>
    </div>
  ),
  play: async ({ canvas }) => {
    const all = canvas.getByTestId("all");
    // Space 6 is 16px on all four sides, inside the grid's width; the columns share what is left.
    await expect(paddingOf(all)).toEqual(["16px", "16px", "16px", "16px"]);
    await expect(box(all).width).toBeCloseTo(400, 0);
    const [first] = items(all).map(box);
    await expect((first?.left as number) - box(all).left).toBeCloseTo(16, 0);
    await expect((first?.top as number) - box(all).top).toBeCloseTo(16, 0);
    await expect(first?.width).toBeCloseTo((400 - 32 - 8) / 2, 0);
    // The specific side wins over `padding`, and "0" counts as a value.
    await expect(paddingOf(canvas.getByTestId("inline-wins"))).toEqual(["8px", "24px", "8px", "24px"]);
    await expect(paddingOf(canvas.getByTestId("block-wins"))).toEqual(["0px", "8px", "0px", "8px"]);
    // A nested Grid has no padding of its own and does not inherit the parent's.
    await expect(paddingOf(canvas.getByTestId("nested"))).toEqual(["0px", "0px", "0px", "0px"]);
    await expect(canvas.getByTestId("nested").getAttribute("style")).not.toContain("pad");
  },
};

export const BreakpointGridStableUnderHostileHost: Story = {
  render: () => (
    <div style={{ inlineSize: 2000 }}>
      <Grid columns={{ base: 1, sm: 2, xl: 3 }} padding="5">
        <GridItem span={2}>
          <Card>One</Card>
        </GridItem>
        <Card>Two</Card>
      </Grid>
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const selector of [".cy-grid", ".cy-grid-item"]) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, [
        "display",
        "grid-template-columns",
        "column-gap",
        "grid-column-end",
        "container-type",
        "box-sizing",
        "margin-top",
        "padding-left",
        "padding-top",
      ]);
      await expect(hostile).toEqual(clean);
    }
    // Three real columns at 2000px (xl whatever root font size the host sets: the breakpoints are in rem).
    await expect(
      getComputedStyle(canvasElement.querySelector(".cy-grid") as Element).gridTemplateColumns.split(" "),
    ).toHaveLength(3);
  },
};

export const UnequalColumns: Story = {
  args: { columns: "2fr 1fr", gap: "4" },
  render: (args) => (
    <div className="frame" style={{ inlineSize: 608 }}>
      <Grid {...args} data-testid="grid">
        {cells(4)}
      </Grid>
    </div>
  ),
  play: async ({ canvas }) => {
    const grid = canvas.getByTestId("grid");
    await expect(columnsOf(grid)).toBe(2);
    // 608px less one 8px gap: 400 and 200, two to one.
    const [a, b] = items(grid).map(box);
    await expect(a?.width).toBeCloseTo(400, 0);
    await expect(b?.width).toBeCloseTo(200, 0);
    await expect(itemsInside(grid)).toBe(true);
  },
};

export const SpanAndOrderPerBreakpoint: Story = {
  args: { columns: { base: 1, md: 3 } },
  render: (args) => (
    <div className="frame" style={{ inlineSize: 320 }}>
      <Grid {...args} data-testid="grid">
        <GridItem span={{ md: 2 }} order={{ base: 2, md: 1 }} data-testid="main">
          <Card>Main</Card>
        </GridItem>
        <GridItem order={{ base: 1, md: 2 }} data-testid="aside">
          <Card>Aside</Card>
        </GridItem>
        <GridItem span={{ base: "full", lg: 1 }} data-testid="foot">
          <Card>Foot</Card>
        </GridItem>
      </Grid>
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const frame = canvasElement.querySelector(".frame") as HTMLElement;
    const main = canvas.getByTestId("main");
    const aside = canvas.getByTestId("aside");
    const foot = canvas.getByTestId("foot");
    const grid = canvas.getByTestId("grid");
    // Narrow: one column, the aside comes first.
    await waitFor(() => expect(box(aside).top).toBeLessThan(box(main).top));
    await expect(box(main).width).toBeCloseTo(box(grid).width, 0);
    // From md (720px of the grid's own width): two columns of three for main, one for the aside, side by side,
    // main first.
    frame.style.inlineSize = `${px("md")}px`;
    await waitFor(() => expect(Math.abs(box(aside).top - box(main).top)).toBeLessThan(1));
    await expect(box(main).left).toBeLessThan(box(aside).left);
    await expect(box(main).width / box(aside).width).toBeGreaterThan(1.9);
    await expect(box(foot).width).toBeCloseTo(box(grid).width, 0);
    // From lg the foot takes one column, as given; below that it keeps `full`.
    frame.style.inlineSize = `${px("lg")}px`;
    await waitFor(() => expect(box(foot).width).toBeCloseTo(box(aside).width, 0));
    await expect(itemsInside(grid)).toBe(true);
    // The reading order is still the source order: only the picture moved.
    await expect(items(grid)[0]).toBe(main);
  },
};

export const StickyItem: Story = {
  args: { columns: "1fr 2fr" },
  render: (args) => (
    <section
      data-testid="scroller"
      // biome-ignore lint/a11y/noNoninteractiveTabindex: a scrolling area must be reachable by keyboard (axe)
      tabIndex={0}
      aria-label="Page"
      style={{ blockSize: 200, overflow: "auto" }}
    >
      <Grid {...args}>
        <GridItem sticky stickyOffset="16px" data-testid="side">
          <Card>On this page</Card>
        </GridItem>
        <div style={{ blockSize: 1000 }}>Long column</div>
      </Grid>
    </section>
  ),
  play: async ({ canvas }) => {
    const scroller = canvas.getByTestId("scroller");
    const side = canvas.getByTestId("side");
    // A sticky item keeps its own height instead of stretching to the row's, so it has room to move.
    await expect(box(side).height).toBeLessThan(200);
    scroller.scrollTop = 500;
    await expect(box(side).top - scroller.getBoundingClientRect().top).toBeCloseTo(16, 0);
  },
};

export const HidesByTheWindowWidth: Story = {
  render: () => (
    <div data-testid="root">
      {BREAKPOINT_NAMES.map((bp) => (
        <Grid key={bp} columns={2}>
          <GridItem hideBelow={bp}>{`item below ${bp}`}</GridItem>
          <GridItem hideAbove={bp}>{`item above ${bp}`}</GridItem>
        </Grid>
      ))}
      <Grid hideBelow="sm" id="cards" role="list" aria-label="Cards" columns={1}>
        <GridItem role="listitem">grid below sm</GridItem>
      </Grid>
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    await expectVisibilityFollowsTheWindow(canvas.getByTestId("root"));
    // id, role and ARIA reach the elements.
    const list = canvasElement.querySelector("#cards") as HTMLElement;
    if (list.checkVisibility()) await expect(canvas.getByRole("list", { name: "Cards" })).toBe(list);
  },
};

/**
 * A grid as the body of an app shell column: it takes the space the header leaves (`grow`), may be shorter than its
 * cards (`minSize="0"`) and scrolls them (`overflow="auto"`). A wide item scrolls sideways inside its own column.
 */
export const GrowsAndScrollsInAShell: Story = {
  render: () => (
    <div style={{ blockSize: 240, inlineSize: 480, display: "flex", flexDirection: "column" }}>
      <Card>Header</Card>
      <Grid columns={2} grow minSize="0" overflow="auto" data-testid="body">
        {cells(12)}
        <GridItem overflow="auto" data-testid="wide">
          <Link href="#wide">
            <span style={{ display: "inline-block", inlineSize: 600 }}>A wide table</span>
          </Link>
        </GridItem>
      </Grid>
    </div>
  ),
  play: async ({ canvas }) => {
    const body = canvas.getByTestId("body");
    const header = canvas.getByText("Header").getBoundingClientRect();
    // The grid fills what the header leaves and scrolls its rows.
    await expect(box(body).height + header.height).toBeCloseTo(240, 0);
    await expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
    body.scrollTop = 100;
    await expect(body.scrollTop).toBe(100);
    // The wide item keeps to its column and scrolls sideways.
    const wide = canvas.getByTestId("wide");
    await expect(box(wide).width).toBeLessThan(240);
    await expect(wide.scrollWidth).toBeGreaterThan(wide.clientWidth);
    await expect(getComputedStyle(wide).overflowX).toBe("auto");
  },
};

export const FillTakesItsParentsSize: Story = {
  render: () => (
    <div style={{ blockSize: 200, inlineSize: 300 }}>
      <Grid columns={2} fill data-testid="grid">
        {cells(2)}
      </Grid>
    </div>
  ),
  play: async ({ canvas }) => {
    const grid = box(canvas.getByTestId("grid"));
    await expect([grid.width, grid.height]).toEqual([300, 200]);
  },
};
