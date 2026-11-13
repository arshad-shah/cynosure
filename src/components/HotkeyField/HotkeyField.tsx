import {
  type CSSProperties,
  forwardRef,
  type ReactNode,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useControllableState } from "../../foundations/controllable.js";
import { deepActiveElement } from "../../foundations/focus.js";
import { HiddenValue } from "../../foundations/HiddenValue/HiddenValue.js";
import { hotkeyFromEvent, shortcutKeys } from "../../foundations/hotkey.js";
import { isComposing } from "../../foundations/keys.js";
import { close } from "../../icons/close.js";
import { record } from "../../icons/record.js";
import { stop } from "../../icons/stop.js";
import type { Size } from "../../tokens/schema.js";
import { Field, type FieldLayoutProps } from "../Field/Field.js";
import { IconButton } from "../IconButton/IconButton.js";
import { Kbd, useApple } from "../Kbd/Kbd.js";

export interface HotkeyFieldTokens {
  recordingColor: string;
  recordingBorder: string;
  radius: string;
  border: string;
  bg: string;
  gap: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    hotkeyField: HotkeyFieldTokens;
  }
}

export interface HotkeyFieldLabels {
  /** The toggle button that starts and stops recording, and its tooltip. Default "Record shortcut". */
  record: string;
  /** The button that removes the shortcut, and its tooltip. Default "Clear shortcut". */
  clear: string;
  /** Shown when there is no shortcut. Default "Not set". */
  none: string;
  /** Shown while recording. Default "Press a shortcut". */
  prompt: string;
  /** Announced when recording starts. Default "Recording, press a shortcut". */
  recording: string;
  /** Announced before the recorded shortcut's keys. Default "Shortcut set to". */
  recorded: string;
  /** Announced when recording stops without a shortcut. Default "Recording cancelled". */
  cancelled: string;
  /** Announced when the shortcut is cleared. Default "Shortcut cleared". */
  cleared: string;
}

export interface HotkeyFieldProps extends FieldLayoutProps {
  /** The field's visible label (what the shortcut does); it names the group of controls. */
  label: ReactNode;
  /** Hide the label visually (a table row that already says what the shortcut does); it still names the field. */
  labelHidden?: boolean;
  /** Help text under the field, read with it by screen readers. */
  description?: ReactNode;
  /** An error under the field, announced. */
  error?: ReactNode;
  /**
   * The shortcut, written as `useHotkey` and `Kbd` read it ("mod+shift+p": `mod` is Command on Apple platforms and
   * Control elsewhere), or "" for none.
   */
  value?: string;
  /** The starting shortcut when `value` is not given. Default "". */
  defaultValue?: string;
  /** A shortcut was recorded, or "" when it was cleared. */
  onChange?: (value: string) => void;
  /** Whether the field is waiting for a shortcut. Give it to control recording (one row at a time on a settings page). */
  recording?: boolean;
  /** Whether it starts out recording, when `recording` is not given. Default false. */
  defaultRecording?: boolean;
  /** Recording started (true) or ended (false): a shortcut was recorded, Escape was pressed or focus left. */
  onRecordingChange?: (recording: boolean) => void;
  /**
   * Accept keys without Control, Command or Alt ("k", "shift+/"), for shortcuts that only work outside text fields.
   * Default false: such a key is ignored while recording. Function keys (F1 to F24) are always accepted.
   */
  allowBare?: boolean;
  /** Form field name. The form receives the shortcut string. */
  name?: string | undefined;
  /** The `id` of a form elsewhere on the page that the field belongs to. */
  form?: string | undefined;
  /** Cannot be recorded, cleared or submitted. */
  disabled?: boolean | undefined;
  /** Size of the keys and buttons. Default "md". */
  size?: Size;
  /** Replace the built-in English text: the buttons, the prompt and the announcements. */
  labels?: Partial<HotkeyFieldLabels>;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. Restyle through --cy-hotkey-field-* tokens. */
  style?: CSSProperties;
}

const DEFAULT_LABELS: HotkeyFieldLabels = {
  record: "Record shortcut",
  clear: "Clear shortcut",
  none: "Not set",
  prompt: "Press a shortcut",
  recording: "Recording, press a shortcut",
  recorded: "Shortcut set to",
  cancelled: "Recording cancelled",
  cleared: "Shortcut cleared",
};

/**
 * Records a keyboard shortcut for a keybindings page. Press the record button (or the shortcut's box), then the keys:
 * the next chord is captured on the field itself, so the app's own shortcuts do not fire, and written as `useHotkey`
 * reads it. Escape cancels.
 */
