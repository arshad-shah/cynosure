import type { Meta, StoryObj } from '@storybook/react';
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

export const LongList: Story = {
  name: 'Long formatted list',
  render: () => (
    <ScrollArea height={320} width={360} style={BOX_STYLE}>
      <Stack gap="2" style={{ padding: 'var(--cynosure-space-4)' }} dividers>
        {Array.from({ length: 25 }, (_, i) => (
          <Inline key={`user-${i.toString()}`} gap="3" align="center">
            <div
              aria-hidden="true"
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--cynosure-color-accent-muted)',
                color: 'var(--cynosure-color-accent-solid)',
                display: 'grid',
                placeItems: 'center',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {(i + 1).toString().padStart(2, '0')}
            </div>
            <Stack gap="0" style={{ flex: 1 }}>
              <Text size="sm" weight="medium">
                User {(i + 1).toString()}
              </Text>
              <Text size="xs" color="fg.muted">
                user{(i + 1).toString()}@example.com
              </Text>
            </Stack>
          </Inline>
        ))}
      </Stack>
    </ScrollArea>
  ),
};

export const CodeBlockContainer: Story = {
  name: 'Containing a long code snippet',
  render: () => (
    <ScrollArea width={520} height={240} style={BOX_STYLE}>
      <pre
        style={{
          margin: 0,
          padding: 'var(--cynosure-space-4)',
          fontFamily: 'var(--cynosure-font-mono)',
          fontSize: 13,
          lineHeight: 1.6,
          whiteSpace: 'pre',
        }}
      >
        {Array.from(
          { length: 30 },
          (_, i) =>
            `${(i + 1).toString().padStart(2, '0')}  const value_${i.toString()} = compute(${i.toString()});`,
        ).join('\n')}
      </pre>
    </ScrollArea>
  ),
};
