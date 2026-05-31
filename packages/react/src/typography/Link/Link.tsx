import { ExternalLink } from 'lucide-react';
import {
  type CSSProperties,
  type ForwardedRef,
  type ReactElement,
  type ReactNode,
  forwardRef,
} from 'react';
import { Box } from '../../primitives/layout/Box/Box.js';
import type { AsChildProps, LayoutProps } from '../../primitives/layout/shared/index.js';
import { cn } from '../../utils/cn.js';
import { externalIcon, linkBase, linkDisabled, linkUnderline, linkVariant } from './Link.css.js';

export type LinkVariant = 'default' | 'subtle' | 'emphasis';
export type LinkUnderline = 'always' | 'hover' | 'none';

/**
 * Props specific to `Link`, layered on top of `LayoutProps` and `AsChildProps`.
 */
export interface LinkOwnProps extends LayoutProps, AsChildProps {
  /**
   * Visual emphasis: `default` for primary links, `subtle` for tertiary
   * navigation, `emphasis` for headline / hero CTAs.
   * @default "default"
   */
  variant?: LinkVariant;
  /**
   * When the underline is drawn — `always`, only on `hover`, or `none`.
   * @default "hover"
   */
  underline?: LinkUnderline;
  /**
   * Marks the link as external: forces `rel="noopener noreferrer"`,
   * `target="_blank"`, and appends a decorative arrow icon. The icon is
   * `aria-hidden` so screen readers aren't double-announced.
   */
  external?: boolean;
  /**
   * Visually mutes the link and blocks `onClick`. Adds `aria-disabled`.
   */
  disabled?: boolean;
  /**
   * Additional class names appended after Cynosure's base classes.
   */
  className?: string;
  /**
   * Inline style overrides merged last.
   */
  style?: CSSProperties;
  /**
   * Link content.
   */
  children?: ReactNode;
}

export type LinkProps = LinkOwnProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkOwnProps | 'color'>;

type AnyProps = LinkOwnProps & { [key: string]: unknown };

const LinkRender = (props: AnyProps, ref: ForwardedRef<HTMLAnchorElement>): ReactElement => {
  const {
    asChild,
    className,
    style,
    children,
    variant = 'default',
    underline = 'hover',
    external,
    disabled,
    rel: relProp,
    target: targetProp,
    onClick,
    ...rest
  } = props as LinkOwnProps & React.AnchorHTMLAttributes<HTMLAnchorElement>;

  const mergedClass = cn(
    linkBase,
    linkVariant[variant],
    linkUnderline[underline],
    disabled ? linkDisabled : undefined,
    className,
  );

  // External link safety: target=_blank without rel=noopener leaks
  // window.opener, so we enforce `noopener noreferrer` whenever we add
  // target=_blank. Caller's rel is merged on top.
  const computedRel = external
    ? [relProp, 'noopener', 'noreferrer']
        .filter(Boolean)
        .join(' ')
        .split(/\s+/)
        .filter((r, i, arr) => r && arr.indexOf(r) === i)
        .join(' ')
    : relProp;

  const computedTarget = external ? (targetProp ?? '_blank') : targetProp;

  const handleClick: React.MouseEventHandler<HTMLAnchorElement> = (event) => {
    if (disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onClick?.(event);
  };

  return (
    <Box
      ref={ref as never}
      as="a"
      asChild={asChild}
      className={mergedClass}
      style={style}
      rel={computedRel}
      target={computedTarget}
      aria-disabled={disabled || undefined}
      onClick={handleClick}
      {...(rest as Record<string, unknown>)}
    >
      {external ? (
        <>
          {children}
          <ExternalLink className={externalIcon} aria-hidden="true" focusable={false} />
        </>
      ) : (
        children
      )}
    </Box>
  );
};

/**
 * Styled anchor. Pass `external` to get safe `rel`/`target` + a decorative
 * arrow icon, or `asChild` to project Link's styling onto a framework-level
 * routing component (e.g. `<Link asChild><NextLink href="/">…</NextLink></Link>`).
 */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(LinkRender as never);
