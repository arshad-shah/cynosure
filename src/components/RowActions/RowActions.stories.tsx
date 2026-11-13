import type { Meta, StoryObj } from "@storybook/react-vite";
import { type CSSProperties, useRef, useState } from "react";
import { expect, waitFor, within } from "storybook/test";
import { copy, edit, trash } from "../../icons/index.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { realHover } from "../../test/hover.js";
import { Button } from "../Button/Button.js";
import { IconButton } from "../IconButton/IconButton.js";
import { Menu } from "../Menu/Menu.js";
import { RowActions } from "./RowActions.js";

const row: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  inlineSize: 360,
  padding: 4,
  border: "var(--cy-border-width) solid var(--cy-color-line)",
};

const buttons = (
  <>
    <IconButton icon={edit} label="Rename" variant="ghost" size="sm" />
    <IconButton icon={trash} label="Delete" variant="ghost" size="sm" />
  </>
);

const meta = {
  title: "Components/RowActions",
  component: RowActions,
  // Moves the real pointer (the reveal on hover).
  tags: ["serial"],
  args: { children: buttons, shown: false },
  argTypes: {
    shown: { control: "boolean" },
    tabbable: { control: false },
    children: { control: false },
  },
  render: (args) => (
    <div style={row} data-testid="row">
      <span style={{ flex: 1 }}>report.pdf</span>
      <RowActions {...args} />
    </div>
  ),
} satisfies Meta<typeof RowActions>;
export default meta;
type Story = StoryObj<typeof meta>;

const actionsIn = (root: HTMLElement) => root.querySelector(".cy-row-actions") as HTMLElement;
const opacity = (el: HTMLElement) => getComputedStyle(el).opacity;
const hover = () => matchMedia("(hover: hover)").matches;

export const ShownWhileTheRowIsHovered: Story = {
  tags: ["visual", "!dev"],
  play: async ({ canvas, canvasElement }) => {
    const actions = actionsIn(canvasElement);
    if (!(await realHover(null)) || !hover()) return;
    // Out of the way until the row (the element holding them) is pointed at; in place, so nothing moves.
    await waitFor(() => expect(opacity(actions)).toBe("0"));
    const before = actions.getBoundingClientRect();
    await realHover(canvas.getByText("report.pdf"));
    await waitFor(() => expect(opacity(actions)).toBe("1"));
    await expect(actions.getBoundingClientRect()).toEqual(before);
    // Pointing at the buttons themselves keeps them shown, and they stay pressable.
    await realHover(canvas.getByRole("button", { name: "Delete" }));
    await expect(opacity(actions)).toBe("1");
    await realHover(null);
    await waitFor(() => expect(opacity(actions)).toBe("0"));
  },
};

export const ShownWhileTheRowHoldsFocus: Story = {
  render: (args) => (
    <div style={row}>
      <Button size="sm">report.pdf</Button>
      <RowActions {...args} />
    </div>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    const actions = actionsIn(canvasElement);
    if (hover()) await waitFor(() => expect(opacity(actions)).toBe("0"));
    // Focus on the row's own control reveals them, and Tab reaches them: hidden, they are still focusable.
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "report.pdf" })).toHaveFocus();
    await waitFor(() => expect(opacity(actions)).toBe("1"));
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Rename" })).toHaveFocus();
    await expect(opacity(actions)).toBe("1");
    await userEvent.tab({ shift: true });
    await userEvent.tab({ shift: true });
    if (hover()) await waitFor(() => expect(opacity(actions)).toBe("0"));
  },
};

export const ShownWhileItsMenuIsOpenOrWhenAsked: Story = {
  args: {
    children: (
      <Menu
        label="More"
        items={[{ value: "copy", label: "Copy", icon: copy }]}
        onSelect={() => {}}
        trigger={(props) => <IconButton {...props} icon={edit} label="More" variant="ghost" size="sm" />}
      />
    ),
  },
  render: (args) => (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={row}>
        <span style={{ flex: 1 }}>with a menu</span>
        <RowActions {...args} />
      </div>
      <div style={row} data-testid="selected">
        <span style={{ flex: 1 }}>selected</span>
        <RowActions shown>{buttons}</RowActions>
      </div>
    </div>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    // `shown` (a selected row) shows them whatever the pointer does.
    await expect(opacity(actionsIn(canvas.getByTestId("selected")))).toBe("1");
    const actions = actionsIn(canvasElement);
    // A menu of theirs open keeps them shown, though focus is in the menu's panel.
    await userEvent.click(canvas.getByRole("button", { name: "More" }));
    await waitFor(() => expect(canvas.getByRole("menu", { name: "More" })).toBeVisible());
    await realHover(null);
    await waitFor(() => expect(opacity(actions)).toBe("1"));
    await new Promise((r) => setTimeout(r, 300));
    await expect(opacity(actions)).toBe("1");
    await userEvent.keyboard("{Escape}");
    await expect(canvas.getByRole("button", { name: "More" })).toHaveFocus();
  },
};

