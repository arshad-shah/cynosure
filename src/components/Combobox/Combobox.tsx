import {
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { HiddenValue } from "../../foundations/HiddenValue/HiddenValue.js";
import { Icon } from "../../foundations/Icon/Icon.js";
import type { IconData } from "../../icons/types.js";
import { useDismiss } from "../../overlay/dismiss.js";
import { useAnchoredPosition } from "../../overlay/use-anchored-position.js";
import type { Size } from "../../tokens/schema.js";
import { TextField } from "../TextField/TextField.js";

export interface ComboboxTokens {
  listMaxHeight: string;
  listBg: string;
  optionActiveBg: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    combobox: ComboboxTokens;
  }
}

export interface ComboboxOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
  icon?: IconData;
}

export interface ComboboxLabels {
  /** Shown when nothing matches. */
  empty: string;
  /** Shown while `loading`. */
  loading: string;
  /** Error after a blocked submit when `required` and nothing is chosen. */
  required: string;
}

export interface ComboboxProps {
  label: ReactNode;
  labelHidden?: boolean;
  description?: ReactNode;
  error?: ReactNode;
  options: ComboboxOption[];
  /** The chosen option's value (or the typed text, with `allowCustom`). */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** The text in the input. Control it to load options as people type. */
  inputValue?: string;
  onInputChange?: (text: string) => void;
  /** Which options match the text. Default: label contains the text, ignoring case. `false`: show `options` as given. */
  filter?: ((option: ComboboxOption, text: string) => boolean) | false;
  /** Accept text that matches no option as the value. */
  allowCustom?: boolean;
  /** Options are being fetched: the list says so and is `aria-busy`. */
  loading?: boolean;
  placeholder?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  size?: Size;
  variant?: "outline" | "soft";
  iconStart?: IconData;
  labels?: Partial<ComboboxLabels>;
  className?: string;
  /** Layout only. */
  style?: CSSProperties;
}

const DEFAULT_LABELS: ComboboxLabels = {
  empty: "No matches",
  loading: "Loading…",
  required: "Please choose a value.",
};
const contains = (option: ComboboxOption, text: string) =>
  option.label.toLowerCase().includes(text.trim().toLowerCase());
type ListEl = HTMLDivElement & { showPopover?: () => void; hidePopover?: () => void };

