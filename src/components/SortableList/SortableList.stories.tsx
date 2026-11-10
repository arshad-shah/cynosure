import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { Badge } from "../Badge/Badge.js";
import { Button } from "../Button/Button.js";
import { Inline } from "../Inline/Inline.js";
import { type SortableItem, SortableList } from "./SortableList.js";

const ITEMS: SortableItem[] = [
  { id: "inbox", label: "Inbox" },
  {
    id: "docs",
    label: "Docs",
    content: (
      <Inline gap="3">
        Docs <Badge>12</Badge>
      </Inline>
    ),
  },
  { id: "drafts", label: "Drafts" },
  { id: "archive", label: "Archive" },
];

const meta = {
  title: "Components/SortableList",
  component: SortableList,
  args: { label: "Sidebar order", defaultItems: ITEMS, onReorder: fn() },
  argTypes: { size: { control: "inline-radio", options: ["sm", "md", "lg"] } },
  decorators: [(Story) => <div style={{ maxWidth: 360 }}>{Story()}</div>],
} satisfies Meta<typeof SortableList>;
export default meta;
type Story = StoryObj<typeof meta>;

const order = (el: HTMLElement) => [...el.querySelectorAll("li")].map((li) => li.dataset.id);

export const ARowPerItemWithAHandle: Story = {
  tags: ["visual"],
  play: async ({ canvas }) => {
    const list = canvas.getByRole("list", { name: "Sidebar order" });
    await expect(list.querySelectorAll("li")).toHaveLength(4);
    const handle = canvas.getByRole("button", { name: "Move Docs" });
    await expect(handle).toHaveAccessibleDescription(
      /Press Space to pick up, the arrow keys to move, Space to drop, Escape to cancel\./,
    );
    await expect(handle).toHaveAttribute("aria-pressed", "false");
  },
};

export const KeyboardPicksUpMovesAndDrops: Story = {
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const status = canvas.getByRole("status");
    canvas.getByRole("button", { name: "Move Inbox" }).focus();
    await userEvent.keyboard(" ");
    await expect(canvas.getByRole("button", { name: "Move Inbox" })).toHaveAttribute("aria-pressed", "true");
    await expect(status).toHaveTextContent("Inbox picked up. Position 1 of 4.");
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    await expect(order(canvasElement)).toEqual(["docs", "drafts", "inbox", "archive"]);
    await expect(status).toHaveTextContent("Inbox moved to position 3 of 4.");
    // The handle keeps focus as its row moves, and its tooltip follows it.
    const moved = canvas.getByRole("button", { name: "Move Inbox" });
    await waitFor(() => expect(moved).toHaveFocus());
    const tip = document.getElementById(
      (moved.getAttribute("aria-describedby") ?? "").split(" ").at(-1) as string,
    );
    await waitFor(() => {
      const t = tip?.getBoundingClientRect();
      const h = moved.getBoundingClientRect();
      expect(Math.abs((t?.top ?? 0) + (t?.height ?? 0) / 2 - (h.top + h.height / 2))).toBeLessThan(4);
    });
    // Nothing is committed until the drop.
    await expect(args.onReorder).not.toHaveBeenCalled();
    await userEvent.keyboard(" ");
    await expect(status).toHaveTextContent("Inbox dropped at position 3 of 4.");
    await expect(args.onReorder).toHaveBeenCalledTimes(1);
    await expect(
      (args.onReorder as ReturnType<typeof fn>).mock.calls[0]?.[0].map((i: SortableItem) => i.id),
    ).toEqual(["docs", "drafts", "inbox", "archive"]);
    // Home and End jump to the ends; at an end they do nothing, nor do other keys.
    await userEvent.keyboard("{Enter}{End}{End}a{Enter}");
    await expect(order(canvasElement)).toEqual(["docs", "drafts", "archive", "inbox"]);
    await userEvent.keyboard("{Enter}{Home}{Enter}");
    await expect(order(canvasElement)).toEqual(["inbox", "docs", "drafts", "archive"]);
  },
};

