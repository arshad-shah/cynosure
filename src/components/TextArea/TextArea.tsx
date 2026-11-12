import {
  type CSSProperties,
  forwardRef,
  type ReactNode,
  type TextareaHTMLAttributes,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useDrag } from "../../foundations/drag.js";
import { Icon } from "../../foundations/Icon/Icon.js";
import { TextAreaBase } from "../../foundations/TextAreaBase/TextAreaBase.js";
import { resizeCorner } from "../../icons/resize-corner.js";
import type { Size } from "../../tokens/schema.js";
import { Field } from "../Field/Field.js";

export interface TextAreaTokens {
  radius: string;
  paddingInline: string;
  paddingBlock: string;
  bg: string;
  border: string;
  softBg: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    textArea: TextAreaTokens;
  }
}

type NativeArea = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "defaultValue" | "onChange" | "rows" | "className" | "style" | "children"
>;

export interface TextAreaProps extends NativeArea {
  /** The field's label and accessible name. */
  label: ReactNode;
  /** Visually hide the label (it still names the control). Prefer visible labels. */
  labelHidden?: boolean | undefined;
  /** Help text shown below the field. */
  description?: ReactNode;
  /** Error message shown below the field; it is announced and marks the field invalid. */
  error?: ReactNode;
  /** The text (controlled). */
  value?: string;
  /** Starting text when uncontrolled. */
  defaultValue?: string;
  /** Called with the new text on every edit. */
  onChange?: (value: string) => void;
  /** Show a corner grip to drag the height (pointer and touch). Content growth still applies. */
  resizable?: boolean;
  /** Minimum visible rows. */
  rows?: number;
  /** Auto-grow cap; content beyond scrolls. */
  maxRows?: number;
  /** Shows a live character counter. */
  showCount?: boolean;
  /** Text size of the field and its label. Default "md". */
  size?: Size;
  /** `outline` or `soft` (tinted, borderless until focus). Default "outline". */
  variant?: "outline" | "soft";
  /** Replace the built-in English text: the character counter. */
  labels?: { count?: (count: number, max?: number) => string };
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. */
  style?: CSSProperties;
}

const defaultCount = (n: number, max?: number) => (max ? `${n} / ${max}` : `${n} characters`);

/** Multi-line input that grows with its content up to `maxRows`, with an optional announced counter. */
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  {
    label,
    labelHidden,
    description,
    error,
    value,
    defaultValue,
    onChange,
    rows = 3,
    maxRows = 12,
    resizable = true,
    showCount = false,
    size = "md",
    variant = "outline",
    labels,
    maxLength,
    required,
    disabled,
    id,
    className,
    style,
    ...rest
  },
  forwarded,
) {
  const inner = useRef<HTMLTextAreaElement | null>(null);
  const [count, setCount] = useState((value ?? defaultValue ?? "").length);
  // Height chosen with the grip: becomes the floor (and lifts the cap) for content-driven sizing.
  const manual = useRef(0);
  const grip = useRef<HTMLSpanElement>(null);
  const dragFrom = useRef({ height: 0, manual: 0 });
  const ref = useCallback(
    (node: HTMLTextAreaElement | null) => {
      inner.current = node;
      if (typeof forwarded === "function") forwarded(node);
      else if (forwarded) forwarded.current = node;
    },
    [forwarded],
  );

  const resize = useCallback(() => {
    const area = inner.current;
    if (!area) return;
    const cs = getComputedStyle(area);
    const line = Number.parseFloat(cs.lineHeight) || Number.parseFloat(cs.fontSize) * 1.5;
    const chrome =
      Number.parseFloat(cs.paddingTop) +
      Number.parseFloat(cs.paddingBottom) +
      Number.parseFloat(cs.borderTopWidth) +
      Number.parseFloat(cs.borderBottomWidth);
    const min = Math.max(rows * line + chrome, manual.current);
    const max = Math.max(Math.max(rows, maxRows) * line + chrome, manual.current);
    area.style.height = "auto";
    const wanted =
      area.scrollHeight + Number.parseFloat(cs.borderTopWidth) + Number.parseFloat(cs.borderBottomWidth);
    const height = Math.min(Math.max(wanted, min), max);
    area.style.height = `${height}px`;
    area.style.overflowY = wanted > max ? "auto" : "hidden";
  }, [rows, maxRows]);

  // The grip drags through detent; Escape puts the height back.
  useDrag(grip, {
    onStart: () => {
      dragFrom.current = {
        height: (inner.current as HTMLTextAreaElement).getBoundingClientRect().height,
        manual: manual.current,
      };
    },
    onMove: ({ delta }) => {
      manual.current = dragFrom.current.height + delta.y;
      resize();
      // Below the row minimum the floor wins: remember what is actually shown.
      manual.current = inner.current?.getBoundingClientRect().height ?? manual.current;
    },
    onEnd: (_, cancelled) => {
      if (!cancelled) return;
      manual.current = dragFrom.current.manual;
      resize();
    },
  });

  useLayoutEffect(resize, [resize, value]);
  // A new width rewraps the text: fit the height again. Only width changes count, since fitting sets the height.
  useEffect(() => {
    const area = inner.current;
    if (!area || typeof ResizeObserver === "undefined") return;
    let width = area.getBoundingClientRect().width;
    const observer = new ResizeObserver(() => {
      const now = area.getBoundingClientRect().width;
      if (now === width) return;
      width = now;
      resize();
    });
    observer.observe(area);
    return () => observer.disconnect();
  }, [resize]);
  useEffect(() => {
    if (value !== undefined) setCount(value.length);
  }, [value]);
  useEffect(() => {
    const form = inner.current?.form;
    if (!form) return;
    const onReset = () =>
      requestAnimationFrame(() => {
        setCount(inner.current?.value.length ?? 0);
        resize();
      });
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  }, [resize]);

  return (
    <Field
      label={label}
      labelHidden={labelHidden}
      description={description}
      error={error}
      required={required}
      size={size}
      id={id}
      className={className}
      style={style}
    >
      {(field) => {
        const countId = `${field.id}-count`;
        const describedBy =
          [field.describedBy, showCount ? countId : ""].filter(Boolean).join(" ") || undefined;
        return (
          <div
            className="cy-text-area"
            data-size={size}
            data-variant={variant}
            data-disabled={disabled ? "" : undefined}
          >
            <div className="cy-text-area-box">
              <TextAreaBase
                ref={ref}
                {...rest}
                id={field.id}
                className="cy-text-area-input"
                rows={rows}
                maxLength={maxLength}
                required={required}
                disabled={disabled}
                invalid={field.invalid}
                aria-describedby={describedBy}
                {...(value !== undefined ? { value } : { defaultValue })}
                onChange={(e) => {
                  setCount(e.currentTarget.value.length);
                  resize();
                  onChange?.(e.currentTarget.value);
                }}
              />
              {resizable && !disabled && (
                <span ref={grip} className="cy-text-area-grip" aria-hidden="true">
                  <Icon icon={resizeCorner} />
                </span>
              )}
            </div>
            {showCount && (
              <span id={countId} className="cy-text-area-count" aria-live="polite">
                {(labels?.count ?? defaultCount)(count, maxLength)}
              </span>
            )}
          </div>
        );
      }}
    </Field>
  );
});
