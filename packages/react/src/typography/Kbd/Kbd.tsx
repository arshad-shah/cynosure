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

/**
 * Props specific to `Kbd`, layered on top of `LayoutProps` and `AsChildProps`.
 */
export interface KbdOwnProps extends LayoutProps, AsChildProps {
  /**
   * Keycap scale — adjusts padding, font-size, and inline-swapped icon size
   * together so caps sit naturally alongside body text at the same step.
   * @default "md"
   */
  size?: KbdSize;
  /**
   * Additional class names appended after Cynosure's base classes.
   */
  className?: string;
  /**
   * Inline style overrides merged last.
   */
  style?: CSSProperties;
  /**
   * Keycap label. Strings are walked grapheme-by-grapheme so combined
   * shortcuts (e.g. `"⌘R"`) swap known modifier glyphs for `lucide` icons.
   */
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
  if (typeof children !== 'string') {
    return isValidElement(children) ? children : children;
  }
  // Walk the string by grapheme so combined shortcuts like "⌘R" or "⇧⌫"
  // swap known modifier glyphs for icons while letters stay as text. Uses
  // Array.from to split correctly on Unicode characters.
  const parts = Array.from(children);
  const hasIcon = parts.some((ch) => GLYPH_TO_ICON[ch] != null);
  if (!hasIcon) return children;
  return parts.map((ch, i) => {
    const Icon = GLYPH_TO_ICON[ch];
    if (Icon != null) {
      // biome-ignore lint/suspicious/noArrayIndexKey: static input; duplicate glyphs allowed within one keycap.
      return <Icon key={i} size={ICON_SIZE[size]} className={kbdIcon} aria-hidden="true" />;
    }
    // biome-ignore lint/suspicious/noArrayIndexKey: static input; duplicate characters allowed within one keycap.
    return <span key={i}>{ch}</span>;
  });
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
