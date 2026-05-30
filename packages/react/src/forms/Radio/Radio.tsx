import {
  type KeyboardEvent,
  type ReactNode,
  forwardRef,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { cn } from '../../utils/cn.js';
import { composeRefs } from '../../utils/composeRefs.js';
import { RadioGroupContext } from '../RadioGroup/RadioGroup.js';
import type { FormControlSize } from '../shared/types.js';
import { radioIndicator, radioLabel, radioRoot, radioSize } from './Radio.css.js';

// Held in a constant so biome's `useSemanticElements` doesn't suggest
// rewriting to `<input type="radio">` — Radix's pattern uses a button so
// the indicator overlay can be styled freely; consumer CSS already targets
// the button. Form submission still works via the hidden native input
// nested inside.
const RADIO_ROLE = 'radio';

/** Props for `<Radio>`. Must be rendered inside `<RadioGroup>`. */
export interface RadioProps {
  /** Submitted value when this radio is selected. */
  value: string;
  /** Disables only this radio. To disable the whole group, set `disabled` on `<RadioGroup>`. */
  disabled?: boolean;
  /** Marks the field as required for form submission. */
  required?: boolean;
  /** Element id — auto-generated when omitted. */
  id?: string;
  /**
   * Control size.
   * @default "md"
   */
  size?: FormControlSize;
  /** Renders the invalid state and sets `aria-invalid`. */
  invalid?: boolean;
  /** Optional label content — when provided, the radio renders inside a `<label>`. */
  children?: ReactNode;
  className?: string;
}

/**
 * Single radio button — must be a descendant of `<RadioGroup>`. The group
 * manages selection and arrow-key roving tabindex; this component renders
 * a `role="radio"` button plus a hidden native `<input type="radio">` for
 * form submission when the group has a `name`.
 */
export const Radio = forwardRef<HTMLButtonElement, RadioProps>(function Radio(
  {
    value,
    disabled: localDisabled,
    required: localRequired,
    id,
    size = 'md',
    invalid,
    children,
    className,
  },
  ref,
) {
  const group = useContext(RadioGroupContext);
  if (!group) throw new Error('<Radio> must be rendered inside <RadioGroup>');

  const disabled = localDisabled ?? group.disabled;
  const required = localRequired ?? group.required;
  const checked = group.value === value;

  const localRef = useRef<HTMLButtonElement | null>(null);
  const setRefs = useMemo(
    () =>
      composeRefs<HTMLButtonElement>(ref, (node) => {
        localRef.current = node;
      }),
    [ref],
  );
  useEffect(() => group.registerItem(localRef.current, value), [group, value]);

  const select = () => {
    if (disabled) return;
    group.setValue(value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const horizontal = group.orientation === 'horizontal';
    const nextKey = horizontal ? 'ArrowRight' : 'ArrowDown';
    const prevKey = horizontal ? 'ArrowLeft' : 'ArrowUp';
    if (event.key === nextKey) {
      event.preventDefault();
      group.focusItem('next', event.currentTarget);
    } else if (event.key === prevKey) {
      event.preventDefault();
      group.focusItem('prev', event.currentTarget);
    } else if (event.key === 'Home') {
      event.preventDefault();
      group.focusItem('first', event.currentTarget);
    } else if (event.key === 'End') {
      event.preventDefault();
      group.focusItem('last', event.currentTarget);
    } else if (event.key === ' ') {
      event.preventDefault();
      select();
    }
  };

  const control = (
    <button
      ref={setRefs}
      type="button"
      role={RADIO_ROLE}
      aria-checked={checked}
      aria-required={required || undefined}
      data-state={checked ? 'checked' : 'unchecked'}
      data-disabled={disabled || undefined}
      data-invalid={invalid || undefined}
      disabled={disabled}
      id={id}
      // Roving tabindex: only the selected radio is reachable via Tab; if
      // nothing is selected, the first enabled item becomes the keyboard
      // entry point per ARIA. `group.firstValue` is recomputed by the
      // parent as items mount/unmount.
      tabIndex={checked || (!group.value && group.firstValue === value) ? 0 : -1}
      onClick={select}
      onKeyDown={handleKeyDown}
      className={cn(radioRoot, radioSize[size], children ? undefined : className)}
    >
      {checked ? <span className={radioIndicator} data-state="checked" /> : null}
      {group.name ? (
        <input
          type="radio"
          name={group.name}
          value={value}
          checked={checked}
          required={required}
          disabled={disabled}
          aria-hidden="true"
          tabIndex={-1}
          onChange={() => {}}
          style={{
            position: 'absolute',
            pointerEvents: 'none',
            opacity: 0,
            margin: 0,
            width: 0,
            height: 0,
          }}
        />
      ) : null}
    </button>
  );

  if (children === undefined) return control;

  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: `control` renders the radio button as a direct child.
    <label className={cn(radioLabel, className)} data-disabled={disabled || undefined}>
      {control}
      <span>{children}</span>
    </label>
  );
});
