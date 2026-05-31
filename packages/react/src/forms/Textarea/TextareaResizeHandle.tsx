import { type PointerEvent, type ReactElement, useCallback, useEffect } from 'react';
import { cn } from '../../utils/cn.js';
import { resizeGrip, resizeGripSize } from './Textarea.css.js';
import { useTextareaContext } from './TextareaContext.js';

export interface TextareaResizeHandleProps {
  className?: string;
}

const MIN_HEIGHT = 40;
const MIN_WIDTH = 120;

/**
 * Custom corner grip that drives the `<textarea>` element's size directly.
 * We hide the native browser handle (the textarea has `resize: none` in CSS)
 * so the grip sits cleanly tangent to the card's rounded corner instead of
 * punching through the footer divider.
 *
 * Returns `null` — removing itself from the DOM — when:
 * - `resize="none"`
 * - `autoResize` is on
 * - the field is `disabled` or `readOnly`
 */
export function TextareaResizeHandle({
  className,
}: TextareaResizeHandleProps): ReactElement | null {
  const ctx = useTextareaContext();

  const shouldHide = ctx.autoResize || ctx.resize === 'none' || ctx.disabled || ctx.readOnly;

  // Tell Root this grip is present so it reserves a bottom padding lane —
  // keeps consumer content in the footer from sliding under the corner grip.
  useEffect(() => {
    if (shouldHide) return;
    ctx.setHasResizeHandle(true);
    return () => ctx.setHasResizeHandle(false);
  }, [shouldHide, ctx.setHasResizeHandle]);

  const onPointerDown = useCallback(
    (e: PointerEvent<HTMLButtonElement>) => {
      const field = ctx.fieldRef.current;
      const root = ctx.rootRef.current;
      if (!field || !root) return;

      const fieldRect = field.getBoundingClientRect();
      const rootRect = root.getBoundingClientRect();
      const startFieldH = fieldRect.height;
      const startRootW = rootRect.width;
      const startY = e.clientY;
      const startX = e.clientX;
      const vertical = ctx.resize === 'vertical' || ctx.resize === 'both';
      const horizontal = ctx.resize === 'horizontal' || ctx.resize === 'both';

      e.preventDefault();
      e.stopPropagation();
      const target = e.currentTarget;
      target.setPointerCapture?.(e.pointerId);

      const onMove = (ev: globalThis.PointerEvent): void => {
        // Vertical grows the textarea element (the card grows with it because
        // the wrapper is a flex column).
        if (vertical) {
          field.style.height = `${Math.max(MIN_HEIGHT, startFieldH + (ev.clientY - startY))}px`;
        }
        // Horizontal grows the wrapper — the textarea is width:100% of it so
        // it tracks automatically, and the footer + corner grip follow.
        if (horizontal) {
          root.style.width = `${Math.max(MIN_WIDTH, startRootW + (ev.clientX - startX))}px`;
        }
      };
      const onUp = (): void => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    },
    [ctx.fieldRef, ctx.rootRef, ctx.resize],
  );

  if (shouldHide) return null;

  return (
    <button
      type="button"
      aria-label="Resize"
      data-testid="textarea-resize-handle"
      onPointerDown={onPointerDown}
      className={cn(resizeGrip, resizeGripSize[ctx.size], className)}
    >
      <svg
        viewBox="0 0 16 16"
        width="100%"
        height="100%"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        aria-hidden="true"
      >
        <line x1="1" y1="15" x2="15" y2="1" />
        <line x1="6" y1="15" x2="15" y2="6" />
        <line x1="11" y1="15" x2="15" y2="11" />
      </svg>
    </button>
  );
}
