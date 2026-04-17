import {
  type CSSProperties,
  type FocusEvent,
  type TextareaHTMLAttributes,
  forwardRef,
  useCallback,
  useId,
  useState,
} from 'react';
import { useControllableState } from '../../hooks/useControllableState.js';
import { cn } from '../../utils/cn.js';
import {
  controlField,
  controlSize,
  controlWrapperBase,
  controlWrapperVariant,
} from '../shared/control.css.js';
import type { FormControlBase } from '../shared/types.js';
import { textareaAutoResize, textareaField } from './Textarea.css.js';

export interface TextareaOwnProps extends FormControlBase<string> {
  rows?: number;
  /**
   * Grow to fit content. Uses native `field-sizing: content` where supported
   * (Chromium-based browsers) and falls back to the consumer-provided `rows`
   * otherwise.
   */
  autoResize?: boolean;
  maxRows?: number;
  className?: string;
  style?: CSSProperties;
  placeholder?: string;
}

export type TextareaProps = TextareaOwnProps &
  Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    'size' | 'value' | 'defaultValue' | 'onChange' | 'rows'
  >;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(props, ref) {
    const {
      id: idProp,
      value: valueProp,
      defaultValue,
      onChange,
      disabled,
      readOnly,
      required,
      invalid,
      size = 'md',
      variant = 'outline',
      rows = 3,
      autoResize,
      maxRows,
      className,
      style,
      onFocus,
      onBlur,
      ...rest
    } = props;

    const fallbackId = useId();
    const id = idProp ?? fallbackId;

    const [value, setValue] = useControllableState<string>({
      value: valueProp,
      defaultValue: defaultValue ?? '',
      onChange,
    });

    const [focused, setFocused] = useState(false);
    const [hover, setHover] = useState(false);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setValue(e.target.value);
      },
      [setValue],
    );

    const handleFocus = useCallback(
      (e: FocusEvent<HTMLTextAreaElement>) => {
        setFocused(true);
        onFocus?.(e);
      },
      [onFocus],
    );
    const handleBlur = useCallback(
      (e: FocusEvent<HTMLTextAreaElement>) => {
        setFocused(false);
        onBlur?.(e);
      },
      [onBlur],
    );

    const wrapperClass = cn(
      controlWrapperBase,
      controlWrapperVariant[variant],
      controlSize[size],
      className,
    );

    const fieldClass = cn(controlField, textareaField, autoResize ? textareaAutoResize : undefined);

    const fieldStyle: CSSProperties | undefined =
      autoResize && maxRows ? { maxHeight: `${maxRows * 1.5}em` } : undefined;

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
        style={{ ...style, alignItems: 'stretch' }}
      >
        <textarea
          id={id}
          ref={ref}
          rows={rows}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          aria-invalid={invalid || undefined}
          className={fieldClass}
          style={fieldStyle}
          {...rest}
        />
      </div>
    );
  },
);
