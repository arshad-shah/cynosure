# ErrorBoundary

Catches errors thrown while its children render and shows a fallback in their place, so one crashing part of the app (a panel, a tab, a widget) leaves the rest working. The user can try again, and a new `resetKey` (a different tab or route) clears the error by itself. Healthy children render as they are, with no wrapper element.

```tsx
import { ErrorBoundary } from "@arshad-shah/cynosure";

<ErrorBoundary label="Query results" resetKey={tabId} onError={(error, info) => report(error, info.componentStack)}>
  <ResultsPanel />
</ErrorBoundary>

<ErrorBoundary fallback={(error, retry) => <EmptyState title="Chart failed" actions={<Button onClick={retry}>Reload</Button>} />}>
  <Chart />
</ErrorBoundary>
```

| Prop                  | Default         | Notes                                                                                                |
| --------------------- | --------------- | ---------------------------------------------------------------------------------------------------- |
| `fallback`            | a danger Notice | `(error, retry) => ReactNode`; anything thrown that is not an Error arrives wrapped in one           |
| `resetKey`            | –               | A change (`Object.is`) clears a caught error and renders the children again                          |
| `onError`             | –               | `(error, info)` once per caught error; `info.componentStack` for reports                             |
| `label`               | –               | Names the part in the default heading: "Query results could not be shown"                            |
| `labels`              | –               | `{ title: (label?) => string, retry: string }`; English defaults "Something went wrong", "Try again" |
| `className` / `style` | –               | On the default fallback's root, layout only                                                          |

The default fallback is a [Notice](../Notice/README.md) with `tone="danger"` (`role="alert"`, so the failure is announced when it appears), the error's message and a "Try again" Button. It fills the area of the part it replaces and centres the message there. Focus is not moved: the retry button is in the normal Tab order.

What it cannot catch (React's rule): errors in event handlers, in asynchronous code, and in the boundary itself. Catch those where they happen, or set state that throws during the next render.

## Tokens

- `--cy-error-boundary-padding`: space around the default fallback (default `--cy-space-6`)
- `--cy-error-boundary-max-width`: widest the default fallback's message grows (default 36rem)
