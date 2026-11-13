import {
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { useControllableState } from "../../foundations/controllable.js";
import { HiddenValue } from "../../foundations/HiddenValue/HiddenValue.js";
import { isComposing } from "../../foundations/keys.js";
import { seekEnabled, useActiveOption } from "../../foundations/listbox.js";
import { OptionIcon, type OptionIconColor } from "../../foundations/option-icon.js";
import { textMatches } from "../../foundations/text-match.js";
import type { IconData } from "../../icons/types.js";
import { useListboxLayer } from "../../overlay/listbox-layer.js";
import type { Size } from "../../tokens/schema.js";
import type { FieldLayoutProps } from "../Field/Field.js";
import { HighlightedText } from "../HighlightedText/HighlightedText.js";
import {
  OptionList,
  type OptionListAction,
  OptionListItem,
  OptionListNote,
} from "../OptionList/OptionList.js";
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

export interface ComboboxOption extends OptionIconColor {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
  /** Icon before the label in the list. Colour it with `iconTone` or `iconColor`. */
  icon?: IconData;
  /** Drawn muted in the list but still choosable: an option that is there but not in use. */
  dimmed?: boolean;
  /** At the end of the option's row in the list, smaller and muted: a shortcut, a count. */
  trailing?: ReactNode;
}

export interface ComboboxLabels {
  /** Shown when nothing matches. */
  empty: string;
  /** Shown while `loading`. */
  loading: string;
  /** Error after a blocked submit when `required` and nothing is chosen. */
  required: string;
}

export interface ComboboxProps extends FieldLayoutProps {
  /** The field's label. It also names the list when it is a string. */
  label: ReactNode;
  /** Visually hide the label (it still names the control). Prefer visible labels. */
  labelHidden?: boolean;
  /** Help text shown below the control and read with it. */
  description?: ReactNode;
  /** Your own error; it replaces the field's own messages. */
  error?: ReactNode;
  /** The options to choose from. */
  options: ComboboxOption[];
  /**
   * An action pinned under the options ("New connection"), shown whatever the text matches: the arrow keys' last
   * stop, run with Enter or a press. The list closes, focus stays in the input, and the value does not change.
   */
  footer?: OptionListAction | undefined;
  /** The chosen option's value (or the typed text, with `allowCustom`). */
  value?: string;
  /** The value chosen at first, when uncontrolled. */
  defaultValue?: string;
  /** Called when the value changes, with the chosen option's value, or an empty string when it is cleared. */
  onChange?: (value: string) => void;
  /** The text in the input. Control it to load options as people type. */
  inputValue?: string;
  /** Called when the text in the input changes (typed, or filled in by a choice), with the text. */
  onInputChange?: (text: string) => void;
  /** Which options match the text. Default: label contains the text, ignoring case. `false`: show `options` as given. */
  filter?: ((option: ComboboxOption, text: string) => boolean) | false;
  /** Accept text that matches no option as the value. */
  allowCustom?: boolean;
  /** Options are being fetched: the list says so and is `aria-busy`. */
  loading?: boolean;
  /** Hint shown in the input while it is empty. */
  placeholder?: string;
  /** Name the value is submitted under in a form. */
  name?: string;
  /** A value must be chosen: submitting the form without one is blocked and shows an error. */
  required?: boolean;
  /** Turns off the input; the value is not submitted with a form. */
  disabled?: boolean;
  /** Size of the field. Default "md". */
  size?: Size;
  /** `outline` or `soft` (tinted, borderless until focus). Default "outline". */
  variant?: "outline" | "soft";
  /** Icon at the start of the input. */
  iconStart?: IconData;
  /** Replace the built-in English text: the empty and loading notes and the required error. */
  labels?: Partial<ComboboxLabels>;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. */
  style?: CSSProperties;
}

const DEFAULT_LABELS: ComboboxLabels = {
  empty: "No matches",
  loading: "Loading…",
  required: "Please choose a value.",
};
const contains = (option: ComboboxOption, text: string) => textMatches(option.label, text);

/** Editable combobox with a list popup (WAI-ARIA APG): type to filter, arrows to choose, async options, forms. */
export function Combobox({
  label,
  labelHidden,
  layout,
  width,
  description,
  error,
  options,
  footer,
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
  const [current, setCurrent, resetCurrent] = useControllableState(value, defaultValue, onChange);
  const labelOf = (v: string) => options.find((o) => o.value === v)?.label ?? (allowCustom ? v : "");
  const [typedText, setText, resetText] = useControllableState(
    inputValue,
    () => labelOf(defaultValue),
    onInputChange,
  );
  const [open, setOpen] = useState(false);
  // True once the person has typed since the last choice: only then does the text filter the list.
  const [typing, setTyping] = useState(false);
  const [missing, setMissing] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  // The list drops from the whole field (TextField's box), not just the input.
  const anchor = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);

  const match = filter === false ? null : (filter ?? contains);
  const visible = match && typing ? options.filter((o) => match(o, typedText)) : options;
  // The arrow keys' stops: the enabled options, then the footer action (one more option, after the last). The active
  // option is followed by its value, so late or changed results keep it, else the first enabled one is active. Focus
  // never moves (it stays in the input; the list uses aria-activedescendant), so typing is never interrupted.
  const atFooter = footer ? visible.length : Number.NaN;
  const usable = (i: number) => !visible[i]?.disabled;
  const { active, activeId, optionId, setActive, first, move } = useActiveOption({
    id: listId,
    list,
    open,
    count: visible.length,
    footer: !!footer,
    usable,
    keyOf: (i) => visible[i]?.value,
  });
  // While people type, the text is marked where it appears in each label.
  const marked = typing ? typedText.trim() : "";

  const setValue = (next: string) => {
    if (next === current) return;
    setMissing(false);
    setCurrent(next);
  };
  const choose = (option: ComboboxOption) => {
    if (option.disabled) return;
    setValue(option.value);
    setText(option.label);
    setTyping(false);
    setOpen(false);
  };
  const show = (at: "first" | "last" | "selected") => {
    const selected = visible.findIndex((o) => o.value === current && !o.disabled);
    // Opening upwards starts at the last option (the footer action is a key further).
    const last = seekEnabled(visible.length, visible.length, -1, usable);
    setActive(at === "selected" && selected >= 0 ? selected : at === "last" ? last : first());
    setOpen(true);
  };
  /**
   * Leaving the field: keep a valid choice, or the custom text, and never leave stale text behind. Text that still
   * shows the chosen option's label (or none yet, while options load) changes nothing.
   */
  const settle = () => {
    setOpen(false);
    setTyping(false);
    if (typedText === labelOf(current)) return;
    if (allowCustom) setValue(options.find((o) => !o.disabled && o.label === typedText)?.value ?? typedText);
    else if (typedText.trim() === "") setValue("");
    else setText(labelOf(current));
  };

  // The chosen option's label changed under the text (options arrived late, or the value was set from outside):
  // text that showed the old label follows, unless the person is typing.
  const shownLabel = labelOf(current);
  const lastLabel = useRef(shownLabel);
  useEffect(() => {
    const was = lastLabel.current;
    if (shownLabel === was) return;
    lastLabel.current = shownLabel;
    if (shownLabel && !typing && typedText === was) setText(shownLabel);
  });

  useListboxLayer({ anchor, list, open, onClose: () => setOpen(false) });
  const runFooter = () => {
    setOpen(false);
    (footer as OptionListAction).onSelect();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (isComposing(event)) return;
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
        const option = visible[active];
        if (open && active === atFooter) {
          event.preventDefault();
          runFooter();
        } else if (open && option) {
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
        boxRef={anchor}
        label={label}
        labelHidden={labelHidden}
        layout={layout}
        width={width}
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
        aria-activedescendant={activeId}
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
      <OptionList
        ref={list}
        id={listId}
        label={typeof label === "string" ? label : undefined}
        busy={loading}
        footer={
          footer && {
            action: footer,
            id: optionId(atFooter),
            active: active === atFooter,
            onActive: () => setActive(atFooter),
            onRun: runFooter,
          }
        }
      >
        {loading && <OptionListNote>{text.loading}</OptionListNote>}
        {!loading && visible.length === 0 && <OptionListNote>{text.empty}</OptionListNote>}
        {visible.map((option, index) => (
          <OptionListItem
            key={option.value}
            id={optionId(index)}
            label={<HighlightedText text={option.label} query={marked} />}
            description={option.description}
            icon={<OptionIcon option={option} plain={option.disabled} className="cy-combobox-icon" />}
            selected={option.value === current}
            disabled={option.disabled}
            dimmed={option.dimmed}
            trailing={option.trailing}
            active={index === active}
            onPointerMove={() => !option.disabled && setActive(index)}
            onClick={() => choose(option)}
          />
        ))}
      </OptionList>
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
          resetCurrent(defaultValue);
          resetText(labelOf(defaultValue));
          setTyping(false);
          setOpen(false);
        }}
      />
    </div>
  );
}
