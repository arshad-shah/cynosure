import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Heading } from '../typography/Heading/Heading.js';
import { Text } from '../typography/Text/Text.js';
import { VisuallyHidden } from './VisuallyHidden.js';
import { Box } from './layout/Box/Box.js';
import { Inline } from './layout/Inline/Inline.js';
import { Stack } from './layout/Stack/Stack.js';

const meta: Meta<typeof VisuallyHidden> = {
  title: 'Primitives/VisuallyHidden',
  component: VisuallyHidden,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof VisuallyHidden>;

const IconClose = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconSettings = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

// ── Screen-reader-only label ───────────────────────────────────────────

export const ScreenReaderLabel: Story = {
  name: 'Screen-reader-only label',
  render: () => (
    <Stack gap="3">
      <Text>
        Content inside <code>VisuallyHidden</code> is invisible on screen but still read by
        assistive technology. Useful for supplementing terse visual labels with richer context.
      </Text>
      <Inline gap="3" align="center">
        <Box
          padding="3"
          background="bg.surface"
          borderRadius="md"
          borderWidth="1"
          borderStyle="solid"
          borderColor="border.default"
        >
          <Text weight="semibold">
            Price: $42<VisuallyHidden> per month, billed annually</VisuallyHidden>
          </Text>
        </Box>
        <Text size="sm" color="fg.muted">
          Sighted users see &ldquo;$42&rdquo;; screen readers announce the full phrase.
        </Text>
      </Inline>
    </Stack>
  ),
};

// ── Icon-only button label ─────────────────────────────────────────────

export const IconOnlyButton: Story = {
  render: () => (
    <Stack gap="3">
      <Text>
        Icon-only controls must still have an accessible name. Pair the icon with a hidden label
        (equivalent to <code>aria-label</code> but survives i18n/localisation).
      </Text>
      <Inline gap="2">
        <button
          type="button"
          style={{
            display: 'inline-grid',
            placeItems: 'center',
            width: 36,
            height: 36,
            borderRadius: 999,
            border: '1px solid var(--lumen-color-border-default)',
            background: 'var(--lumen-color-bg-surface)',
            cursor: 'pointer',
          }}
        >
          <IconClose />
          <VisuallyHidden>Close dialog</VisuallyHidden>
        </button>
        <button
          type="button"
          style={{
            display: 'inline-grid',
            placeItems: 'center',
            width: 36,
            height: 36,
            borderRadius: 999,
            border: '1px solid var(--lumen-color-border-default)',
            background: 'var(--lumen-color-bg-surface)',
            cursor: 'pointer',
          }}
        >
          <IconSettings />
          <VisuallyHidden>Open settings</VisuallyHidden>
        </button>
      </Inline>
    </Stack>
  ),
};

// ── Skip-to-content link ───────────────────────────────────────────────

export const SkipToContent: Story = {
  name: 'Skip-to-content link',
  render: () => (
    <Stack gap="3">
      <Text>
        A skip link is hidden by default but becomes visible when focused. Keyboard users can tab to
        it to jump past navigation. Tab into the outlined region below.
      </Text>
      <Box
        padding="4"
        background="bg.subtle"
        borderRadius="md"
        borderWidth="1"
        borderStyle="dashed"
        borderColor="border.default"
        tabIndex={-1}
      >
        <a
          href="#main"
          style={{
            position: 'absolute',
            padding: '0.5rem 1rem',
            background: 'var(--lumen-color-accent-solid)',
            color: 'var(--lumen-color-accent-on-solid)',
            borderRadius: '0.25rem',
            // Hidden unless focused — use VisuallyHidden's technique with a
            // focus-visible override for this pattern.
            clip: 'rect(0 0 0 0)',
            clipPath: 'inset(50%)',
            width: 1,
            height: 1,
            overflow: 'hidden',
          }}
          onFocus={(event) => {
            const el = event.currentTarget;
            el.style.clip = 'auto';
            el.style.clipPath = 'none';
            el.style.width = 'auto';
            el.style.height = 'auto';
            el.style.overflow = 'visible';
          }}
          onBlur={(event) => {
            const el = event.currentTarget;
            el.style.clip = 'rect(0 0 0 0)';
            el.style.clipPath = 'inset(50%)';
            el.style.width = '1px';
            el.style.height = '1px';
            el.style.overflow = 'hidden';
          }}
        >
          Skip to content
        </a>
        <Stack gap="2">
          <Heading level={3}>Page</Heading>
          <Text color="fg.muted">Tab into the dashed region to reveal the skip link.</Text>
          <Box id="main" padding="3" background="bg.surface" borderRadius="sm">
            <Text>Main content area</Text>
          </Box>
        </Stack>
      </Box>
    </Stack>
  ),
};

// ── Live region announcement ───────────────────────────────────────────

function LiveRegionDemo() {
  const [count, setCount] = useState(0);
  return (
    <Stack gap="3">
      <Text>
        Pair <code>VisuallyHidden</code> with an <code>aria-live</code> region to announce status
        updates that are rendered elsewhere visually.
      </Text>
      <Inline gap="3" align="center">
        <button type="button" onClick={() => setCount((c) => c + 1)}>
          Increment
        </button>
        <Text>
          Visual count: <strong>{count}</strong>
        </Text>
      </Inline>
      <VisuallyHidden aria-live="polite" aria-atomic="true">
        {count === 0 ? 'Counter is ready.' : `Counter updated to ${count}.`}
      </VisuallyHidden>
    </Stack>
  );
}

export const LiveRegion: Story = {
  render: () => <LiveRegionDemo />,
};

// ── Form field hidden description ──────────────────────────────────────

export const HiddenDescription: Story = {
  render: () => (
    <Stack gap="3" width="320px">
      <Text>
        Hidden descriptions let you attach rich help text to a field without visually cluttering the
        layout.
      </Text>
      <Box>
        <label htmlFor="demo-input" style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>
          Username
        </label>
        <input
          id="demo-input"
          aria-describedby="demo-desc"
          placeholder="choose a handle"
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid var(--lumen-color-border-default)',
            borderRadius: '0.25rem',
          }}
        />
        <VisuallyHidden id="demo-desc">
          Usernames must be 3–20 characters, lowercase letters, digits, and dashes only.
        </VisuallyHidden>
      </Box>
    </Stack>
  ),
};

// ── Form field visually rendered by Text + hidden paragraph ───────────

export const AsCustomElement: Story = {
  name: 'Polymorphic via props',
  render: () => (
    <Stack gap="3">
      <Text>
        <code>VisuallyHidden</code> forwards any span attribute — <code>role</code>, <code>id</code>
        , <code>aria-*</code>, etc. It&rsquo;s always a <code>&lt;span&gt;</code>, so avoid wrapping
        block-level children directly.
      </Text>
      <Box>
        <Text>
          Delete account
          <VisuallyHidden role="note" id="warn-copy">
            This action is permanent and cannot be undone.
          </VisuallyHidden>
        </Text>
      </Box>
    </Stack>
  ),
};
