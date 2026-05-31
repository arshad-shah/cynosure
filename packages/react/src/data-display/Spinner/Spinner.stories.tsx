import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../../forms/Button/Button.js';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import { Spinner } from './Spinner.js';

const meta: Meta<typeof Spinner> = {
  title: 'Data display/Spinner',
  component: Spinner,
  parameters: { layout: 'padded' },
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    variant: { control: 'select', options: ['border', 'dots', 'ring'] },
    colorScheme: { control: 'select', options: ['accent', 'neutral', 'currentColor'] },
    speed: { control: 'select', options: ['slow', 'normal', 'fast'] },
  },
};
export default meta;
type Story = StoryObj<typeof Spinner>;

export const Basic: Story = {
  args: { size: 'md', variant: 'border', colorScheme: 'accent' },
};

export const Variants: Story = {
  render: () => (
    <Inline gap="6" align="center">
      {(['border', 'dots', 'ring'] as const).map((variant) => (
        <Stack key={variant} gap="2" align="center">
          <Spinner variant={variant} size="lg" colorScheme="accent" />
          <Text size="xs" color="fg.muted">
            {variant}
          </Text>
        </Stack>
      ))}
    </Inline>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Inline gap="6" align="center">
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <Stack key={size} gap="2" align="center">
          <Spinner size={size} colorScheme="accent" />
          <Text size="xs" color="fg.muted">
            {size}
          </Text>
        </Stack>
      ))}
    </Inline>
  ),
};

export const ColorSchemes: Story = {
  render: () => (
    <Stack gap="4">
      {(['border', 'dots', 'ring'] as const).map((variant) => (
        <Inline key={variant} gap="6" align="center">
          <Text size="sm" color="fg.muted" style={{ width: 56 }}>
            {variant}
          </Text>
          <Spinner variant={variant} colorScheme="accent" size="lg" />
          <Spinner variant={variant} colorScheme="neutral" size="lg" />
          <span style={{ color: 'var(--cynosure-color-feedback-success-solid)' }}>
            <Spinner variant={variant} colorScheme="currentColor" size="lg" />
          </span>
          <span style={{ color: 'var(--cynosure-color-feedback-danger-solid)' }}>
            <Spinner variant={variant} colorScheme="currentColor" size="lg" />
          </span>
        </Inline>
      ))}
    </Stack>
  ),
};

export const Speeds: Story = {
  render: () => (
    <Inline gap="6" align="center">
      {(['slow', 'normal', 'fast'] as const).map((speed) => (
        <Stack key={speed} gap="2" align="center">
          <Spinner speed={speed} size="lg" colorScheme="accent" />
          <Text size="xs" color="fg.muted">
            {speed}
          </Text>
        </Stack>
      ))}
    </Inline>
  ),
};

export const InlineWithText: Story = {
  name: 'Inline with text',
  render: () => (
    <Stack gap="3">
      <Inline gap="2" align="center">
        <Spinner size="sm" colorScheme="accent" />
        <Text>Loading your dashboard…</Text>
      </Inline>
      <Inline gap="2" align="center">
        <Spinner size="sm" variant="dots" colorScheme="accent" />
        <Text>Syncing changes</Text>
      </Inline>
      <Inline gap="2" align="center">
        <Spinner size="sm" variant="ring" colorScheme="accent" />
        <Text>Preparing download</Text>
      </Inline>
    </Stack>
  ),
};

export const InButton: Story = {
  name: 'Inside a loading button',
  render: () => (
    <Inline gap="3">
      <Button loading>Saving</Button>
      <Button loading variant="outline">
        Saving
      </Button>
      <Button loading variant="soft" colorScheme="danger">
        Deleting
      </Button>
    </Inline>
  ),
};

export const FullScreenCenter: Story = {
  name: 'Full-screen centered',
  render: () => (
    <div
      style={{
        position: 'relative',
        height: 360,
        borderRadius: 'var(--cynosure-radius-md)',
        border: '1px dashed var(--cynosure-color-border-default)',
        background: 'var(--cynosure-color-background-muted)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <Stack gap="3" align="center">
          <Spinner size="xl" variant="ring" colorScheme="accent" />
          <Text size="sm" color="fg.muted">
            Loading workspace…
          </Text>
        </Stack>
      </div>
    </div>
  ),
};
