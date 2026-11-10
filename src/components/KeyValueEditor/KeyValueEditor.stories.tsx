import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { KeyValueEditor, type KeyValuePair } from "./KeyValueEditor.js";

const HEADERS: KeyValuePair[] = [
  { id: "a", key: "Accept", value: "application/json" },
  { id: "b", key: "Authorization", value: "Bearer abc", secret: true },
  { id: "c", key: "X-Debug", value: "1", enabled: false },
];

/** A request editor holding the headers, with the current value shown for the tests. */
function Headers(props: {
  start?: KeyValuePair[];
  toggleable?: boolean;
  bulkEdit?: boolean;
  disabled?: boolean;
}) {
  const [pairs, setPairs] = useState(props.start ?? HEADERS);
  return (
    <>
      <KeyValueEditor
        label="Headers"
        pairs={pairs}
        onChange={setPairs}
        {...(props.toggleable === false ? { toggleable: false } : {})}
        {...(props.bulkEdit === false ? { bulkEdit: false } : {})}
        {...(props.disabled ? { disabled: true } : {})}
      />
      <output data-testid="pairs">
        {JSON.stringify(pairs.map((p) => [p.enabled === false ? `#${p.key}` : p.key, p.value]))}
      </output>
    </>
  );
}

const meta = {
  title: "Components/KeyValueEditor",
  component: KeyValueEditor,
  args: { label: "Headers", defaultPairs: HEADERS, onChange: fn() },
  render: () => <Headers />,
} satisfies Meta<typeof KeyValueEditor>;
export default meta;
type Story = StoryObj<typeof meta>;

const state = (el: HTMLElement) =>
  JSON.parse((el.querySelector('[data-testid="pairs"]') as HTMLElement).textContent as string) as [
    string,
    string,
  ][];

export const EditPairs: Story = {
  tags: ["visual"],
  play: async ({ canvas, canvasElement, userEvent }) => {
    await expect(canvas.getByRole("list", { name: "Headers" })).toBeVisible();
    // Each field is named for its row; a secret value is masked.
    const value = canvas.getByRole("textbox", { name: "Value (Accept)" });
    await userEvent.clear(value);
    await userEvent.type(value, "text/html");
    await expect(state(canvasElement)[0]).toEqual(["Accept", "text/html"]);
    await expect(canvas.getByLabelText("Value (Authorization)")).toHaveAttribute("type", "password");
    // Switching a row off keeps it.
    await userEvent.click(canvas.getByRole("checkbox", { name: "Use Accept" }));
    await expect(state(canvasElement)[0]).toEqual(["#Accept", "text/html"]);
    await expect(canvas.getByRole("checkbox", { name: "Use X-Debug" })).not.toBeChecked();
  },
};

export const AddAndRemoveMoveFocus: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Add" }));
    // A new row is named by position until it has a key; focus lands in its key field.
    const key = canvas.getByRole("textbox", { name: "Key (Row 4)" });
    await waitFor(() => expect(key).toHaveFocus());
    await userEvent.keyboard("Cache-Control");
    await expect(canvas.getByRole("button", { name: "Remove Cache-Control" })).toBeVisible();
    // Removing a row focuses the row that took its place, or the one before it.
    await userEvent.click(canvas.getByRole("button", { name: "Remove Authorization" }));
    await waitFor(() => expect(canvas.getByRole("textbox", { name: "Key (X-Debug)" })).toHaveFocus());
    await userEvent.click(canvas.getByRole("button", { name: "Remove Cache-Control" }));
    await waitFor(() => expect(canvas.getByRole("textbox", { name: "Key (X-Debug)" })).toHaveFocus());
    await expect(state(canvasElement).map((p) => p[0])).toEqual(["Accept", "#X-Debug"]);
  },
};

