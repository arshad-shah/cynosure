import {
  type AriaAttributes,
  type CSSProperties,
  forwardRef,
  type MouseEvent,
  type ReactNode,
  type Ref,
  useEffect,
  useRef,
  useState,
} from "react";
import { ButtonBase, type ButtonBaseProps } from "../../foundations/ButtonBase/ButtonBase.js";
import { Icon } from "../../foundations/Icon/Icon.js";
import { LinkBase } from "../../foundations/LinkBase/LinkBase.js";
import type { IconData } from "../../icons/types.js";
import type { DenseSize, Tone } from "../../tokens/schema.js";
import { LoadingDots } from "../LoadingDots/LoadingDots.js";

export interface ButtonTokens {
  fontSizeXs: string;
  paddingInlineXs: string;
  heightXs: string;
  heightSm: string;
  heightMd: string;
  heightLg: string;
  radius: string;
  paddingInline: string;
  gap: string;
  fontWeight: string;
  maxWidth: string;
  /** Inset highlight + drop shadow on solid buttons. */
  solidShadow: string;
  /** Tint strength of soft buttons (percentage of the tone mixed into the surface). */
  softMix: string;
  /** Border strength of outline buttons (percentage of the tone mixed into the line colour). */
  outlineMix: string;
  pressScale: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    button: ButtonTokens;
  }
}

export type ButtonVariant = "solid" | "soft" | "outline" | "ghost";

export interface ButtonProps extends Omit<ButtonBaseProps, "children" | "className" | "style" | "color"> {
  /** Fill style. */
  variant?: ButtonVariant;
  /** Semantic colour. */
  tone?: Tone;
  /**
   * A one-off colour (any CSS colour), for a brand button such as "Get it on Google Play". Overrides `tone`. The text
   * on a solid fill is white or black, whichever reads; on the other variants the colour is darkened or lightened
   * until it reads on the surface. Prefer a tone or the theme's accent.
   */
  color?: string | undefined;
  /**
   * Height and text size of the button. Default "md". `xs` (about 20px) is for dense desktop chrome: it looks small and
   * is still 24px to press (44px on coarse pointers).
   */
  size?: DenseSize;
  /** Leading icon (inline-start, RTL aware). */
  icon?: IconData | undefined;
  /** Trailing icon (inline-end). */
  iconEnd?: IconData | undefined;
  /** Shows LoadingDots, sets aria-busy and ignores activation while keeping the button's width. */
  loading?: boolean;
  /** Stretch to the container's width. */
  fullWidth?: boolean;
  /**
   * A link that looks like a button (it navigates: a real `<a>`, so it opens in a new tab, can be copied, and so on).
   * Only safe URLs are linked. The forwarded ref is not attached to a link (use `linkRef`). A link takes `target`,
   * `id`, `aria-label`, `aria-current`, `className`, `style`, `data-testid` and `onClick`; the other button
   * attributes do not apply to it.
   */
  href?: string | undefined;
  /** With `href`: where it opens, e.g. `_blank`. */
  target?: string | undefined;
  /** With `href`: receives the link element (the forwarded ref is for the button element). */
  linkRef?: Ref<HTMLAnchorElement> | undefined;
  /**
   * Square: as wide as it is tall, with no padding, for one icon as the content. Prefer IconButton, which sets it and
   * adds the required label and its tooltip. Default false.
   */
  square?: boolean;
  /**
   * Ask before acting, in place: the first press arms the button and shows this text ("Press again to delete"), a
   * second press within 4 seconds acts. Escape, leaving the button or the time running out disarms it.
   */
  confirm?: ReactNode;
  /**
   * A pointer press leaves focus where it was (an on-screen keypad beside a field keeps the field's caret). Keyboard
   * users still reach it with Tab.
   */
  keepFocus?: boolean;
  /**
   * Marks the button or link as the current item of a set: `"page"` for the page being shown (a link to it in a
   * navigation bar or in Pagination), or `"step"`, `"location"`, `"date"`, `"time"` or `true`. Set on the button or
   * link element. Default: not set.
   */
  "aria-current"?: AriaAttributes["aria-current"];
  /** Added to the button (or link) element, for layout. */
  className?: string;
  /** Layout only. Restyle through `--cy-button-*` tokens. */
  style?: CSSProperties;
  /** The button's label. */
  children: ReactNode;
  /** Set on the button (or link) element, to find it in tests. */
  "data-testid"?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "outline",
    tone = "neutral",
    color,
    size = "md",
    icon,
    iconEnd,
    loading = false,
    fullWidth,
    href,
    target,
    linkRef,
    square = false,
    confirm,
    keepFocus = false,
    className,
    children,
    onClick,
    onKeyDown,
    onBlur,
    onPointerDown,
    ...rest
  },
  ref,
) {
  const iconSize = size === "lg" ? "lg" : size === "xs" ? "sm" : "md";
  const [armed, setArmed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const disarm = () => {
    clearTimeout(timer.current);
    setArmed(false);
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  const press = (event: MouseEvent<HTMLButtonElement>) => {
    if (loading) return event.preventDefault();
    if (confirm !== undefined && !armed) {
      setArmed(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setArmed(false), 4000);
      return;
    }
    disarm();
    onClick?.(event);
  };
  const shared = {
    className: `cy-button cy-motion-trigger${className ? ` ${className}` : ""}`,
    "data-variant": variant,
    "data-tone": color ? undefined : tone,
    "data-color": color ? "" : undefined,
    "data-size": size,
    "data-full": fullWidth ? "" : undefined,
    "data-square": square ? "" : undefined,
    "data-loading": loading ? "" : undefined,
    "data-armed": armed ? "" : undefined,
    style: color ? ({ "--_tone": color, ...rest.style } as CSSProperties) : rest.style,
  };
  const content = (
    <>
      <span className="cy-reset cy-button-content">
        {icon && <Icon icon={icon} size={iconSize} />}
        <span className="cy-reset cy-button-label">{armed ? confirm : children}</span>
        {iconEnd && <Icon icon={iconEnd} size={iconSize} />}
      </span>
      {loading && <LoadingDots className="cy-button-loading" />}
    </>
  );
  if (href !== undefined)
    return (
      <LinkBase
        ref={linkRef}
        href={href}
        target={target}
        {...shared}
        id={rest.id}
        data-testid={rest["data-testid"]}
        aria-label={rest["aria-label"]}
        aria-current={rest["aria-current"]}
        onClick={onClick as unknown as (e: MouseEvent<HTMLAnchorElement>) => void}
      >
        {content}
      </LinkBase>
    );
  return (
    <ButtonBase
      ref={ref}
      {...rest}
      {...shared}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      onClick={press}
      onMouseDown={keepFocus ? (event) => event.preventDefault() : rest.onMouseDown}
      onPointerDown={(event) => {
        // Pressing without taking focus: the field beside it keeps its caret.
        if (keepFocus) event.preventDefault();
        onPointerDown?.(event);
      }}
      onKeyDown={(event) => {
        if (armed && event.key === "Escape") {
          event.preventDefault();
          disarm();
        }
        onKeyDown?.(event);
      }}
      onBlur={(event) => {
        if (armed) disarm();
        onBlur?.(event);
      }}
    >
      {content}
    </ButtonBase>
  );
});
