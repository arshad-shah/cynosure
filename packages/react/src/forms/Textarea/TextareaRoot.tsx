import {
  type CSSProperties,
  type FocusEvent,
  type ReactElement,
  type ReactNode,
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useControllableState } from '../../hooks/useControllableState.js';
import { cn } from '../../utils/cn.js';
import type { FormControlSize, FormControlVariant } from '../shared/types.js';
import { textareaRoot, textareaRootSize, textareaRootVariant } from './Textarea.css.js';
import {
  TextareaContextProvider,
  type TextareaContextValue,
  type TextareaResizeMode,
} from './TextareaContext.js';

export interface TextareaRootProps {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;

  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  /** Forced-invalid state (e.g. from `FormField`). Also flips automatically when an over-limit `<TextareaCounter>` is mounted. */
  invalid?: boolean;

  size?: FormControlSize;
  variant?: FormControlVariant;

  autoResize?: boolean;
  maxRows?: number;
  resize?: TextareaResizeMode;

  /** Character limit forwarded to any nested `<TextareaCounter>` without its own `limit`. */
  limit?: number;

  className?: string;
  style?: CSSProperties;
  'aria-describedby'?: string;
  children?: ReactNode;
}

/**
 * Compound primitive. Owns the value state, focus/hover state, and provides
 * context for the other sub-components (`TextareaField`, `TextareaCounter`,
 * `TextareaClearButton`, `TextareaFooter`, `TextareaActions`, `TextareaResizeHandle`).
 */
export function TextareaRoot({
  id: idProp,
  name,
  value: valueProp,
  defaultValue,
  onChange,
  disabled = false,
  readOnly = false,
  required = false,
  invalid: invalidProp = false,
  size = 'md',
  variant = 'outline',
  autoResize = false,
  maxRows,
  resize = 'vertical',
  limit,
  className,
  style,
  'aria-describedby': ariaDescribedBy,
  children,
}: TextareaRootProps): ReactElement {
  const fallbackId = useId();
  const id = idProp ?? fallbackId;

  const [value, setValue] = useControllableState<string>({
    value: valueProp,
    defaultValue: defaultValue ?? '',
    onChange,
  });

  const [focused, setFocused] = useState(false);
  const [hover, setHover] = useState(false);
  const [hasClearButton, setHasClearButton] = useState(false);
  const [hasResizeHandle, setHasResizeHandle] = useState(false);
  const [hasFooter, setHasFooter] = useState(false);
  const [overLimit, setOverLimit] = useState(false);
  const fieldRef = useRef<HTMLTextAreaElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const invalid = invalidProp || overLimit;

  const ctx = useMemo<TextareaContextValue>(
    () => ({
      id,
      name,
      value,
      setValue,
      fieldRef,
      rootRef,
      disabled,
      readOnly,
      required,
      invalid,
      overLimit,
      size,
      variant,
      limit,
      autoResize,
      maxRows,
      resize,
      hasClearButton,
      setHasClearButton,
      hasResizeHandle,
      setHasResizeHandle,
      hasFooter,
      setHasFooter,
      setOverLimit,
      ariaDescribedBy,
    }),
    [
      id,
      name,
      value,
      setValue,
      disabled,
      readOnly,
      required,
      invalid,
      overLimit,
      size,
      variant,
      limit,
      autoResize,
      maxRows,
      resize,
      hasClearButton,
      hasResizeHandle,
      hasFooter,
      ariaDescribedBy,
    ],
  );

  const handleFocus = useCallback((_e: FocusEvent<HTMLDivElement>) => {
    setFocused(true);
  }, []);

  const handleBlur = useCallback((e: FocusEvent<HTMLDivElement>) => {
    // Only clear when focus leaves the wrapper entirely, not when it moves
    // between field ↔ clear button ↔ toolbar actions.
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      setFocused(false);
    }
  }, []);

  return (
    <TextareaContextProvider value={ctx}>
      <div
        ref={rootRef}
        className={cn(
          textareaRoot,
          textareaRootVariant[variant],
          textareaRootSize[size],
          className,
        )}
        style={style}
        data-disabled={disabled || undefined}
        data-readonly={readOnly || undefined}
        data-invalid={invalid || undefined}
        data-focus-within={focused || undefined}
        data-hover={hover || undefined}
        data-has-grip={hasResizeHandle || undefined}
        data-has-footer={hasFooter || undefined}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {children}
      </div>
    </TextareaContextProvider>
  );
}
