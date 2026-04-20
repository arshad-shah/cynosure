import {
  ArrowBigUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ChevronUp,
  Command,
  CornerDownLeft,
  Delete,
  type LucideIcon,
  Option,
} from 'lucide-react';
import {
  type CSSProperties,
  type ForwardedRef,
  type ReactElement,
  type ReactNode,
  forwardRef,
  isValidElement,
} from 'react';
import { Box } from '../../primitives/layout/Box/Box.js';
import type { AsChildProps, LayoutProps } from '../../primitives/layout/shared/index.js';
import { cn } from '../../utils/cn.js';
import { kbdBase, kbdIcon, kbdSize } from './Kbd.css.js';

export type KbdSize = 'sm' | 'md' | 'lg';

export interface KbdOwnProps extends LayoutProps, AsChildProps {
  size?: KbdSize;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export type KbdProps = KbdOwnProps &
  Omit<React.HTMLAttributes<HTMLElement>, keyof KbdOwnProps | 'color'>;

type AnyProps = KbdOwnProps & { [key: string]: unknown };

/**
 * Keyboard glyphs that users commonly type as a single character but that
 * read better as an icon. Keys are the literal character a consumer might
 * type (e.g. `'⌘'`, `'⇧'`); values are the lucide icon to render in their
 * place so no keycap ever shows a bare symbol.
 */
const GLYPH_TO_ICON: Record<string, LucideIcon> = {
  '⌘': Command,
  '⇧': ArrowBigUp,
  '⌥': Option,
  '⌃': ChevronUp,
  '⌫': Delete,
  '↵': CornerDownLeft,
  '⏎': CornerDownLeft,
  '↑': ArrowUp,
  '↓': ArrowDown,
  '←': ArrowLeft,
  '→': ArrowRight,
};

/** Pixel sizes for the swapped-in icon per kbd size variant. */
const ICON_SIZE: Record<KbdSize, number> = { sm: 12, md: 14, lg: 16 };

function renderChildren(children: ReactNode, size: KbdSize): ReactNode {
  if (typeof children === 'string') {
    const Icon = GLYPH_TO_ICON[children];
    if (Icon != null) {
      return <Icon size={ICON_SIZE[size]} className={kbdIcon} aria-hidden="true" />;
    }
  }
  // A single-child ReactElement representing a recognized glyph (rare, but
  // future-proof: consumers may wrap in a fragment). Fall through untouched.
  if (isValidElement(children)) return children;
  return children;
}

const KbdRender = (props: AnyProps, ref: ForwardedRef<HTMLElement>): ReactElement => {
  const { asChild, className, style, children, size = 'md', ...rest } = props;

  return (
    <Box
      ref={ref as never}
      as="kbd"
      asChild={asChild}
      className={cn(kbdBase, kbdSize[size], className)}
      style={style}
      {...rest}
    >
      {renderChildren(children, size)}
    </Box>
  );
};

/**
 * Renders a `<kbd>` styled as a faux keycap. Sizes `sm | md | lg` scale
 * padding + font-size together so keycaps sit nicely alongside body text at
 * the corresponding size. Known keyboard glyphs (`⌘`, `⇧`, `⌥`, arrows,
 * return, backspace) are auto-swapped for lucide icons so keycaps always
 * display a rendered glyph rather than a bare Unicode character.
 */
export const Kbd = forwardRef<HTMLElement, KbdProps>(KbdRender as never);
