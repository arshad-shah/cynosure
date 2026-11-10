import {
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { ButtonBase } from "../../foundations/ButtonBase/ButtonBase.js";
import { HiddenValue } from "../../foundations/HiddenValue/HiddenValue.js";
import { Icon } from "../../foundations/Icon/Icon.js";
import { isComposing } from "../../foundations/keys.js";
import { isTypeaheadKey, seekEnabled, useTypeahead } from "../../foundations/listbox.js";
import { chevronDown } from "../../icons/chevron-down.js";
import type { IconData } from "../../icons/types.js";
import { useAnchoredPosition } from "../../overlay/use-anchored-position.js";
import type { Size } from "../../tokens/schema.js";
import { Field } from "../Field/Field.js";

export interface SelectTokens {
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

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: IconData;
  disabled?: boolean;
}

export interface SelectProps {
  label: ReactNode;
  /** Visually hide the label (it still names the control). Prefer visible labels. */
  labelHidden?: boolean | undefined;
  description?: ReactNode;
  error?: ReactNode;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  size?: Size;
  variant?: "outline" | "soft";
  labels?: { placeholder?: string; empty?: string; required?: string };
  className?: string;
  /** Layout only. */
  style?: CSSProperties;
}

const PAGE = 10;

/** Select-only combobox (WAI-ARIA APG): listbox in the top layer, typeahead, forms via HiddenValue. */
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
  const listId = `cy-select-${useId().replace(/:/g, "")}`;
  const trigger = useRef<HTMLButtonElement | null>(null);
  const list = useRef<HTMLDivElement | null>(null);
  const [inner, setInner] = useState(defaultValue);
  const current = value ?? inner;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const typeTo = useTypeahead();
  // Shown after a blocked submit: the hidden input cannot be focused or explained, so the trigger is.
  const [missing, setMissing] = useState(false);

  const enabled = (i: number) => i >= 0 && i < options.length && !options[i]?.disabled;
  const step = (from: number, delta: 1 | -1) => seekEnabled(options.length, from, delta, enabled);
  const first = () => step(-1, 1);
  const last = () => step(options.length, -1);

  const choose = useCallback(
    (index: number) => {
      const option = options[index];
      if (!option || option.disabled) return;
      if (value === undefined) setInner(option.value);
      setMissing(false);
      if (option.value !== current) onChange?.(option.value);
    },
    [options, value, current, onChange],
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

  useLayoutEffect(() => {
    const el = list.current as (HTMLElement & { showPopover?: () => void; hidePopover?: () => void }) | null;
    if (!el?.showPopover) return;
    if (open && !el.matches(":popover-open")) {
      const width = trigger.current?.offsetWidth ?? 0;
      // As wide as the trigger, never wider than max(trigger, 20rem): long labels truncate instead of overflowing.
      el.style.minInlineSize = `${width}px`;
      el.style.maxInlineSize = `${Math.max(width, 320)}px`;
      el.showPopover();
    }
    if (!open && el.matches(":popover-open")) el.hidePopover?.();
  });
  useAnchoredPosition(trigger, list, open, "bottom", 4, "start");
  useEffect(() => {
    if (!open || active < 0) return;
    list.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);
  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      const path = e.composedPath();
      if (!path.includes(trigger.current as EventTarget) && !path.includes(list.current as EventTarget))
        close(false);
    };
    document.addEventListener("pointerdown", away, true);
    return () => document.removeEventListener("pointerdown", away, true);
  });

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
      PageDown: () => step(Math.min(active + PAGE - 1, options.length - 1), 1),
      PageUp: () => step(Math.max(active - PAGE + 1, 0), -1),
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
      size={size}
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
            {selected?.icon && <Icon icon={selected.icon} />}
            <span className="cy-select-value" data-placeholder={selected ? undefined : ""}>
              {selected?.label ?? placeholderText}
            </span>
            <Icon icon={chevronDown} className="cy-select-chevron" />
          </ButtonBase>
          <div
            ref={list}
            id={listId}
            role="listbox"
            aria-labelledby={field.labelId}
            className="cy-select-list"
            {...{ popover: "manual" }}
          >
            {options.length === 0 && (
              <div
                role="option"
                aria-disabled="true"
                aria-selected="false"
                tabIndex={-1}
                className="cy-select-empty"
              >
                {labels?.empty ?? "No options"}
              </div>
            )}
            {options.map((option, index) => (
              <div
                key={option.value}
                id={`${listId}-${index}`}
                role="option"
                data-index={index}
                aria-selected={option.value === current}
                aria-disabled={option.disabled || undefined}
                data-active={index === active ? "" : undefined}
                className="cy-select-option"
                tabIndex={-1}
                onPointerMove={() => enabled(index) && setActive(index)}
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => {
                  if (!enabled(index)) return;
                  choose(index);
                  close();
                }}
                onKeyDown={() => {}}
              >
                {option.icon && <Icon icon={option.icon} />}
                <span className="cy-select-option-text">
                  <span className="cy-select-option-label">{option.label}</span>
                  {option.description && (
                    <span className="cy-select-option-description">{option.description}</span>
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
            requiredMessage={labels?.required ?? "Please choose a value."}
            onReset={() => {
              if (value === undefined) setInner(defaultValue);
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
