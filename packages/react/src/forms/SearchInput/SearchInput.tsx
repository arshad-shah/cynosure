import {
  type CSSProperties,
  type InputHTMLAttributes,
  type KeyboardEvent,
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { useControllableState } from '../../hooks/useControllableState.js';
import { useDebouncedValue } from '../../hooks/useDebouncedValue.js';
import { useMergedRef } from '../../hooks/useMergedRef.js';
import { cn } from '../../utils/cn.js';
import { IconButton } from '../IconButton/IconButton.js';
import { inputAffordance } from '../shared/affordance.css.js';
import {
  controlElement,
  controlField,
  controlSize,
  controlWrapperBase,
  controlWrapperVariant,
} from '../shared/control.css.js';
import type { FormControlBase } from '../shared/types.js';

const SearchIcon = (): React.ReactElement => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
    <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const XIcon = (): React.ReactElement => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export interface SearchInputOwnProps extends FormControlBase<string> {
  placeholder?: string;
  /** Debounced callback — fires `debounceMs` after the user stops typing. */
  onSearch?: (query: string) => void;
  /** Debounce delay in milliseconds. Defaults to 200. */
  debounceMs?: number;
  /** Submit handler — fires on Enter. */
  onSubmit?: (query: string) => void;
  className?: string;
  style?: CSSProperties;
}

export type SearchInputProps = SearchInputOwnProps &
  Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'size' | 'value' | 'defaultValue' | 'onChange' | 'type' | 'onSubmit'
  >;

/** Search-shaped input with icon, clear button, and debounced `onSearch`. */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput(props, ref) {
    const {
      id: idProp,
      value: valueProp,
      defaultValue,
      onChange,
      onSearch,
      onSubmit,
      debounceMs = 200,
      placeholder = 'Search…',
      disabled,
      readOnly,
      required,
      invalid,
      size = 'md',
      variant = 'outline',
      className,
      style,
      onKeyDown,
      ...rest
    } = props;

    const fallbackId = useId();
    const id = idProp ?? fallbackId;

    const [value, setValue] = useControllableState<string>({
      value: valueProp,
      defaultValue: defaultValue ?? '',
      onChange,
    });

    const inputNodeRef = useRef<HTMLInputElement | null>(null);
    const mergedRef = useMergedRef(ref, inputNodeRef);

    const [focused, setFocused] = useState(false);
    const [hover, setHover] = useState(false);

    const debounced = useDebouncedValue(value, debounceMs);
    const lastDispatchedRef = useRef<string | null>(null);

    useEffect(() => {
      if (lastDispatchedRef.current === debounced) return;
      lastDispatchedRef.current = debounced;
      onSearch?.(debounced);
    }, [debounced, onSearch]);

    const handleClear = useCallback(() => {
      setValue('');
      inputNodeRef.current?.focus();
    }, [setValue]);

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Escape') {
        if (value !== '') {
          event.preventDefault();
          handleClear();
        }
      }
      if (event.key === 'Enter') {
        onSubmit?.(value);
      }
      onKeyDown?.(event);
    };

    const wrapperClass = cn(
      controlWrapperBase,
      controlWrapperVariant[variant],
      controlSize[size],
      className,
    );

    return (
      <div
        className={wrapperClass}
        data-disabled={disabled || undefined}
        data-readonly={readOnly || undefined}
        data-invalid={invalid || undefined}
        data-focus-within={focused || undefined}
        data-hover={hover || undefined}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={style}
      >
        <span className={controlElement} aria-hidden="true">
          <SearchIcon />
        </span>
        <input
          ref={mergedRef}
          id={id}
          type="search"
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          aria-invalid={invalid || undefined}
          className={controlField}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          {...rest}
        />
        {value !== '' && !disabled && !readOnly ? (
          <span className={controlElement}>
            <IconButton
              variant="bare"
              label="Clear search"
              icon={<XIcon />}
              className={inputAffordance}
              onClick={handleClear}
            />
          </span>
        ) : null}
      </div>
    );
  },
);
