import { Check, ChevronDown, X } from 'lucide-react';
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
import { useResizeObserver } from '../../hooks/useResizeObserver.js';
import { cn } from '../../utils/cn.js';
import { SearchInput } from '../SearchInput/SearchInput.js';
import { listboxEmpty } from '../shared/popover.css.js';
import {
  triggerChevronIcon,
  triggerChevronSize,
  triggerChevronTile,
  triggerTileSize,
  triggerTrack,
  triggerTrackSize,
  triggerValueTile,
} from '../shared/segmentedTrigger.css.js';
import type { FormControlSize, FormControlVariant } from '../shared/types.js';
import {
  multiSelectList,
  multiSelectPopover,
  option,
  optionCheck,
  optionLabel,
  overflowBadge,
  placeholder as placeholderClass,
  searchHeader,
  tag,
  tagLabel,
  tagRemove,
  tagsRow,
} from './MultiSelect.css.js';

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
   * @default "Select…"
   */
  placeholder?: string;
  /**
   * Placeholder for the in-dropdown search field.
   * @default "Search…"
   */
  searchPlaceholder?: string;
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

const RESERVED_BADGE_WIDTH = 44; // px reserved for the "+N" chip when overflowing.

/**
 * Tag-based multi-select with a fixed-height trigger. Selected values render
 * as removable chips on a single row; chips that don't fit collapse into a
 * `+N` overflow badge (so the control never grows as you select). Opening the
 * dropdown reveals a search field and the full option list — every item stays
 * reachable and toggles on click, with a checkmark marking the selected ones.
 */
