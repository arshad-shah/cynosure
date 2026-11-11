import type { CSSProperties, ReactNode } from "react";
import { ButtonBase } from "../../foundations/ButtonBase/ButtonBase.js";
import { Icon } from "../../foundations/Icon/Icon.js";
import { alert } from "../../icons/alert.js";
import { check } from "../../icons/check.js";
import type { Size } from "../../tokens/schema.js";

export interface StepsTokens {
  /** Diameter of the numbered marker. */
  markerSize: string;
  /** Thickness of the line between steps. */
  lineWidth: string;
  /** Space between steps. */
  gap: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    steps: StepsTokens;
  }
}

export type StepStatus = "complete" | "current" | "upcoming" | "error";

export interface StepItem {
  id: string;
  label: ReactNode;
  /** A second line under the label. */
  description?: ReactNode;
  /** Overrides the status worked out from `current`: mark a step `error`, or `complete` out of order. */
  status?: "complete" | "error" | undefined;
  /** With `onStepSelect`: this step cannot be chosen. */
  disabled?: boolean;
}

export interface StepsLabels {
  /** Accessible name of the list. Default: "Progress". */
  list: string;
  /** Read after each step's label. Defaults: "completed", "current step", "not started", "has a problem". */
  complete: string;
  current: string;
  upcoming: string;
  error: string;
}

export interface StepsProps {
  /** The steps, in order. */
  steps: StepItem[];
  /** `id` of the step the person is on. Steps before it are complete, steps after it upcoming. */
  current: string;
  /** Lays the steps out in a row or in a column. Default "horizontal". */
  orientation?: "horizontal" | "vertical";
  /** Makes steps buttons that go to that step. Leave it out for a read-only progress display. */
  onStepSelect?: (id: string) => void;
  /** Text size of labels and markers. */
  size?: Size;
  /** Replace the built-in English text: the list's name and the status read after each step. */
  labels?: Partial<StepsLabels>;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. Restyle through --cy-steps-* tokens. */
  style?: CSSProperties;
}

const DEFAULT_LABELS: StepsLabels = {
  list: "Progress",
  complete: "completed",
  current: "current step",
  upcoming: "not started",
  error: "has a problem",
};

/** Progress through an ordered flow (a setup wizard, a checkout): numbered steps with the current one marked. */
export function Steps({
  steps,
  current,
  orientation = "horizontal",
  onStepSelect,
  size = "md",
  labels,
  className,
  style,
}: StepsProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const at = steps.findIndex((s) => s.id === current);
  return (
    <ol
      className={className ? `cy-steps ${className}` : "cy-steps"}
      aria-label={text.list}
      data-orientation={orientation}
      data-size={size}
      style={style}
    >
      {steps.map((step, i) => {
        const status: StepStatus =
          step.status ?? (i === at ? "current" : at >= 0 && i < at ? "complete" : "upcoming");
        const isCurrent = i === at;
        const content = (
          <>
            <span className="cy-steps-marker cy-reset" aria-hidden="true">
              {status === "complete" ? (
                <Icon icon={check} size="sm" />
              ) : status === "error" ? (
                <Icon icon={alert} size="sm" />
              ) : (
                i + 1
              )}
            </span>
            <span className="cy-steps-text cy-reset">
              <span className="cy-steps-label cy-reset">{step.label}</span>
              {step.description != null && (
                <span className="cy-steps-description cy-reset">{step.description}</span>
              )}
              <span className="cy-steps-hidden">{`, ${text[status]}`}</span>
            </span>
          </>
        );
        return (
          <li key={step.id} className="cy-steps-item cy-reset" data-status={status}>
            {onStepSelect ? (
              <ButtonBase
                className="cy-steps-step cy-reset"
                aria-current={isCurrent ? "step" : undefined}
                aria-disabled={step.disabled || undefined}
                onClick={() => {
                  if (!step.disabled && !isCurrent) onStepSelect(step.id);
                }}
              >
                {content}
              </ButtonBase>
            ) : (
              <span className="cy-steps-step cy-reset" aria-current={isCurrent ? "step" : undefined}>
                {content}
              </span>
            )}
            {i < steps.length - 1 && <span className="cy-steps-line cy-reset" aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  );
}
