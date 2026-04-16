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
import { codeBase, codeBlock, codeColorScheme, codeSize } from './Code.css.js';

export type CodeSize = 'sm' | 'md';
export type CodeVariant = 'inline' | 'block';
export type CodeColorScheme = 'neutral' | 'accent' | 'success' | 'danger';

export interface CodeOwnProps extends LayoutProps, AsChildProps {
  size?: CodeSize;
  /** `"block"` renders `<pre><code>` so multi-line snippets retain whitespace. */
  variant?: CodeVariant;
  colorScheme?: CodeColorScheme;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export type CodeProps = CodeOwnProps &
  Omit<React.HTMLAttributes<HTMLElement>, keyof CodeOwnProps | 'color'>;

type AnyProps = CodeOwnProps & { [key: string]: unknown };

const CodeRender = (props: AnyProps, ref: ForwardedRef<HTMLElement>): ReactElement => {
  const {
    asChild,
    className,
    style,
    children,
    size = 'md',
    variant = 'inline',
    colorScheme = 'neutral',
    ...rest
  } = props;

  const classes = cn(
    codeBase,
    codeSize[size],
    codeColorScheme[colorScheme],
    variant === 'block' ? codeBlock : undefined,
    className,
  );

  if (variant === 'block') {
    // Block variant wraps the `<code>` in a `<pre>` so browsers preserve
    // whitespace + line breaks. The outer `<pre>` carries the visual styling
    // while the inner `<code>` remains semantic. `asChild` applies to the
    // outer element (the box the caller wants to style).
    return (
      <Box
        ref={ref as never}
        as="pre"
        asChild={asChild}
        className={classes}
        style={style}
        {...rest}
      >
        <code>{children}</code>
      </Box>
    );
  }

  return (
    <Box ref={ref as never} as="code" asChild={asChild} className={classes} style={style} {...rest}>
      {children}
    </Box>
  );
};

/**
 * Inline code (`variant="inline"`, default) or block snippet (`variant="block"`).
 * Syntax highlighting is intentionally out of scope — the full `CodeBlock`
 * component lands in Phase 11.
 */
export const Code = forwardRef<HTMLElement, CodeProps>(CodeRender as never);