export const MultiSelect = forwardRef<HTMLDivElement, MultiSelectProps<string>>(
  function MultiSelect(props, ref) {
    const {
      value: valueProp,
      defaultValue,
      onValueChange,
      items,
      label,
      placeholder = 'Select…',
      searchPlaceholder = 'Search…',
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
    const listboxId = `${id}-listbox`;

    const [value, setValue] = useControllableState<string[]>({
      value: valueProp as string[] | undefined,
      defaultValue: (defaultValue as string[] | undefined) ?? [],
      onChange: onValueChange,
    });

    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const [focused, setFocused] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    const triggerRef = useRef<HTMLDivElement | null>(null);
    const mergedRef = useMergedRef(ref, triggerRef);
    const tagsRowRef = useRef<HTMLDivElement | null>(null);
    const searchRef = useRef<HTMLInputElement | null>(null);
    const popoverRef = useRef<HTMLDivElement | null>(null);
    const [popoverRect, setPopoverRect] = useState<{
      top: number;
      left: number;
      width: number;
    } | null>(null);

    const labelMap = useMemo(() => {
      const map = new Map<string, ReactNode>();
      for (const item of items) map.set(item.value, item.label);
      return map;
    }, [items]);

    const labelText = useCallback(
      (v: string): string => {
        const l = labelMap.get(v);
        return typeof l === 'string' ? l : v;
      },
      [labelMap],
    );

    // ---- Overflow: how many chips fit on the single row before "+N". ----
    // We measure the *real* chips rather than a hidden mirror: each time the
    // value / size / width changes we render every chip (measuring pass), read
    // their widths in a layout effect (before paint, so no flicker), then
    // collapse the overflow into a "+N" badge.
    const [visibleCount, setVisibleCount] = useState(value.length);
    const measuringRef = useRef(true);
    const rowEntry = useResizeObserver(tagsRowRef);

    // biome-ignore lint/correctness/useExhaustiveDependencies: rowEntry (resize), size, and labelText are intentional re-measure triggers, not values read here.
    useLayoutEffect(() => {
      measuringRef.current = true;
      setVisibleCount(value.length);
    }, [value, rowEntry, size, labelText]);

    useLayoutEffect(() => {
      if (!measuringRef.current) return;
      measuringRef.current = false;
      const row = tagsRowRef.current;
      const avail = row?.clientWidth ?? 0;
      const chips = Array.from(row?.querySelectorAll<HTMLElement>('[data-chip]') ?? []);
      if (avail === 0 || chips.length === 0) return;
      const gap = 6;
      let used = 0;
      let count = 0;
      for (let i = 0; i < chips.length; i += 1) {
        const chip = chips[i];
        if (!chip) break;
        const w = chip.getBoundingClientRect().width + (i > 0 ? gap : 0);
        // Every chip but the last must leave room for the "+N" badge in case
        // the following chips don't fit.
        const reserve = i < chips.length - 1 ? gap + RESERVED_BADGE_WIDTH : 0;
        if (used + w + reserve <= avail) {
          used += w;
          count += 1;
        } else {
          break;
        }
      }
      if (count !== value.length) setVisibleCount(count);
    });

    const measuring = measuringRef.current;
    const hiddenCount = measuring ? 0 : Math.max(0, value.length - visibleCount);
    const visibleValues = hiddenCount > 0 ? value.slice(0, visibleCount) : value;

    // ---- Popover placement (portalled, anchored under the trigger). ----
    useLayoutEffect(() => {
      if (!open) return;
      const measure = () => {
        const el = triggerRef.current;
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

    // Close on outside pointer-down.
    useEffect(() => {
      if (!open) return;
      const handlePointerDown = (event: PointerEvent) => {
        const target = event.target as Node | null;
        if (!target) return;
        if (triggerRef.current?.contains(target)) return;
        if (popoverRef.current?.contains(target)) return;
        setOpen(false);
      };
      document.addEventListener('pointerdown', handlePointerDown, true);
      return () => document.removeEventListener('pointerdown', handlePointerDown, true);
    }, [open]);

    // Focus the search field when opening; reset query/active when closing.
    useEffect(() => {
      if (open) {
        searchRef.current?.focus();
      } else {
        setQuery('');
        setActiveIndex(0);
      }
    }, [open]);

    const filtered = useMemo(() => {
      const q = query.trim().toLowerCase();
      if (q === '') return items;
      return items.filter((item) => labelText(item.value).toLowerCase().includes(q));
    }, [items, query, labelText]);

    // Keep the active option index in range as the filtered list changes.
    useEffect(() => {
      setActiveIndex((i) => Math.min(Math.max(0, i), Math.max(0, filtered.length - 1)));
    }, [filtered.length]);

    const selectedSet = useMemo(() => new Set(value), [value]);
    const atMax = maxSelected !== undefined && value.length >= maxSelected;

    const toggleValue = useCallback(
      (target: string) => {
        if (selectedSet.has(target)) {
          setValue(value.filter((v) => v !== target));
        } else {
          if (atMax) return;
          setValue([...value, target]);
        }
      },
      [atMax, selectedSet, setValue, value],
    );

    const removeValue = useCallback(
      (target: string) => setValue(value.filter((v) => v !== target)),
      [setValue, value],
    );

    const closeAndFocusTrigger = useCallback(() => {
      setOpen(false);
      triggerRef.current?.focus();
    }, []);

    const handleTriggerKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setOpen(true);
      }
    };

    const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
          break;
        case 'ArrowUp':
          event.preventDefault();
          setActiveIndex((i) => Math.max(i - 1, 0));
          break;
        case 'Enter': {
          event.preventDefault();
          const item = filtered[activeIndex];
          if (item && !item.disabled && !(atMax && !selectedSet.has(item.value))) {
            toggleValue(item.value);
          }
          break;
        }
        case 'Escape':
          // SearchInput clears a non-empty query on Escape; only close the
          // dropdown once the search is already empty (two-step Escape).
          if (query === '') {
            event.preventDefault();
            closeAndFocusTrigger();
          }
          break;
        case 'Backspace':
          if (query === '' && value.length > 0) {
            event.preventDefault();
            const last = value[value.length - 1];
            if (last !== undefined) removeValue(last);
          }
          break;
      }
    };

    const trackClass = cn(triggerTrack, triggerTrackSize[size], className);

    const renderChip = (v: string) => (
      <span key={v} className={tag} data-chip="">
        <span className={tagLabel}>{labelMap.get(v) ?? v}</span>
        <button
          type="button"
          className={tagRemove}
          aria-label={`Remove ${labelText(v)}`}
          onClick={(e) => {
            e.stopPropagation();
            removeValue(v);
          }}
          disabled={disabled}
        >
          <X size={12} strokeWidth={3} aria-hidden />
        </button>
      </span>
    );

    return (
      <>
        <div
          ref={mergedRef}
          id={id}
          // biome-ignore lint/a11y/useSemanticElements: the combobox trigger wraps removable chip <button>s, so it can't be a native form control.
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          aria-label={label ?? props['aria-label']}
          aria-invalid={invalid || undefined}
          aria-required={required || undefined}
          aria-disabled={disabled || undefined}
          tabIndex={disabled ? -1 : 0}
          className={trackClass}
          data-variant={variant}
          data-open={open || undefined}
          data-disabled={disabled || undefined}
          data-invalid={invalid || undefined}
          data-focus-within={open || focused || undefined}
          style={style}
          onClick={() => {
            if (!disabled) setOpen((o) => !o);
          }}
          onKeyDown={handleTriggerKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        >
          <span className={cn(triggerValueTile, triggerTileSize[size])}>
            <div ref={tagsRowRef} className={tagsRow}>
              {value.length === 0 ? (
                <span className={placeholderClass}>{placeholder}</span>
              ) : (
                <>
                  {visibleValues.map((v) => renderChip(v))}
                  {hiddenCount > 0 ? (
                    <span className={overflowBadge} aria-label={`${hiddenCount} more selected`}>
                      +{hiddenCount}
                    </span>
                  ) : null}
                </>
              )}
            </div>
          </span>
          <span
            className={cn(triggerChevronTile, triggerTileSize[size], triggerChevronSize[size])}
            aria-hidden="true"
          >
            <span className={triggerChevronIcon}>
              <ChevronDown size={16} aria-hidden />
            </span>
          </span>

          {/* Hidden inputs so selected values submit with the form. */}
          {name ? value.map((v) => <input key={v} type="hidden" name={name} value={v} />) : null}
        </div>

        {open && !disabled && popoverRect
          ? createPortal(
              <div
                ref={popoverRef}
                className={multiSelectPopover}
                style={{
                  position: 'absolute',
                  top: popoverRect.top,
                  left: popoverRect.left,
                  width: popoverRect.width,
                }}
              >
                <div className={searchHeader}>
                  <SearchInput
                    ref={searchRef}
                    size="sm"
                    placeholder={searchPlaceholder}
                    aria-label={`Search ${label ?? props['aria-label'] ?? 'options'}`}
                    aria-controls={listboxId}
                    aria-activedescendant={
                      filtered[activeIndex] ? `${id}-opt-${filtered[activeIndex].value}` : undefined
                    }
                    value={query}
                    onChange={setQuery}
                    onKeyDown={handleSearchKeyDown}
                  />
                </div>
                <ul
                  id={listboxId}
                  // Focus stays on the search input; options use the
                  // aria-activedescendant pattern. tabIndex=-1 keeps the
                  // listbox out of the tab order while satisfying a11y tooling.
                  tabIndex={-1}
                  // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: composite listbox widget — option role is correct here.
                  // biome-ignore lint/a11y/useSemanticElements: there is no native multi-select listbox equivalent.
                  role="listbox"
                  className={multiSelectList}
                  aria-multiselectable="true"
                >
                  {filtered.length === 0 ? (
                    <li className={listboxEmpty} role="presentation">
                      {emptyState ?? 'No results'}
                    </li>
                  ) : (
                    filtered.map((item, index) => {
                      const selected = selectedSet.has(item.value);
                      const blocked = item.disabled || (atMax && !selected);
                      return (
                        <li
                          key={item.value}
                          id={`${id}-opt-${item.value}`}
                          // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: listbox/option composite widget pattern.
                          // biome-ignore lint/a11y/useSemanticElements: no native HTML option preserves the role inside a custom listbox.
                          role="option"
                          aria-selected={selected}
                          aria-disabled={blocked || undefined}
                          className={option}
                          data-selected={selected || undefined}
                          data-active={index === activeIndex || undefined}
                          tabIndex={-1}
                          onMouseEnter={() => setActiveIndex(index)}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            if (blocked) return;
                            toggleValue(item.value);
                            searchRef.current?.focus();
                          }}
                        >
                          <span className={optionCheck} aria-hidden="true">
                            {selected ? <Check size={12} strokeWidth={3} /> : null}
                          </span>
                          <span className={optionLabel}>{item.label}</span>
                        </li>
                      );
                    })
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
  props: MultiSelectProps<T> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement;
