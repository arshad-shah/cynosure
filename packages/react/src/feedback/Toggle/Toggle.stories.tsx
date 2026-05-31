import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import { Toggle } from './Toggle.js';

const meta: Meta<typeof Toggle> = {
  title: 'Buttons/Toggle',
  component: Toggle,
  parameters: { layout: 'padded' },
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg'] },
    variant: { control: 'select', options: ['ghost', 'outline', 'solid'] },
    disabled: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof Toggle>;

const IconBold = (): React.ReactElement => (
  <svg
    aria-hidden="true"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.25"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M7 4h6a4 4 0 0 1 0 8H7z" />
    <path d="M7 12h7a4 4 0 0 1 0 8H7z" />
  </svg>
);

const IconItalic = (): React.ReactElement => (
  <svg
    aria-hidden="true"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="19" y1="4" x2="10" y2="4" />
    <line x1="14" y1="20" x2="5" y2="20" />
    <line x1="15" y1="4" x2="9" y2="20" />
  </svg>
);

const IconUnderline = (): React.ReactElement => (
  <svg
    aria-hidden="true"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 4v7a6 6 0 0 0 12 0V4" />
    <line x1="4" y1="20" x2="20" y2="20" />
  </svg>
);

export const Playground: Story = {
  args: { size: 'md', variant: 'ghost' },
  render: (args) => (
    <Toggle {...args} aria-label="Toggle bold">
      <IconBold />
    </Toggle>
  ),
};

export const Default: Story = {
  render: () => (
    <Inline gap="3">
      <Toggle aria-label="Toggle bold">
        <IconBold />
      </Toggle>
      <Toggle aria-label="Toggle italic">
        <IconItalic />
      </Toggle>
      <Toggle aria-label="Toggle underline">
        <IconUnderline />
      </Toggle>
    </Inline>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Inline gap="3" align="center">
      <Toggle size="xs" aria-label="Toggle bold">
        <IconBold />
      </Toggle>
      <Toggle size="sm" aria-label="Toggle bold">
        <IconBold />
      </Toggle>
      <Toggle size="md" aria-label="Toggle bold">
        <IconBold />
      </Toggle>
      <Toggle size="lg" aria-label="Toggle bold">
        <IconBold />
      </Toggle>
    </Inline>
  ),
};

export const Variants: Story = {
  render: () => (
    <Stack gap="3">
      {(['ghost', 'outline', 'solid'] as const).map((variant) => (
        <Inline key={variant} gap="3" align="center">
          <Text size="sm" color="fg.muted" style={{ width: 72 }}>
            {variant}
          </Text>
          <Toggle variant={variant} aria-label="Toggle bold">
            <IconBold />
          </Toggle>
          <Toggle variant={variant} defaultPressed aria-label="Toggle italic">
            <IconItalic />
          </Toggle>
          <Toggle variant={variant} disabled aria-label="Toggle underline">
            <IconUnderline />
          </Toggle>
        </Inline>
      ))}
    </Stack>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Inline gap="3">
      <Toggle disabled aria-label="Toggle bold">
        <IconBold />
      </Toggle>
      <Toggle disabled defaultPressed aria-label="Toggle italic">
        <IconItalic />
      </Toggle>
      <Toggle disabled variant="outline" aria-label="Toggle underline">
        <IconUnderline />
      </Toggle>
    </Inline>
  ),
};

export const Interaction: Story = {
  name: 'Interaction · click toggles aria-pressed',
  render: () => (
    <Toggle aria-label="Toggle bold">
      <IconBold />
    </Toggle>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Toggle bold' });
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(toggle).toHaveAttribute('data-state', 'off');
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(toggle).toHaveAttribute('data-state', 'on');
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  },
};
