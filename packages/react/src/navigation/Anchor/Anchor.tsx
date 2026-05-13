import { Link } from 'lucide-react';
import {
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  forwardRef,
  useCallback,
} from 'react';
import { cn } from '../../utils/cn.js';
import { anchorHeading, anchorLink, anchorWrapper } from './Anchor.css.js';

/**
 * Props for `Anchor` — a heading with a permalink that copies a URL with
 * `#id` to the clipboard on click.
 */
export interface AnchorProps extends Omit<HTMLAttributes<HTMLElement>, 'id'> {
  /** Required — used as the heading `id` and the URL fragment. */
  id: string;
  /**
   * Which heading tag is rendered (`h1`–`h6`). Pick to match the section's
   * place in the document outline.
   * @default 2
   */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /**
   * Sticky-header offset applied via `scroll-margin-top` when scrolling
   * the heading into view. Accepts any CSS length (`number` is treated as
   * px). Set this when a fixed top bar would otherwise cover the heading.
   */
  offsetTop?: number | string;
  /** Fired after the URL has been (best-effort) copied to the clipboard. */
  onCopy?: () => void;
  /**
   * Accessible label for the copy-link icon button.
   * @default "Copy link to section"
   */
  label?: string;
  /** The visible heading text. */
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
        <Link size={16} />
      </a>
    </Tag>
  );
});
