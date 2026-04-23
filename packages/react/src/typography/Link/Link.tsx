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
import { linkBase, linkDisabled, linkUnderline, linkVariant } from './Link.css.js';

export type LinkVariant = 'default' | 'subtle' | 'emphasis';
export type LinkUnderline = 'always' | 'hover' | 'none';

export interface LinkOwnProps extends LayoutProps, AsChildProps {
  variant?: LinkVariant;
  underline?: LinkUnderline;
  /**
   * Marks the link as external: adds `rel="noopener noreferrer"`,
   * `target="_blank"`, and a decorative icon after the text. The icon is
   * `aria-hidden` so screen readers aren't double-announced.
   */
  external?: boolean;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
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
          <ExternalLink />
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
