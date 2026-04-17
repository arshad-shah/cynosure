import { type CSSProperties, type KeyboardEvent, forwardRef } from 'react';
import { useControllableState } from '../../hooks/useControllableState.js';
import { cn } from '../../utils/cn.js';
import type { FormControlSize } from '../shared/types.js';
import { halfOverlay, root, star, starSize } from './Rating.css.js';

const Star = ({ filled }: { filled: boolean }): React.ReactElement => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export interface RatingProps {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  max?: number;
  /** Allow half-star increments. */
  allowHalf?: boolean;
  size?: FormControlSize;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  label?: string;
  'aria-label'?: string;
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
    className,
    style,
  } = props;

  const ariaLabel = label ?? props['aria-label'] ?? 'Rating';

  const [value, setValue] = useControllableState<number>({
    value: valueProp,
    defaultValue: defaultValue ?? 0,
    onChange: onValueChange,
  });

  const step = allowHalf ? 0.5 : 1;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled || readOnly) return;
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

  const set = (next: number) => {
    if (disabled || readOnly) return;
    setValue(next);
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
    >
      {name ? <input type="hidden" name={name} id={id} value={String(value)} /> : null}
      {Array.from({ length: max }).map((_, i) => {
        const index = i + 1;
        const filled = value >= index;
        const half = allowHalf && !filled && value >= index - 0.5;
        return (
          // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard interaction is owned by the parent's role="slider" ↑/↓/←/→/Home/End handler.
          <span
            key={index}
            className={cn(star, starSize[size])}
            data-filled={filled || undefined}
            data-readonly={readOnly || undefined}
            data-disabled={disabled || undefined}
            role="presentation"
            onClick={(event) => {
              if (!allowHalf) return set(index);
              const target = event.currentTarget as HTMLElement;
              const rect = target.getBoundingClientRect();
              const isRtl = typeof document !== 'undefined' && document.dir === 'rtl';
              const offset = isRtl ? rect.right - event.clientX : event.clientX - rect.left;
              const isLeftHalf = offset < rect.width / 2;
              set(isLeftHalf ? index - 0.5 : index);
            }}
          >
            <Star filled={filled} />
            {half ? (
              <span className={halfOverlay} aria-hidden="true">
                <Star filled={true} />
              </span>
            ) : null}
          </span>
        );
      })}
    </div>
  );
});
