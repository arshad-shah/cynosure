import {
  type ButtonHTMLAttributes,
  type ReactElement,
  type ReactNode,
  forwardRef,
  useEffect,
  useState,
} from 'react';
import { IconButton } from '../../forms/IconButton/IconButton.js';
import { useThrottledCallback } from '../../hooks/useThrottledCallback.js';
import { Portal } from '../../primitives/Portal.js';
import { cn } from '../../utils/cn.js';
import { backToTopButton, backToTopPosition } from './BackToTop.css.js';

export type BackToTopPosition = 'bottom-right' | 'bottom-left' | 'bottom-center';

export interface BackToTopProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  /** Scroll distance before showing. Default 300px. */
  showAfter?: number;
  /** Pre-set position presets. Default `bottom-right`. */
  position?: BackToTopPosition;
  /** Smooth scroll. Default `true`. Ignored under `prefers-reduced-motion`. */
  smooth?: boolean;
  /** Override the default portal target. Defaults to `document.body`. */
  container?: Element | DocumentFragment | (() => Element | DocumentFragment | null | undefined);
  /** Render inline (skip portal). Useful in tests. */
  disablePortal?: boolean;
  /** Replace the default arrow icon. */
  icon?: ReactNode;
  label?: string;
}

const UpIcon = (): ReactElement => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="m18 15-6-6-6 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

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
      icon={icon ?? <UpIcon />}
      data-visible={visible ? 'true' : 'false'}
      className={cn(backToTopButton, backToTopPosition[position], className)}
      onClick={onClick}
      {...rest}
    />
  );

  if (disablePortal) return button;
  return <Portal container={container}>{button}</Portal>;
});
