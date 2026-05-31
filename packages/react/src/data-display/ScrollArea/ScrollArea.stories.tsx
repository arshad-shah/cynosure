import type { Meta, StoryObj } from '@storybook/react';
import { expect, waitFor, within } from 'storybook/test';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Heading } from '../../typography/Heading/Heading.js';
import { Text } from '../../typography/Text/Text.js';
import { ScrollArea } from './ScrollArea.js';

const meta: Meta<typeof ScrollArea> = {
  title: 'Data display/ScrollArea',
  component: ScrollArea,
  parameters: { layout: 'padded' },
  argTypes: {
    type: { control: 'select', options: ['auto', 'always', 'scroll', 'hover'] },
    scrollbars: { control: 'select', options: ['vertical', 'horizontal', 'both'] },
  },
};
export default meta;
type Story = StoryObj<typeof ScrollArea>;

const BOX_STYLE: React.CSSProperties = {
  borderRadius: 'var(--cynosure-radius-md)',
  border: '1px solid var(--cynosure-color-border-default)',
};

export const Vertical: Story = {
  name: 'Vertical scrolling',
  render: () => (
    <ScrollArea height={240} width={320} style={BOX_STYLE} scrollbars="vertical">
      <Stack gap="2" style={{ padding: 'var(--cynosure-space-3)' }}>
        {Array.from({ length: 40 }, (_, i) => (
          <Text key={`line-${i.toString()}`} size="sm">
            Item #{(i + 1).toString().padStart(2, '0')} — a short entry in a long list.
          </Text>
        ))}
      </Stack>
    </ScrollArea>
  ),
};

export const Horizontal: Story = {
  name: 'Horizontal scrolling',
  render: () => (
    <ScrollArea width={480} style={BOX_STYLE} scrollbars="horizontal">
      <Inline gap="3" wrap={false} style={{ padding: 'var(--cynosure-space-3)' }}>
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={`tile-${i.toString()}`}
            style={{
              flex: '0 0 auto',
              width: 140,
              height: 100,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 'var(--cynosure-radius-md)',
              background: 'var(--cynosure-color-background-muted)',
              border: '1px solid var(--cynosure-color-border-subtle)',
              fontWeight: 600,
            }}
          >
            Tile {(i + 1).toString()}
          </div>
        ))}
      </Inline>
    </ScrollArea>
  ),
};

export const Both: Story = {
  name: 'Both axes',
  render: () => (
    <ScrollArea width={480} height={280} style={BOX_STYLE} scrollbars="both">
      <div style={{ padding: 'var(--cynosure-space-3)', minWidth: 800 }}>
        <Heading level={3} size="sm">
          A wide, tall surface
        </Heading>
        <Stack gap="2" style={{ marginTop: 'var(--cynosure-space-3)' }}>
          {Array.from({ length: 30 }, (_, i) => (
            <Text key={`line-${i.toString()}`} size="sm">
              Row {(i + 1).toString()} — Lorem ipsum dolor sit amet, consectetur adipiscing elit,
              sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </Text>
          ))}
        </Stack>
      </div>
    </ScrollArea>
  ),
};

export const TypeAlways: Story = {
  name: 'type="always"',
  render: () => (
    <ScrollArea type="always" height={200} width={320} style={BOX_STYLE}>
      <Stack gap="2" style={{ padding: 'var(--cynosure-space-3)' }}>
        {Array.from({ length: 20 }, (_, i) => (
          <Text key={`always-${i.toString()}`} size="sm">
            Scrollbar always visible — row {(i + 1).toString()}
          </Text>
        ))}
      </Stack>
    </ScrollArea>
  ),
};

export const Interaction: Story = {
  name: 'Interaction · content scrolls vertically',
  render: () => (
    <ScrollArea
      data-testid="scroller"
      height={200}
      width={320}
      style={BOX_STYLE}
      scrollbars="vertical"
    >
      <Stack gap="2" style={{ padding: 'var(--cynosure-space-3)' }}>
        {Array.from({ length: 40 }, (_, i) => (
          <Text key={`line-${i.toString()}`} size="sm">
            Item #{(i + 1).toString().padStart(2, '0')}
          </Text>
        ))}
      </Stack>
    </ScrollArea>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const scroller = canvas.getByTestId('scroller');
    // Content overflows its fixed height, so there is room to scroll.
    await expect(scroller.scrollHeight).toBeGreaterThan(scroller.clientHeight);
    await expect(scroller.scrollTop).toBe(0);

    scroller.scrollTop = 150;
    scroller.dispatchEvent(new Event('scroll'));
    await waitFor(() => {
      expect(scroller.scrollTop).toBeGreaterThan(0);
    });
  },
};
