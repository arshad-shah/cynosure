import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";
import { expect, fireEvent, fn, waitFor, within } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { Checklist, type ChecklistItem, type ChecklistProps } from "./Checklist.js";

const ITEMS: ChecklistItem[] = [
  { id: "milk", label: "Buy milk", done: false },
  { id: "vet", label: "Call the vet", done: true },
  { id: "bins", label: "Put the bins out", done: false },
];

/** A task's subtasks held by the parent, with the current value shown for the tests. */
function Subtasks(props: Partial<ChecklistProps> & { start?: ChecklistItem[] }) {
  const { start = ITEMS, ...rest } = props;
  const [items, setItems] = useState(start);
  return (
    <>
      <Checklist label="Subtasks" {...rest} items={items} onChange={setItems} />
      <output data-testid="items">
        {JSON.stringify(items.map((i) => (i.done ? `+${i.label}` : i.label)))}
      </output>
    </>
  );
}

const meta = {
  title: "Components/Checklist",
  component: Checklist,
  args: { label: "Subtasks", defaultItems: ITEMS, onChange: fn(), size: "md" },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md"] },
    labelHidden: { control: "boolean" },
    reorderable: { control: "boolean" },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
    maxItems: { control: "number" },
  },
} satisfies Meta<typeof Checklist>;
export default meta;
type Story = StoryObj<typeof meta>;

/** The value the parent holds: names in order, `+` in front of a done row. */
const state = (el: HTMLElement) =>
  JSON.parse((el.querySelector('[data-testid="items"]') as HTMLElement).textContent as string) as string[];
/** The rows on screen, in order, read from the checkboxes. */
const shown = (el: HTMLElement) =>
  [...el.querySelectorAll<HTMLInputElement>('.cy-checklist-row input[type="checkbox"]')].map((box) => {
    const name = (box.closest(".cy-checklist-check") as HTMLElement).textContent as string;
    return box.checked ? `+${name}` : name;
  });

export const Default: Story = {
  tags: ["visual"],
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    // A named group holding a named list of rows; every control is named for its row.
    await expect(canvas.getByRole("group", { name: "Subtasks" })).toBeVisible();
    const list = canvas.getByRole("list", { name: "Subtasks" });
    await expect(list.querySelectorAll(":scope > li")).toHaveLength(3);
    await expect(canvas.getByText("Subtasks")).toBeVisible();
    await expect(canvas.getByRole("checkbox", { name: "Call the vet" })).toBeChecked();
    await expect(canvas.getByRole("button", { name: "Rename Buy milk" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Remove Buy milk" })).toBeVisible();
    await expect(canvas.getByRole("textbox", { name: "Add an item" })).toHaveAttribute(
      "placeholder",
      "Add an item",
    );
    await expect(canvas.getByRole("button", { name: "Add" })).toBeVisible();
    // Uncontrolled: a tick by pointer shows, and the parent hears the full list.
    const milk = canvas.getByRole("checkbox", { name: "Buy milk" });
    await userEvent.click(canvas.getByText("Buy milk"));
    await expect(milk).toBeChecked();
    await expect(args.onChange).toHaveBeenLastCalledWith([
      { id: "milk", label: "Buy milk", done: true },
      ...ITEMS.slice(1),
    ]);
    // Space on the checkbox unticks it.
    milk.focus();
    await userEvent.keyboard(" ");
    await expect(milk).not.toBeChecked();
    await expect(args.onChange).toHaveBeenLastCalledWith(ITEMS);
    await expect(shown(canvasElement)).toEqual(["Buy milk", "+Call the vet", "Put the bins out"]);
    // Done rows are struck through (by Checkbox); the others are not.
    const line = (name: string) => getComputedStyle(canvas.getByText(name)).textDecorationLine;
    await expect(line("Call the vet")).toBe("line-through");
    await expect(line("Buy milk")).toBe("none");
  },
};

export const AddWithEnterKeepsFocus: Story = {
  args: { createId: fn(() => "new-1") },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const field = canvas.getByRole("textbox", { name: "Add an item" });
    await userEvent.click(field);
    await userEvent.keyboard("  Water the plants {Enter}");
    // The name is trimmed, the new row is not done and takes its id from createId.
    await expect(args.onChange).toHaveBeenLastCalledWith([
      ...ITEMS,
      { id: "new-1", label: "Water the plants", done: false },
    ]);
    await expect(canvas.getByRole("checkbox", { name: "Water the plants" })).not.toBeChecked();
    // The field is empty and still focused, ready for the next row.
    await expect(field).toHaveValue("");
    await waitFor(() => expect(field).toHaveFocus());
    // Enter on an empty or blank field adds nothing.
    await userEvent.keyboard("{Enter}   {Enter}");
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await expect(shown(canvasElement)).toHaveLength(4);
  },
};

export const AddWithTheButton: Story = {
  render: () => <Subtasks />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const field = canvas.getByRole("textbox", { name: "Add an item" });
    const add = canvas.getByRole("button", { name: "Add" });
    // Nothing typed: the button adds nothing.
    await userEvent.click(add);
    await expect(state(canvasElement)).toHaveLength(3);
    await userEvent.type(field, "Water the plants");
    await userEvent.click(add);
    await expect(state(canvasElement)).toEqual([
      "Buy milk",
      "+Call the vet",
      "Put the bins out",
      "Water the plants",
    ]);
    // Focus goes back to the field for the next row.
    await waitFor(() => expect(field).toHaveFocus());
    await expect(field).toHaveValue("");
    // Rows added without createId get different ids, so each can be removed on its own.
    await userEvent.keyboard("Feed the cat{Enter}");
    await userEvent.click(canvas.getByRole("button", { name: "Remove Water the plants" }));
    await expect(state(canvasElement)).toEqual([
      "Buy milk",
      "+Call the vet",
      "Put the bins out",
      "Feed the cat",
    ]);
  },
};

