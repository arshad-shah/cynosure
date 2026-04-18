import type { Meta, StoryObj } from '@storybook/react';
import {
  type ButtonHTMLAttributes,
  type ReactNode,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Heading } from '../typography/Heading/Heading.js';
import { Text } from '../typography/Text/Text.js';
import { Slot, Slottable } from './Slot.js';
import { Box } from './layout/Box/Box.js';
import { Inline } from './layout/Inline/Inline.js';
import { Stack } from './layout/Stack/Stack.js';

// ── Demo components ─────────────────────────────────────────────────────

interface FakeButtonProps extends ButtonHTMLAttributes<HTMLElement> {
  asChild?: boolean;
}

const FakeButton = forwardRef<HTMLElement, FakeButtonProps>(function FakeButton(
  { asChild, style, ...rest },
  ref,
) {
  const Component = (asChild ? Slot : 'button') as 'button';
  return (
    <Component
      ref={ref as never}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 0.875rem',
        borderRadius: '0.5rem',
        background: 'var(--cynosure-color-accent-solid)',
        color: 'var(--cynosure-color-accent-on-solid)',
        fontSize: '0.875rem',
        fontWeight: 600,
        textDecoration: 'none',
        border: 'none',
        cursor: 'pointer',
        ...style,
      }}
      {...rest}
    />
  );
});

interface IconArrowProps {
  readonly 'aria-hidden'?: boolean;
}

const IconArrow = ({ 'aria-hidden': hidden = true }: IconArrowProps) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden={hidden}
    role="img"
    aria-label="arrow"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

// ── Meta ────────────────────────────────────────────────────────────────

const meta: Meta<typeof FakeButton> = {
  title: 'Primitives/Slot',
  component: FakeButton,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof FakeButton>;

// ── Basic asChild ───────────────────────────────────────────────────────

export const AsChildAnchor: Story = {
  name: 'Basic asChild',
  render: () => (
    <Stack gap="3">
      <Text>
        <code>Slot</code> merges a component&rsquo;s props onto its single child, letting consumers
        project styling/behaviour onto an arbitrary element. Here <code>FakeButton</code> becomes an
        anchor.
      </Text>
      <Inline gap="3">
        <FakeButton>Normal button</FakeButton>
        <FakeButton asChild>
          <a href="https://example.com" target="_blank" rel="noreferrer">
            Rendered as &lt;a&gt; <IconArrow />
          </a>
        </FakeButton>
      </Inline>
    </Stack>
  ),
};

// ── With Slottable for multiple children ───────────────────────────────

interface SlottableButtonProps extends ButtonHTMLAttributes<HTMLElement> {
  asChild?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children?: ReactNode;
}

const SlottableButton = forwardRef<HTMLElement, SlottableButtonProps>(function SlottableButton(
  { asChild, leftIcon, rightIcon, children, style, ...rest },
  ref,
) {
  const Component = (asChild ? Slot : 'button') as 'button';
  return (
    <Component
      ref={ref as never}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 0.875rem',
        borderRadius: '0.5rem',
        background: 'var(--cynosure-color-bg-surface, #fff)',
        color: 'var(--cynosure-color-foreground-default, #111)',
        fontSize: '0.875rem',
        fontWeight: 600,
        textDecoration: 'none',
        border: '1px solid var(--cynosure-color-border-default)',
        cursor: 'pointer',
        ...style,
      }}
      {...rest}
    >
      {leftIcon}
      <Slottable>{children}</Slottable>
      {rightIcon}
    </Component>
  );
});

export const WithSlottable: Story = {
  render: () => (
    <Stack gap="3">
      <Text>
        <code>Slottable</code> marks the &ldquo;real&rdquo; child when a component renders siblings
        around it (icons, adornments). The left/right icons stay in the rendered tree while the
        middle content is merged into the child element.
      </Text>
      <Inline gap="3">
        <SlottableButton leftIcon={<IconArrow />} rightIcon={<IconArrow />}>
          Regular &lt;button&gt;
        </SlottableButton>
        <SlottableButton asChild leftIcon={<IconArrow />} rightIcon={<IconArrow />}>
          <a href="/docs">Rendered as &lt;a&gt;</a>
        </SlottableButton>
      </Inline>
    </Stack>
  ),
};

