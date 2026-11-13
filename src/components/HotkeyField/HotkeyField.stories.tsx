import type { Meta, StoryObj } from "@storybook/react-vite";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { expect, fn, waitFor } from "storybook/test";
import { useHotkey } from "../../foundations/hotkey.js";
import { createStyleSheet } from "../../styles/inline.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { emulateMedia } from "../../test/media.js";
import { Button } from "../Button/Button.js";
import { TextField } from "../TextField/TextField.js";
import { HotkeyField } from "./HotkeyField.js";

const meta = {
  tags: ["serial"],
  title: "Components/HotkeyField",
  component: HotkeyField,
  args: {
    label: "Command palette",
    defaultValue: "mod+shift+p",
    size: "md",
    onChange: fn(),
    onRecordingChange: fn(),
  },
  argTypes: {
    label: { control: "text" },
    labelHidden: { control: "boolean" },
    description: { control: "text" },
    error: { control: "text" },
    value: { control: "text" },
    defaultValue: { control: "text" },
    recording: { control: "boolean" },
    defaultRecording: { control: "boolean" },
    allowBare: { control: "boolean" },
    name: { control: "text" },
    disabled: { control: "boolean" },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    labels: { control: "object" },
  },
} satisfies Meta<typeof HotkeyField>;
export default meta;
type Story = StoryObj<typeof meta>;

const field = (el: HTMLElement) => el.querySelector(".cy-hotkey-field") as HTMLElement;
const box = (el: ParentNode) => el.querySelector(".cy-hotkey-field-box") as HTMLElement;

export const Default: Story = {
  tags: ["visual"],
  play: async ({ canvas, canvasElement }) => {
    // The group is named by its label; the shortcut shows as key caps (Ctrl off Apple platforms).
    await expect(canvas.getByRole("group", { name: "Command palette" })).toBeVisible();
    await expect(box(canvasElement)).toHaveTextContent(/(Ctrl|Cmd)ShiftP/);
    const record = canvas.getByRole("button", { name: "Record shortcut" });
    await expect(record).toHaveAttribute("aria-pressed", "false");
    // The record button is described by the shortcut, so it is read out with it.
    await expect(record).toHaveAccessibleDescription(/(Control|Command) plus Shift plus P/);
    await expect(canvas.getByRole("button", { name: "Clear shortcut" })).toBeVisible();
  },
};

export const RecordsAChordFromTheKeyboard: Story = {
  render: (args) => (
    <form aria-label="Keys" data-testid="form">
      <HotkeyField {...args} name="palette" />
    </form>
  ),
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const record = canvas.getByRole("button", { name: "Record shortcut" });
    record.focus();
    await userEvent.keyboard("{Enter}");
    await expect(record).toHaveAttribute("aria-pressed", "true");
    await expect(args.onRecordingChange).toHaveBeenLastCalledWith(true);
    await expect(box(canvasElement)).toHaveTextContent("Press a shortcut");
    const status = canvas.getByRole("status");
    await waitFor(() => expect(status).toHaveTextContent("Recording, press a shortcut"));
    // Modifiers alone are not a shortcut: recording waits for the key.
    await userEvent.keyboard("{Control>}{Alt>}");
    await expect(args.onChange).not.toHaveBeenCalled();
    await userEvent.keyboard("k{/Alt}{/Control}");
    await expect(args.onChange).toHaveBeenCalledWith("mod+alt+k");
    await expect(args.onRecordingChange).toHaveBeenLastCalledWith(false);
    await expect(record).toHaveAttribute("aria-pressed", "false");
    await expect(record).toHaveFocus();
    await expect(box(canvasElement)).toHaveTextContent("CtrlAltK");
    await waitFor(() => expect(status).toHaveTextContent(/Shortcut set to .*Control plus Alt plus K/));
    // The form receives the shortcut as useHotkey writes it.
    const data = new FormData(canvas.getByTestId("form") as HTMLFormElement);
    await expect(data.get("palette")).toBe("mod+alt+k");
  },
};