export const NewIdsWithoutRandomUuid: Story = {
  render: () => <Subtasks start={[]} />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    // Pages served without HTTPS have no crypto.randomUUID: rows still get ids of their own.
    Object.defineProperty(crypto, "randomUUID", { value: undefined, configurable: true });
    try {
      await userEvent.type(canvas.getByRole("textbox", { name: "Add an item" }), "One{Enter}Two{Enter}");
    } finally {
      Reflect.deleteProperty(crypto, "randomUUID");
    }
    await userEvent.click(canvas.getByRole("button", { name: "Remove One" }));
    await expect(state(canvasElement)).toEqual(["Two"]);
  },
};

/** What is around the list: a form that could be submitted, a dialog that closes on Escape. */
const submitted = fn();
const escaped = fn();

export const EnterDoesNotSubmitAForm: Story = {
  render: () => (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submitted();
      }}
    >
      <Checklist label="Subtasks" defaultItems={ITEMS} />
    </form>
  ),
  play: async ({ canvas, userEvent }) => {
    submitted.mockClear();
    await userEvent.type(canvas.getByRole("textbox", { name: "Add an item" }), "Water the plants{Enter}");
    await expect(canvas.getByRole("checkbox", { name: "Water the plants" })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Rename Buy milk" }));
    await userEvent.keyboard("Buy oat milk{Enter}");
    await expect(canvas.getByRole("checkbox", { name: "Buy oat milk" })).toBeInTheDocument();
    await expect(submitted).not.toHaveBeenCalled();
  },
};

export const ComposingEnterIsLeftToTheInputMethod: Story = {
  play: async ({ args, canvas, userEvent }) => {
    // While an input method is composing, Enter picks a candidate: it neither adds nor saves.
    const field = canvas.getByRole("textbox", { name: "Add an item" });
    await userEvent.type(field, "Water");
    fireEvent.keyDown(field, { key: "Enter", keyCode: 229 });
    await expect(args.onChange).not.toHaveBeenCalled();
    await userEvent.click(canvas.getByRole("button", { name: "Rename Buy milk" }));
    const rename = canvas.getByRole("textbox", { name: "Rename Buy milk" });
    fireEvent.keyDown(rename, { key: "Enter", keyCode: 229 });
    await expect(rename).toHaveFocus();
    // Other keys type as usual.
    await userEvent.keyboard("Buy oat milk");
    await expect(rename).toHaveValue("Buy oat milk");
  },
};

