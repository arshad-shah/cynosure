import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { Button } from "../Button/Button.js";
import { moveItems, VirtualList, type VirtualListHandle, type VirtualListProps } from "./VirtualList.js";

interface Entry {
  id: string;
  name: string;
  locked?: boolean;
}
const MANY: Entry[] = Array.from({ length: 10_000 }, (_, i) => ({ id: `f${i}`, name: `File ${i + 1}` }));
const FEW: Entry[] = [
  { id: "a", name: "Alpha" },
  { id: "b", name: "Bravo", locked: true },
  { id: "c", name: "Charlie" },
  { id: "d", name: "Delta" },
  { id: "e", name: "Echo" },
];

const base: VirtualListProps<Entry> = {
  label: "Files",
  items: MANY,
  getKey: (e) => e.id,
  renderItem: (e) => e.name,
  isDisabled: (e) => !!e.locked,
};

function Files(props: Partial<VirtualListProps<Entry>>) {
  return <VirtualList {...base} {...props} />;
}

const meta = {
  title: "Components/VirtualList",
  component: VirtualList,
  args: {
    ...base,
    onSelectionChange: fn(),
    onAction: fn(),
    onAtBottomChange: fn(),
  } as VirtualListProps<unknown>,
  render: (args) => <Files {...(args as Partial<VirtualListProps<Entry>>)} />,
} satisfies Meta<typeof VirtualList>;
export default meta;
type Story = StoryObj<typeof meta>;

const list = (el: Element) => el.querySelector(".cy-virtual-list") as HTMLElement;
const rendered = (el: Element) => el.querySelectorAll('[role="option"]').length;
const nextFrame = () => new Promise((res) => requestAnimationFrame(() => res(null)));

export const TenThousandRowsRenderOnlyWhatIsInView: Story = {
  tags: ["visual"],
  play: async ({ canvas, canvasElement }) => {
    const box = canvas.getByRole("listbox", { name: "Files" });
    await expect(canvas.getByRole("option", { name: "File 1" })).toHaveAttribute("aria-setsize", "10000");
    await expect(rendered(canvasElement)).toBeLessThan(60);
    // Scrolled to the end, the last rows are there and placed at the bottom of the scroll space.
    box.scrollTop = box.scrollHeight;
    await waitFor(() => expect(canvas.getByRole("option", { name: "File 10000" })).toBeVisible());
    await expect(canvas.getByRole("option", { name: "File 10000" })).toHaveAttribute(
      "aria-posinset",
      "10000",
    );
    await expect(rendered(canvasElement)).toBeLessThan(60);
  },
};

export const KeyboardMovesFocusAndChooses: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.tab();
    await expect(canvas.getByRole("option", { name: "File 1" })).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    await expect(canvas.getByRole("option", { name: "File 3" })).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect(canvas.getByRole("option", { name: "File 3" })).toHaveAttribute("aria-selected", "true");
    await expect(args.onSelectionChange).toHaveBeenLastCalledWith(["f2"]);
    // End scrolls the last row into view and focuses it.
    await userEvent.keyboard("{End}");
    const last = canvas.getByRole("option", { name: "File 10000" });
    await expect(last).toHaveFocus();
    await expect(last).toBeVisible();
    await userEvent.keyboard("{PageUp}");
    const up = Number(document.activeElement?.getAttribute("aria-posinset"));
    await expect(up).toBeLessThan(10000);
    await expect(up).toBeGreaterThan(9990);
    await userEvent.keyboard("{PageDown}");
    await expect(canvas.getByRole("option", { name: "File 10000" })).toHaveFocus();
    await userEvent.keyboard("{Home}{Enter}");
    await expect(args.onAction).toHaveBeenLastCalledWith(MANY[0], 0);
    // Tab leaves: one tab stop.
    await userEvent.tab();
    await expect(canvas.getByRole("listbox").contains(document.activeElement)).toBe(false);
  },
};

export const FocusSurvivesScrollingAway: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const box = list(canvasElement);
    await userEvent.click(canvas.getByRole("option", { name: "File 2" }));
    box.scrollTop = box.scrollHeight / 2;
    await nextFrame();
    // Far out of view, the focused row is still rendered and focused; the next arrow brings it back.
    await waitFor(() => expect(canvas.getByRole("option", { name: "File 5000" })).toBeInTheDocument());
    await expect(canvas.getByRole("option", { name: "File 2" })).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(canvas.getByRole("option", { name: "File 3" })).toHaveFocus();
    await expect(box.scrollTop).toBeLessThan(200);
  },
};

