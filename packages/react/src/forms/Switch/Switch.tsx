import { Check, Loader2 } from 'lucide-react';
import { type ReactNode, forwardRef } from 'react';
import { useControllableState } from '../../hooks/useControllableState.js';
import { cn } from '../../utils/cn.js';
import type { BooleanFormControlBase } from '../shared/types.js';
import {
  switchLabel,
  switchRoot,
  switchSize,
  switchThumb,
  thumbCheck,
  thumbCheckInvalid,
  thumbLoader,
} from './Switch.css.js';

/** Props for `<Switch>`. */
export interface SwitchProps extends BooleanFormControlBase {
  /** Controlled checked state. */
  checked?: boolean;
  /** Uncontrolled initial checked state. */
  defaultChecked?: boolean;
  /** Fires with the next checked state on toggle. */
  onCheckedChange?: (checked: boolean) => void;
  /** Submitted value when checked. */
  value?: string;
  /**
   * Renders a spinner inside the thumb and blocks interaction while
   * awaiting async work.
   * @default false
   */
  loading?: boolean;
  /** Optional label rendered alongside the control. */
  children?: ReactNode;
  className?: string;
}

/**
 * Toggle switch. Semantically conveys an "on/off setting that takes effect
 * immediately" — prefer over `<Checkbox>` when the action has no explicit
 * Save button. Pass `children` to render the label alongside.
 *
 * Implemented natively as a `role="switch"` button paired with a hidden
 * `<input type="checkbox">` for form participation. The hidden checkbox
 * carries `name`/`value`/`required` so the control submits identically to
 * a plain checkbox while the visible button handles all keyboard /
 * pointer interaction.
 */
export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch(props, ref) {
  const {
    size = 'md',
    checked: checkedProp,
    defaultChecked,
    onCheckedChange,
    disabled,
    required,
    invalid,
    name,
    id,
    value = 'on',
    autoFocus,
    loading = false,
    children,
    className,
  } = props;

  const [checked, setChecked] = useControllableState<boolean>({
    value: checkedProp,
    defaultValue: defaultChecked ?? false,
    onChange: onCheckedChange,
  });

  const showIcon = size !== 'sm';
  const iconPx = size === 'lg' ? 14 : 12;
  const effectiveDisabled = disabled || loading;
  const state = checked ? 'checked' : 'unchecked';

  const handleClick = () => {
    if (effectiveDisabled) return;
    setChecked(!checked);
  };

  const control = (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-required={required || undefined}
      aria-busy={loading || undefined}
      data-state={state}
      data-disabled={effectiveDisabled || undefined}
      data-invalid={invalid || undefined}
      data-loading={loading || undefined}
      disabled={effectiveDisabled}
      id={id}
      // biome-ignore lint/a11y/noAutofocus: Switch parity with Radix — consumers opt in explicitly and tests rely on it.
      autoFocus={autoFocus}
      onClick={handleClick}
      className={cn(switchRoot, switchSize[size], children ? undefined : className)}
    >
      <span className={switchThumb} data-state={state}>
        {loading ? (
          <Loader2 className={thumbLoader} size={iconPx} aria-hidden="true" />
        ) : showIcon ? (
          <Check
            className={cn(thumbCheck, invalid && thumbCheckInvalid)}
            size={iconPx}
            strokeWidth={3}
            aria-hidden="true"
          />
        ) : null}
      </span>
      {name ? (
        <input
          type="checkbox"
          name={name}
          value={value}
          checked={checked}
          required={required}
          disabled={effectiveDisabled}
          aria-hidden="true"
          tabIndex={-1}
          // Native form submission only — the visible button drives all
          // user interaction. Keep onChange to silence React's controlled-
          // input warning; the visible click handler is the source of truth.
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
    // biome-ignore lint/a11y/noLabelWithoutControl: `control` renders the switch button as a direct child.
    <label className={cn(switchLabel, className)} data-disabled={disabled || undefined}>
      {control}
      <span>{children}</span>
    </label>
  );
});
