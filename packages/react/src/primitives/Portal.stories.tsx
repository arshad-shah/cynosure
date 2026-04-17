import type { Meta, StoryObj } from '@storybook/react';
import { useEffect, useRef, useState } from 'react';
import { Heading } from '../typography/Heading/Heading.js';
import { Text } from '../typography/Text/Text.js';
import { Portal } from './Portal.js';
import { Box } from './layout/Box/Box.js';
import { Inline } from './layout/Inline/Inline.js';
import { Stack } from './layout/Stack/Stack.js';

const meta: Meta<typeof Portal> = {
  title: 'Primitives/Portal',
  component: Portal,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof Portal>;

// ── Default: portal to document.body ────────────────────────────────────

function DefaultDemo() {
  const [open, setOpen] = useState(false);
  return (
    <Stack gap="3">
      <Text>
        Portals render their children into a different part of the DOM tree while preserving React
        tree context. By default, <code>Portal</code> targets <code>document.body</code>.
      </Text>
      <Inline gap="2">
        <button type="button" onClick={() => setOpen(true)}>
          Show overlay
        </button>
      </Inline>
      {open ? (
        <Portal>
          <Box
            position="fixed"
            top="0"
            right="0"
            bottom="0"
            left="0"
            zIndex="modal"
            background="bg.overlay"
            padding="4"
            style={{ display: 'grid', placeItems: 'center' }}
          >
            <Box
              background="bg.surface"
              padding="6"
              borderRadius="lg"
              boxShadow="lg"
              maxWidth="400px"
            >
              <Stack gap="3">
                <Heading level={3}>Portaled overlay</Heading>
                <Text color="fg.muted">
                  This dialog is a child of <code>document.body</code>, escaping any
                  <code> overflow:hidden</code> or transform on ancestors.
                </Text>
                <Inline gap="2" justify="end">
                  <button type="button" onClick={() => setOpen(false)}>
                    Dismiss
                  </button>
                </Inline>
              </Stack>
            </Box>
          </Box>
        </Portal>
      ) : null}
    </Stack>
  );
}

export const Default: Story = {
  render: () => <DefaultDemo />,
};

// ── Custom container ────────────────────────────────────────────────────

function CustomContainerDemo() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <Stack gap="4">
      <Text>
        Pass <code>container</code> (an element or a lazy getter) to target a specific node.
      </Text>
      <Inline gap="4" align="start">
        <Box
          padding="3"
          background="bg.subtle"
          borderRadius="md"
          borderWidth="1"
          borderStyle="dashed"
          borderColor="border.default"
          minWidth="240px"
        >
          <Text size="sm" color="fg.muted">
            React tree origin
          </Text>
          {mounted ? (
            <Portal container={() => hostRef.current}>
              <Box
                padding="2"
                marginTop="2"
                background="accent.soft"
                color="accent.solid"
                borderRadius="sm"
              >
                Rendered by React here, mounted into the target on the right.
              </Box>
            </Portal>
          ) : null}
        </Box>
        <Box
          ref={hostRef}
          padding="3"
          background="bg.surface"
          borderRadius="md"
          borderWidth="1"
          borderStyle="solid"
          borderColor="accent.ring"
          minWidth="240px"
        >
          <Text size="sm" color="fg.muted">
            Target container
          </Text>
        </Box>
      </Inline>
    </Stack>
  );
}

export const CustomContainer: Story = {
  render: () => <CustomContainerDemo />,
};

// ── Nested portals ──────────────────────────────────────────────────────