export const ClickChoosesAndDoubleClickActs: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("option", { name: "File 4" }));
    await expect(canvas.getByRole("option", { name: "File 4" })).toHaveAttribute("aria-selected", "true");
    await expect(canvas.getByRole("option", { name: "File 4" })).toHaveFocus();
    await userEvent.click(canvas.getByRole("option", { name: "File 6" }));
    await expect(canvas.getByRole("option", { name: "File 4" })).toHaveAttribute("aria-selected", "false");
    await userEvent.dblClick(canvas.getByRole("option", { name: "File 6" }));
    await expect(args.onAction).toHaveBeenLastCalledWith(MANY[5], 5);
  },
};

export const MultipleSelection: Story = {
  args: { selectionMode: "multiple", items: FEW } as Partial<VirtualListProps<unknown>>,
  render: (args) => <Files {...(args as Partial<VirtualListProps<Entry>>)} items={FEW} />,
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByRole("listbox")).toHaveAttribute("aria-multiselectable", "true");
    await userEvent.click(canvas.getByRole("option", { name: "Alpha" }));
    await userEvent.click(canvas.getByRole("option", { name: "Charlie" }));
    await expect(args.onSelectionChange).toHaveBeenLastCalledWith(["a", "c"]);
    // A second click unchooses.
    await userEvent.click(canvas.getByRole("option", { name: "Alpha" }));
    await expect(args.onSelectionChange).toHaveBeenLastCalledWith(["c"]);
    // Shift+arrows extend from the last row clicked, skipping the locked one.
    await userEvent.click(canvas.getByRole("option", { name: "Charlie" }));
    await userEvent.keyboard("{Shift>}{ArrowDown}{ArrowDown}{/Shift}");
    await expect(args.onSelectionChange).toHaveBeenLastCalledWith(["c", "d", "e"]);
    await userEvent.keyboard("{Control>}a{/Control}");
    await expect(args.onSelectionChange).toHaveBeenLastCalledWith(["a", "c", "d", "e"]);
  },
};

export const DisabledRowsAreSkipped: Story = {
  render: (args) => <Files {...(args as Partial<VirtualListProps<Entry>>)} items={FEW} />,
  play: async ({ args, canvas, userEvent }) => {
    const bravo = canvas.getByRole("option", { name: "Bravo" });
    await expect(bravo).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(bravo);
    await expect(bravo).toHaveAttribute("aria-selected", "false");
    await userEvent.keyboard(" {Enter}");
    await expect(args.onSelectionChange).not.toHaveBeenCalled();
    await expect(args.onAction).not.toHaveBeenCalled();
    canvas.getByRole("option", { name: "Alpha" }).focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(canvas.getByRole("option", { name: "Charlie" })).toHaveFocus();
    await userEvent.keyboard("{ArrowUp}{ArrowUp}");
    await expect(canvas.getByRole("option", { name: "Alpha" })).toHaveFocus();
  },
};

export const LockedEnds: Story = {
  render: () => (
    <Files
      items={[
        { id: "x", name: "Locked first", locked: true },
        ...FEW.slice(2),
        { id: "z", name: "Locked last", locked: true },
      ]}
    />
  ),
  play: async ({ canvas, userEvent }) => {
    // The tab stop and Home/End/Page keys land on the nearest row that can be used.
    await userEvent.tab();
    await expect(canvas.getByRole("option", { name: "Charlie" })).toHaveFocus();
    await userEvent.keyboard("{End}");
    await expect(canvas.getByRole("option", { name: "Echo" })).toHaveFocus();
    await userEvent.keyboard("{Home}");
    await expect(canvas.getByRole("option", { name: "Charlie" })).toHaveFocus();
    await userEvent.keyboard("{PageDown}");
    await expect(canvas.getByRole("option", { name: "Echo" })).toHaveFocus();
    await userEvent.keyboard("{PageUp}");
    await expect(canvas.getByRole("option", { name: "Charlie" })).toHaveFocus();
  },
};