export const RemovingTheLastRowFocusesAdd: Story = {
  render: () => <Headers start={[{ id: "x", key: "Only", value: "1" }]} />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Remove Only" }));
    await waitFor(() => expect(canvas.getByRole("button", { name: "Add" })).toHaveFocus());
    await expect(canvas.queryByRole("list")).toBeNull();
  },
};

export const ReorderWithTheKeyboard: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    canvas.getByRole("button", { name: /Move X-Debug/ }).focus();
    await userEvent.keyboard(" {ArrowUp}{ArrowUp} ");
    await expect(state(canvasElement).map((p) => p[0])).toEqual(["#X-Debug", "Accept", "Authorization"]);
  },
};

export const EditAsText: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const toggle = canvas.getByRole("button", { name: "Edit as text" });
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    const area = canvas.getByRole("textbox", { name: /Headers as text/ });
    await expect(area).toHaveValue("Accept: application/json\nAuthorization: Bearer abc\n# X-Debug: 1");
    await expect(canvas.queryByRole("button", { name: "Add" })).toBeNull();
    // Paste a block of headers: lines become pairs, # switches one off.
    await userEvent.clear(area);
    await userEvent.type(area, "Accept: */*{Enter}Authorization: Bearer xyz{Enter}# Trace: on{Enter}Plain");
    await expect(state(canvasElement)).toEqual([
      ["Accept", "*/*"],
      ["Authorization", "Bearer xyz"],
      ["#Trace", "on"],
      ["Plain", ""],
    ]);
    await userEvent.click(toggle);
    // Back to rows: a key that was secret stays masked, however it was retyped.
    await expect(canvas.getByLabelText("Value (Authorization)")).toHaveAttribute("type", "password");
    await expect(canvas.getByRole("checkbox", { name: "Use Trace" })).not.toBeChecked();
  },
};

export const WithoutTogglesOrText: Story = {
  render: () => <Headers toggleable={false} bulkEdit={false} />,
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole("checkbox")).toBeNull();
    await expect(canvas.queryByRole("button", { name: "Edit as text" })).toBeNull();
  },
};

export const Disabled: Story = {
  render: () => <Headers disabled />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("textbox", { name: "Key (Accept)" })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "Add" })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "Remove Accept" })).toBeDisabled();
  },
};

export const LabelsAndUncontrolled: Story = {
  render: (args) => (
    <KeyValueEditor
      {...args}
      label="Kopfzeilen"
      defaultPairs={[{ id: "z", key: "", value: "" }]}
      size="sm"
      className="product-kv"
      labels={{
        key: "Schlüssel",
        value: "Wert",
        row: (n) => `Zeile ${n}`,
        add: "Hinzufügen",
        remove: (name) => `${name} entfernen`,
        enable: (name) => `${name} verwenden`,
        bulk: "Als Text",
        bulkField: (label) => `${label} als Text`,
      }}
    />
  ),
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    await expect(canvasElement.querySelector(".cy-key-value-editor")).toHaveClass("product-kv");
    await userEvent.type(canvas.getByRole("textbox", { name: "Schlüssel (Zeile 1)" }), "A");
    await expect(args.onChange).toHaveBeenLastCalledWith([{ id: "z", key: "A", value: "" }]);
    await expect(canvas.getByRole("button", { name: "A entfernen" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Als Text" }));
    await expect(canvas.getByRole("textbox", { name: "Kopfzeilen als Text" })).toHaveValue("A: ");
  },
};

export const TouchRows: Story = {
  tags: ["touch", "!dev"],
  play: async ({ canvas }) => {
    const remove = canvas.getByRole("button", { name: "Remove Accept" });
    await expect(Number.parseFloat(getComputedStyle(remove, "::before").width)).toBeGreaterThanOrEqual(44);
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    const props = ["display", "gap", "font-size", "box-sizing", "align-items"];
    for (const selector of [".cy-key-value-editor", ".cy-key-value-editor-row"]) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, props);
      await expect({ selector, ...hostile }).toEqual({ selector, ...clean });
    }
  },
};
