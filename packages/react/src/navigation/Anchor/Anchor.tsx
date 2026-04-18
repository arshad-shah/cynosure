import {
  type CSSProperties,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  forwardRef,
  useCallback,
} from 'react';
import { cn } from '../../utils/cn.js';
import { anchorHeading, anchorLink, anchorWrapper } from './Anchor.css.js';

const LinkIcon = (): ReactElement => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M9 15a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M15 9a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
  </svg>
);

export interface AnchorProps extends Omit<HTMLAttributes<HTMLElement>, 'id'> {
  id: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Sticky-header offset applied when scrolling into view. Accepts any CSS length. */
  offsetTop?: number | string;
  onCopy?: () => void;
  label?: string;
  children?: ReactNode;
}

/**
 * Heading + in-page anchor link. Renders `<h{level}>` with an
 * invisible-until-hover link that copies the current URL + fragment to the
 * clipboard. Used heavily in docs.
 */
export const Anchor = forwardRef<HTMLElement, AnchorProps>(function Anchor(
  {
    id,
    level = 2,
    offsetTop,
    onCopy,
    label = 'Copy link to section',
    className,
    style,
    children,
    ...rest
  },
  ref,
) {
  const Tag = `h${level}` as const;
  const wrapperStyle: CSSProperties | undefined = offsetTop
    ? {
        ['--cynosure-anchor-offset' as string]:
          typeof offsetTop === 'number' ? `${offsetTop}px` : offsetTop,
        ...style,
      }
    : style;

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      if (typeof window === 'undefined') return;
      const target = document.getElementById(id);
      const url = `${window.location.origin}${window.location.pathname}${window.location.search}#${id}`;
      if (window.history?.pushState) {
        window.history.pushState(null, '', `#${id}`);
      } else {
        window.location.hash = id;
      }
      if (target) {
        const prefersReducedMotion =
          window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
        target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      }
      if (navigator?.clipboard?.writeText) {
        void navigator.clipboard.writeText(url).then(
          () => onCopy?.(),
          () => {
            /* swallow clipboard failures — still navigated the hash */
          },
        );
      } else {
        onCopy?.();
      }
    },
    [id, onCopy],
  );

  return (
    <Tag
      ref={ref as React.Ref<HTMLHeadingElement>}
      id={id}
      className={cn(anchorWrapper, className)}
      style={wrapperStyle}
      {...rest}
    >
      <span className={anchorHeading}>{children}</span>
      <a
        href={`#${id}`}
        onClick={handleClick}
        aria-label={label}
        data-anchor-link=""
        className={anchorLink}
      >
        <LinkIcon />
      </a>
    </Tag>
  );
});
