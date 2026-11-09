import {
  type CSSProperties,
  forwardRef,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Icon } from "../../foundations/Icon/Icon.js";
import { InputBase } from "../../foundations/InputBase/InputBase.js";
import { close } from "../../icons/close.js";
import type { IconData } from "../../icons/types.js";
import type { Size } from "../../tokens/schema.js";
import { Field } from "../Field/Field.js";
import { IconButton } from "../IconButton/IconButton.js";

export interface TextFieldTokens {
  heightSm: string;
  heightMd: string;
  heightLg: string;
  radius: string;
  paddingInline: string;
  bg: string;
  border: string;
  softBg: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    textField: TextFieldTokens;
  }
}

type NativeInput = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "value" | "defaultValue" | "onChange" | "onSubmit" | "type" | "className" | "style" | "children"
>;

export interface TextFieldProps extends NativeInput {
  label: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  type?: "text" | "email" | "url" | "tel" | "password" | "number" | "search";
  size?: Size;
  /** `outline` (default) or `soft` (tinted, borderless until focus). */
  variant?: "outline" | "soft";
  iconStart?: IconData | undefined;
  iconEnd?: IconData | undefined;
  /** Shows a clear button while the field has a value. */
  clearable?: boolean;
  labels?: { clear?: string };
  className?: string;
  /** Layout only. */
  style?: CSSProperties;
  "data-testid"?: string;
}

const setNativeValue = (input: HTMLInputElement, value: string) => {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
};

/** Single-line text input with label, description, error, icons and an optional clear button. */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  {
    label,
    description,
    error,
    value,
    defaultValue,
    onChange,
    type = "text",
    size = "md",
    variant = "outline",
    iconStart,
    iconEnd,
    clearable = false,
    labels,
    required,
    disabled,
    id,
    className,
    style,
    onKeyDown,
    ...rest
  },
  forwarded,
) {
  const inner = useRef<HTMLInputElement | null>(null);
  const [filled, setFilled] = useState(Boolean(value ?? defaultValue));
  const controlled = value !== undefined;
  useEffect(() => {
    if (controlled) setFilled(Boolean(value));
  }, [controlled, value]);
  useEffect(() => {
    const form = inner.current?.form;
    if (!form) return;
    // After the browser restores the default value on reset, sync the clear button.
    const onReset = () => requestAnimationFrame(() => setFilled(Boolean(inner.current?.value)));
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  }, []);
  const ref = useCallback(
    (node: HTMLInputElement | null) => {
      inner.current = node;
      if (typeof forwarded === "function") forwarded(node);
      else if (forwarded) forwarded.current = node;
    },
    [forwarded],
  );
  const clear = () => {
    if (!inner.current) return;
    setNativeValue(inner.current, "");
    inner.current.focus();
  };

  return (
    <Field
      label={label}
      description={description}
      error={error}
      required={required}
      size={size}
      id={id}
      className={className}
      style={style}
    >
      {(field) => (
        <div
          className="cy-text-field"
          data-size={size}
          data-variant={variant}
          data-invalid={field.invalid ? "" : undefined}
          data-disabled={disabled ? "" : undefined}
        >
          {iconStart && <Icon icon={iconStart} className="cy-text-field-icon" />}
          <InputBase
            ref={ref}
            {...rest}
            id={field.id}
            type={type}
            className="cy-text-field-input"
            aria-describedby={field.describedBy}
            invalid={field.invalid}
            required={required}
            disabled={disabled}
            {...(controlled ? { value } : { defaultValue })}
            onChange={(e) => {
              setFilled(Boolean(e.currentTarget.value));
              onChange?.(e.currentTarget.value);
            }}
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => onKeyDown?.(e)}
          />
          {clearable && filled && !disabled && (
            <IconButton
              icon={close}
              label={labels?.clear ?? "Clear"}
              variant="ghost"
              size="sm"
              onClick={clear}
              className="cy-text-field-clear"
            />
          )}
          {iconEnd && <Icon icon={iconEnd} className="cy-text-field-icon" />}
        </div>
      )}
    </Field>
  );
});