export const RenameInPlace: Story = {
  render: () => <Subtasks />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Rename Buy milk" }));
    // The name becomes a focused field with the old name selected, so typing replaces it.
    const field = canvas.getByRole("textbox", { name: "Rename Buy milk" }) as HTMLInputElement;
    await waitFor(() => expect(field).toHaveFocus());
    await expect(field).toHaveValue("Buy milk");
    await expect([field.selectionStart, field.selectionEnd]).toEqual([0, 8]);
    // The checkbox stays, still named for the row, and the rename button steps aside.
    await expect(canvas.getByRole("checkbox", { name: "Buy milk" })).toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: "Rename Buy milk" })).toBeNull();
    await userEvent.keyboard(" Buy oat milk {Enter}");
    // Enter saves the trimmed name; focus returns to the row's rename button, now named for the new name.
    await expect(state(canvasElement)[0]).toBe("Buy oat milk");
    await expect(canvas.queryByRole("textbox", { name: /Rename/ })).toBeNull();
    await waitFor(() => expect(canvas.getByRole("button", { name: "Rename Buy oat milk" })).toHaveFocus());
    await expect(canvas.getByRole("button", { name: "Remove Buy oat milk" })).toBeVisible();
    // The keyboard alone: Enter on the rename button opens the field.
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(canvas.getByRole("textbox", { name: "Rename Buy oat milk" })).toHaveFocus());
    await userEvent.keyboard("Buy soy milk{Enter}");
    await expect(state(canvasElement)[0]).toBe("Buy soy milk");
  },
};

export const EscapeCancelsARename: Story = {
  render: (args) => (
    // biome-ignore lint/a11y/noStaticElementInteractions: stands in for a dialog that closes on Escape
    <div onKeyDown={(event) => event.key === "Escape" && escaped()}>
      <Checklist {...args} />
    </div>
  ),
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    escaped.mockClear();
    await userEvent.click(canvas.getByRole("button", { name: "Rename Buy milk" }));
    await userEvent.keyboard("Something else{Escape}");
    await expect(shown(canvasElement)[0]).toBe("Buy milk");
    await expect(args.onChange).not.toHaveBeenCalled();
    await waitFor(() => expect(canvas.getByRole("button", { name: "Rename Buy milk" })).toHaveFocus());
    // Escape ended the rename only: whatever is around the list (a dialog) did not hear it.
    await expect(escaped).not.toHaveBeenCalled();
    // The next rename saves again.
    await userEvent.keyboard("{Enter}Buy oat milk{Enter}");
    await expect(shown(canvasElement)[0]).toBe("Buy oat milk");
  },
};

export const LeavingTheFieldSaves: Story = {
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Rename Buy milk" }));
    await userEvent.keyboard("Buy oat milk");
    // Pressing somewhere else saves and leaves focus where the person put it.
    const add = canvas.getByRole("textbox", { name: "Add an item" });
    await userEvent.click(add);
    await expect(shown(canvasElement)[0]).toBe("Buy oat milk");
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await expect(add).toHaveFocus();
    // Tab saves too, and moves on to the row's next control.
    await userEvent.click(canvas.getByRole("button", { name: "Rename Put the bins out" }));
    await userEvent.keyboard("Bins");
    await userEvent.tab();
    await expect(shown(canvasElement)[2]).toBe("Bins");
    await waitFor(() => expect(canvas.getByRole("button", { name: "Remove Bins" })).toHaveFocus());
  },
};

export const AnEmptyNameKeepsTheOldOne: Story = {
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Rename Buy milk" }));
    await userEvent.keyboard("{Backspace}{Enter}");
    await expect(shown(canvasElement)).toEqual(["Buy milk", "+Call the vet", "Put the bins out"]);
    // Blank counts as empty, and saving the same name is not a change.
    await userEvent.keyboard("{Enter}   {Enter}");
    await userEvent.keyboard("{Enter}Buy milk{Enter}");
    await expect(shown(canvasElement)[0]).toBe("Buy milk");
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const RemoveMovesFocus: Story = {
  render: () => <Subtasks />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    // The row that takes the removed row's place gets focus, on its checkbox.
    await userEvent.click(canvas.getByRole("button", { name: "Remove Buy milk" }));
    await expect(state(canvasElement)).toEqual(["+Call the vet", "Put the bins out"]);
    await waitFor(() => expect(canvas.getByRole("checkbox", { name: "Call the vet" })).toHaveFocus());
    // Removing the last row focuses the one before it.
    await userEvent.click(canvas.getByRole("button", { name: "Remove Put the bins out" }));
    await waitFor(() => expect(canvas.getByRole("checkbox", { name: "Call the vet" })).toHaveFocus());
    // With the keyboard, and with no row left: the add field, and no empty list.
    canvas.getByRole("button", { name: "Remove Call the vet" }).focus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(canvas.getByRole("textbox", { name: "Add an item" })).toHaveFocus());
    await expect(canvas.queryByRole("list")).toBeNull();
    await expect(state(canvasElement)).toEqual([]);
  },
};