/** An app with its own shortcut, to prove recording keeps keys from it. */
function App(
  props: Partial<Parameters<typeof HotkeyField>[0]> & { onApp: () => void; onDocument: () => void },
) {
  const { onApp, onDocument, ...rest } = props;
  useHotkey("mod+k", onApp);
  useEffect(() => {
    document.addEventListener("keydown", onDocument);
    return () => document.removeEventListener("keydown", onDocument);
  }, [onDocument]);
  return <HotkeyField label="Search" {...rest} />;
}

function Spied() {
  const [hits, setHits] = useState(0);
  const [seen, setSeen] = useState(0);
  const [value, setValue] = useState("");
  return (
    <div>
      <App
        value={value}
        onChange={setValue}
        onApp={() => setHits((h) => h + 1)}
        onDocument={() => setSeen((s) => s + 1)}
      />
      <output data-testid="hits">{hits}</output>
      <output data-testid="seen">{seen}</output>
    </div>
  );
}

export const KeepsKeysFromTheApp: Story = {
  render: () => <Spied />,
  play: async ({ canvas, userEvent }) => {
    const record = canvas.getByRole("button", { name: "Record shortcut" });
    record.focus();
    // Not recording: the app's shortcut works from the field like anywhere else.
    await userEvent.keyboard("{Control>}k{/Control}");
    await expect(canvas.getByTestId("hits")).toHaveTextContent("1");
    const before = Number(canvas.getByTestId("seen").textContent);
    await userEvent.keyboard("{Enter}");
    await expect(record).toHaveAttribute("aria-pressed", "true");
    const seenAtStart = Number(canvas.getByTestId("seen").textContent);
    await expect(seenAtStart).toBe(before + 1);
    // Recording: the chord is the field's. Neither useHotkey nor any document listener sees it.
    await userEvent.keyboard("{Control>}k{/Control}");
    await expect(canvas.getByTestId("hits")).toHaveTextContent("1");
    await expect(canvas.getByTestId("seen")).toHaveTextContent(String(seenAtStart));
    await expect(canvas.getByRole("group", { name: "Search" })).toHaveTextContent(/CtrlK/);
  },
};

export const IgnoresBareKeysUntilAModifierArrives: Story = {
  args: { defaultValue: "" },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    await expect(box(canvasElement)).toHaveTextContent("Not set");
    await expect(canvas.queryByRole("button", { name: "Clear shortcut" })).toBeNull();
    canvas.getByRole("button", { name: "Record shortcut" }).focus();
    await userEvent.keyboard("{Enter}");
    // A letter, Shift+letter and Enter type rather than command: ignored, still recording.
    await userEvent.keyboard("k{Shift>}K{/Shift}{Enter} ");
    await expect(args.onChange).not.toHaveBeenCalled();
    await expect(box(canvasElement)).toHaveTextContent("Press a shortcut");
    // A function key is a shortcut on its own.
    await userEvent.keyboard("{F2}");
    await expect(args.onChange).toHaveBeenCalledWith("f2");
    await expect(box(canvasElement)).toHaveTextContent("F2");
  },
};

export const AllowBareRecordsPlainKeys: Story = {
  args: { defaultValue: "", allowBare: true },
  play: async ({ args, canvas, userEvent }) => {
    canvas.getByRole("button", { name: "Record shortcut" }).focus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard("{Shift>}/{/Shift}");
    await expect(args.onChange).toHaveBeenCalledWith("shift+/");
  },
};

export const EscapeCancelsUnlessModified: Story = {
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const record = canvas.getByRole("button", { name: "Record shortcut" });
    record.focus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard("{Escape}");
    await expect(record).toHaveAttribute("aria-pressed", "false");
    await expect(args.onRecordingChange).toHaveBeenLastCalledWith(false);
    await expect(args.onChange).not.toHaveBeenCalled();
    await expect(box(canvasElement)).toHaveTextContent(/ShiftP/);
    await waitFor(() => expect(canvas.getByRole("status")).toHaveTextContent("Recording cancelled"));
    // With a modifier, Escape is a shortcut like any other.
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard("{Control>}{Escape}{/Control}");
    await expect(args.onChange).toHaveBeenCalledWith("mod+escape");
  },
};