export const NothingToChooseActsOnClick: Story = {
  render: (args) => (
    <Files {...(args as Partial<VirtualListProps<Entry>>)} items={FEW} selectionMode="none" />
  ),
  play: async ({ args, canvas, userEvent }) => {
    const alpha = canvas.getByRole("option", { name: "Alpha" });
    await expect(alpha).not.toHaveAttribute("aria-selected");
    await userEvent.click(alpha);
    await expect(args.onAction).toHaveBeenLastCalledWith(FEW[0], 0);
    await userEvent.keyboard(" ");
    await expect(args.onSelectionChange).not.toHaveBeenCalled();
  },
};

export const Controlled: Story = {
  render: () => {
    function Pair() {
      const [keys, setKeys] = useState(["d"]);
      return (
        <>
          <Files items={FEW} selectedKeys={keys} onSelectionChange={setKeys} className="product-list" />
          <output data-testid="keys">{keys.join(",")}</output>
        </>
      );
    }
    return <Pair />;
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await expect(list(canvasElement)).toHaveClass("product-list");
    // The tab stop starts on the chosen row.
    await userEvent.tab();
    await expect(canvas.getByRole("option", { name: "Delta" })).toHaveFocus();
    await userEvent.keyboard("{ArrowUp} ");
    await expect(canvas.getByTestId("keys")).toHaveTextContent("c");
  },
};

export const Empty: Story = {
  render: () => <Files items={[]} empty="No files yet" />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    await expect(list(canvasElement)).toHaveTextContent("No files yet");
    await expect(canvas.queryByRole("listbox")).toBeNull();
    await userEvent.keyboard("{ArrowDown}");
    await expect(canvas.queryAllByRole("option")).toHaveLength(0);
  },
};

export const SmallRows: Story = {
  render: () => <Files size="sm" />,
  play: async ({ canvas }) => {
    const one = canvas.getByRole("option", { name: "File 1" }).getBoundingClientRect();
    const two = canvas.getByRole("option", { name: "File 2" }).getBoundingClientRect();
    // Rows sit end to end at their measured height, at least 24px.
    await expect(two.top - one.top).toBeCloseTo(one.height, 0);
    await expect(one.height).toBeGreaterThanOrEqual(24);
  },
};

export const TouchRows: Story = {
  tags: ["touch", "!dev"],
  play: async ({ canvas, userEvent }) => {
    const one = canvas.getByRole("option", { name: "File 1" });
    const two = canvas.getByRole("option", { name: "File 2" });
    // 44px rows on touch screens, still placed end to end.
    await expect(one.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    await expect(two.getBoundingClientRect().top - one.getBoundingClientRect().top).toBeCloseTo(
      one.getBoundingClientRect().height,
      0,
    );
    await userEvent.pointer({ keys: "[TouchA]", target: two });
    await expect(two).toHaveAttribute("aria-selected", "true");
  },
};

const PAGES: Entry[] = Array.from({ length: 200 }, (_, i) => ({ id: `p${i + 1}`, name: `Page ${i + 1}` }));
/** A page rail as the tools app has it: choose pages, then move them together. */
function Rail() {
  const [pages, setPages] = useState(PAGES);
  return (
    <>
      <Files
        label="Pages"
        items={pages}
        selectionMode="multiple"
        onMove={(keys, to) => setPages(moveItems(pages, keys, to, (p) => p.id))}
      />
      <output data-testid="order">
        {pages
          .slice(0, 6)
          .map((p) => p.id)
          .join(",")}
      </output>
    </>
  );
}
const order = (canvas: { getByTestId: (id: string) => HTMLElement }) =>
  canvas.getByTestId("order").textContent;
const said = (el: HTMLElement) => el.querySelector('[role="status"]')?.textContent;

export const AltArrowsMoveTheSelection: Story = {
  render: () => <Rail />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole("option", { name: "Page 3" }));
    await userEvent.click(canvas.getByRole("option", { name: "Page 5" }));
    // The chosen pages move together, closing up, and the move is announced.
    await userEvent.keyboard("{Alt>}{ArrowUp}{/Alt}");
    await expect(order(canvas)).toBe("p1,p3,p5,p2,p4,p6");
    await expect(said(canvasElement)).toBe("Moved 2 rows to position 2 of 200");
    await expect(canvas.getByRole("option", { name: "Page 5" })).toHaveFocus();
    await userEvent.keyboard("{Alt>}{ArrowUp}{ArrowUp}{/Alt}");
    await expect(order(canvas)).toBe("p3,p5,p1,p2,p4,p6");
    await userEvent.keyboard("{Alt>}{ArrowDown}{/Alt}");
    await expect(order(canvas)).toBe("p1,p3,p5,p2,p4,p6");
    // A row that is not chosen moves alone.
    canvas.getByRole("option", { name: "Page 4" }).focus();
    await userEvent.keyboard("{ArrowDown}{Alt>}{ArrowUp}{/Alt}");
    await expect(order(canvas)).toBe("p1,p3,p5,p2,p6,p4");
  },
};

