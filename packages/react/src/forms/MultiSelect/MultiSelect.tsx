import { X } from 'lucide-react';
import {
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useControllableState } from '../../hooks/useControllableState.js';
import { useMergedRef } from '../../hooks/useMergedRef.js';
import { cn } from '../../utils/cn.js';
import { controlSize, controlWrapperBase, controlWrapperVariant } from '../shared/control.css.js';
import { listbox, listboxEmpty, listboxItem, popover } from '../shared/popover.css.js';
import type { FormControlSize, FormControlVariant } from '../shared/types.js';
import { inlineInput, tag, tagRemove, tagsRow } from './MultiSelect.css.js';

/** Shape of a data-driven `<MultiSelect>` option. */
export interface MultiSelectItemData<T extends string = string> {
  /** Unique value submitted when selected. */
  value: T;
  /** Visible label. */
  label: ReactNode;
  /** Disables this option. */
  disabled?: boolean;
}

/** Props for `<MultiSelect>`. */
export interface MultiSelectProps<T extends string = string> {
  /** Controlled array of selected values. */
  value?: readonly T[];
  /** Uncontrolled initial array of selected values. */
  defaultValue?: readonly T[];
  /** Fires with the next array on every add/remove. */
  onValueChange?: (value: T[]) => void;
  /** Options to choose from. */
  items: ReadonlyArray<MultiSelectItemData<T>>;
  /** Visible label, also used as the trigger's accessible name. */
  label?: string;
  /** Aria label when no visual label is available. */
  'aria-label'?: string;
  /**
   * Placeholder rendered when nothing is selected.
   * @default "Add…"
   */
  placeholder?: string;
  /**
   * Control size.
   * @default "md"
   */
  size?: FormControlSize;
  /**
   * Visual treatment.
   * @default "outline"
   */
  variant?: FormControlVariant;
  /** Disables interaction. */
  disabled?: boolean;
  /** Requires at least one selection for form submission. */
  required?: boolean;
  /** Renders the invalid state and sets `aria-invalid`. */
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
    const popoverRef = useRef<HTMLDivElement | null>(null);
    const [popoverRect, setPopoverRect] = useState<{
      top: number;
      left: number;
      width: number;
    } | null>(null);

    useLayoutEffect(() => {
      if (!open) return;
      const measure = () => {
        const el = wrapperRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        setPopoverRect({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      };
      measure();
      window.addEventListener('scroll', measure, true);
      window.addEventListener('resize', measure);
      return () => {
        window.removeEventListener('scroll', measure, true);
        window.removeEventListener('resize', measure);
      };
    }, [open]);

    useEffect(() => {
      if (!open) return;
      const handlePointerDown = (event: PointerEvent) => {
        const target = event.target as Node | null;
        if (!target) return;
        if (wrapperRef.current?.contains(target)) return;
        if (popoverRef.current?.contains(target)) return;
        setOpen(false);
      };
      document.addEventListener('pointerdown', handlePointerDown, true);
      return () => document.removeEventListener('pointerdown', handlePointerDown, true);
    }, [open]);

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
                  <X size={12} strokeWidth={3} aria-hidden />
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
        {open && !disabled && popoverRect
          ? createPortal(
              <div
                ref={popoverRef}
                className={popover}
                style={{
                  position: 'absolute',
                  top: popoverRect.top,
                  left: popoverRect.left,
                  width: popoverRect.width,
                }}
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
              </div>,
              document.body,
            )
          : null}
      </>
    );
  },
) as <T extends string = string>(
  props: MultiSelectProps<T> & { ref?: React.Ref<HTMLInputElement> },
) => React.ReactElement;