function NestedPortalsDemo() {
  const [outer, setOuter] = useState(false);
  const [inner, setInner] = useState(false);
  return (
    <Stack gap="3">
      <Text>
        Nested portals work naturally — opening an inner portal from within an outer portal
        preserves React context and re-renders correctly.
      </Text>
      <button type="button" onClick={() => setOuter(true)}>
        Open outer dialog
      </button>
      {outer ? (
        <Portal>
          <Box
            position="fixed"
            top="0"
            right="0"
            bottom="0"
            left="0"
            background="bg.overlay"
            zIndex="modal"
            style={{ display: 'grid', placeItems: 'center' }}
          >
            <Box background="bg.surface" padding="6" borderRadius="lg" maxWidth="420px">
              <Stack gap="3">
                <Heading level={3}>Outer</Heading>
                <Text color="fg.muted">The outer dialog owns the backdrop.</Text>
                <Inline gap="2">
                  <button type="button" onClick={() => setInner(true)}>
                    Open inner
                  </button>
                  <button type="button" onClick={() => setOuter(false)}>
                    Close outer
                  </button>
                </Inline>
              </Stack>
            </Box>
            {inner ? (
              <Portal>
                <Box
                  position="fixed"
                  top="0"
                  right="0"
                  bottom="0"
                  left="0"
                  background="bg.overlay"
                  zIndex="popover"
                  style={{ display: 'grid', placeItems: 'center' }}
                >
                  <Box
                    background="accent.soft"
                    color="accent.solid"
                    padding="5"
                    borderRadius="md"
                    maxWidth="360px"
                  >
                    <Stack gap="3">
                      <Heading level={4}>Inner</Heading>
                      <Text>Portaled again, sitting above the outer overlay.</Text>
                      <button type="button" onClick={() => setInner(false)}>
                        Close inner
                      </button>
                    </Stack>
                  </Box>
                </Box>
              </Portal>
            ) : null}
          </Box>
        </Portal>
      ) : null}
    </Stack>
  );
}

export const NestedPortals: Story = {
  render: () => <NestedPortalsDemo />,
};

// ── Escaping a scroll-locked parent ────────────────────────────────────

function ScrollEscapeDemo() {
  const [open, setOpen] = useState(false);
  return (
    <Stack gap="3">
      <Text>
        Portals are the escape hatch from ancestors that clip (<code>overflow: hidden</code>) or
        translate content. The overlay below is rendered
        <em> inside</em> the clipped box but <strong>portals to the body</strong>, so it still
        covers the viewport.
      </Text>
      <Box
        background="bg.subtle"
        borderWidth="1"
        borderStyle="solid"
        borderColor="border.default"
        borderRadius="md"
        padding="3"
        overflow="hidden"
        maxWidth="420px"
        style={{ transform: 'translateZ(0)' }}
      >
        <Stack gap="2">
          <Text weight="semibold">overflow:hidden + transform parent</Text>
          <Text size="sm" color="fg.muted">
            Without a portal, the overlay would be clipped here.
          </Text>
          <button type="button" onClick={() => setOpen(true)}>
            Show portaled overlay
          </button>
        </Stack>
        {open ? (
          <Portal>
            <Box
              position="fixed"
              top="0"
              right="0"
              bottom="0"
              left="0"
              background="bg.overlay"
              zIndex="modal"
              style={{ display: 'grid', placeItems: 'center' }}
            >
              <Box background="bg.surface" padding="5" borderRadius="md" maxWidth="360px">
                <Stack gap="3">
                  <Text>
                    Notice this covers the whole viewport even though the trigger lives inside a
                    clipped + transformed ancestor.
                  </Text>
                  <button type="button" onClick={() => setOpen(false)}>
                    Close
                  </button>
                </Stack>
              </Box>
            </Box>
          </Portal>
        ) : null}
      </Box>
    </Stack>
  );
}

export const EscapesScrollLockedParent: Story = {
  name: 'Escapes overflow:hidden parent',
  render: () => <ScrollEscapeDemo />,
};

// ── Disabled (inline) ──────────────────────────────────────────────────

export const DisabledInline: Story = {
  name: 'disabled — renders inline',
  render: () => (
    <Stack gap="2">
      <Text>
        Pass <code>disabled</code> to keep children in-tree (useful in tests or SSR where portalling
        is unwanted). The badge below is a direct child of this story, <em>not</em> the body.
      </Text>
      <Portal disabled>
        <Box
          display="inline-flex"
          padding="2"
          background="accent.soft"
          color="accent.solid"
          borderRadius="sm"
        >
          Rendered inline (disabled)
        </Box>
      </Portal>
    </Stack>
  ),
};
