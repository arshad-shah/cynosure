import { type CSSProperties, type ComponentPropsWithoutRef, forwardRef } from 'react';

const STYLE: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
  border: 0,
};

/**
 * Props for `VisuallyHidden`. Accepts every standard `<span>` attribute —
 * the component owns its visual style via inline CSS and merges any caller
 * `style` on top.
 */
export interface VisuallyHiddenProps extends ComponentPropsWithoutRef<'span'> {}

/**
 * Visually hides content while keeping it available to assistive tech. Used
 * for icon-only buttons, off-screen labels, and live-region announcers. The
 * inline styles override any cascade so the element is hidden even without
 * Cynosure's stylesheet.
 */
export const VisuallyHidden = forwardRef<HTMLSpanElement, VisuallyHiddenProps>(
  function VisuallyHidden({ style, ...rest }, ref) {
    return <span ref={ref} {...rest} style={{ ...STYLE, ...style }} />;
  },
);