export const ControlledByTheParent: Story = {
  render: (args) => <Checklist label="Subtasks" items={ITEMS} onChange={args.onChange} />,
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    // The parent is told, and nothing changes until it passes new items.
    await userEvent.click(canvas.getByRole("checkbox", { name: "Buy milk" }));
    await expect(args.onChange).toHaveBeenLastCalledWith([
      { id: "milk", label: "Buy milk", done: true },
      ...ITEMS.slice(1),
    ]);
    await userEvent.click(canvas.getByRole("button", { name: "Remove Call the vet" }));
    await expect(args.onChange).toHaveBeenLastCalledWith([ITEMS[0], ITEMS[2]]);
    await expect(shown(canvasElement)).toEqual(["Buy milk", "+Call the vet", "Put the bins out"]);
  },
};

export const MaxItems: Story = {
  render: () => <Subtasks maxItems={4} />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const field = canvas.getByRole("textbox", { name: "Add an item" });
    const add = canvas.getByRole("button", { name: "Add" });
    await expect(field).toBeEnabled();
    await userEvent.type(field, "Water the plants{Enter}");
    // Full: the add field and button turn off, and focus moves to the row just added.
    await expect(field).toBeDisabled();
    await expect(add).toBeDisabled();
    await waitFor(() => expect(canvas.getByRole("checkbox", { name: "Water the plants" })).toHaveFocus());
    // Room again after a row goes.
    await userEvent.click(canvas.getByRole("button", { name: "Remove Buy milk" }));
    await expect(field).toBeEnabled();
    await expect(add).toBeEnabled();
    await expect(state(canvasElement)).toHaveLength(3);
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    for (const box of canvas.getAllByRole("checkbox")) await expect(box).toBeDisabled();
    for (const button of canvas.getAllByRole("button")) await expect(button).toBeDisabled();
    await expect(canvas.getByRole("textbox", { name: "Add an item" })).toBeDisabled();
    await userEvent.click(canvas.getByText("Buy milk"));
    await expect(shown(canvasElement)[0]).toBe("Buy milk");
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const ReadOnly: Story = {
  args: { readOnly: true, reorderable: true },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    // Only the rows: nothing to add, rename, remove or move with.
    await expect(canvas.queryAllByRole("button")).toHaveLength(0);
    await expect(canvas.queryByRole("textbox")).toBeNull();
    await expect(canvas.getByRole("list", { name: "Subtasks" })).toBeVisible();
    // The checkboxes can be reached and read, and a press leaves them as they were.
    await userEvent.click(canvas.getByText("Buy milk"));
    const vet = canvas.getByRole("checkbox", { name: "Call the vet" });
    vet.focus();
    await userEvent.keyboard(" ");
    await expect(shown(canvasElement)).toEqual(["Buy milk", "+Call the vet", "Put the bins out"]);
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const LabelsOverride: Story = {
  args: {
    label: "Sous-tâches",
    labels: {
      add: "Ajouter un élément",
      addButton: "Ajouter",
      rename: (name) => `Renommer ${name}`,
      remove: (name) => `Supprimer ${name}`,
    },
  },
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByRole("list", { name: "Sous-tâches" })).toBeVisible();
    await expect(canvas.getByRole("textbox", { name: "Ajouter un élément" })).toHaveAttribute(
      "placeholder",
      "Ajouter un élément",
    );
    await expect(canvas.getByRole("button", { name: "Ajouter" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Supprimer Buy milk" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Renommer Buy milk" }));
    await expect(canvas.getByRole("textbox", { name: "Renommer Buy milk" })).toHaveFocus();
  },
};

function Compact() {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <Checklist
      ref={ref}
      label="Subtasks"
      labelHidden
      size="sm"
      defaultItems={ITEMS}
      className="host-list"
      style={{ maxInlineSize: 320 }}
      onChange={() => ref.current?.setAttribute("data-changed", "")}
    />
  );
}