export const EscapeCancels: Story = {
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    canvas.getByRole("button", { name: "Move Drafts" }).focus();
    await userEvent.keyboard(" {ArrowUp}{ArrowUp}");
    await expect(order(canvasElement)).toEqual(["drafts", "inbox", "docs", "archive"]);
    await userEvent.keyboard("{Escape}");
    await expect(order(canvasElement)).toEqual(["inbox", "docs", "drafts", "archive"]);
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Move cancelled. Drafts is back where it was.",
    );
    await expect(args.onReorder).not.toHaveBeenCalled();
    // Arrow keys do nothing when nothing is picked up, and the ends stop a move.
    await userEvent.keyboard("{ArrowDown}");
    await expect(order(canvasElement)).toEqual(["inbox", "docs", "drafts", "archive"]);
  },
};

export const TabDropsWhereItIs: Story = {
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    canvas.getByRole("button", { name: "Move Archive" }).focus();
    await userEvent.keyboard(" {ArrowUp}");
    await userEvent.tab();
    await expect(order(canvasElement)).toEqual(["inbox", "docs", "archive", "drafts"]);
    await expect(args.onReorder).toHaveBeenCalledTimes(1);
  },
};

/** Presses a handle, moves the pointer to the vertical middle of row `to` (index), and releases. */
function dragRow(canvasElement: HTMLElement, handleName: string, to: number, pointerType = "mouse") {
  const handle = [...canvasElement.querySelectorAll("button")].find(
    (b) => b.getAttribute("aria-label") === handleName,
  ) as HTMLElement;
  const rows = () => [...canvasElement.querySelectorAll("li")];
  const init = {
    bubbles: true,
    cancelable: true,
    pointerId: 5,
    pointerType,
    isPrimary: true,
    button: 0,
    buttons: 1,
  };
  const start = handle.getBoundingClientRect();
  handle.dispatchEvent(
    new PointerEvent("pointerdown", { ...init, clientX: start.left + 4, clientY: start.top + 4 }),
  );
  const target = (rows()[to] as Element).getBoundingClientRect();
  const y = to === 0 ? target.top + 2 : target.bottom - 2;
  handle.dispatchEvent(new PointerEvent("pointermove", { ...init, clientX: start.left + 4, clientY: y }));
  handle.dispatchEvent(
    new PointerEvent("pointerup", { ...init, buttons: 0, clientX: start.left + 4, clientY: y }),
  );
}

export const DragWithThePointer: Story = {
  play: async ({ args, canvasElement }) => {
    dragRow(canvasElement, "Move Inbox", 2);
    await waitFor(() => expect(order(canvasElement)).toEqual(["docs", "drafts", "inbox", "archive"]));
    await expect(args.onReorder).toHaveBeenCalledTimes(1);
    dragRow(canvasElement, "Move Archive", 0);
    await waitFor(() => expect(order(canvasElement)).toEqual(["archive", "docs", "drafts", "inbox"]));
  },
};

export const TouchDrag: Story = {
  tags: ["touch", "!dev"],
  play: async ({ canvas, canvasElement }) => {
    const handle = canvas.getByRole("button", { name: "Move Inbox" });
    await expect(Number.parseFloat(getComputedStyle(handle, "::before").height)).toBeGreaterThanOrEqual(44);
    // The handle does not scroll the page while dragging.
    await expect(getComputedStyle(handle).touchAction).toBe("none");
    dragRow(canvasElement, "Move Inbox", 3, "touch");
    await waitFor(() => expect(order(canvasElement)).toEqual(["docs", "drafts", "archive", "inbox"]));
  },
};

export const EmptyAndStyled: Story = {
  render: () => <SortableList label="Nothing yet" className="host-sortable" />,
  play: async ({ canvas, canvasElement }) => {
    await expect(canvasElement.querySelector(".host-sortable")).not.toBeNull();
    await expect(canvas.getByRole("list", { name: "Nothing yet" }).children).toHaveLength(0);
  },
};