/** Presses on `from`, moves to the gap above `toRow` (or past the end), and releases unless told not to. */
function dragRows(
  canvasElement: HTMLElement,
  from: string,
  toRow: string,
  pointerType = "mouse",
  release = true,
) {
  const row = (name: string) =>
    [...canvasElement.querySelectorAll<HTMLElement>('[role="option"]')].find(
      (r) => r.textContent === name,
    ) as HTMLElement;
  const a = row(from).getBoundingClientRect();
  const b = row(toRow).getBoundingClientRect();
  const init = {
    bubbles: true,
    cancelable: true,
    pointerId: 8,
    pointerType,
    isPrimary: true,
    button: 0,
    buttons: 1,
  };
  const x = a.left + 20;
  row(from).dispatchEvent(
    new PointerEvent("pointerdown", { ...init, clientX: x, clientY: a.top + a.height / 2 }),
  );
  for (const y of [a.top + a.height / 2 + 10, b.top + 2])
    window.dispatchEvent(new PointerEvent("pointermove", { ...init, clientX: x, clientY: y }));
  if (release)
    window.dispatchEvent(
      new PointerEvent("pointerup", { ...init, buttons: 0, clientX: x, clientY: b.top + 2 }),
    );
}

export const DragTheSelection: Story = {
  render: () => <Rail />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    // A row dragged on its own lands in the gap the pointer is over.
    dragRows(canvasElement, "Page 1", "Page 5");
    await waitFor(() => expect(order(canvas)).toBe("p2,p3,p4,p1,p5,p6"));
    // Chosen rows drag together; a line shows where they will land.
    await userEvent.click(canvas.getByRole("option", { name: "Page 2" }));
    await userEvent.click(canvas.getByRole("option", { name: "Page 3" }));
    dragRows(canvasElement, "Page 3", "Page 6", "mouse", false);
    await waitFor(() => expect(canvasElement.querySelector(".cy-virtual-list-drop")).not.toBeNull());
    await expect(canvasElement.querySelectorAll("[data-moving]")).toHaveLength(2);
    window.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 8, isPrimary: true }));
    await waitFor(() => expect(order(canvas)).toBe("p4,p1,p5,p2,p3,p6"));
    await expect(canvasElement.querySelector(".cy-virtual-list-drop")).toBeNull();
  },
};

export const EscapeCancelsADragAndTouchScrolls: Story = {
  render: () => <Rail />,
  play: async ({ canvas, canvasElement }) => {
    dragRows(canvasElement, "Page 1", "Page 4", "mouse", false);
    await waitFor(() => expect(canvasElement.querySelector(".cy-virtual-list-drop")).not.toBeNull());
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    await waitFor(() => expect(canvasElement.querySelector(".cy-virtual-list-drop")).toBeNull());
    await expect(order(canvas)).toBe("p1,p2,p3,p4,p5,p6");
    // A finger scrolls the list instead of dragging rows.
    dragRows(canvasElement, "Page 1", "Page 4", "touch");
    await new Promise((r) => setTimeout(r, 50));
    await expect(order(canvas)).toBe("p1,p2,p3,p4,p5,p6");
  },
};

