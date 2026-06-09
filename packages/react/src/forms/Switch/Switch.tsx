import { Check, Loader2 } from 'lucide-react';
import { type ReactNode, forwardRef, useState } from 'react';
import { useControllableState } from '../../hooks/useControllableState.js';
import { cn } from '../../utils/cn.js';
import type { BooleanFormControlBase } from '../shared/types.js';
import {
  switchLabel,
  switchRoot,
  switchSize,
  switchThumb,
  thumbIcon,
  thumbIconChecked,
  thumbIconUnchecked,
  thumbLoader,
} from './Switch.css.js';

/** Props for `<Switch>`. */
export interface SwitchProps extends BooleanFormControlBase {
  /** Controlled checked state. */
  checked?: boolean;
  /** Uncontrolled initial checked state. */
  defaultChecked?: boolean;
  /**
   * Fires with the next checked state on toggle. May return a `Promise`: the
   * switch then flips optimistically to the new state, shows a spinner while
   * the promise is pending, **commits** on resolve, and **reverts** on reject.
   */
  // biome-ignore lint/suspicious/noConfusingVoidType: the handler may return nothing or a Promise — both are intended and drive the async flow.
  onCheckedChange?: (checked: boolean) => void | Promise<unknown>;
  /** Submitted value when checked. */
  value?: string;
  /**
   * Forces the loading spinner and blocks interaction. Use for externally
   * managed async work; when `onCheckedChange` returns a promise the spinner
   * is shown automatically and you don't need this.
   * @default false
   */
  loading?: boolean;
  /**
   * Icon shown inside the thumb when **on**. Defaults to a checkmark (hidden
   * at `sm`). Pass `null` to suppress it, or any node to customize (e.g. a
   * sun/moon for a theme toggle).
   */
  checkedIcon?: ReactNode;
  /**
   * Icon shown inside the thumb when **off**. When set, the resting thumb
   * stays full-size (instead of the Material-style shrink) so the icon fits.
   */
  uncheckedIcon?: ReactNode;
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
    checkedIcon,
    uncheckedIcon,
    children,
    className,
  } = props;

  // Internal value is managed directly (not via the controllable `onChange`)
  // so we can read `onCheckedChange`'s return value to drive the async flow.
  const [checked, setChecked] = useControllableState<boolean>({
    value: checkedProp,
    defaultValue: defaultChecked ?? false,
  });

  // While an async `onCheckedChange` is in flight, `pending` holds the
  // optimistic target shown to the user; cleared (committed or reverted) when
  // the promise settles.
  const [pending, setPending] = useState<boolean | null>(null);

  const displayed = pending ?? checked;
  const busy = loading || pending !== null;
  const effectiveDisabled = disabled || busy;
  const state = displayed ? 'checked' : 'unchecked';

  const iconPx = size === 'lg' ? 14 : 12;

  // The on-state glyph defaults to a checkmark (suppressed at `sm`, where the
  // thumb is tiny); `checkedIcon={null}` opts out, any node customizes it.
  const resolvedCheckedIcon =
    checkedIcon !== undefined ? (
      checkedIcon
    ) : size === 'sm' ? null : (
      <Check size={iconPx} strokeWidth={3} aria-hidden="true" />
    );
  // An unchecked icon keeps the resting thumb full-size so the glyph fits.
  const keepThumb = uncheckedIcon != null && !displayed;

  const handleClick = () => {
    if (effectiveDisabled) return;
    const next = !displayed;
    const result = onCheckedChange?.(next);
    if (result != null && typeof (result as PromiseLike<unknown>).then === 'function') {
      // Optimistically flip + spin; commit on success, revert on failure.
      setPending(next);
      Promise.resolve(result).then(
        () => {
          setChecked(next);
          setPending(null);
        },
        () => setPending(null),
      );
    } else {
      setChecked(next);
    }
  };

  const control = (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={displayed}
      aria-required={required || undefined}
      aria-busy={busy || undefined}
      data-state={state}
      data-disabled={effectiveDisabled || undefined}
      data-invalid={invalid || undefined}
      data-loading={busy || undefined}
      disabled={effectiveDisabled}
      id={id}
      // biome-ignore lint/a11y/noAutofocus: Switch parity with Radix — consumers opt in explicitly and tests rely on it.
      autoFocus={autoFocus}
      onClick={handleClick}
      className={cn(switchRoot, switchSize[size], children ? undefined : className)}
    >
      <span className={switchThumb} data-state={state} data-keep-thumb={keepThumb || undefined}>
        {busy ? (
          <Loader2 className={thumbLoader} size={iconPx} aria-hidden="true" />
        ) : displayed ? (
          resolvedCheckedIcon ? (
            <span className={cn(thumbIcon, thumbIconChecked)} aria-hidden="true">
              {resolvedCheckedIcon}
            </span>
          ) : null
        ) : uncheckedIcon != null ? (
          <span className={cn(thumbIcon, thumbIconUnchecked)} aria-hidden="true">
            {uncheckedIcon}
          </span>
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
