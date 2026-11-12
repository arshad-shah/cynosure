import { Component, type CSSProperties, type ErrorInfo, type ReactNode } from "react";
import { Button } from "../Button/Button.js";
import { Notice } from "../Notice/Notice.js";

export interface ErrorBoundaryTokens {
  /** Space around the default fallback, inside the area it replaces. */
  padding: string;
  /** Widest the default fallback's message grows. */
  maxWidth: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    errorBoundary: ErrorBoundaryTokens;
  }
}

export interface ErrorBoundaryLabels {
  /** Heading of the default fallback; it gets `label` when one is set. */
  title: (label?: string) => string;
  /** The default fallback's retry button. */
  retry: string;
}

export interface ErrorBoundaryProps {
  /** The part of the app this boundary protects. Rendered as it is, with no wrapper element. */
  children?: ReactNode;
  /**
   * What to show instead of `children` after they threw while rendering: gets the error (anything thrown that is not
   * an Error is wrapped in one) and `retry`, which renders the children again. Default: a danger Notice naming the
   * part (`label`), with the error's message and a "Try again" button.
   */
  fallback?: ((error: Error, retry: () => void) => ReactNode) | undefined;
  /**
   * When this value changes (compared with `Object.is`), a caught error is cleared and the children render again: pass
   * what the content depends on (a tab or route id) so moving on recovers.
   */
  resetKey?: unknown;
  /** Called once per caught error, with React's component stack, for logging or reporting. */
  onError?: ((error: Error, info: ErrorInfo) => void) | undefined;
  /** Names the protected part in the default fallback's heading ("Query results could not be shown"). */
  label?: string | undefined;
  /** Replace the built-in English text of the default fallback: its heading and the retry button. */
  labels?: Partial<ErrorBoundaryLabels> | undefined;
  /** Added to the default fallback's root, for layout. */
  className?: string;
  /** Layout only, on the default fallback's root. Restyle through --cy-error-boundary-* tokens. */
  style?: CSSProperties;
}

const DEFAULT_LABELS: ErrorBoundaryLabels = {
  title: (label) => (label ? `${label} could not be shown` : "Something went wrong"),
  retry: "Try again",
};

interface State {
  error: Error | null;
}

/** Anything can be thrown; the fallback and `onError` always get an Error. */
const toError = (thrown: unknown) => (thrown instanceof Error ? thrown : new Error(String(thrown)));

/**
 * Catches errors thrown while rendering its children and shows a fallback in their place, so one crashing part (a
 * panel, a tab, a widget) does not take the rest of the app down. Retry, or a new `resetKey`, renders them again.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(thrown: unknown): State {
    return { error: toError(thrown) };
  }

  override componentDidCatch(thrown: unknown, info: ErrorInfo): void {
    this.props.onError?.(toError(thrown), info);
  }

  override componentDidUpdate(previous: ErrorBoundaryProps): void {
    if (this.state.error && !Object.is(previous.resetKey, this.props.resetKey)) this.retry();
  }

  retry = () => this.setState({ error: null });

  override render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    const { fallback, label, labels, className, style } = this.props;
    if (fallback) return fallback(error, this.retry);
    const text = { ...DEFAULT_LABELS, ...labels };
    return (
      <div className={className ? `cy-error-boundary ${className}` : "cy-error-boundary"} style={style}>
        <Notice
          tone="danger"
          title={text.title(label)}
          className="cy-error-boundary-notice"
          action={
            <Button size="sm" variant="soft" tone="danger" onClick={this.retry}>
              {text.retry}
            </Button>
          }
        >
          {error.message}
        </Notice>
      </div>
    );
  }
}
