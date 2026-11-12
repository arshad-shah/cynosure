import {
  type CSSProperties,
  Fragment,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { ButtonBase } from "../../foundations/ButtonBase/ButtonBase.js";
import { useControllableState } from "../../foundations/controllable.js";
import { HiddenValue } from "../../foundations/HiddenValue/HiddenValue.js";
import { Icon } from "../../foundations/Icon/Icon.js";
import { isComposing } from "../../foundations/keys.js";
import { isTypeaheadKey, seekEnabled, useTypeahead } from "../../foundations/listbox.js";
import { clamp } from "../../foundations/math.js";
import { OptionIcon, type OptionIconColor } from "../../foundations/option-icon.js";
import { chevronDown } from "../../icons/chevron-down.js";
import type { IconData } from "../../icons/types.js";
import { useListboxLayer } from "../../overlay/listbox-layer.js";
import type { DenseSize } from "../../tokens/schema.js";
import { Field } from "../Field/Field.js";
import { OptionList, OptionListGroup, OptionListItem, OptionListNote } from "../OptionList/OptionList.js";

export interface SelectTokens {
  fontSizeXs: string;
  paddingInlineXs: string;
  heightXs: string;
  radius: string;
  bg: string;
  border: string;
  listBg: string;
  listShadow: string;
  listMaxHeight: string;
  optionActiveBg: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    select: SelectTokens;
  }
}

export interface SelectOption extends OptionIconColor {
  value: string;
  label: string;
  description?: string;
  /** Icon before the label, in the list and in the trigger when chosen. Colour it with `iconTone` or `iconColor`. */
  icon?: IconData;
  disabled?: boolean;
  /** Options next to each other with the same `group` are listed under that heading. */
  group?: string;
}

export interface SelectProps {
  /** Names the control, shown above it. */
  label: ReactNode;
  /** Visually hide the label (it still names the control). Prefer visible labels. */
  labelHidden?: boolean | undefined;
  /** Help text shown below the control. */
  description?: ReactNode;
  /** Your own error; it replaces the built-in required message. */
  error?: ReactNode;
  /** The choices: `{ value, label, description?, icon?, iconTone?, iconColor?, disabled?, group? }`. */
  options: SelectOption[];
  /** Controlled selected value. */
  value?: string;
  /** Selected value at first, when uncontrolled. */
  defaultValue?: string;
  /** Called with the chosen option's value when it changes. */
  onChange?: (value: string) => void;
  /** Shown while nothing is chosen. Default "Select…". */
  placeholder?: string;
  /** Submits the value with its form under this name. */
  name?: string;
  /** The form will not submit until a value is chosen; also draws the required marker. */
  required?: boolean;
  /** Cannot be opened or changed, and is not submitted. */
  disabled?: boolean;
  /**
   * Height and text size of the control. Default "md". `xs` (about 20px) is for dense desktop chrome: the trigger is
   * still 24px to press (44px on coarse pointers); its label is set as for `sm`.
   */
  size?: DenseSize;
  /** `outline`, or `soft` (tinted, no border). Default "outline". */
  variant?: "outline" | "soft";
  /** Replace the built-in English text: the placeholder, the empty list and the required message. */
  labels?: { placeholder?: string; empty?: string; required?: string };
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. */
  style?: CSSProperties;
}

const PAGE = 10;

/** Select-only combobox (WAI-ARIA APG): listbox in the top layer, typeahead, forms via HiddenValue. */
/** Consecutive options that share a group, in order (ungrouped runs have no group). */
function groupsOf(options: SelectOption[]) {
  const runs: {
    group: string | undefined;
    start: number;
    items: { option: SelectOption; index: number }[];
  }[] = [];
  options.forEach((option, index) => {
    const last = runs[runs.length - 1];
    if (last && last.group === option.group) last.items.push({ option, index });
    else runs.push({ group: option.group, start: index, items: [{ option, index }] });
  });
  return runs;
}

