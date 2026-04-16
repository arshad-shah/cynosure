import { type CSSProperties, type ForwardedRef, forwardRef } from 'react';
import { cn } from '../../../utils/cn.js';
import { spacer } from './Spacer.css.js';

export interface SpacerProps {
  className?: string;
  style?: CSSProperties;
  /** Accessible label — Spacer renders `aria-hidden` by default but can be overridden. */
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
