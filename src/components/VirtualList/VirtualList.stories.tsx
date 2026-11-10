import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { moveItems, VirtualList, type VirtualListProps } from "./VirtualList.js";

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
  args: { ...base, onSelectionChange: fn(), onAction: fn() } as VirtualListProps<unknown>,
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

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    const props = ["display", "height", "overflow-y", "box-sizing", "padding-left", "font-size", "position"];
    for (const selector of [".cy-virtual-list", ".cy-virtual-list-row"]) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, props);
      await expect({ selector, ...hostile }).toEqual({ selector, ...clean });
    }
  },
};
