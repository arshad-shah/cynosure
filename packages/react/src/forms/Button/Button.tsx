import {
  type ButtonHTMLAttributes,
  type CSSProperties,
  type ForwardedRef,
  type ReactElement,
  type ReactNode,
  forwardRef,
  useContext,
} from 'react';
import { Slot, Slottable } from '../../primitives/Slot.js';
import { cn } from '../../utils/cn.js';
import { ButtonGroupContext } from '../ButtonGroup/context.js';
import {
  buttonBase,
  buttonContent,
  buttonFullWidth,
  buttonShape,
  buttonSize,
  buttonSpinner,
  ghostAccent,
  ghostDanger,
  ghostNeutral,
  ghostSuccess,
  ghostWarning,
  linkAccent,
  linkDanger,
  linkNeutral,
  linkSuccess,
  linkWarning,
  outlineAccent,
  outlineDanger,
  outlineNeutral,
  outlineSuccess,
  outlineWarning,
  softAccent,
  softDanger,
  softNeutral,
  softSuccess,
  softWarning,
  solidAccent,
  solidDanger,
  solidNeutral,
  solidSuccess,
  solidWarning,
} from './Button.css.js';

export type ButtonVariant = 'solid' | 'soft' | 'outline' | 'ghost' | 'link';
export type ButtonColorScheme = 'accent' | 'neutral' | 'success' | 'danger' | 'warning';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ButtonShape = 'default' | 'square' | 'pill';

/**
 * Variant × colourScheme → CSS class lookup. Declared as a nested map rather
 * than computed from the style objects so the resulting bundle only pulls in
 * the cells that actually render.
 */
const variantClass: Record<ButtonVariant, Record<ButtonColorScheme, string>> = {
  solid: {
    accent: solidAccent,
    neutral: solidNeutral,
    success: solidSuccess,
    danger: solidDanger,
    warning: solidWarning,
  },
  soft: {
    accent: softAccent,
    neutral: softNeutral,
    success: softSuccess,
    danger: softDanger,
    warning: softWarning,
  },
  outline: {
    accent: outlineAccent,
    neutral: outlineNeutral,
    success: outlineSuccess,
    danger: outlineDanger,
    warning: outlineWarning,
  },
  ghost: {
    accent: ghostAccent,
    neutral: ghostNeutral,
    success: ghostSuccess,
    danger: ghostDanger,
    warning: ghostWarning,
  },
  link: {
    accent: linkAccent,
    neutral: linkNeutral,
    success: linkSuccess,
    danger: linkDanger,
    warning: linkWarning,
  },
};

export interface ButtonOwnProps {
  variant?: ButtonVariant;
  colorScheme?: ButtonColorScheme;
  size?: ButtonSize;
  shape?: ButtonShape;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  asChild?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export type ButtonProps = ButtonOwnProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonOwnProps>;

const TinySpinner = (): ReactElement => <span aria-hidden="true" className={buttonSpinner} />;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  props,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  const group = useContext(ButtonGroupContext);

  const {
    asChild,
    variant = group?.variant ?? 'solid',
    colorScheme = group?.colorScheme ?? 'accent',
    size = group?.size ?? 'md',
    shape = 'default',
    fullWidth,
    loading = false,
    leftIcon,
    rightIcon,
    className,
    children,
    disabled,
    type,
    'aria-busy': ariaBusy,
    ...rest
  } = props;

  const mergedClassName = cn(
    buttonBase,
    buttonSize[size],
    buttonShape[shape],
    variantClass[variant][colorScheme],
    fullWidth ? buttonFullWidth : undefined,
    className,
  );

  // `asChild` projects the button's props onto a single consumer element
  // (typically an `<a>`). Slot requires exactly one slot target — wrapping
  // `children` in `Slottable` tells it where that target is so left/right
  // icons and the spinner can coexist as siblings. Slot's own types don't
  // list HTML attributes (it forwards whatever to the cloned child), so the
  // prop bag is widened for this branch.
  if (asChild) {
    const SlotAny = Slot as unknown as (props: Record<string, unknown>) => ReactElement;
    return (
      <SlotAny
        ref={ref}
        disabled={disabled || loading || undefined}
        aria-busy={loading ? true : ariaBusy}
        data-loading={loading || undefined}
        className={mergedClassName}
        style={{ position: 'relative', ...props.style }}
        {...(rest as Record<string, unknown>)}
      >
        {leftIcon}
        <Slottable>{children}</Slottable>
        {rightIcon}
        {loading ? <TinySpinner /> : null}
      </SlotAny>
    );
  }

  return (
    <button
      ref={ref}
      type={type ?? 'button'}
      disabled={disabled || loading || undefined}
      aria-busy={loading ? true : ariaBusy}
      data-loading={loading || undefined}
      className={mergedClassName}
      style={{ position: 'relative', ...props.style }}
      {...rest}
    >
      <span data-slot="content" className={buttonContent}>
        {leftIcon}
        {children}
        {rightIcon}
      </span>
      {loading ? <TinySpinner /> : null}
    </button>
  );
});