export const RecordsTheLetterUnderOption: Story = {
  args: { defaultValue: "" },
  play: async ({ args, canvas, userEvent }) => {
    const record = canvas.getByRole("button", { name: "Record shortcut" });
    record.focus();
    await userEvent.keyboard("{Enter}");
    // Option+K on macOS types "˚": the physical key K is recorded, so useHotkey matches it again.
    record.dispatchEvent(
      new KeyboardEvent("keydown", { key: "˚", code: "KeyK", altKey: true, bubbles: true, cancelable: true }),
    );
    await expect(args.onChange).toHaveBeenCalledWith("alt+k");
  },
};

export const PointerRecordsStopsAndClears: Story = {
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const record = canvas.getByRole("button", { name: "Record shortcut" });
    await userEvent.click(record);
    await expect(record).toHaveAttribute("aria-pressed", "true");
    await expect(record).toHaveFocus();
    // Pressing it again stops without changing the shortcut.
    await userEvent.click(record);
    await expect(record).toHaveAttribute("aria-pressed", "false");
    await expect(args.onChange).not.toHaveBeenCalled();
    // The shortcut's box records too, and takes focus to the record button so the keys arrive.
    await userEvent.click(box(canvasElement));
    await expect(record).toHaveAttribute("aria-pressed", "true");
    await expect(record).toHaveFocus();
    await userEvent.click(box(canvasElement));
    await expect(record).toHaveAttribute("aria-pressed", "true");
    await userEvent.keyboard("{Escape}");
    await userEvent.click(canvas.getByRole("button", { name: "Clear shortcut" }));
    await expect(args.onChange).toHaveBeenLastCalledWith("");
    await expect(box(canvasElement)).toHaveTextContent("Not set");
    // The clear button goes with the shortcut; focus stays in the field.
    await expect(record).toHaveFocus();
    await waitFor(() => expect(canvas.getByRole("status")).toHaveTextContent("Shortcut cleared"));
  },
};

export const LeavingTheFieldCancels: Story = {
  render: (args) => (
    <div>
      <HotkeyField {...args} />
      <Button>Next</Button>
    </div>
  ),
  play: async ({ args, canvas, userEvent }) => {
    const record = canvas.getByRole("button", { name: "Record shortcut" });
    record.focus();
    await userEvent.keyboard("{Enter}");
    // Tab is not taken: it moves focus on, and recording ends so keys typed elsewhere are never captured.
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Next" })).toHaveFocus();
    await expect(record).toHaveAttribute("aria-pressed", "false");
    await expect(args.onRecordingChange).toHaveBeenLastCalledWith(false);
    await userEvent.keyboard("{Control>}j{/Control}");
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

function OneAtATime() {
  const [editing, setEditing] = useState<string | null>(null);
  const [keys, setKeys] = useState({ palette: "mod+shift+p", search: "mod+f" });
  return (
    <div>
      {(["palette", "search"] as const).map((id) => (
        <HotkeyField
          key={id}
          label={id === "palette" ? "Command palette" : "Search"}
          value={keys[id]}
          onChange={(v) => setKeys((k) => ({ ...k, [id]: v }))}
          recording={editing === id}
          onRecordingChange={(on) => setEditing(on ? id : null)}
        />
      ))}
      <Button onClick={() => setEditing("search")}>Edit search</Button>
    </div>
  );
}

export const ControlledRecording: Story = {
  render: () => <OneAtATime />,
  play: async ({ canvas, userEvent }) => {
    const [palette, search] = canvas.getAllByRole("button", { name: "Record shortcut" }) as [
      HTMLElement,
      HTMLElement,
    ];
    // Started from outside: focus moves into the field, so the keys reach it.
    await userEvent.click(canvas.getByRole("button", { name: "Edit search" }));
    await expect(search).toHaveAttribute("aria-pressed", "true");
    await waitFor(() => expect(search).toHaveFocus());
    await userEvent.keyboard("{Control>}{Shift>}f{/Shift}{/Control}");
    await expect(search).toHaveAttribute("aria-pressed", "false");
    await expect(canvas.getByRole("group", { name: "Search" })).toHaveTextContent(/CtrlShiftF/);
    // Starting another row ends the first (the parent holds one recording at a time).
    await userEvent.click(search);
    await userEvent.click(palette);
    await expect(palette).toHaveAttribute("aria-pressed", "true");
    await expect(search).toHaveAttribute("aria-pressed", "false");
  },
};

export const Disabled: Story = {
  args: { disabled: true, name: "palette" },
  render: (args) => (
    <form aria-label="Keys" data-testid="form">
      <HotkeyField {...args} />
    </form>
  ),
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    await expect(canvas.getByRole("button", { name: "Record shortcut" })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "Clear shortcut" })).toBeDisabled();
    await userEvent.click(box(canvasElement));
    await expect(args.onRecordingChange).not.toHaveBeenCalled();
    await expect(getComputedStyle(box(canvasElement)).cursor).toBe("not-allowed");
    // Not submitted, like a disabled native control.
    await expect(new FormData(canvas.getByTestId("form") as HTMLFormElement).has("palette")).toBe(false);
  },
};

