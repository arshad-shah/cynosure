import { type CSSProperties, type LabelHTMLAttributes, type ReactNode, forwardRef } from 'react';
import { cn } from '../../utils/cn.js';
import { label, labelRequiredIndicator } from './Label.css.js';

export interface LabelProps extends Omit<LabelHTMLAttributes<HTMLLabelElement>, 'children'> {
  /** Appends a red `*` after the label text. Purely decorative (`aria-hidden`). */
  required?: boolean;
  /** Renders in the disabled colour. */
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Form control label. Renders a `<label>` with Cynosure typography/colour so
 * form fields look consistent. Pair with an input via `htmlFor={id}`.
 */
export const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label(
  { required, disabled, children, className, ...rest },
  ref,
) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: htmlFor/associated input is the consumer's responsibility; this component renders the label surface only.
    <label
      ref={ref}
      className={cn(label, className)}
      data-disabled={disabled || undefined}
      {...rest}
    >
      {children}
      {required ? (
        <span aria-hidden="true" className={labelRequiredIndicator}>
          *
        </span>
      ) : null}
    </label>
  );
});
