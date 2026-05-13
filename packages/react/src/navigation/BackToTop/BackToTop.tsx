import { ChevronUp } from 'lucide-react';
import { type ButtonHTMLAttributes, type ReactNode, forwardRef, useEffect, useState } from 'react';
import { IconButton } from '../../forms/IconButton/IconButton.js';
import { useThrottledCallback } from '../../hooks/useThrottledCallback.js';
import { Portal } from '../../primitives/Portal.js';
import { cn } from '../../utils/cn.js';
import { backToTopButton, backToTopPosition } from './BackToTop.css.js';

export type BackToTopPosition = 'bottom-right' | 'bottom-left' | 'bottom-center';

/**
 * Props for the `BackToTop` floating button. Inherits all standard
 * `<button>` attributes except `onClick`, which is owned by the component.
 */
export interface BackToTopProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  /**
   * Scroll distance (in px) past which the button becomes visible.
   * @default 300
   */
  showAfter?: number;
  /**
   * One of the corner / center positioning presets.
   * @default "bottom-right"
   */
  position?: BackToTopPosition;
  /**
   * Use smooth scrolling on click. Forced to `"auto"` under
   * `prefers-reduced-motion: reduce`.
   * @default true
   */
  smooth?: boolean;
  /** Portal target. Defaults to `document.body`. */
  container?: Element | DocumentFragment | (() => Element | DocumentFragment | null | undefined);
  /**
   * Render inline (skip portal). Useful in tests or when the parent scroll
   * container isn't `document`.
   */
  disablePortal?: boolean;
  /** Replace the default chevron-up icon. */
  icon?: ReactNode;
  /**
   * Accessible label for the icon-only button.
   * @default "Back to top"
   */
  label?: string;
}
/**
 * Portal'd floating button that reveals after scrolling past `showAfter`.
 * Scrolls the document back to the top when clicked, respecting
 * `prefers-reduced-motion`.
 */
export const BackToTop = forwardRef<HTMLButtonElement, BackToTopProps>(function BackToTop(
  {
    showAfter = 300,
    position = 'bottom-right',
    smooth = true,
    container,
    disablePortal,
    icon,
    label = 'Back to top',
    className,
    type,
    ...rest
  },
  ref,
) {
  const [visible, setVisible] = useState(false);

  const handleScroll = useThrottledCallback(() => {
    if (typeof window === 'undefined') return;
    setVisible(window.scrollY > showAfter);
  }, 100);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const onClick = () => {
    if (typeof window === 'undefined') return;
    const prefersReducedMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    window.scrollTo({
      top: 0,
      behavior: smooth && !prefersReducedMotion ? 'smooth' : 'auto',
    });
  };

  const button = (
    <IconButton
      ref={ref}
      variant="bare"
      type={type}
      label={label}
      icon={icon ?? <ChevronUp size={18} />}
      data-visible={visible ? 'true' : 'false'}
      className={cn(backToTopButton, backToTopPosition[position], className)}
      onClick={onClick}
      {...rest}
    />
  );

  if (disablePortal) return button;
  return <Portal container={container}>{button}</Portal>;
});
