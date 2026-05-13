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
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import { cn } from '../../utils/cn.js';
import {
  stepperBody,
  stepperButton,
  stepperConnectorAfter,
  stepperConnectorBefore,
  stepperConnectorTrack,
  stepperDescription,
  stepperItem,
  stepperMarker,
  stepperRoot,
  stepperRootSize,
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

  // Inject `index`, `isFirst`, `isLast` so each Step can suppress the line
  // arm on the edge of the row. The connector arms render *inside* each
  // Step (rather than as separate <li> elements between Steps), so adjacent
  // arms abut at the item boundary with no visible gap.
  const items = steps.map((step, index) =>
    cloneElement(step, {
      key: step.key ?? `step-${index}`,
      index,
      isFirst: index === 0,
      isLast: index === steps.length - 1,
    } as { index: number; isFirst: boolean; isLast: boolean }),
  );

  return (
    <StepperContext.Provider value={ctx}>
      <ol
        ref={ref}
        data-orientation={orientation}
        data-variant={variant}
        className={cn(stepperRoot, stepperRootSize[size], stepperVariant[variant], className)}
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
  /** Populated by `<Stepper>` on clone — consumers should not pass these. */
  index?: number;
  isFirst?: boolean;
  isLast?: boolean;
}

export const Step = forwardRef<HTMLLIElement, StepProps>(function Step(
  {
    title,
    description,
    status: statusProp,
    icon,
    index = 0,
    isFirst = false,
    isLast = false,
    className,
    ...rest
  },
  ref,
) {
  const ctx = useStepperContext();
  const derivedStatus: StepStatus =
    statusProp ??
    (index < ctx.currentStep ? 'complete' : index === ctx.currentStep ? 'active' : 'pending');

  const canInteract = ctx.interactive && derivedStatus !== 'pending' && Boolean(ctx.onStepChange);

  const markerContent: ReactNode =
    icon !== undefined ? (
      icon
    ) : ctx.variant === 'dots' || ctx.variant === 'lines' ? null : derivedStatus === 'complete' ? (
      <Check size={14} strokeWidth={2.5} />
    ) : derivedStatus === 'error' ? (
      <X size={14} strokeWidth={2.5} />
    ) : (
      index + 1
    );

  const variantClass =
    ctx.variant === 'dots'
      ? stepperVariantDot
      : ctx.variant === 'lines'
        ? stepperVariantLine
        : undefined;

  // Connector colouring: a "before" arm reflects the *previous* step's
  // completion (so it lights up as soon as the current step is reached);
  // an "after" arm reflects this step's own completion. The two halves of
  // the line between Step N and Step N+1 evaluate to the same boolean, so
  // they render the same colour and the seam at the item boundary is
  // invisible.
  const beforeComplete = ctx.currentStep >= index;
  const afterComplete = ctx.currentStep > index;

  // Marker + flanking line halves on one track. With `gap: 0` on the root
  // and the track set to `flex: 1` per item, adjacent tracks touch at the
  // item boundary so the line reads as one continuous run from marker to
  // marker.
  const track = (
    <div className={stepperConnectorTrack} aria-hidden="true">
      <span
        className={stepperConnectorBefore}
        data-complete={beforeComplete ? 'true' : 'false'}
        data-hidden={isFirst ? 'true' : 'false'}
      />
      <span className={cn(stepperMarker, variantClass)} data-status={derivedStatus}>
        {markerContent}
      </span>
      <span
        className={stepperConnectorAfter}
        data-complete={afterComplete ? 'true' : 'false'}
        data-hidden={isLast ? 'true' : 'false'}
      />
    </div>
  );

  const body =
    title !== undefined || description !== undefined ? (
      <Stack gap="0.5" className={stepperBody}>
        {title !== undefined ? (
          <Text as="span" size="md" weight="semibold" className={stepperTitle}>
            {title}
          </Text>
        ) : null}
        {description !== undefined ? (
          <Text as="span" size="sm" color="fg.muted" className={stepperDescription}>
            {description}
          </Text>
        ) : null}
      </Stack>
    ) : null;

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
          {track}
          {body}
        </button>
      ) : (
        <>
          {track}
          {body}
        </>
      )}
    </li>
  );
});