export const DraggingNearAnEdgeScrolls: Story = {
  render: () => <Rail />,
  play: async ({ canvasElement }) => {
    const box = list(canvasElement);
    const first = box.querySelector('[role="option"]') as HTMLElement;
    const r = first.getBoundingClientRect();
    const edge = box.getBoundingClientRect().bottom - 4;
    const init = {
      bubbles: true,
      cancelable: true,
      pointerId: 9,
      pointerType: "mouse",
      isPrimary: true,
      button: 0,
      buttons: 1,
    };
    first.dispatchEvent(
      new PointerEvent("pointerdown", { ...init, clientX: r.left + 20, clientY: r.top + 5 }),
    );
    for (let n = 0; n < 6; n++)
      window.dispatchEvent(new PointerEvent("pointermove", { ...init, clientX: r.left + 20, clientY: edge }));
    await waitFor(() => expect(box.scrollTop).toBeGreaterThan(0));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
  },
};

const HUGE: Entry[] = Array.from({ length: 100_000 }, (_, i) => ({ id: `h${i}`, name: `Row ${i + 1}` }));
/** A hundred thousand rows, every one chosen: moves work on the whole list at once. */
function HugeRail() {
  const [rows, setRows] = useState(HUGE);
  return (
    <>
      <Files
        label="Rows"
        items={rows}
        selectionMode="multiple"
        defaultSelectedKeys={HUGE.map((r) => r.id)}
        onMove={(keys, to) => setRows(moveItems(rows, keys, to, (r) => r.id))}
      />
      <output data-testid="order">
        {[...rows.slice(0, 3), ...rows.slice(-2)].map((r) => r.id).join(",")}
      </output>
    </>
  );
}

export const MovesStayRightInAHundredThousandRows: Story = {
  render: () => <HugeRail />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    // Unchoose the first row, then move the other 99,999 up past it with Alt+Up. Each step is linear in the row
    // count; a quadratic one (scanning the selection per row) would not finish within the test's time.
    await userEvent.click(canvas.getByRole("option", { name: "Row 1" }));
    await expect(canvas.getByRole("option", { name: "Row 1" })).toHaveAttribute("aria-selected", "false");
    await userEvent.keyboard("{ArrowDown}{Alt>}{ArrowUp}{/Alt}");
    await expect(order(canvas)).toBe("h1,h2,h3,h99999,h0");
    await expect(said(canvasElement)).toBe("Moved 99999 rows to position 1 of 100000");
    await expect(canvas.getByRole("option", { name: "Row 2" })).toHaveFocus();
    // And back down again.
    await userEvent.keyboard("{Alt>}{ArrowDown}{/Alt}");
    await expect(order(canvas)).toBe("h0,h1,h2,h99998,h99999");
  },
};

let keyCalls = 0;
const countedKey = (e: Entry) => {
  keyCalls++;
  return e.id;
};

export const ScrollingDoesNotWalkEveryRow: Story = {
  render: () => <Files getKey={countedKey} />,
  play: async ({ canvas, canvasElement }) => {
    const box = list(canvasElement);
    await waitFor(() => expect(canvas.getByRole("option", { name: "File 1" })).toBeInTheDocument());
    // Scrolling re-renders the rows in view; it does not key (or size) all ten thousand rows again each time.
    // Counted, not timed: re-keying every row would be 10,000 calls per scroll.
    keyCalls = 0;
    for (const n of [1, 2, 3, 4, 5]) {
      box.scrollTop = n * 2000;
      // The rows at the new position are rendered.
      await waitFor(() =>
        expect(
          [...box.querySelectorAll<HTMLElement>('[role="option"]')].some(
            (r) => r.offsetTop <= box.scrollTop && r.offsetTop + r.offsetHeight > box.scrollTop,
          ),
        ).toBe(true),
      );
    }
    await expect(keyCalls).toBe(0);
  },
};