export const HotkeyField = forwardRef<HTMLDivElement, HotkeyFieldProps>(function HotkeyField(
  {
    label,
    labelHidden,
    layout,
    width,
    description,
    error,
    value,
    defaultValue = "",
    onChange,
    recording: recordingProp,
    defaultRecording = false,
    onRecordingChange,
    allowBare = false,
    name,
    form,
    disabled = false,
    size = "md",
    labels,
    className,
    style,
  },
  ref,
) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const apple = useApple();
  const [current, setCurrent, resetCurrent] = useControllableState(value, defaultValue, onChange);
  const [recording, setRecording] = useControllableState(recordingProp, defaultRecording, onRecordingChange);
  const [message, setMessage] = useState<ReactNode>("");
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const boxId = useId();
  const active = recording && !disabled;

  const announce = (next: ReactNode) => {
    // Cleared first, so the same words twice in a row are spoken twice.
    setMessage("");
    queueMicrotask(() => setMessage(next));
  };
  const start = () => {
    setRecording(true);
    announce(text.recording);
  };
  const cancel = () => {
    setRecording(false);
    announce(text.cancelled);
  };

  // While recording, keys go to the field: focus moves into it (recording may be started from outside).
  useEffect(() => {
    if (!active) return;
    const el = root.current as HTMLDivElement;
    if (!el.contains(deepActiveElement(el.ownerDocument))) button.current?.focus();
  }, [active]);

  const latest = useRef({ active, apple, allowBare, text, setCurrent, setRecording, cancel, announce });
  latest.current = { active, apple, allowBare, text, setCurrent, setRecording, cancel, announce };
  useEffect(() => {
    const el = root.current as HTMLDivElement;
    // Capture phase on the field itself: it sees the keys before anything inside it, and stops them before the
    // document's listeners (useHotkey) see them.
    const onKeyDown = (event: KeyboardEvent) => {
      const now = latest.current;
      if (!now.active || isComposing(event)) return;
      const command = event.ctrlKey || event.metaKey || event.altKey;
      // Plain Tab still moves focus on, which ends recording.
      if (event.key === "Tab" && !command) return;
      event.preventDefault();
      event.stopPropagation();
      if (event.key === "Escape" && !command && !event.shiftKey) return now.cancel();
      const combo = hotkeyFromEvent(event, { apple: now.apple, allowBare: now.allowBare });
      if (!combo) return;
      now.setCurrent(combo);
      now.setRecording(false);
      now.announce(
        <>
          {now.text.recorded} <Kbd keys={shortcutKeys(combo, now.apple)} />
        </>,
      );
    };
    // Focus leaving the field ends recording, so keys typed elsewhere are never taken.
    const onFocusOut = (event: FocusEvent) => {
      if (latest.current.active && !el.contains(event.relatedTarget as Node | null)) latest.current.cancel();
    };
    el.addEventListener("keydown", onKeyDown, true);
    el.addEventListener("focusout", onFocusOut);
    return () => {
      el.removeEventListener("keydown", onKeyDown, true);
      el.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  useImperativeHandle(ref, () => root.current as HTMLDivElement);

  return (
    <div
      ref={root}
      className={`cy-hotkey-field${className ? ` ${className}` : ""}`}
      data-size={size}
      data-recording={active ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      style={style}
    >
      <Field
        group
        label={label}
        labelHidden={labelHidden}
        layout={layout}
        width={width}
        description={description}
        error={error}
        size={size}
      >
        {() => (
          <div className="cy-hotkey-field-row cy-reset">
            {/* biome-ignore lint/a11y/useKeyWithClickEvents lint/a11y/noStaticElementInteractions: pressing the shortcut's box records too; the record button beside it is the keyboard way. */}
            <div
              id={boxId}
              className="cy-hotkey-field-box cy-reset"
              data-recording={active ? "" : undefined}
              data-disabled={disabled ? "" : undefined}
              onClick={() => {
                if (!disabled && !active) start();
              }}
            >
              {active ? (
                <span className="cy-hotkey-field-prompt cy-reset">
                  <span className="cy-hotkey-field-dot cy-reset" aria-hidden="true" />
                  {text.prompt}
                </span>
              ) : current ? (
                <Kbd keys={shortcutKeys(current, apple)} size={size} />
              ) : (
                <span className="cy-hotkey-field-none cy-reset">{text.none}</span>
              )}
            </div>
            <IconButton
              ref={button}
              icon={active ? stop : record}
              label={text.record}
              pressed={active}
              size={size}
              variant="ghost"
              disabled={disabled}
              aria-describedby={boxId}
              onClick={() => (active ? cancel() : start())}
            />
            {current && !active && (
              <IconButton
                icon={close}
                label={text.clear}
                size={size}
                variant="ghost"
                disabled={disabled}
                onClick={() => {
                  setCurrent("");
                  announce(text.cleared);
                  // The clear button goes with the shortcut: focus stays in the field.
                  button.current?.focus();
                }}
              />
            )}
          </div>
        )}
      </Field>
      <span className="cy-visually-hidden" role="status">
        {message}
      </span>
      <HiddenValue
        name={name}
        form={form}
        value={current}
        disabled={disabled}
        onReset={() => resetCurrent(defaultValue)}
      />
    </div>
  );
});
