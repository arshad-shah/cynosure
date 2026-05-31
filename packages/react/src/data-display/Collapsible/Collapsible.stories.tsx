import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../../forms/Button/Button.js';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './Collapsible.js';

const meta: Meta<typeof Collapsible> = {
  title: 'Data display/Collapsible',
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
            <Text>
              It animates height by measuring the panel and writing the result to a CSS custom
              property.
            </Text>
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

export const Interaction: Story = {
  name: 'Interaction · trigger toggles content visibility',
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="outline">Show more</Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Stack gap="2" style={{ paddingTop: 'var(--cynosure-space-3)' }}>
            <Text>Supplementary detail revealed on demand.</Text>
          </Stack>
        </CollapsibleContent>
      </Collapsible>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Show more' });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    // Content unmounts while closed.
    await expect(
      canvas.queryByText('Supplementary detail revealed on demand.'),
    ).not.toBeInTheDocument();

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await waitFor(() => {
      expect(canvas.getByText('Supplementary detail revealed on demand.')).toBeVisible();
    });

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() => {
      expect(
        canvas.queryByText('Supplementary detail revealed on demand.'),
      ).not.toBeInTheDocument();
    });
  },
};