/** A request log, as the tools app shows one: wrapped lines, new entries arriving, a button to jump back. */
function Log({ follow = true }: { follow?: boolean }) {
  const [lines, setLines] = useState<Entry[]>(() =>
    Array.from({ length: 60 }, (_, i) => ({
      id: `l${i}`,
      name:
        i % 7 === 3
          ? `GET /api/items/${i} 200 ${"with a long query string that wraps ".repeat(4)}`
          : `GET /api/items/${i} 200`,
    })),
  );
  const handle = useRef<VirtualListHandle>(null);
  return (
    <div style={{ display: "grid", gap: 8, inlineSize: 360 }}>
      <VirtualList
        label="Requests"
        items={lines}
        getKey={(e) => e.id}
        renderItem={(e) => e.name}
        selectionMode="none"
        wrap
        follow={follow}
        handle={handle}
      />
      <div style={{ display: "flex", gap: 8 }}>
        <Button
          size="sm"
          onClick={() =>
            setLines((all) => [...all, { id: `l${all.length}`, name: `GET /api/items/${all.length} 201` }])
          }
        >
          Add a line
        </Button>
        <Button size="sm" onClick={() => handle.current?.scrollToIndex(3, { align: "start" })}>
          Show line 4
        </Button>
        <Button size="sm" onClick={() => handle.current?.scrollToEnd()}>
          Latest
        </Button>
      </div>
    </div>
  );
}
const rowAt = (el: Element, i: number) => el.querySelector(`[data-index="${i}"]`) as HTMLElement | null;

function Jumps() {
  const handle = useRef<VirtualListHandle>(null);
  return (
    <div style={{ display: "grid", gap: 8, inlineSize: 360 }}>
      <VirtualList
        label="Pages"
        items={PAGES}
        getKey={(e) => e.id}
        renderItem={(e) => e.name}
        handle={handle}
      />
      <div style={{ display: "flex", gap: 8 }}>
        <Button size="sm" onClick={() => handle.current?.scrollToIndex(100, { align: "center" })}>
          Centre 101
        </Button>
        <Button size="sm" onClick={() => handle.current?.scrollToIndex(50, "start")}>
          Top 51
        </Button>
        <Button size="sm" onClick={() => handle.current?.scrollToIndex(199)}>
          Show 200
        </Button>
      </div>
    </div>
  );
}

export const ScrollToIndexPlacesTheRow: Story = {
  render: () => <Jumps />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const el = list(canvasElement);
    const row = (i: number) => rowAt(canvasElement, i) as HTMLElement;
    const view = () => el.getBoundingClientRect();
    // `{ align: "center" }` puts the row in the middle of the list.
    await userEvent.click(canvas.getByRole("button", { name: "Centre 101" }));
    await waitFor(() => expect(row(100)).not.toBeNull());
    const mid = row(100).getBoundingClientRect();
    await expect(
      Math.abs(mid.top + mid.height / 2 - (view().top + el.clientTop + el.clientHeight / 2)),
    ).toBeLessThan(2);
    // The alignment alone, the earlier form, still works: row 51 at the top.
    await userEvent.click(canvas.getByRole("button", { name: "Top 51" }));
    await waitFor(() => expect(el.scrollTop).toBe(row(50).offsetTop));
    // No options: the least scrolling, so the last row ends at the bottom.
    await userEvent.click(canvas.getByRole("button", { name: "Show 200" }));
    await waitFor(() => expect(el.scrollTop + el.clientHeight).toBe(el.scrollHeight));
  },
};

export const WrappedRowsTakeTheirHeight: Story = {
  // Without following, so it starts at the top whatever the timing of the first measure.
  render: () => <Log follow={false} />,
  play: async ({ canvasElement }) => {
    const el = list(canvasElement);
    await expect(el.scrollTop).toBe(0);
    await waitFor(() => expect(rowAt(canvasElement, 3)).not.toBeNull());
    // A long line wraps and is taller than a short one, and the next row starts right below it.
    // Rows are looked up each time: they are placed again as their heights settle.
    const h = (i: number) => rowAt(canvasElement, i)?.offsetHeight ?? 0;
    await waitFor(() => expect(h(3)).toBeGreaterThan(h(2) * 2));
    await waitFor(() =>
      expect(rowAt(canvasElement, 4)?.offsetTop).toBe((rowAt(canvasElement, 3)?.offsetTop ?? 0) + h(3)),
    );
    await expect(el.scrollHeight).toBeGreaterThan(60 * h(2));
  },
};

