import { type CSSProperties, type ForwardedRef, forwardRef } from 'react';
import { cn } from '../../../utils/cn.js';
import { spacer } from './Spacer.css.js';

/**
 * Props for `Spacer`. Spacer is decorative-only and intentionally omits the
 * `LayoutProps` surface — it has no rendered content to lay out.
 */
export interface SpacerProps {
  /**
   * Additional class names appended after Cynosure's base classes.
   */
  className?: string;
  /**
   * Inline style overrides merged last.
   */
  style?: CSSProperties;
  /**
   * Override the implicit `aria-hidden="true"` if Spacer participates in a
   * meaningful layout that assistive tech should observe.
   * @default true
   */
  'aria-hidden'?: boolean;
}

/**
 * A flex child that grows to fill remaining space. Use between flex children
 * to shove them apart: `<Inline><Logo/><Spacer/><Nav/></Inline>`.
 *
 * Spacer renders a hidden `<div>` — it is decorative only.
 */
export const Spacer = forwardRef<HTMLDivElement, SpacerProps>(function Spacer(
  { className, style, ...rest },
  ref: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div
      ref={ref}
      aria-hidden={rest['aria-hidden'] ?? true}
      className={cn(spacer, className)}
      style={style}
    />
  );
});