export const DisabledWhileRecordingStops: Story = {
  args: { recording: true },
  render: function Render(args) {
    const [disabled, setDisabled] = useState(false);
    return (
      <div>
        <HotkeyField {...args} disabled={disabled} />
        <Button onClick={() => setDisabled(true)}>Lock</Button>
      </div>
    );
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const record = canvas.getByRole("button", { name: "Record shortcut" });
    await expect(record).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(canvas.getByRole("button", { name: "Lock" }));
    await expect(record).toHaveAttribute("aria-pressed", "false");
    await expect(box(canvasElement)).not.toHaveTextContent("Press a shortcut");
  },
};

export const FormResetRestoresTheDefault: Story = {
  render: (args) => (
    <form aria-label="Keys" data-testid="form">
      <HotkeyField {...args} name="palette" />
      <Button type="reset">Reset</Button>
    </form>
  ),
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Clear shortcut" }));
    await expect(box(canvasElement)).toHaveTextContent("Not set");
    await userEvent.click(canvas.getByRole("button", { name: "Reset" }));
    await waitFor(() => expect(box(canvasElement)).toHaveTextContent(/ShiftP/));
    await expect(new FormData(canvas.getByTestId("form") as HTMLFormElement).get("palette")).toBe(
      "mod+shift+p",
    );
    // A reset is not a change the person made.
    await expect(args.onChange).toHaveBeenCalledTimes(1);
  },
};

