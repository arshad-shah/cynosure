import { Search } from 'lucide-react';
import {
  type CSSProperties,
  type InputHTMLAttributes,
  type KeyboardEvent,
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
} from 'react';
import { useControllableState } from '../../hooks/useControllableState.js';
import { useDebouncedValue } from '../../hooks/useDebouncedValue.js';
import { useMergedRef } from '../../hooks/useMergedRef.js';
import { Input, type InputVariant } from '../Input/Input.js';
import type { FormControlBase } from '../shared/types.js';

export interface SearchInputOwnProps extends Omit<FormControlBase<string>, 'variant'> {
  variant?: InputVariant;
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

const SearchIcon = (): React.ReactElement => <Search aria-hidden size={16} />;

/** Search-shaped input. Thin wrapper over `Input` with a search icon, clear button, debounced `onSearch`, and Enter-to-submit. */
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

    const debounced = useDebouncedValue(value, debounceMs);
    const lastDispatchedRef = useRef<string | null>(null);

    useEffect(() => {
      if (lastDispatchedRef.current === debounced) return;
      lastDispatchedRef.current = debounced;
      onSearch?.(debounced);
    }, [debounced, onSearch]);

    const handleKeyDown = useCallback(
      (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Escape' && value !== '') {
          event.preventDefault();
          setValue('');
          inputNodeRef.current?.focus();
        } else if (event.key === 'Enter') {
          onSubmit?.(value);
        }
        onKeyDown?.(event);
      },
      [value, setValue, onSubmit, onKeyDown],
    );

    return (
      <Input
        {...rest}
        id={id}
        ref={mergedRef}
        type="search"
        value={value}
        onChange={setValue}
        placeholder={placeholder}
        clearable
        leadingSlot={<SearchIcon />}
        onKeyDown={handleKeyDown}
      />
    );
  },
);