export const SmallWithAHiddenLabel: Story = {
  render: () => (
    <>
      <Compact />
      <Checklist label="Regular" defaultItems={ITEMS} />
    </>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    const [small, regular] = [...canvasElement.querySelectorAll<HTMLElement>(".cy-checklist")] as [
      HTMLElement,
      HTMLElement,
    ];
    // className and style land on the root, which is also what the ref points at.
    await expect(small).toHaveClass("host-list");
    await expect(small.style.maxInlineSize).toBe("320px");
    // The hidden label still names the list and takes no room.
    await expect(canvas.getByRole("list", { name: "Subtasks" })).toBeVisible();
    const label = within(small).getByText("Subtasks");
    await expect(label.getBoundingClientRect().width).toBeLessThanOrEqual(2);
    // sm is smaller than md: text, and the buttons.
    const font = (root: HTMLElement) =>
      Number.parseFloat(getComputedStyle(within(root).getByText("Buy milk")).fontSize);
    const button = (root: HTMLElement) =>
      (root.querySelector(".cy-checklist-rename") as HTMLElement).getBoundingClientRect().height;
    await expect(font(small)).toBeLessThan(font(regular));
    await expect(button(small)).toBeLessThan(button(regular));
    await userEvent.click(small.querySelector('input[type="checkbox"]') as HTMLElement);
    await expect(small).toHaveAttribute("data-changed");
  },
};

export const LongNamesWrap: Story = {
  render: () => (
    <div style={{ inlineSize: 280 }}>
      <Checklist
        label="Subtasks"
        defaultItems={[
          {
            id: "long",
            label: `Renew the ${"very".repeat(30)} long insurance policy before Friday`,
            done: false,
          },
        ]}
      />
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    // The name wraps inside the row, and the buttons stay within the list.
    const root = canvasElement.querySelector(".cy-checklist") as HTMLElement;
    const remove = canvas.getByRole("button", { name: /^Remove/ });
    await expect(remove.getBoundingClientRect().right).toBeLessThanOrEqual(
      root.getBoundingClientRect().right + 1,
    );
    await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth + 1);
  },
};

