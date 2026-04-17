import {
  type CSSProperties,
  type ChangeEvent,
  type ClipboardEvent,
  type KeyboardEvent,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { useControllableState } from '../../hooks/useControllableState.js';
import { cn } from '../../utils/cn.js';
import type { FormControlSize } from '../shared/types.js';
import { cell, cellSize, root } from './PinInput.css.js';

export type PinInputType = 'numeric' | 'alphanumeric' | 'alphabetic';

const PATTERN_BY_TYPE: Record<PinInputType, RegExp> = {
  numeric: /[0-9]/,
  alphanumeric: /[a-zA-Z0-9]/,
  alphabetic: /[a-zA-Z]/,
};

export interface PinInputProps {
  length?: number;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Fires once the user has filled all `length` cells. */
  onComplete?: (value: string) => void;
  type?: PinInputType;
  /** Mask the displayed characters (like a password). */
  mask?: boolean;
  size?: FormControlSize;
  disabled?: boolean;
  invalid?: boolean;
  autoFocus?: boolean;
  name?: string;
  id?: string;
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

  const handleChange = (index: number) => (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    const char = raw.slice(-1);
    if (char === '') {
      const next = padded(value);
      const chars = next.split('');
      chars[index] = ' ';
      const trimmed = chars.join('').trimEnd();
      setValue(trimmed);
      return;
    }
    if (!pattern.test(char)) return;
    const normalized = type === 'alphabetic' || type === 'alphanumeric' ? char : char;
    const chars = padded(value).split('');
    chars[index] = normalized;
    const joined = chars.join('').trimEnd();
    setValue(joined);
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
    if (!text) return;
    const chars = padded(value).split('');
    let cursor = index;
    for (const ch of text) {
      if (cursor >= length) break;
      if (!pattern.test(ch)) continue;
      chars[cursor] = ch;
      cursor += 1;
    }
    const joined = chars.join('').trimEnd();
    setValue(joined);
    cellsRef.current[Math.min(cursor, length - 1)]?.focus();
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
        const display = raw === ' ' ? '' : mask ? '•' : raw;
        return (
          <input
            // Cells are positional — index is stable across renders (length is fixed).
            // biome-ignore lint/suspicious/noArrayIndexKey: each cell is tied to its positional index.
            key={index}
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
        );
      })}
    </div>
  );
});
