import { X } from 'lucide-react';
import { type ReactElement, useEffect } from 'react';
import { cn } from '../../utils/cn.js';
import { clearButton, clearButtonHidden, clearButtonSize } from './Textarea.css.js';
import { useTextareaContext } from './TextareaContext.js';

export interface TextareaClearButtonProps {
  /** Accessible label. Default `"Clear"`. */
  label?: string;
  className?: string;
}

const ICON_SIZE = { sm: 12, md: 13, lg: 15 } as const;

/**
 * Corner icon-button that clears the value. Rendered unconditionally so the
 * layout is stable, but hidden (`aria-hidden`, `opacity: 0`, `pointer-events: none`,
 * `tabIndex: -1`) when the value is empty or the field is disabled/read-only.
 *
 * Its presence registers `hasClearButton` on Root, which makes
 * `<TextareaField>` reserve right-padding so text never runs under the button.
 */
export function TextareaClearButton({
  label = 'Clear',
  className,
}: TextareaClearButtonProps): ReactElement {
  const ctx = useTextareaContext();

  useEffect(() => {
    ctx.setHasClearButton(true);
    return () => {
      ctx.setHasClearButton(false);
    };
  }, [ctx.setHasClearButton]);

  const shouldHide = ctx.value.length === 0 || ctx.disabled || ctx.readOnly;

  return (
    <button
      type="button"
      aria-label={label}
      aria-hidden={shouldHide ? 'true' : undefined}
      tabIndex={shouldHide ? -1 : 0}
      disabled={ctx.disabled || ctx.readOnly || undefined}
      onClick={() => {
        ctx.setValue('');
        ctx.fieldRef.current?.focus();
      }}
      className={cn(
        clearButton,
        clearButtonSize[ctx.size],
        shouldHide ? clearButtonHidden : undefined,
        className,
      )}
    >
      <X size={ICON_SIZE[ctx.size]} aria-hidden />
    </button>
  );
}