/** Editable combobox with a list popup (WAI-ARIA APG): type to filter, arrows to choose, async options, forms. */
export function Combobox({
  label,
  labelHidden,
  description,
  error,
  options,
  value,
  defaultValue = "",
  onChange,
  inputValue,
  onInputChange,
  filter,
  allowCustom = false,
  loading = false,
  placeholder,
  name,
  required,
  disabled,
  size = "md",
  variant = "outline",
  iconStart,
  labels,
  className,
  style,
}: ComboboxProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const listId = `cy-combobox-${useId().replace(/:/g, "")}`;
  const [innerValue, setInnerValue] = useState(defaultValue);
  const current = value ?? innerValue;
  const labelOf = (v: string) => options.find((o) => o.value === v)?.label ?? (allowCustom ? v : "");
  const [innerText, setInnerText] = useState(() => labelOf(defaultValue));
  const typedText = inputValue ?? innerText;
  const [open, setOpen] = useState(false);
  // True once the person has typed since the last choice: only then does the text filter the list.
  const [typing, setTyping] = useState(false);
  const [activeValue, setActiveValue] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const anchor = useRef<HTMLElement | null>(null);
  const list = useRef<ListEl>(null);

  const match = filter === false ? null : (filter ?? contains);
  const visible = match && typing ? options.filter((o) => match(o, typedText)) : options;
  const enabled = visible.filter((o) => !o.disabled);
  const activeIndex = visible.findIndex((o) => o.value === activeValue);

  const setText = (next: string) => {
    if (inputValue === undefined) setInnerText(next);
    onInputChange?.(next);
  };
  const setValue = (next: string) => {
    if (next === current) return;
    if (value === undefined) setInnerValue(next);
    setMissing(false);
    onChange?.(next);
  };
  const choose = (option: ComboboxOption) => {
    if (option.disabled) return;
    setValue(option.value);
    setText(option.label);
    setTyping(false);
    setOpen(false);
  };
  const show = (at: "first" | "last" | "selected") => {
    const pool = enabled;
    const selected = pool.find((o) => o.value === current);
    const pick = at === "selected" ? (selected ?? pool[0]) : at === "first" ? pool[0] : pool[pool.length - 1];
    setActiveValue(pick?.value ?? null);
    setOpen(true);
  };
  /** Leaving the field: keep a valid choice, or the custom text, and never leave stale text behind. */
  const settle = () => {
    setOpen(false);
    setTyping(false);
    if (allowCustom) setValue(typedText);
    else if (typedText.trim() === "") setValue("");
    else if (typedText !== labelOf(current)) setText(labelOf(current));
  };

  // Late or changed results: keep the active option if it is still there, else the first enabled one. Focus never
  // moves (it stays in the input; the list uses aria-activedescendant), so typing is never interrupted.
  useEffect(() => {
    if (!open) return;
    if (!enabled.some((o) => o.value === activeValue)) setActiveValue(enabled[0]?.value ?? null);
  });

  useLayoutEffect(() => {
    anchor.current = (input.current as HTMLInputElement).closest<HTMLElement>(".cy-text-field");
    // Optional calls: test environments without the Popover API (jsdom) still render and filter.
    const el = list.current as ListEl;
    if (open && !el.matches(":popover-open")) {
      el.style.minInlineSize = `${(anchor.current as HTMLElement).offsetWidth}px`;
      el.showPopover?.();
    }
    if (!open && el.matches(":popover-open")) el.hidePopover?.();
  });
  useAnchoredPosition(anchor, list, open, "bottom", 4, "start");
  useDismiss({ open, onClose: () => setOpen(false), inside: [anchor, list] });
  useEffect(() => {
    if (open && activeIndex >= 0)
      list.current?.querySelector(`#${listId}-${activeIndex}`)?.scrollIntoView?.({ block: "nearest" });
  }, [open, activeIndex, listId]);

  const move = (delta: 1 | -1) => {
    const at = enabled.findIndex((o) => o.value === activeValue);
    const next = enabled[Math.min(Math.max(at + delta, 0), enabled.length - 1)];
    if (next) setActiveValue(next.value);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing || event.keyCode === 229) return;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!open) show(event.altKey ? "selected" : "first");
        else move(1);
        return;
      case "ArrowUp":
        event.preventDefault();
        if (!open) show("last");
        else move(-1);
        return;
      case "Enter": {
        const option = visible[activeIndex];
        if (open && option) {
          event.preventDefault();
          choose(option);
        } else if (allowCustom) settle();
        return;
      }
      case "Escape":
        // First Escape closes the list, the next clears the text; with nothing to do, it goes on to a Dialog.
        if (open) {
          event.preventDefault();
          setOpen(false);
        } else if (typedText) {
          event.preventDefault();
          setText("");
          setTyping(false);
          setValue("");
        }
        return;
      case "Tab":
        if (open) setOpen(false);
        return;
    }
  };

  return (
    <div className={className ? `cy-combobox ${className}` : "cy-combobox"} style={style}>
      <TextField
        ref={input}
        label={label}
        labelHidden={labelHidden}
        description={description}
        error={error ?? (missing && !current ? text.required : undefined)}
        size={size}
        variant={variant}
        iconStart={iconStart}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoComplete="off"
        role="combobox"
        aria-autocomplete={match ? "list" : "none"}
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
        value={typedText}
        onChange={(next) => {
          setText(next);
          setTyping(true);
          if (!open) setOpen(true);
        }}
        onKeyDown={onKeyDown}
        onClick={() => !open && show("selected")}
        // Options never take focus (they are aria-activedescendant targets), so any blur leaves the field.
        onBlur={settle}
      />
      <div
        ref={list}
        id={listId}
        role="listbox"
        aria-label={typeof label === "string" ? label : undefined}
        aria-busy={loading || undefined}
        className="cy-combobox-list"
        {...{ popover: "manual" }}
      >
        {loading && (
          <div
            role="option"
            aria-disabled="true"
            aria-selected="false"
            tabIndex={-1}
            className="cy-combobox-note"
          >
            {text.loading}
          </div>
        )}
        {!loading && visible.length === 0 && (
          <div
            role="option"
            aria-disabled="true"
            aria-selected="false"
            tabIndex={-1}
            className="cy-combobox-note"
          >
            {text.empty}
          </div>
        )}
        {visible.map((option, index) => (
          <div
            key={option.value}
            id={`${listId}-${index}`}
            role="option"
            aria-selected={option.value === current}
            aria-disabled={option.disabled || undefined}
            data-active={index === activeIndex ? "" : undefined}
            className="cy-combobox-option"
            tabIndex={-1}
            onPointerMove={() => !option.disabled && setActiveValue(option.value)}
            onPointerDown={(e) => e.preventDefault()}
            onClick={() => choose(option)}
            onKeyDown={() => {}}
          >
            {option.icon && <Icon icon={option.icon} />}
            <span className="cy-combobox-option-text">
              <span className="cy-combobox-option-label">{option.label}</span>
              {option.description && (
                <span className="cy-combobox-option-description">{option.description}</span>
              )}
            </span>
          </div>
        ))}
      </div>
      <HiddenValue
        name={name}
        value={current}
        required={required}
        disabled={disabled}
        requiredMessage={text.required}
        onInvalid={(event) => {
          event.preventDefault();
          setMissing(true);
          input.current?.focus();
        }}
        onReset={() => {
          if (value === undefined) setInnerValue(defaultValue);
          if (inputValue === undefined) setInnerText(labelOf(defaultValue));
          setTyping(false);
          setOpen(false);
        }}
      />
    </div>
  );
}