export const RightToLeft: Story = {
  render: (args) => (
    <div dir="rtl">
      <Checklist {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    // The row mirrors: checkbox at the right, then the name, then the buttons at the left.
    const left = (el: HTMLElement) => el.getBoundingClientRect().left;
    const box = canvas.getByRole("checkbox", { name: "Buy milk" });
    const rename = canvas.getByRole("button", { name: "Rename Buy milk" });
    const remove = canvas.getByRole("button", { name: "Remove Buy milk" });
    await expect(left(remove)).toBeLessThan(left(rename));
    await expect(left(rename)).toBeLessThan(left(canvas.getByText("Buy milk")));
    await expect(left(canvas.getByText("Buy milk"))).toBeLessThan(left(box));
    await expect(left(canvas.getByRole("button", { name: "Add" }))).toBeLessThan(
      left(canvas.getByRole("textbox", { name: "Add an item" })),
    );
  },
};

/** Presses a grip, moves the pointer to the vertical middle of row `to` (index), and releases. */
function dragRow(canvasElement: HTMLElement, handle: HTMLElement, to: number, pointerType = "mouse") {
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
  const x = start.left + 4;
  handle.dispatchEvent(new PointerEvent("pointerdown", { ...init, clientX: x, clientY: start.top + 4 }));
  const target = ([...canvasElement.querySelectorAll("li")][to] as Element).getBoundingClientRect();
  const y = to === 0 ? target.top + 2 : target.bottom - 2;
  handle.dispatchEvent(new PointerEvent("pointermove", { ...init, clientX: x, clientY: y }));
  handle.dispatchEvent(new PointerEvent("pointerup", { ...init, buttons: 0, clientX: x, clientY: y }));
}

export const Reorderable: Story = {
  tags: ["visual"],
  render: () => <Subtasks reorderable />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    await expect(canvas.getByRole("list", { name: "Subtasks" })).toBeVisible();
    // Keyboard: Space picks the row up, the arrows move it, Space drops it.
    canvas.getByRole("button", { name: "Move Put the bins out" }).focus();
    await userEvent.keyboard(" {ArrowUp}{ArrowUp} ");
    await expect(state(canvasElement)).toEqual(["Put the bins out", "Buy milk", "+Call the vet"]);
    // Pointer: drag the grip.
    dragRow(canvasElement, canvas.getByRole("button", { name: "Move Put the bins out" }), 2);
    await waitFor(() =>
      expect(state(canvasElement)).toEqual(["Buy milk", "+Call the vet", "Put the bins out"]),
    );
    // Rows still tick, rename (spaces type, they do not pick the row up) and remove.
    await userEvent.click(canvas.getByRole("checkbox", { name: "Buy milk" }));
    await userEvent.click(canvas.getByRole("button", { name: "Rename Buy milk" }));
    await userEvent.keyboard("Buy oat milk{Enter}");
    await expect(state(canvasElement)[0]).toBe("+Buy oat milk");
    await expect(canvas.getByRole("button", { name: "Move Buy oat milk" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Remove Buy oat milk" }));
    await waitFor(() => expect(canvas.getByRole("checkbox", { name: "Call the vet" })).toHaveFocus());
  },
};

export const ReorderableDisabled: Story = {
  args: { reorderable: true, disabled: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Move Buy milk" })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "Remove Buy milk" })).toBeDisabled();
  },
};

export const TouchRows: Story = {
  tags: ["touch", "!dev"],
  render: () => <Subtasks reorderable />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    // Every pressable part has a 44px hit area on a coarse pointer.
    const hit = (el: Element) => getComputedStyle(el, "::before");
    for (const name of ["Rename Buy milk", "Remove Buy milk", "Add", "Move Buy milk"]) {
      const button = canvas.getByRole("button", { name });
      await expect(Number.parseFloat(hit(button).width)).toBeGreaterThanOrEqual(44);
      await expect(Number.parseFloat(hit(button).height)).toBeGreaterThanOrEqual(44);
    }
    const row = canvas.getByText("Buy milk").closest(".cy-checklist-check") as HTMLElement;
    await expect(row.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    // A tap ticks and unticks, taps rename and add, and a finger drags the grip.
    await userEvent.pointer({ keys: "[TouchA]", target: canvas.getByText("Buy milk") });
    await expect(state(canvasElement)[0]).toBe("+Buy milk");
    await userEvent.pointer({ keys: "[TouchA]", target: canvas.getByText("Buy milk") });
    await expect(state(canvasElement)[0]).toBe("Buy milk");
    await userEvent.pointer({
      keys: "[TouchA]",
      target: canvas.getByRole("button", { name: "Rename Buy milk" }),
    });
    await waitFor(() => expect(canvas.getByRole("textbox", { name: "Rename Buy milk" })).toHaveFocus());
    await userEvent.keyboard("Buy oat milk");
    const field = canvas.getByRole("textbox", { name: "Add an item" });
    await userEvent.pointer({ keys: "[TouchA]", target: field });
    await expect(state(canvasElement)[0]).toBe("Buy oat milk");
    await userEvent.keyboard("Water the plants");
    await userEvent.pointer({ keys: "[TouchA]", target: canvas.getByRole("button", { name: "Add" }) });
    await expect(state(canvasElement)).toHaveLength(4);
    await userEvent.pointer({
      keys: "[TouchA]",
      target: canvas.getByRole("button", { name: "Remove Call the vet" }),
    });
    await expect(state(canvasElement)).toEqual(["Buy oat milk", "Put the bins out", "Water the plants"]);
    dragRow(canvasElement, canvas.getByRole("button", { name: "Move Buy oat milk" }), 2, "touch");
    await waitFor(() =>
      expect(state(canvasElement)).toEqual(["Put the bins out", "Water the plants", "Buy oat milk"]),
    );
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Rename Buy milk" }));
    const props = [
      "display",
      "gap",
      "font-size",
      "box-sizing",
      "align-items",
      "margin",
      "padding",
      "line-height",
    ];
    for (const selector of [
      ".cy-checklist",
      ".cy-checklist-body",
      ".cy-checklist-items",
      ".cy-checklist-item",
      ".cy-checklist-row",
      ".cy-checklist-add",
    ]) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, props);
      await expect({ selector, ...hostile }).toEqual({ selector, ...clean });
    }
    const { clean, hostile } = computeUnderHostileHost(canvasElement, ".cy-checklist", [
      "color",
      "font-family",
      "font-weight",
      "letter-spacing",
      "text-transform",
    ]);
    await expect(hostile).toEqual(clean);
  },
};
