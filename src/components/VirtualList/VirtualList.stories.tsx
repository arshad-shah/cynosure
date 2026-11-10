import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { VirtualList, type VirtualListProps } from "./VirtualList.js";

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

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    const props = ["display", "height", "overflow-y", "box-sizing", "padding-left", "font-size", "position"];
    for (const selector of [".cy-virtual-list", ".cy-virtual-list-row"]) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, props);
      await expect({ selector, ...hostile }).toEqual({ selector, ...clean });
    }
  },
};
