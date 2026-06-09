import {
  type CSSProperties,
  type ChangeEvent,
  type ClipboardEvent,
  Fragment,
  type KeyboardEvent,
  type ReactNode,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { useControllableState } from '../../hooks/useControllableState.js';
import { cn } from '../../utils/cn.js';
import type { FormControlSize } from '../shared/types.js';
import { cell, cellSize, root, separatorClass } from './PinInput.css.js';

export type PinInputType = 'numeric' | 'alphanumeric' | 'alphabetic';

const PATTERN_BY_TYPE: Record<PinInputType, RegExp> = {
  numeric: /[0-9]/,
  alphanumeric: /[a-zA-Z0-9]/,
  alphabetic: /[a-zA-Z]/,
};

/** Props for `<PinInput>` — OTP-style segmented entry. */
export interface PinInputProps {
  /**
   * Number of cells to render.
   * @default 6
   */
  length?: number;
  /** Controlled value (trimmed to `length`). */
  value?: string;
  /** Uncontrolled initial value. */
  defaultValue?: string;
  /** Fires on every cell change with the next value. */
  onChange?: (value: string) => void;
  /** Fires once the user has filled all `length` cells. */
  onComplete?: (value: string) => void;
  /**
   * Allowed character class. `numeric` enables the numeric mobile keyboard.
   * @default "numeric"
   */
  type?: PinInputType;
  /**
   * Mask the displayed characters (like a password).
   * @default false
   */
  mask?: boolean;
  /**
   * Control size.
   * @default "md"
   */
  size?: FormControlSize;
  /**
   * Disables every cell.
   * @default false
   */
  disabled?: boolean;
  /** Renders the invalid state on every cell. */
  invalid?: boolean;
  /** Focuses the first cell on mount. */
  autoFocus?: boolean;
  /**
   * Visual separator rendered at the midpoint of the cells (e.g. a dash for a
   * `123–456` grouping). Omitted by default.
   */
  separator?: ReactNode;
  /** Submitted form field name (renders a hidden input carrying the concatenated value). */
  name?: string;
  id?: string;
  /**
   * Accessible label for the group; individual cells append `digit N`.
   * @default "Verification code"
   */
  'aria-label'?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * OTP-style input: N single-character cells, arrow-key navigation, paste
 * distribution, backspace transfers to previous cell.
 */
export const PinInput = forwardRef<HTMLDivElement, PinInputProps>(function PinInput(props, ref) {
  const {
    length = 6,
    value: valueProp,
    defaultValue,
    onChange,
    onComplete,
    type = 'numeric',
    mask = false,
    size = 'md',
    disabled = false,
    invalid,
    autoFocus,
    separator,
    name,
    id,
    className,
    style,
  } = props;

  const ariaLabel = props['aria-label'] ?? 'Verification code';

  const [value, setValue] = useControllableState<string>({
    value: valueProp,
    defaultValue: defaultValue ?? '',
    onChange,
  });

  const cellsRef = useRef<Array<HTMLInputElement | null>>([]);
  const completedRef = useRef(false);

  useEffect(() => {
    if (value.length === length && !completedRef.current) {
      completedRef.current = true;
      onComplete?.(value);
    } else if (value.length !== length) {
      completedRef.current = false;
    }
  }, [value, length, onComplete]);

  useEffect(() => {
    if (autoFocus) cellsRef.current[0]?.focus();
  }, [autoFocus]);

  const pattern = PATTERN_BY_TYPE[type];

  const padded = useCallback((v: string) => v.padEnd(length, ' ').slice(0, length), [length]);

  /**
   * Distribute a string across cells starting at `from`, keeping only chars
   * that match the type (so `"123-456"` or a spaced code pastes cleanly), and
   * land focus on the next empty cell. Shared by paste and the multi-char
   * change path (OS SMS autofill drops the whole code into one cell's value).
   */
  const fill = useCallback(
    (text: string, from: number) => {
      const chars = padded(value).split('');
      let cursor = from;
      for (const ch of text) {
        if (cursor >= length) break;
        if (!pattern.test(ch)) continue;
        chars[cursor] = ch;
        cursor += 1;
      }
      setValue(chars.join('').trimEnd());
      cellsRef.current[Math.min(cursor, length - 1)]?.focus();
    },
    [padded, value, length, pattern, setValue],
  );

  const handleChange = (index: number) => (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    // Multi-char value = paste-into-field or OS one-time-code autofill — spread
    // it across the cells instead of keeping a single character.
    if (raw.length > 1) {
      fill(raw, index);
      return;
    }
    const char = raw;
    if (char === '') {
      const chars = padded(value).split('');
      chars[index] = ' ';
      setValue(chars.join('').trimEnd());
      return;
    }
    if (!pattern.test(char)) return;
    const chars = padded(value).split('');
    chars[index] = char;
    setValue(chars.join('').trimEnd());
    if (index < length - 1) cellsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number) => (event: KeyboardEvent<HTMLInputElement>) => {
    const key = event.key;
    if (key === 'Backspace') {
      const chars = padded(value).split('');
      if (chars[index] && chars[index] !== ' ') {
        chars[index] = ' ';
        const trimmed = chars.join('').trimEnd();
        setValue(trimmed);
        return;
      }
      if (index > 0) {
        event.preventDefault();
        cellsRef.current[index - 1]?.focus();
        chars[index - 1] = ' ';
        const trimmed = chars.join('').trimEnd();
        setValue(trimmed);
      }
      return;
    }
    if (key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      cellsRef.current[index - 1]?.focus();
    }
    if (key === 'ArrowRight' && index < length - 1) {
      event.preventDefault();
      cellsRef.current[index + 1]?.focus();
    }
    if (key === 'Home') {
      event.preventDefault();
      cellsRef.current[0]?.focus();
    }
    if (key === 'End') {
      event.preventDefault();
      cellsRef.current[length - 1]?.focus();
    }
  };

  const handlePaste = (index: number) => (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const text = event.clipboardData.getData('text').trim();
    if (text) fill(text, index);
  };

  const padVal = padded(value);

  return (
    <div
      ref={ref}
      className={cn(root, className)}
      style={style}
      // biome-ignore lint/a11y/useSemanticElements: no native element groups multiple single-character inputs as one logical OTP field.
      role="group"
      aria-label={ariaLabel}
    >
      {name ? <input type="hidden" name={name} id={id} value={value} /> : null}
      {Array.from({ length }).map((_, index) => {
        const raw = padVal[index] ?? ' ';
        const display = raw === ' ' ? '' : mask ? '●' : raw;
        // A separator splits the cells into two halves at the midpoint.
        const showSeparator = separator != null && index === Math.floor(length / 2) && length > 1;
        return (
          // Cells are positional — index is stable across renders (length is fixed).
          // biome-ignore lint/suspicious/noArrayIndexKey: each cell is tied to its positional index.
          <Fragment key={index}>
            {showSeparator ? (
              <span className={separatorClass} aria-hidden="true">
                {separator}
              </span>
            ) : null}
            <input
              ref={(el) => {
                cellsRef.current[index] = el;
              }}
              type="text"
              inputMode={type === 'numeric' ? 'numeric' : 'text'}
              pattern={type === 'numeric' ? '[0-9]*' : undefined}
              maxLength={1}
              autoComplete={index === 0 ? 'one-time-code' : 'off'}
              aria-label={`${ariaLabel} digit ${index + 1}`}
              aria-invalid={invalid || undefined}
              className={cn(cell, cellSize[size])}
              value={display}
              disabled={disabled}
              data-filled={display !== '' || undefined}
              data-invalid={invalid || undefined}
              onChange={handleChange(index)}
              onKeyDown={handleKeyDown(index)}
              onPaste={handlePaste(index)}
              onFocus={(e) => e.target.select()}
            />
          </Fragment>
        );
      })}
    </div>
  );
});