export const PointerEdges: Story = {
  play: async ({ args, canvas, canvasElement }) => {
    const handle = canvas.getByRole("button", { name: "Move Docs" });
    const box = handle.getBoundingClientRect();
    const fire = (type: string, extra: object) =>
      handle.dispatchEvent(
        new PointerEvent(type, {
          bubbles: true,
          cancelable: true,
          pointerId: 8,
          pointerType: "mouse",
          isPrimary: true,
          clientX: box.left + 4,
          ...extra,
        }),
      );
    // A right-button press does not start a move.
    fire("pointerdown", { button: 2, buttons: 2, clientY: box.top + 4 });
    fire("pointermove", { buttons: 2, clientY: box.top + 200 });
    fire("pointerup", { button: 2, clientY: box.top + 200 });
    await expect(order(canvasElement)).toEqual(["inbox", "docs", "drafts", "archive"]);
    // Dragging onto the lower half of the last row puts it last.
    fire("pointerdown", { button: 0, buttons: 1, clientY: box.top + 4 });
    const list = canvas.getByRole("list").getBoundingClientRect();
    fire("pointermove", { buttons: 1, clientY: box.top + 20 });
    fire("pointermove", { buttons: 1, clientY: list.bottom - 4 });
    await waitFor(() => expect(order(canvasElement)).toEqual(["inbox", "drafts", "archive", "docs"]));
    fire("pointerup", { button: 0, clientY: list.bottom - 4 });
    await waitFor(() => expect(args.onReorder).toHaveBeenCalledTimes(1));
    await expect(order(canvasElement)).toEqual(["inbox", "drafts", "archive", "docs"]);
    await expect(canvas.getByRole("status")).toHaveTextContent("Docs dropped at position 4 of 4.");
  },
};

export const KeyEdges: Story = {
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    // While one row is moving by keyboard, Space on another handle does nothing.
    canvas.getByRole("button", { name: "Move Inbox" }).focus();
    await userEvent.keyboard(" ");
    canvas.getByRole("button", { name: "Move Drafts" }).focus();
    await userEvent.keyboard(" {ArrowDown}");
    await expect(order(canvasElement)).toEqual(["inbox", "docs", "drafts", "archive"]);
    // Picking up and dropping without moving changes nothing and calls nothing.
    canvas.getByRole("button", { name: "Move Inbox" }).focus();
    await userEvent.keyboard(" {ArrowUp} ");
    await expect(args.onReorder).not.toHaveBeenCalled();
  },
};

export const Controlled: Story = {
  render: (args) => {
    function Ordered() {
      const [items, setItems] = useState(ITEMS);
      return (
        <>
          <SortableList {...args} items={items} onReorder={setItems} />
          <Button onClick={() => setItems([...items].reverse())}>Reverse</Button>
        </>
      );
    }
    return <Ordered />;
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Reverse" }));
    await expect(order(canvasElement)).toEqual(["archive", "drafts", "docs", "inbox"]);
    canvas.getByRole("button", { name: "Move Inbox" }).focus();
    await userEvent.keyboard(" {ArrowUp} ");
    await expect(order(canvasElement)).toEqual(["archive", "drafts", "inbox", "docs"]);
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvas, canvasElement }) => {
    await expect(canvas.getByRole("button", { name: "Move Inbox" })).toBeDisabled();
    dragRow(canvasElement, "Move Inbox", 2);
    await expect(order(canvasElement)).toEqual(["inbox", "docs", "drafts", "archive"]);
    await expect(args.onReorder).not.toHaveBeenCalled();
  },
};

export const LabelsOverride: Story = {
  args: {
    labels: {
      handle: (l) => `${l} verschieben`,
      instructions: "Leertaste zum Aufnehmen",
      pickedUp: (l) => `${l} aufgenommen`,
    },
  },
  play: async ({ canvas, userEvent }) => {
    const handle = canvas.getByRole("button", { name: "Docs verschieben" });
    await expect(handle).toHaveAccessibleDescription(/Leertaste zum Aufnehmen/);
    handle.focus();
    await userEvent.keyboard(" ");
    await expect(canvas.getByRole("status")).toHaveTextContent("Docs aufgenommen");
    await userEvent.keyboard("{Escape}");
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    const props = [
      "display",
      "font-size",
      "color",
      "background-color",
      "padding-left",
      "list-style-type",
      "box-sizing",
    ];
    for (const selector of [".cy-sortable-list", ".cy-sortable-list-items", ".cy-sortable-list-item"]) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, props);
      await expect({ selector, ...hostile }).toEqual({ selector, ...clean });
    }
  },
};