export function Select({
  label,
  labelHidden,
  description,
  error,
  options,
  value,
  defaultValue = "",
  onChange,
  placeholder,
  name,
  required,
  disabled,
  size = "md",
  variant = "outline",
  labels,
  className,
  style,
}: SelectProps) {
  const iconSize = size === "xs" ? "sm" : "md";
  const listId = `cy-select-${useId().replace(/:/g, "")}`;
  const trigger = useRef<HTMLButtonElement | null>(null);
  const list = useRef<HTMLDivElement | null>(null);
  const [current, setCurrent, resetCurrent] = useControllableState(value, defaultValue, onChange);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const typeTo = useTypeahead();
  // Shown after a blocked submit: the hidden input cannot be focused or explained, so the trigger is.
  const [missing, setMissing] = useState(false);

  const enabled = (i: number) => i >= 0 && i < options.length && !options[i]?.disabled;
  const step = (from: number, delta: 1 | -1) => seekEnabled(options.length, from, delta, enabled);
  const first = () => step(-1, 1);
  const last = () => step(options.length, -1);
  // A page away, or the nearest usable option short of it; with none there, the active option stays.
  const page = (delta: 1 | -1) => {
    const target = clamp(active + delta * PAGE, 0, options.length - 1);
    const beyond = seekEnabled(options.length, target - delta, delta, enabled);
    if (beyond >= 0 && beyond !== target - delta) return beyond;
    const short = seekEnabled(options.length, target, -delta as 1 | -1, enabled);
    return short >= 0 ? short : active;
  };

  const choose = useCallback(
    (index: number) => {
      const option = options[index];
      if (!option || option.disabled) return;
      setMissing(false);
      if (option.value !== current) setCurrent(option.value);
    },
    [options, current, setCurrent],
  );
  const close = (focus = true) => {
    setOpen(false);
    if (focus) trigger.current?.focus();
  };
  const openList = (at?: number) => {
    const selected = options.findIndex((o) => o.value === current);
    setActive(at ?? (enabled(selected) ? selected : first()));
    setOpen(true);
  };

  // As wide as the trigger, never wider than max(trigger, 20rem): long labels truncate instead of overflowing.
  useListboxLayer({ anchor: trigger, list, open, onClose: () => close(false), capWidth: true });
  useEffect(() => {
    if (!open || active < 0) return;
    list.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const typeahead = (key: string) => {
    const hit = typeTo(
      key,
      options.map((o, i) => (enabled(i) ? o.label : null)),
      active,
    );
    if (hit >= 0) {
      if (!open) openList(hit);
      else setActive(hit);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (isComposing(e)) return;
    const { key } = e;
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(key)) {
        e.preventDefault();
        openList(key === "ArrowUp" ? last() : undefined);
      } else if (isTypeaheadKey(e)) typeahead(key);
      return;
    }
    const moves: Record<string, () => number> = {
      ArrowDown: () => step(active, 1),
      ArrowUp: () => step(active, -1),
      Home: first,
      End: last,
      PageDown: () => page(1),
      PageUp: () => page(-1),
    };
    if (moves[key]) {
      e.preventDefault();
      setActive(moves[key]());
    } else if (key === "Enter" || key === " ") {
      e.preventDefault();
      choose(active);
      close();
    } else if (key === "Escape") {
      e.preventDefault();
      close();
    } else if (key === "Tab") {
      choose(active);
      close(false);
    } else if (isTypeaheadKey(e)) typeahead(key);
  };

  const selected = options.find((o) => o.value === current);
  const placeholderText = placeholder ?? labels?.placeholder ?? "Select…";

  return (
    <Field
      label={label}
      labelHidden={labelHidden}
      description={description}
      error={error ?? (missing && !current ? (labels?.required ?? "Please choose a value.") : undefined)}
      required={required}
      size={size === "xs" ? "sm" : size}
      className={className}
      style={style}
    >
      {(field) => (
        <div className="cy-select" data-size={size} data-variant={variant}>
          <ButtonBase
            ref={trigger}
            id={field.id}
            role="combobox"
            className="cy-select-trigger"
            aria-labelledby={field.labelId}
            aria-describedby={field.describedBy}
            aria-invalid={field.invalid || undefined}
            aria-required={required || undefined}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={listId}
            aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
            disabled={disabled}
            onClick={() => (open ? close() : openList())}
            onKeyDown={onKeyDown}
          >
            {selected && (
              <OptionIcon option={selected} plain={disabled} size={iconSize} className="cy-select-icon" />
            )}
            <span className="cy-select-value" data-placeholder={selected ? undefined : ""}>
              {selected?.label ?? placeholderText}
            </span>
            <Icon icon={chevronDown} size={iconSize} className="cy-select-chevron" />
          </ButtonBase>
          <OptionList ref={list} id={listId} aria-labelledby={field.labelId}>
            {options.length === 0 && <OptionListNote>{labels?.empty ?? "No options"}</OptionListNote>}
            {groupsOf(options).map((run) => {
              const rows = run.items.map(({ option, index }) => (
                <OptionListItem
                  key={option.value}
                  id={`${listId}-${index}`}
                  data-index={index}
                  label={option.label}
                  description={option.description}
                  icon={<OptionIcon option={option} plain={option.disabled} className="cy-select-icon" />}
                  selected={option.value === current}
                  disabled={option.disabled}
                  active={index === active}
                  onPointerMove={() => enabled(index) && setActive(index)}
                  onClick={() => {
                    if (!enabled(index)) return;
                    choose(index);
                    close();
                  }}
                />
              ));
              return run.group === undefined ? (
                <Fragment key={`run-${run.start}`}>{rows}</Fragment>
              ) : (
                <OptionListGroup key={`group-${run.start}`} id={`${listId}-g${run.start}`} label={run.group}>
                  {rows}
                </OptionListGroup>
              );
            })}
          </OptionList>
          <HiddenValue
            name={name}
            value={current}
            required={required}
            disabled={disabled}
            requiredMessage={labels?.required ?? "Please choose a value."}
            onReset={() => {
              resetCurrent(defaultValue);
              setMissing(false);
            }}
            onInvalid={(event) => {
              event.preventDefault();
              setMissing(true);
              trigger.current?.focus();
            }}
          />
        </div>
      )}
    </Field>
  );
}