export const FollowsNewRowsAtTheEnd: Story = {
  render: () => <Log />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const el = list(canvasElement);
    const atEnd = () => el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
    // It starts at the end, and stays there as lines arrive.
    await waitFor(() => expect(atEnd()).toBe(true));
    await userEvent.click(canvas.getByRole("button", { name: "Add a line" }));
    await waitFor(() => expect(rowAt(canvasElement, 60)).not.toBeNull());
    await waitFor(() => expect(atEnd()).toBe(true));
    // Scrolled back to read, new lines leave it where it is.
    await userEvent.click(canvas.getByRole("button", { name: "Show line 4" }));
    await waitFor(() => expect(el.scrollTop).toBe((rowAt(canvasElement, 3) as HTMLElement).offsetTop));
    el.dispatchEvent(new Event("scroll"));
    const where = el.scrollTop;
    await userEvent.click(canvas.getByRole("button", { name: "Add a line" }));
    await new Promise((res) => setTimeout(res, 50));
    await expect(el.scrollTop).toBe(where);
    // The handle jumps to the latest.
    await userEvent.click(canvas.getByRole("button", { name: "Latest" }));
    await waitFor(() => expect(atEnd()).toBe(true));
  },
};

/** An activity stream: a pill over the list counts what arrived while someone reads further up, and jumps back. */
function Stream({ onAtBottomChange }: { onAtBottomChange?: ((atBottom: boolean) => void) | undefined }) {
  const [lines, setLines] = useState<Entry[]>(() =>
    Array.from({ length: 60 }, (_, i) => ({ id: `s${i}`, name: `Event ${i + 1}` })),
  );
  const [atBottom, setAtBottom] = useState(true);
  const [unseen, setUnseen] = useState(0);
  const handle = useRef<VirtualListHandle>(null);
  return (
    <div style={{ display: "grid", gap: 8, inlineSize: 360 }}>
      <VirtualList
        label="Activity"
        items={lines}
        getKey={(e) => e.id}
        renderItem={(e) => e.name}
        selectionMode="none"
        follow
        handle={handle}
        onAtBottomChange={(bottom) => {
          setAtBottom(bottom);
          if (bottom) setUnseen(0);
          onAtBottomChange?.(bottom);
        }}
        overlay={
          !atBottom && unseen > 0 ? (
            <Button size="sm" variant="solid" tone="accent" onClick={() => handle.current?.scrollToEnd()}>
              {`${unseen} new`}
            </Button>
          ) : null
        }
      />
      <Button
        size="sm"
        onClick={() => {
          setLines((all) => [...all, { id: `s${all.length}`, name: `Event ${all.length + 1}` }]);
          if (!atBottom) setUnseen((u) => u + 1);
        }}
      >
        Add an event
      </Button>
    </div>
  );
}

export const AtBottomChangeAndOverlay: Story = {
  render: (args) => <Stream onAtBottomChange={args.onAtBottomChange} />,
  play: async ({ canvas, canvasElement, args, userEvent }) => {
    const el = list(canvasElement);
    const spy = args.onAtBottomChange;
    const atEnd = () => el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
    await waitFor(() => expect(atEnd()).toBe(true));
    // Scrolling up lets go of the end and says so; new rows then leave the view where it is.
    el.scrollTop = 100;
    await waitFor(() => expect(spy).toHaveBeenLastCalledWith(false));
    await userEvent.click(canvas.getByRole("button", { name: "Add an event" }));
    const pill = await canvas.findByRole("button", { name: "1 new" });
    await expect(el.scrollTop).toBe(100);
    // The overlay sits over the bottom of the list, outside the listbox, and stays put while the list scrolls.
    await expect(canvas.getByRole("listbox", { name: "Activity" })).not.toContainElement(pill);
    const box = el.getBoundingClientRect();
    const where = () => pill.getBoundingClientRect().bottom - box.bottom;
    const before = where();
    await expect(before).toBeLessThan(0);
    await expect(before).toBeGreaterThan(-40);
    await expect(pill.getBoundingClientRect().left + pill.getBoundingClientRect().width / 2).toBeCloseTo(
      box.left + box.width / 2,
      0,
    );
    el.scrollTop = 40;
    await waitFor(() => expect(where()).toBe(before));
    // It jumps back to the end, which follows again.
    await userEvent.click(pill);
    await waitFor(() => expect(atEnd()).toBe(true));
    await waitFor(() => expect(spy).toHaveBeenLastCalledWith(true));
    await userEvent.click(canvas.getByRole("button", { name: "Add an event" }));
    await waitFor(() => expect(rowAt(canvasElement, 61)).not.toBeNull());
    await waitFor(() => expect(atEnd()).toBe(true));
  },
};