// ── Ref forwarding ──────────────────────────────────────────────────────

function RefForwardDemo() {
  const ref = useRef<HTMLElement | null>(null);
  const [tag, setTag] = useState<string>('');
  useEffect(() => {
    if (ref.current) setTag(ref.current.tagName.toLowerCase());
  }, []);
  return (
    <Stack gap="3">
      <Text>
        Refs flow through <code>Slot</code> to the underlying child element. The component thinks
        it&rsquo;s holding a button ref, but actually gets the child&rsquo;s element.
      </Text>
      <Inline gap="3" align="center">
        <FakeButton asChild ref={ref}>
          <a href="#top">Focusable anchor</a>
        </FakeButton>
        <Text size="sm" color="fg.muted">
          Resolved tag: <code>{tag || '…'}</code>
        </Text>
      </Inline>
    </Stack>
  );
}

export const RefForwarding: Story = {
  render: () => <RefForwardDemo />,
};

// ── Event handler composition ──────────────────────────────────────────

function EventComposeDemo() {
  const [log, setLog] = useState<string[]>([]);
  const push = (msg: string) => setLog((prev) => [...prev.slice(-4), msg]);
  return (
    <Stack gap="3">
      <Text>
        Both the parent&rsquo;s and the child&rsquo;s <code>onClick</code> fire, in order. This lets
        a styled primitive own behaviour (e.g. disabled handling) while the consumer attaches
        app-level handlers.
      </Text>
      <Inline gap="3" align="center">
        <FakeButton
          asChild
          onClick={() => push('parent onClick')}
          onPointerDown={() => push('parent pointerDown')}
        >
          <button
            type="button"
            onClick={() => {
              push('child onClick');
            }}
            onPointerDown={() => push('child pointerDown')}
          >
            Click me
          </button>
        </FakeButton>
        <button type="button" onClick={() => setLog([])}>
          Clear log
        </button>
      </Inline>
      <Box
        padding="3"
        background="bg.subtle"
        borderRadius="sm"
        borderWidth="1"
        borderStyle="solid"
        borderColor="border.default"
        minHeight="120px"
      >
        <Stack gap="1">
          {log.length === 0 ? (
            <Text size="sm" color="fg.muted">
              (no events yet)
            </Text>
          ) : (
            log.map((line, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: log entries are append-only and never reorder.
              <Text key={`${line}-${i}`} size="sm">
                {i + 1}. {line}
              </Text>
            ))
          )}
        </Stack>
      </Box>
    </Stack>
  );
}

export const EventComposition: Story = {
  render: () => <EventComposeDemo />,
};

// ── Realistic: framework link ──────────────────────────────────────────

// Simulate e.g. react-router's <Link>
const RouterLink = forwardRef<HTMLAnchorElement, { to: string; children?: ReactNode }>(
  function RouterLink({ to, children, ...rest }, ref) {
    return (
      <a ref={ref} href={to} data-router-link {...rest}>
        {children}
      </a>
    );
  },
);

export const FrameworkLink: Story = {
  name: 'Projecting onto a framework Link',
  render: () => (
    <Stack gap="3">
      <Heading level={4}>Typical framework-integration pattern</Heading>
      <Text>
        A common use-case: a design-system button that renders a router-provided link without
        knowing about the router.
      </Text>
      <Inline gap="3">
        <FakeButton asChild>
          <RouterLink to="/pricing">Pricing</RouterLink>
        </FakeButton>
        <FakeButton asChild>
          <RouterLink to="/docs">Docs</RouterLink>
        </FakeButton>
      </Inline>
    </Stack>
  ),
};