export const LabelsAndDescription: Story = {
  args: {
    labelHidden: true,
    description: "Opens the list of commands",
    error: "Already used by Search",
    labels: {
      record: "Enregistrer",
      clear: "Effacer",
      none: "Aucun",
      prompt: "Appuyez sur un raccourci",
      recording: "Enregistrement",
      recorded: "Raccourci",
      cancelled: "Annulé",
      cleared: "Effacé",
    },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const group = canvas.getByRole("group", { name: "Command palette" });
    await expect(group).toHaveAccessibleDescription(/Opens the list of commands/);
    await expect(canvas.getByRole("alert")).toHaveTextContent("Already used by Search");
    const record = canvas.getByRole("button", { name: "Enregistrer" });
    await userEvent.click(record);
    await expect(box(canvasElement)).toHaveTextContent("Appuyez sur un raccourci");
    await waitFor(() => expect(canvas.getByRole("status")).toHaveTextContent("Enregistrement"));
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(canvas.getByRole("status")).toHaveTextContent("Annulé"));
    await userEvent.click(record);
    await userEvent.keyboard("{Control>}e{/Control}");
    await waitFor(() => expect(canvas.getByRole("status")).toHaveTextContent(/Raccourci .*Control plus E/));
    await userEvent.click(canvas.getByRole("button", { name: "Effacer" }));
    await expect(box(canvasElement)).toHaveTextContent("Aucun");
    await waitFor(() => expect(canvas.getByRole("status")).toHaveTextContent("Effacé"));
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div>
      <HotkeyField {...args} size="sm" label="Small" />
      <HotkeyField {...args} size="lg" label="Large" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const [sm, lg] = [...canvasElement.querySelectorAll(".cy-hotkey-field-box")] as [
      HTMLElement,
      HTMLElement,
    ];
    await expect(sm.getBoundingClientRect().height).toBeLessThan(lg.getBoundingClientRect().height);
    await expect(Number.parseFloat(getComputedStyle(sm).fontSize)).toBeLessThan(
      Number.parseFloat(getComputedStyle(lg).fontSize),
    );
  },
};

export const SharesTheFieldSkinWithTextField: Story = {
  render: (args) => (
    <div
      style={
        {
          display: "grid",
          gap: 12,
          maxWidth: 320,
          "--cy-field-control-border": "rgb(200, 30, 30)",
          "--cy-field-control-bg": "rgb(250, 240, 200)",
          "--cy-field-control-radius": "3px",
          "--cy-field-control-sunken-bg": "rgb(210, 230, 250)",
        } as CSSProperties
      }
    >
      <HotkeyField {...args} />
      <TextField label="Name" defaultValue="Query" />
      <HotkeyField {...args} label="Disabled" disabled />
      <TextField label="Read only" defaultValue="Query" readOnly />
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const [box, disabledBox] = [...canvasElement.querySelectorAll(".cy-hotkey-field-box")] as HTMLElement[];
    const shell = (name: string) =>
      canvas.getByRole("textbox", { name }).closest(".cy-text-field") as HTMLElement;
    const skin = (el: Element) => {
      const s = getComputedStyle(el);
      return { border: s.borderTopColor, background: s.backgroundColor, radius: s.borderTopLeftRadius };
    };
    // A product restyling fields once gets the same box for a shortcut as for text.
    await expect(skin(box as HTMLElement)).toEqual({
      border: "rgb(200, 30, 30)",
      background: "rgb(250, 240, 200)",
      radius: "3px",
    });
    await expect(skin(box as HTMLElement)).toEqual(skin(shell("Name")));
    // A box that cannot be edited takes the same sunken fill in both.
    await expect(getComputedStyle(disabledBox as HTMLElement).backgroundColor).toBe("rgb(210, 230, 250)");
    await expect(getComputedStyle(shell("Read only")).backgroundColor).toBe("rgb(210, 230, 250)");
  },
};

export const RightToLeft: Story = {
  render: (args) => (
    <div dir="rtl">
      <HotkeyField {...args} />
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    // The box starts at the inline start (the right) and the buttons follow it to the left.
    const shown = box(canvasElement).getBoundingClientRect();
    const record = canvas.getByRole("button", { name: "Record shortcut" }).getBoundingClientRect();
    const clear = canvas.getByRole("button", { name: "Clear shortcut" }).getBoundingClientRect();
    await expect(record.right).toBeLessThanOrEqual(shown.left);
    await expect(clear.right).toBeLessThanOrEqual(record.left);
  },
};