export const DragWrappedRows: Story = {
  render: () => {
    const [items, setItems] = useState(
      FEW.map((e, i) => (i === 1 ? { ...e, name: `${e.name} ${"wraps ".repeat(30)}`.trim() } : e)),
    );
    return (
      <div style={{ inlineSize: 240 }}>
        <VirtualList
          {...(base as VirtualListProps<Entry>)}
          items={items}
          isDisabled={() => false}
          wrap
          onMove={(keys, to) => setItems((all) => moveItems(all, keys, to, (e) => e.id))}
        />
        <span data-testid="wrapped-order" hidden>
          {items.map((e) => e.id).join(",")}
        </span>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const order = () =>
      (canvasElement.querySelector('[data-testid="wrapped-order"]') as HTMLElement).textContent;
    // Rows of different heights: the drop lands in the gap the pointer is nearest, measured row by row.
    await waitFor(() =>
      expect(rowAt(canvasElement, 1)?.offsetHeight ?? 0).toBeGreaterThan(
        rowAt(canvasElement, 0)?.offsetHeight ?? 0,
      ),
    );
    await waitFor(() =>
      expect(rowAt(canvasElement, 2)?.offsetTop).toBe(
        (rowAt(canvasElement, 1)?.offsetTop ?? 0) + (rowAt(canvasElement, 1)?.offsetHeight ?? 0),
      ),
    );
    dragRows(canvasElement, "Alpha", "Delta");
    await waitFor(() => expect(order()).toBe("b,c,a,d,e"));
  },
};

const DAYS: Entry[] = ["Today", "Yesterday", "Last week"].flatMap((day, d) => [
  { id: `h${d}`, name: day },
  ...Array.from({ length: 20 }, (_, i) => ({ id: `${d}-${i}`, name: `${day}: file ${i + 1}` })),
]);

export const SectionHeadingsStayPinned: Story = {
  render: () => (
    <Files
      items={DAYS}
      isHeader={(e) => e.id.startsWith("h")}
      isDisabled={() => false}
      onSelectionChange={fn()}
    />
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    const el = list(canvasElement);
    // Headings are rows that cannot be focused or chosen: the first stop is the first file.
    await userEvent.tab();
    await expect(canvas.getByRole("option", { name: "Today: file 1" })).toHaveFocus();
    await userEvent.keyboard("{Home}");
    await expect(canvas.getByRole("option", { name: "Today: file 1" })).toHaveFocus();
    await expect(canvas.getByRole("option", { name: "Today" })).toHaveAttribute("aria-disabled", "true");
    // Arrows step over a heading.
    el.scrollTop = 0;
    for (let i = 0; i < 20; i++) await userEvent.keyboard("{ArrowDown}");
    await expect(canvas.getByRole("option", { name: "Yesterday: file 1" })).toHaveFocus();
    // Scrolled into a section, its heading stays at the top (a copy, hidden from screen readers).
    const pinned = () => canvasElement.querySelector(".cy-virtual-list-pinned") as HTMLElement | null;
    el.scrollTop = (rowAt(canvasElement, 21) as HTMLElement).offsetTop + 60;
    el.dispatchEvent(new Event("scroll"));
    await waitFor(() => expect(pinned()).toHaveTextContent("Yesterday"));
    await expect(pinned()).toHaveAttribute("aria-hidden", "true");
    await expect(pinned()?.getBoundingClientRect().top).toBeCloseTo(
      el.getBoundingClientRect().top + el.clientTop,
      0,
    );
    el.scrollTop = 0;
    el.dispatchEvent(new Event("scroll"));
    await waitFor(() => expect(pinned()).toBeNull());
  },
};

export const StableUnderHostileHost: Story = {
  args: { overlay: <Button size="sm">Latest</Button> },
  play: async ({ canvasElement }) => {
    const props = ["display", "height", "overflow-y", "box-sizing", "padding-left", "font-size", "position"];
    for (const selector of [".cy-virtual-list", ".cy-virtual-list-row"]) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, props);
      await expect({ selector, ...hostile }).toEqual({ selector, ...clean });
    }
    // The frame and its overlay are OverlayFrame's (its own hostile-host story).
  },
};
