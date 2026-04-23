import {
  type ChangeEventHandler,
  type TextareaHTMLAttributes,
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
} from 'react';
import { useMergedRef } from '../../hooks/useMergedRef.js';
import { cn } from '../../utils/cn.js';
import { textareaAutoResize, textareaField, textareaFieldSize } from './Textarea.css.js';
import { useTextareaContext } from './TextareaContext.js';

export interface TextareaFieldProps
  extends Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    'value' | 'defaultValue' | 'onChange' | 'disabled' | 'readOnly' | 'required' | 'id' | 'name'
  > {
  /** Initial row count; applies when `autoResize` isn't active. */
  rows?: number;
  /**
   * Native change event — fires alongside the context update, so consumers
   * can inspect the underlying `<textarea>` (e.g. for selection APIs) on top
   * of the controlled value forwarded to `Root`.
   */
  onChange?: ChangeEventHandler<HTMLTextAreaElement>;
}

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  function TextareaField({ rows = 3, className, style, onChange, ...rest }, forwardedRef) {
    const ctx = useTextareaContext();
    const mergedRef = useMergedRef(forwardedRef, ctx.fieldRef);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        ctx.setValue(e.target.value);
        onChange?.(e);
      },
      [ctx.setValue, onChange],
    );

    // When autoResize + maxRows are both set, derive the cap from the
    // resolved line-height + vertical padding rather than assuming 1.5em.
    useIsomorphicLayoutEffect(() => {
      if (!ctx.autoResize || !ctx.maxRows) return;
      const el = ctx.fieldRef.current;
      if (!el) return;
      const cs = window.getComputedStyle(el);
      const lh = Number.parseFloat(cs.lineHeight);
      const pt = Number.parseFloat(cs.paddingTop) || 0;
      const pb = Number.parseFloat(cs.paddingBottom) || 0;
      if (!Number.isFinite(lh)) return;
      el.style.maxHeight = `${lh * ctx.maxRows + pt + pb}px`;
    }, [ctx.autoResize, ctx.maxRows, ctx.size]);

    // JS fallback for engines without `field-sizing: content` (Safari, Firefox).
    useEffect(() => {
      if (!ctx.autoResize) return;
      const supports =
        typeof window !== 'undefined' &&
        typeof window.CSS?.supports === 'function' &&
        window.CSS.supports('field-sizing', 'content');
      if (supports) return;

      const el = ctx.fieldRef.current;
      if (!el) return;

      const resize = (): void => {
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
      };
      resize();
      el.addEventListener('input', resize);
      return () => el.removeEventListener('input', resize);
    }, [ctx.autoResize]);

    return (
      <textarea
        {...rest}
        id={ctx.id}
        name={ctx.name}
        ref={mergedRef}
        rows={rows}
        value={ctx.value}
        onChange={handleChange}
        disabled={ctx.disabled || undefined}
        readOnly={ctx.readOnly || undefined}
        required={ctx.required || undefined}
        aria-invalid={ctx.invalid || undefined}
        aria-describedby={ctx.ariaDescribedBy}
        data-clearable={ctx.hasClearButton || undefined}
        className={cn(
          textareaField,
          textareaFieldSize[ctx.size],
          ctx.autoResize ? textareaAutoResize : undefined,
          className,
        )}
        style={style}
      />
    );
  },
);
