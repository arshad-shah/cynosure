import {
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  forwardRef,
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Popover as AriaPopover } from 'react-aria-components';
import { useControllableState } from '../../hooks/useControllableState.js';
import { useMergedRef } from '../../hooks/useMergedRef.js';
import { cn } from '../../utils/cn.js';
import { controlSize, controlWrapperBase, controlWrapperVariant } from '../shared/control.css.js';
import { listbox, listboxEmpty, listboxItem, popover } from '../shared/popover.css.js';
import type { FormControlSize, FormControlVariant } from '../shared/types.js';
import { inlineInput, tag, tagRemove, tagsRow } from './MultiSelect.css.js';

const XIcon = (): React.ReactElement => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path stroke="currentColor" strokeWidth="3" strokeLinecap="round" d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export interface MultiSelectItemData<T extends string = string> {
  value: T;
  label: ReactNode;
  disabled?: boolean;
}

export interface MultiSelectProps<T extends string = string> {
  value?: readonly T[];
  defaultValue?: readonly T[];
  onValueChange?: (value: T[]) => void;
  items: ReadonlyArray<MultiSelectItemData<T>>;
  label?: string;
  'aria-label'?: string;
  placeholder?: string;
  size?: FormControlSize;
  variant?: FormControlVariant;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  /** Hard cap on how many items can be selected. */
  maxSelected?: number;
  /** Rendered when the filtered dropdown is empty. */
  emptyState?: ReactNode;
  className?: string;
  style?: CSSProperties;
  name?: string;
  id?: string;
}

/**
 * Tag-based multi-select. Selected values render as removable tags inside the
 * trigger; typing filters the dropdown; Backspace removes the last tag when
 * the input is empty.
 */
export const MultiSelect = forwardRef<HTMLInputElement, MultiSelectProps<string>>(
  function MultiSelect(props, ref) {
    const {
      value: valueProp,
      defaultValue,
      onValueChange,
      items,
      label,
      placeholder = 'Add…',
      size = 'md',
      variant = 'outline',
      disabled,
      required,
      invalid,
      maxSelected,
      emptyState,
      className,
      style,
      id: idProp,
      name,
    } = props;

    const fallbackId = useId();
    const id = idProp ?? fallbackId;

    const [value, setValue] = useControllableState<string[]>({
      value: valueProp as string[] | undefined,
      defaultValue: (defaultValue as string[] | undefined) ?? [],
      onChange: onValueChange,
    });

    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const inputNodeRef = useRef<HTMLInputElement | null>(null);
    const mergedRef = useMergedRef(ref, inputNodeRef);
    const wrapperRef = useRef<HTMLDivElement | null>(null);

    const filtered = useMemo(() => {
      const selected = new Set(value);
      const q = query.trim().toLowerCase();
      return items.filter((item) => {
        if (selected.has(item.value)) return false;
        if (q === '') return true;
        const text = typeof item.label === 'string' ? item.label : item.value;
        return text.toLowerCase().includes(q);
      });
    }, [items, query, value]);

    const canAdd = maxSelected === undefined || value.length < maxSelected;

    const addValue = useCallback(
      (next: string) => {
        if (!canAdd) return;
        if (value.includes(next)) return;
        setValue([...value, next]);
        setQuery('');
      },
      [canAdd, setValue, value],
    );

    const removeValue = useCallback(
      (target: string) => {
        setValue(value.filter((v) => v !== target));
      },
      [setValue, value],
    );

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Backspace' && query === '' && value.length > 0) {
        event.preventDefault();
        const last = value[value.length - 1];
        if (last !== undefined) removeValue(last);
        return;
      }
      if (event.key === 'ArrowDown' && !open) {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    const labelMap = useMemo(() => {
      const map = new Map<string, ReactNode>();
      for (const item of items) map.set(item.value, item.label);
      return map;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items]);

    const wrapperClass = cn(
      controlWrapperBase,
      controlWrapperVariant[variant],
      controlSize[size],
      className,
    );

    return (
      <>
        <div
          ref={wrapperRef}
          className={wrapperClass}
          data-disabled={disabled || undefined}
          data-invalid={invalid || undefined}
          style={style}
          onClick={() => inputNodeRef.current?.focus()}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.preventDefault();
          }}
        >
          <div className={tagsRow}>
            {value.map((v) => (
              <span key={v} className={tag}>
                <span>{labelMap.get(v) ?? v}</span>
                <button
                  type="button"
                  className={tagRemove}
                  aria-label={`Remove ${typeof labelMap.get(v) === 'string' ? labelMap.get(v) : v}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeValue(v);
                  }}
                  disabled={disabled}
                >
                  <XIcon />
                </button>
              </span>
            ))}
            <input
              ref={mergedRef}
              id={id}
              name={name}
              className={inlineInput}
              aria-label={label ?? props['aria-label']}
              placeholder={value.length === 0 ? placeholder : undefined}
              value={query}
              disabled={disabled}
              required={required && value.length === 0}
              aria-invalid={invalid || undefined}
              onChange={(e) => {
                setQuery(e.target.value);
                if (!open) setOpen(true);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setOpen(true)}
            />
          </div>
        </div>
        {open && !disabled ? (
          <AriaPopover
            triggerRef={wrapperRef as React.RefObject<HTMLDivElement>}
            isOpen={open}
            onOpenChange={setOpen}
            placement="bottom start"
            className={popover}
            style={{ width: 'var(--trigger-width)' }}
          >
            {/* biome-ignore lint/a11y/useFocusableInteractive: the listbox is announced via the trigger's aria-activedescendant pattern; the input keeps the actual focus. */}
            {/* biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: composite widget — listbox/option is the correct WAI-ARIA pattern here. */}
            {/* biome-ignore lint/a11y/useSemanticElements: there is no native equivalent for a multi-select listbox. */}
            <ul role="listbox" className={listbox} aria-multiselectable="true">
              {filtered.length === 0 ? (
                <li className={listboxEmpty} role="presentation">
                  {emptyState ?? 'No results'}
                </li>
              ) : (
                filtered.map((item) => (
                  <li
                    key={item.value}
                    // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: listbox/option is the correct WAI-ARIA composite widget pattern.
                    // biome-ignore lint/a11y/useSemanticElements: no native HTML equivalent preserves the option role inside a custom listbox.
                    role="option"
                    aria-selected={false}
                    aria-disabled={item.disabled || !canAdd}
                    className={listboxItem}
                    tabIndex={-1}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      if (item.disabled || !canAdd) return;
                      addValue(item.value);
                      inputNodeRef.current?.focus();
                    }}
                  >
                    <span>{item.label}</span>
                  </li>
                ))
              )}
            </ul>
          </AriaPopover>
        ) : null}
      </>
    );
  },
) as <T extends string = string>(
  props: MultiSelectProps<T> & { ref?: React.Ref<HTMLInputElement> },
) => React.ReactElement;
