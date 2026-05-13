import { Star } from 'lucide-react';
import {
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  forwardRef,
  useState,
} from 'react';
import { useControllableState } from '../../hooks/useControllableState.js';
import { cn } from '../../utils/cn.js';
import type { FormControlSize } from '../shared/types.js';
import { fillLayer, halfClip, root, star, starSize, valueSlot } from './Rating.css.js';

/** Props for `<Rating>` — star rating control. */
export interface RatingProps {
  /** Controlled current value, 0..`max`. */
  value?: number;
  /** Uncontrolled initial value. */
  defaultValue?: number;
  /** Fires when the user clicks or keys to a new value. */
  onValueChange?: (value: number) => void;
  /**
   * Maximum number of stars.
   * @default 5
   */
  max?: number;
  /**
   * Allow half-star increments.
   * @default false
   */
  allowHalf?: boolean;
  /**
   * Control size.
   * @default "md"
   */
  size?: FormControlSize;
  /**
   * Disables interaction and removes the control from the tab order.
   * @default false
   */
  disabled?: boolean;
  /**
   * Renders stars but blocks user interaction.
   * @default false
   */
  readOnly?: boolean;
  /** Marks the field as required for form submission. */
  required?: boolean;
  /** Submitted form field name (renders a hidden input). */
  name?: string;
  id?: string;
  /**
   * Accessible label.
   * @default "Rating"
   */
  label?: string;
  'aria-label'?: string;
  /**
   * Render a trailing slot (e.g. numeric label). `previewValue` is the
   * currently-hovered value, or `undefined` when not hovering.
   */
  renderValue?: (value: number, max: number, previewValue: number | undefined) => ReactNode;
  className?: string;
  style?: CSSProperties;
}

/** Star rating. Keyboard: ←/→ change value; Home/End jump to min/max. */
export const Rating = forwardRef<HTMLDivElement, RatingProps>(function Rating(props, ref) {
  const {
    value: valueProp,
    defaultValue,
    onValueChange,
    max = 5,
    allowHalf = false,
    size = 'md',
    disabled = false,
    readOnly = false,
    required,
    name,
    id,
    label,
    renderValue,
    className,
    style,
  } = props;

  const ariaLabel = label ?? props['aria-label'] ?? 'Rating';

  const [value, setValue] = useControllableState<number>({
    value: valueProp,
    defaultValue: defaultValue ?? 0,
    onChange: onValueChange,
  });

  const [hoverValue, setHoverValue] = useState<number | undefined>(undefined);

  const interactive = !disabled && !readOnly;
  const step = allowHalf ? 0.5 : 1;
  const displayValue = hoverValue ?? value;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const rtl = typeof document !== 'undefined' && document.dir === 'rtl';
    const inc = rtl ? -step : step;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        event.preventDefault();
        setValue(Math.min(max, value + inc));
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        event.preventDefault();
        setValue(Math.max(0, value - inc));
        break;
      case 'Home':
        event.preventDefault();
        setValue(0);
        break;
      case 'End':
        event.preventDefault();
        setValue(max);
        break;
      default:
        break;
    }
  };

  const valueAtPointer = (
    event: PointerEvent<HTMLElement> | MouseEvent<HTMLElement>,
    index: number,
  ): number => {
    if (!allowHalf) return index;
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    const isRtl = typeof document !== 'undefined' && document.dir === 'rtl';
    const offset = isRtl ? rect.right - event.clientX : event.clientX - rect.left;
    return offset < rect.width / 2 ? index - 0.5 : index;
  };

  const commit = (next: number) => {
    if (!interactive) return;
    setValue(next === value ? 0 : next);
  };

  return (
    <div
      ref={ref}
      className={cn(root, className)}
      style={style}
      role="slider"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-readonly={readOnly || undefined}
      aria-disabled={disabled || undefined}
      aria-required={required || undefined}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={handleKeyDown}
      onPointerLeave={() => setHoverValue(undefined)}
    >
      {name ? <input type="hidden" name={name} id={id} value={String(value)} /> : null}
      {Array.from({ length: max }).map((_, i) => {
        const index = i + 1;
        const filled = displayValue >= index;
        const half = allowHalf && !filled && displayValue >= index - 0.5;
        return (
          // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard interaction is owned by the parent's role="slider" ↑/↓/←/→/Home/End handler.
          <span
            key={index}
            className={cn(star, starSize[size])}
            data-filled={filled || undefined}
            data-half={half || undefined}
            data-readonly={readOnly || undefined}
            data-disabled={disabled || undefined}
            role="presentation"
            onPointerMove={(event) => {
              if (!interactive) return;
              setHoverValue(valueAtPointer(event, index));
            }}
            onClick={(event) => {
              if (!interactive) return;
              commit(valueAtPointer(event, index));
            }}
          >
            <Star size="100%" strokeWidth={2} aria-hidden="true" />
            {filled || half ? (
              <span className={cn(fillLayer, half && halfClip)} aria-hidden="true">
                <Star size="100%" strokeWidth={2} fill="currentColor" />
              </span>
            ) : null}
          </span>
        );
      })}
      {renderValue ? (
        <span className={valueSlot}>{renderValue(value, max, hoverValue)}</span>
      ) : null}
    </div>
  );
});
