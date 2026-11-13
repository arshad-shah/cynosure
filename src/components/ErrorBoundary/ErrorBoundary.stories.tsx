import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ErrorInfo, useState } from "react";
import { expect, fn, waitFor, within } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { Button } from "../Button/Button.js";
import { Inline } from "../Inline/Inline.js";
import { Stack } from "../Stack/Stack.js";
import { ErrorBoundary } from "./ErrorBoundary.js";

/** Throws while rendering when `broken` is set, as a crashing panel would. */
function Panel({ broken, name = "Results" }: { broken: boolean; name?: string }) {
  if (broken) throw new Error(`${name} could not read the rows`);
  return <p>{name} loaded</p>;
}

/** A panel that can be broken and fixed from outside the boundary, so retry is tested against a real recovery. */
function Breakable(props: {
  label?: string | undefined;
  labels?: { retry?: string; title?: (label?: string) => string };
  className?: string;
}) {
  const [broken, setBroken] = useState(true);
  return (
    <Stack gap="3">
      <Inline gap="3">
        <Button onClick={() => setBroken(false)}>Fix</Button>
        <Button onClick={() => setBroken(true)}>Break</Button>
      </Inline>
      <ErrorBoundary {...props}>
        <Panel broken={broken} />
      </ErrorBoundary>
    </Stack>
  );
}

const meta = {
  title: "Components/ErrorBoundary",
  component: ErrorBoundary,
  args: { label: "Query results" },
  argTypes: {
    label: { control: "text" },
    resetKey: { control: "text" },
    labels: { control: "object" },
  },
  render: (args) => <Breakable label={args.label} />,
} satisfies Meta<typeof ErrorBoundary>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["visual"],
  play: async ({ canvas }) => {
    // A crash shows the fallback where the panel was, announced as an alert naming the part that failed.
    const alert = await canvas.findByRole("alert");
    await expect(alert).toHaveTextContent("Query results could not be shown");
    await expect(alert).toHaveTextContent("Results could not read the rows");
    await expect(canvas.queryByText("Results loaded")).toBeNull();
    // The rest of the page keeps working.
    await expect(canvas.getByRole("button", { name: "Fix" })).toBeEnabled();
  },
};

export const RetryRecovers: Story = {
  play: async ({ canvas, userEvent }) => {
    const retry = await canvas.findByRole("button", { name: "Try again" });
    // Still broken: trying again shows the fallback again.
    await userEvent.click(retry);
    await expect(await canvas.findByRole("alert")).toBeVisible();
    // Fixed outside; the fallback stays until the user tries again.
    await userEvent.click(canvas.getByRole("button", { name: "Fix" }));
    await expect(canvas.getByRole("alert")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Try again" }));
    await expect(await canvas.findByText("Results loaded")).toBeVisible();
    await expect(canvas.queryByRole("alert")).toBeNull();
  },
};

export const KeyboardRetry: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Fix" }));
    // Tab from the page's buttons reaches the fallback's button, and Enter retries.
    await userEvent.tab();
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Try again" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(await canvas.findByText("Results loaded")).toBeVisible();
  },
};

/** Throws on the pages listed in `bad`; the boundary resets when the page changes. */
function Pages({ onError }: { onError?: (error: Error, info: ErrorInfo) => void }) {
  const [page, setPage] = useState(1);
  return (
    <Stack gap="3">
      <Inline gap="3">
        {[1, 2, 3].map((n) => (
          <Button key={n} onClick={() => setPage(n)}>
            {`Page ${n}`}
          </Button>
        ))}
      </Inline>
      <ErrorBoundary resetKey={page} label="Page" onError={onError}>
        <Panel broken={page === 1} name={`Page ${page}`} />
      </ErrorBoundary>
    </Stack>
  );
}

export const ResetKeyResets: Story = {
  render: () => <Pages />,
  play: async ({ canvas, userEvent }) => {
    await expect(await canvas.findByRole("alert")).toHaveTextContent("Page 1 could not read the rows");
    // Moving on (a new resetKey) clears the error without a retry.
    await userEvent.click(canvas.getByRole("button", { name: "Page 2" }));
    await expect(await canvas.findByText("Page 2 loaded")).toBeVisible();
    await expect(canvas.queryByRole("alert")).toBeNull();
    // A new key with nothing to reset just renders the new content.
    await userEvent.click(canvas.getByRole("button", { name: "Page 3" }));
    await expect(await canvas.findByText("Page 3 loaded")).toBeVisible();
    // Back to the broken page: caught again.
    await userEvent.click(canvas.getByRole("button", { name: "Page 1" }));
    await expect(await canvas.findByRole("alert")).toHaveTextContent("Page could not be shown");
  },
};

const reported = fn();

export const OnErrorReports: Story = {
  render: () => <Pages onError={reported} />,
  play: async ({ canvas }) => {
    await canvas.findByRole("alert");
    // Once per crash, with the error and React's component stack.
    await waitFor(() => expect(reported).toHaveBeenCalledTimes(1));
    const [error, info] = reported.mock.calls[0] as [Error, ErrorInfo];
    await expect(error).toBeInstanceOf(Error);
    await expect(error.message).toBe("Page 1 could not read the rows");
    await expect(info.componentStack).toContain("Panel");
  },
  beforeEach: () => {
    reported.mockClear();
  },
};