function FollowingTheTabStop() {
  const first = useRef<HTMLButtonElement>(null);
  const second = useRef<HTMLButtonElement>(null);
  const [stop, setStop] = useState(0);
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <Button size="sm" onClick={() => setStop((s) => 1 - s)}>
        Move the Tab stop
      </Button>
      {[first, second].map((ref, i) => (
        <div key={ref === first ? "a" : "b"} style={row} data-testid={`row-${i}`}>
          <Button ref={ref} size="sm" tabIndex={stop === i ? 0 : -1}>
            {`row ${i}`}
          </Button>
          <RowActions tabbable={ref}>{buttons}</RowActions>
        </div>
      ))}
      <div style={row} data-testid="never">
        <span style={{ flex: 1 }}>never</span>
        <RowActions tabbable={false}>{buttons}</RowActions>
      </div>
      <div style={row} data-testid="static">
        <span style={{ flex: 1 }}>a row that cannot be pressed</span>
        <RowActions tabbable={{ current: null }}>{buttons}</RowActions>
      </div>
    </div>
  );
}

export const InTheTabOrderOnlyOnTheTabStopRow: Story = {
  render: () => <FollowingTheTabStop />,
  play: async ({ canvas, userEvent }) => {
    const tabIndexes = (id: string) =>
      within(canvas.getByTestId(id))
        .getAllByRole("button")
        .filter((b) => b.closest(".cy-row-actions"))
        .map((b) => b.tabIndex);
    // Following the row's own control: in the Tab order only while it is the Tab stop.
    await expect(tabIndexes("row-0")).toEqual([0, 0]);
    await expect(tabIndexes("row-1")).toEqual([-1, -1]);
    await expect(tabIndexes("never")).toEqual([-1, -1]);
    // A row with no control of its own keeps them in the Tab order.
    await expect(tabIndexes("static")).toEqual([0, 0]);
    // The Tab stop moves (roving focus changes the control's tabindex): the actions follow.
    await userEvent.click(canvas.getByRole("button", { name: "Move the Tab stop" }));
    await waitFor(() => expect(tabIndexes("row-1")).toEqual([0, 0]));
    await expect(tabIndexes("row-0")).toEqual([-1, -1]);
    // Tab from the Tab stop reaches its actions.
    canvas.getByRole("button", { name: "row 1" }).focus();
    await userEvent.tab();
    await expect(within(canvas.getByTestId("row-1")).getByRole("button", { name: "Rename" })).toHaveFocus();
  },
};

export const TouchShowsThemAlways: Story = {
  tags: ["touch", "!dev"],
  play: async ({ canvas, canvasElement, userEvent }) => {
    // No hover on a touch screen: always shown, and big enough for a finger.
    const actions = actionsIn(canvasElement);
    await expect(opacity(actions)).toBe("1");
    const hit = getComputedStyle(canvas.getByRole("button", { name: "Delete" }), "::before");
    await expect(Number.parseFloat(hit.height)).toBeGreaterThanOrEqual(44);
    await userEvent.pointer({ keys: "[TouchA]", target: canvas.getByRole("button", { name: "Delete" }) });
    await expect(opacity(actions)).toBe("1");
  },
};

export const RightToLeft: Story = {
  render: (args) => (
    <div dir="rtl" style={row}>
      <span style={{ flex: 1 }}>report.pdf</span>
      <RowActions {...args} />
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    // At the row's end, which is its left edge in right-to-left text.
    const actions = actionsIn(canvasElement).getBoundingClientRect();
    await expect(actions.right).toBeLessThan(canvas.getByText("report.pdf").getBoundingClientRect().left + 1);
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    const { clean, hostile } = computeUnderHostileHost(canvasElement, ".cy-row-actions", [
      "display",
      "gap",
      "box-sizing",
      "align-items",
      "background-color",
    ]);
    await expect(hostile).toEqual(clean);
  },
};

export const ARowFurtherUp: Story = {
  tags: ["!dev"],
  render: (args) => (
    <div data-row-actions-host="" style={{ ...row, justifyContent: "space-between" }}>
      <span data-testid="far">avatar</span>
      <div>
        <RowActions {...args} />
      </div>
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const actions = actionsIn(canvasElement);
    if (!(await realHover(null)) || !hover()) return;
    await waitFor(() => expect(opacity(actions)).toBe("0"));
    // The host is the row: pointing anywhere in it shows the actions, though they sit in an inner element.
    await realHover(canvas.getByTestId("far"));
    await waitFor(() => expect(opacity(actions)).toBe("1"));
    await realHover(null);
    await waitFor(() => expect(opacity(actions)).toBe("0"));
  },
};
