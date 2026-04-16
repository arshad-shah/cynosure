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

/**
 * Minimal external-link chevron. Kept inline so typography doesn't depend on
 * `@lumen/icons` (which is its own shippable package arriving post-v1).
 */
const ExternalIcon = (): ReactElement => (
  <svg
    className={externalIcon}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M6 3h7v7M12.5 3.5L6 10"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11 9v3.5A1.5 1.5 0 0 1 9.5 14h-6A1.5 1.5 0 0 1 2 12.5v-6A1.5 1.5 0 0 1 3.5 5H7"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

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
          <ExternalIcon />
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