const outerError = fn();
const innerError = fn();

export const NestedBoundariesCatchLocally: Story = {
  render: () => (
    <ErrorBoundary label="Window" onError={outerError}>
      <Stack gap="3">
        <p>Sidebar</p>
        <ErrorBoundary label="Editor" onError={innerError}>
          <Panel broken name="Editor" />
        </ErrorBoundary>
        <p>Status bar</p>
      </Stack>
    </ErrorBoundary>
  ),
  beforeEach: () => {
    outerError.mockClear();
    innerError.mockClear();
  },
  play: async ({ canvas }) => {
    // The nearest boundary catches it: only the editor is replaced, its siblings stay.
    const alerts = await canvas.findAllByRole("alert");
    await expect(alerts).toHaveLength(1);
    await expect(alerts[0]).toHaveTextContent("Editor could not be shown");
    await expect(canvas.getByText("Sidebar")).toBeVisible();
    await expect(canvas.getByText("Status bar")).toBeVisible();
    await expect(innerError).toHaveBeenCalledTimes(1);
    await expect(outerError).not.toHaveBeenCalled();
  },
};

export const CustomFallback: Story = {
  render: () => {
    function Custom() {
      const [broken, setBroken] = useState(true);
      return (
        <ErrorBoundary
          fallback={(error, retry) => (
            <Button
              onClick={() => {
                setBroken(false);
                retry();
              }}
            >
              {`Reload (${error.message})`}
            </Button>
          )}
        >
          <Panel broken={broken} />
        </ErrorBoundary>
      );
    }
    return <Custom />;
  },
  play: async ({ canvas, userEvent }) => {
    // The fallback is entirely the caller's: no built-in alert.
    const reload = await canvas.findByRole("button", { name: "Reload (Results could not read the rows)" });
    await expect(canvas.queryByRole("alert")).toBeNull();
    await userEvent.click(reload);
    await expect(await canvas.findByText("Results loaded")).toBeVisible();
  },
};

/** Throws something that is not an Error, as some libraries do. */
function ThrowsString(): never {
  throw "connection reset";
}

export const NonErrorThrown: Story = {
  render: () => (
    <ErrorBoundary fallback={(error) => <p>{`${error instanceof Error} ${error.message}`}</p>}>
      <ThrowsString />
    </ErrorBoundary>
  ),
  play: async ({ canvas }) => {
    // Whatever was thrown, the fallback gets an Error with its text.
    await expect(await canvas.findByText("true connection reset")).toBeVisible();
  },
};

export const LabelsOverride: Story = {
  render: () => (
    <Breakable label="Résultats" labels={{ title: (label) => `${label}: erreur`, retry: "Réessayer" }} />
  ),
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("alert")).toHaveTextContent("Résultats: erreur");
    await expect(canvas.getByRole("button", { name: "Réessayer" })).toBeVisible();
  },
};

export const WithoutALabel: Story = {
  render: () => <Breakable className="panel-fallback" />,
  play: async ({ canvas }) => {
    const alert = await canvas.findByRole("alert");
    await expect(alert).toHaveTextContent("Something went wrong");
    // className goes on the default fallback's root, for layout.
    await expect(alert.closest(".cy-error-boundary")).toHaveClass("panel-fallback");
  },
};

export const RendersChildrenAsTheyAre: Story = {
  render: () => (
    <div data-testid="host">
      <ErrorBoundary label="Chart">
        <p>Chart drawn</p>
      </ErrorBoundary>
    </div>
  ),
  play: async ({ canvas }) => {
    // No wrapper element around healthy children: layout (a flex or grid parent) is untouched.
    const host = canvas.getByTestId("host");
    await expect(host.children).toHaveLength(1);
    await expect(host.firstElementChild?.tagName).toBe("P");
  },
};

export const RightToLeft: Story = {
  render: () => (
    <div dir="rtl">
      <Breakable label="Query results" />
    </div>
  ),
  play: async ({ canvas }) => {
    const alert = await canvas.findByRole("alert");
    const retry = within(alert).getByRole("button", { name: "Try again" });
    // The retry button sits on the reading direction's end side of the message.
    const text = within(alert).getByText("Query results could not be shown");
    await expect(retry.getBoundingClientRect().right).toBeLessThan(text.getBoundingClientRect().left + 1);
  },
};

export const TouchTargets: Story = {
  tags: ["touch", "!dev"],
  play: async ({ canvas, userEvent }) => {
    const retry = await canvas.findByRole("button", { name: "Try again" });
    const hit = getComputedStyle(retry, "::before");
    await expect(Number.parseFloat(hit.blockSize || hit.height)).toBeGreaterThanOrEqual(44);
    // A tap retries.
    await userEvent.pointer({ keys: "[TouchA]", target: canvas.getByRole("button", { name: "Fix" }) });
    await userEvent.pointer({ keys: "[TouchA]", target: retry });
    await expect(await canvas.findByText("Results loaded")).toBeVisible();
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement, canvas }) => {
    await canvas.findByRole("alert");
    const { clean, hostile } = computeUnderHostileHost(canvasElement, ".cy-error-boundary", [
      "display",
      "padding-top",
      "box-sizing",
      "margin-top",
    ]);
    await expect(hostile).toEqual(clean);
  },
};
