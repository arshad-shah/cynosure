import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from '../../forms/Button/Button.js';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './Collapsible.js';

const meta: Meta<typeof Collapsible> = {
  title: 'Data Display/Collapsible',
  component: Collapsible,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof Collapsible>;

const ChevronIcon = ({ open }: { open: boolean }): React.ReactElement => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    style={{
      transition: 'transform 160ms ease',
      transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
    }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export const Basic: Story = {
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="outline">Show more</Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Stack gap="2" style={{ paddingTop: 'var(--cynosure-space-3)' }}>
            <Text>
              This content only exists in the DOM while the Collapsible is open — perfect for
              revealing supplementary detail without cluttering the default view.
            </Text>
            <Text>It animates height using Radix&rsquo;s state-driven CSS variables.</Text>
          </Stack>
        </CollapsibleContent>
      </Collapsible>
    </div>
  ),
};

export const Controlled: Story = {
  render: () => {
    function Controlled(): React.ReactElement {
      const [open, setOpen] = useState(false);
      return (
        <Stack gap="3" style={{ maxWidth: 420 }}>
          <Inline gap="2">
            <Button size="sm" onClick={() => setOpen((v) => !v)}>
              {open ? 'Close' : 'Open'} programmatically
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setOpen(false)} disabled={!open}>
              Reset
            </Button>
          </Inline>
          <Collapsible open={open} onOpenChange={setOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline">Toggle via trigger</Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Stack gap="2" style={{ paddingTop: 'var(--cynosure-space-3)' }}>
                <Text>Open state is driven from the parent component.</Text>
                <Text size="sm" color="fg.muted">
                  Current state: <strong>{open ? 'open' : 'closed'}</strong>
                </Text>
              </Stack>
            </CollapsibleContent>
          </Collapsible>
        </Stack>
      );
    }
    return <Controlled />;
  },
};

export const WithChevron: Story = {
  name: 'Chevron rotation animation',
  render: () => {
    function WithChevron(): React.ReactElement {
      const [open, setOpen] = useState(false);
      return (
        <div style={{ maxWidth: 420 }}>
          <Collapsible open={open} onOpenChange={setOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" rightIcon={<ChevronIcon open={open} />}>
                {open ? 'Hide details' : 'Show details'}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Stack gap="2" style={{ paddingTop: 'var(--cynosure-space-3)' }}>
                <Text>
                  The chevron on the trigger rotates via a CSS transform bound to the open state.
                </Text>
              </Stack>
            </CollapsibleContent>
          </Collapsible>
        </div>
      );
    }
    return <WithChevron />;
  },
};

export const NestedDetails: Story = {
  name: 'Nested inside a card row',
  render: () => (
    <div
      style={{
        maxWidth: 480,
        padding: 'var(--cynosure-space-4)',
        border: '1px solid var(--cynosure-color-border-default)',
        borderRadius: 'var(--cynosure-radius-md)',
      }}
    >
      <Stack gap="3">
        <Inline justify="between" align="center">
          <Stack gap="0">
            <Text weight="semibold">Beta features</Text>
            <Text size="sm" color="fg.muted">
              3 enabled
            </Text>
          </Stack>
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button size="sm" variant="ghost">
                Manage
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent />
          </Collapsible>
        </Inline>
        <Collapsible defaultOpen>
          <CollapsibleContent>
            <Stack
              gap="2"
              style={{
                paddingTop: 'var(--cynosure-space-2)',
                borderTop: '1px solid var(--cynosure-color-border-subtle)',
              }}
            >
              <Text size="sm">• AI drafts</Text>
              <Text size="sm">• Real-time cursors</Text>
              <Text size="sm">• Offline edits</Text>
            </Stack>
          </CollapsibleContent>
        </Collapsible>
      </Stack>
    </div>
  ),
};

export const LongContent: Story = {
  name: 'Edge case — long content',
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="outline">Read full changelog</Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Stack gap="2" style={{ paddingTop: 'var(--cynosure-space-3)' }}>
            {Array.from({ length: 6 }, (_, i) => (
              <Text key={`p-${i.toString()}`}>
                v1.{(12 - i).toString()} — bugfixes, performance improvements, and a renewed focus
                on accessibility across the overlay primitives. This release also lands the new
                DataTable selection API plus minor polish to Tree keyboard handling.
              </Text>
            ))}
          </Stack>
        </CollapsibleContent>
      </Collapsible>
    </div>
  ),
};