export const RecordingLightRestsUnderReducedMotion: Story = {
  tags: ["!dev"],
  args: { defaultRecording: true },
  play: async ({ canvasElement }) => {
    const dot = canvasElement.querySelector(".cy-hotkey-field-dot") as HTMLElement;
    await expect(getComputedStyle(dot).animationName).toBe("cy-hotkey-field-pulse");
    if (!(await emulateMedia({ reducedMotion: "reduce" }))) return;
    try {
      await waitFor(() => expect(getComputedStyle(dot).animationName).toBe("none"));
      await expect(getComputedStyle(dot).opacity).toBe("1");
    } finally {
      await emulateMedia({ reducedMotion: null });
    }
  },
};

export const TouchTapsRecordAndClear: Story = {
  tags: ["touch", "!dev"],
  play: async ({ args, canvas, userEvent }) => {
    const record = canvas.getByRole("button", { name: "Record shortcut" });
    const clear = canvas.getByRole("button", { name: "Clear shortcut" });
    for (const button of [record, clear]) {
      const hit = getComputedStyle(button, "::before");
      await expect(Number.parseFloat(hit.blockSize || hit.height)).toBeGreaterThanOrEqual(44);
    }
    await userEvent.pointer({ keys: "[TouchA]", target: clear });
    await expect(args.onChange).toHaveBeenCalledWith("");
    await userEvent.pointer({ keys: "[TouchA]", target: record });
    await expect(record).toHaveAttribute("aria-pressed", "true");
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    for (const selector of [".cy-hotkey-field", ".cy-hotkey-field-box", ".cy-hotkey-field-row"]) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, [
        "display",
        "gap",
        "font-size",
        "box-sizing",
        "border-top-width",
        "padding-inline-start",
        "min-height",
        "text-transform",
      ]);
      await expect(hostile, selector).toEqual(clean);
    }
    await expect(field(canvasElement)).toBeVisible();
  },
};

function ShadowField({ onDocument }: { onDocument: () => void }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current;
    if (!el || el.shadowRoot) return;
    const root = el.attachShadow({ mode: "open" });
    root.adoptedStyleSheets = [createStyleSheet()];
    const mount = document.createElement("div");
    root.append(mount);
    createRoot(mount).render(<HotkeyField label="Palette" defaultValue="" />);
  }, []);
  useEffect(() => {
    document.addEventListener("keydown", onDocument);
    return () => document.removeEventListener("keydown", onDocument);
  }, [onDocument]);
  return <div data-testid="host" ref={host} />;
}

export const WorksInsideAShadowRoot: Story = {
  render: () => <ShadowField onDocument={documentKeys} />,
  play: async ({ canvas, userEvent }) => {
    const host = await canvas.findByTestId("host");
    await waitFor(() => expect(host.shadowRoot?.querySelector("button")).toBeTruthy());
    const root = host.shadowRoot as ShadowRoot;
    const record = root.querySelector("button") as HTMLButtonElement;
    await userEvent.click(record);
    await waitFor(() => expect(record).toHaveAttribute("aria-pressed", "true"));
    documentKeys.mockClear();
    await userEvent.keyboard("{Control>}{Shift>}l{/Shift}{/Control}");
    await waitFor(() => expect(box(root)).toHaveTextContent(/CtrlShiftL/));
    // The keys stopped at the field, inside the shadow root.
    await expect(documentKeys).not.toHaveBeenCalled();
    await expect(getComputedStyle(box(root)).display).toBe("flex");
  },
};
const documentKeys = fn();

export const LayoutHooks: Story = {
  render: function Render(args) {
    const ref = useRef<HTMLDivElement>(null);
    const [tag, setTag] = useState("");
    useEffect(() => setTag(ref.current?.className ?? ""), []);
    return (
      <div>
        <HotkeyField {...args} ref={ref} className="host-keys" style={{ maxInlineSize: 320 }} />
        <output data-testid="ref">{tag}</output>
      </div>
    );
  },
  play: async ({ canvas, canvasElement }) => {
    // The ref is the root element, which takes the layout class and style.
    await waitFor(() => expect(canvas.getByTestId("ref")).toHaveTextContent("cy-hotkey-field host-keys"));
    await expect(field(canvasElement).style.maxInlineSize).toBe("320px");
  },
};
