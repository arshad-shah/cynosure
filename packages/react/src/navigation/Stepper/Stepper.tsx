import { Check, X } from 'lucide-react';
import {
  Children,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useMemo,
} from 'react';
import { cn } from '../../utils/cn.js';
import {
  stepperBody,
  stepperButton,
  stepperConnector,
  stepperDescription,
  stepperItem,
  stepperMarker,
  stepperMarkerSize,
  stepperRoot,
  stepperTitle,
  stepperVariant,
  stepperVariantDot,
  stepperVariantLine,
} from './Stepper.css.js';

export type StepStatus = 'pending' | 'active' | 'complete' | 'error';
export type StepperVariant = 'numbered' | 'dots' | 'lines' | 'icons';
export type StepperSize = 'sm' | 'md' | 'lg';
export type StepperOrientation = 'horizontal' | 'vertical';

interface StepperContextValue {
  currentStep: number;
  variant: StepperVariant;
  size: StepperSize;
  orientation: StepperOrientation;
  interactive: boolean;
  onStepChange?: (step: number) => void;
  totalSteps: number;
}

const StepperContext = createContext<StepperContextValue | null>(null);
const useStepperContext = (): StepperContextValue => {
  const ctx = useContext(StepperContext);
  if (!ctx) throw new Error('Step must be used inside <Stepper>');
  return ctx;
};

export interface StepperProps extends Omit<HTMLAttributes<HTMLOListElement>, 'onChange'> {
  currentStep: number;
  variant?: StepperVariant;
  size?: StepperSize;
  orientation?: StepperOrientation;
  interactive?: boolean;
  onStepChange?: (step: number) => void;
}

export const Stepper = forwardRef<HTMLOListElement, StepperProps>(function Stepper(
  {
    currentStep,
    variant = 'numbered',
    size = 'md',
    orientation = 'horizontal',
    interactive = false,
    onStepChange,
    children,
    className,
    ...rest
  },
  ref,
) {
  const steps = Children.toArray(children).filter(isValidElement) as ReactElement[];

  const ctx = useMemo<StepperContextValue>(
    () => ({
      currentStep,
      variant,
      size,
      orientation,
      interactive,
      onStepChange,
      totalSteps: steps.length,
    }),
    [currentStep, variant, size, orientation, interactive, onStepChange, steps.length],
  );

  const items: ReactNode[] = [];
  steps.forEach((step, index) => {
    const stepKey = step.key ?? `step-${index}`;
    items.push(cloneElement(step, { key: stepKey, index } as { index: number }));
    if (index < steps.length - 1) {
      const isComplete = index < currentStep;
      items.push(
        <li
          key={`connector-${stepKey.toString()}`}
          aria-hidden="true"
          className={stepperConnector}
          data-complete={isComplete ? 'true' : 'false'}
        />,
      );
    }
  });

  return (
    <StepperContext.Provider value={ctx}>
      <ol
        ref={ref}
        data-orientation={orientation}
        data-variant={variant}
        className={cn(stepperRoot, stepperVariant[variant], className)}
        {...rest}
      >
        {items}
      </ol>
    </StepperContext.Provider>
  );
});

export interface StepProps extends Omit<HTMLAttributes<HTMLLIElement>, 'title'> {
  title?: ReactNode;
  description?: ReactNode;
  /** Overrides the default status derived from the index vs. currentStep. */
  status?: StepStatus;
  /** Overrides the default number/dot with a custom icon. */
  icon?: ReactNode;
  /** Populated by `<Stepper>` on clone — consumers should not pass this. */
  index?: number;
}

export const Step = forwardRef<HTMLLIElement, StepProps>(function Step(
  { title, description, status: statusProp, icon, index = 0, className, ...rest },
  ref,
) {
  const ctx = useStepperContext();
  const derivedStatus: StepStatus =
    statusProp ??
    (index < ctx.currentStep ? 'complete' : index === ctx.currentStep ? 'active' : 'pending');

  const canInteract = ctx.interactive && derivedStatus !== 'pending' && ctx.onStepChange;

  const markerContent: ReactNode =
    icon !== undefined ? (
      icon
    ) : ctx.variant === 'dots' || ctx.variant === 'lines' ? null : derivedStatus === 'complete' ? (
      <Check />
    ) : derivedStatus === 'error' ? (
      <X />
    ) : (
      index + 1
    );

  const variantClass =
    ctx.variant === 'dots'
      ? stepperVariantDot
      : ctx.variant === 'lines'
        ? stepperVariantLine
        : undefined;

  const body = (
    <div className={stepperBody}>
      {title !== undefined ? <p className={stepperTitle}>{title}</p> : null}
      {description !== undefined ? <p className={stepperDescription}>{description}</p> : null}
    </div>
  );

  const marker = (
    <span
      className={cn(stepperMarker, stepperMarkerSize[ctx.size], variantClass)}
      data-status={derivedStatus}
      aria-hidden="true"
    >
      {markerContent}
    </span>
  );

  return (
    <li
      ref={ref}
      aria-current={derivedStatus === 'active' ? 'step' : undefined}
      data-status={derivedStatus}
      className={cn(stepperItem, className)}
      {...rest}
    >
      {canInteract ? (
        <button
          type="button"
          className={stepperButton}
          onClick={() => ctx.onStepChange?.(index)}
          aria-label={typeof title === 'string' ? title : `Step ${index + 1}`}
        >
          {marker}
          {body}
        </button>
      ) : (
        <>
          {marker}
          {body}
        </>
      )}
    </li>
  );
});
