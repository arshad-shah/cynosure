import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import { ToggleGroup, ToggleGroupItem } from './ToggleGroup.js';

const meta: Meta<typeof ToggleGroup> = {
  title: 'Buttons/ToggleGroup',
  component: ToggleGroup,
  parameters: { layout: 'padded' },
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg'] },
    variant: { control: 'select', options: ['ghost', 'outline', 'solid'] },
    attached: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof ToggleGroup>;

const AlignLeft = (): React.ReactElement => (
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
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="15" y2="12" />
    <line x1="3" y1="18" x2="18" y2="18" />
  </svg>
);

const AlignCenter = (): React.ReactElement => (
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
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="6" y1="12" x2="18" y2="12" />
    <line x1="4" y1="18" x2="20" y2="18" />
  </svg>
);

const AlignRight = (): React.ReactElement => (
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
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="9" y1="12" x2="21" y2="12" />
    <line x1="6" y1="18" x2="21" y2="18" />
  </svg>
);

const AlignJustify = (): React.ReactElement => (
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
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

export const Playground: Story = {
  render: () => (
    <ToggleGroup
      type="single"
      defaultValue={'left' as string}
      size="md"
      variant="outline"
      attached
      aria-label="Text alignment"
    >
      <ToggleGroupItem value="left" aria-label="Align left">
        <AlignLeft />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center">
        <AlignCenter />
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Align right">
        <AlignRight />
      </ToggleGroupItem>
      <ToggleGroupItem value="justify" aria-label="Justify">
        <AlignJustify />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const Attached: Story = {
  name: 'Attached segmented control vs unattached',
  render: () => (
    <Stack gap="4">
      <Inline gap="3" align="center">
        <Text size="sm" color="fg.muted" style={{ width: 96 }}>
          attached
        </Text>
        <ToggleGroup
          type="single"
          defaultValue="left"
          variant="outline"
          attached
          aria-label="Alignment attached"
        >
          <ToggleGroupItem value="left" aria-label="Align left">
            <AlignLeft />
          </ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="Align center">
            <AlignCenter />
          </ToggleGroupItem>
          <ToggleGroupItem value="right" aria-label="Align right">
            <AlignRight />
          </ToggleGroupItem>
        </ToggleGroup>
      </Inline>
      <Inline gap="3" align="center">
        <Text size="sm" color="fg.muted" style={{ width: 96 }}>
          detached
        </Text>
        <ToggleGroup
          type="single"
          defaultValue="left"
          variant="outline"
          aria-label="Alignment detached"
        >
          <ToggleGroupItem value="left" aria-label="Align left">
            <AlignLeft />
          </ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="Align center">
            <AlignCenter />
          </ToggleGroupItem>
          <ToggleGroupItem value="right" aria-label="Align right">
            <AlignRight />
          </ToggleGroupItem>
        </ToggleGroup>
      </Inline>
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack gap="3">
      {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
        <ToggleGroup
          key={size}
          type="single"
          defaultValue="left"
          size={size}
          variant="outline"
          attached
          aria-label={`Alignment ${size}`}
        >
          <ToggleGroupItem value="left" size={size} aria-label="Align left">
            <AlignLeft />
          </ToggleGroupItem>
          <ToggleGroupItem value="center" size={size} aria-label="Align center">
            <AlignCenter />
          </ToggleGroupItem>
          <ToggleGroupItem value="right" size={size} aria-label="Align right">
            <AlignRight />
          </ToggleGroupItem>
        </ToggleGroup>
      ))}
    </Stack>
  ),
};

export const Variants: Story = {
  render: () => (
    <Stack gap="3">
      {(['ghost', 'outline', 'solid'] as const).map((variant) => (
        <ToggleGroup
          key={variant}
          type="single"
          defaultValue="left"
          variant={variant}
          attached
          aria-label={`Alignment ${variant}`}
        >
          <ToggleGroupItem value="left" variant={variant} aria-label="Align left">
            <AlignLeft />
          </ToggleGroupItem>
          <ToggleGroupItem value="center" variant={variant} aria-label="Align center">
            <AlignCenter />
          </ToggleGroupItem>
          <ToggleGroupItem value="right" variant={variant} aria-label="Align right">
            <AlignRight />
          </ToggleGroupItem>
        </ToggleGroup>
      ))}
    </Stack>
  ),
};

export const Interaction: Story = {
  name: 'Interaction · single-select changes the pressed item',
  render: () => (
    <ToggleGroup
      type="single"
      defaultValue="left"
      variant="outline"
      attached
      aria-label="Alignment"
    >
      <ToggleGroupItem value="left" aria-label="Align left">
        <AlignLeft />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center">
        <AlignCenter />
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Align right">
        <AlignRight />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Single-mode items expose role="radio" with aria-checked (Radix parity).
    const left = canvas.getByRole('radio', { name: 'Align left' });
    const center = canvas.getByRole('radio', { name: 'Align center' });
    await expect(left).toHaveAttribute('aria-checked', 'true');
    await expect(center).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(center);
    await expect(center).toHaveAttribute('aria-checked', 'true');
    await expect(left).toHaveAttribute('aria-checked', 'false');
  },
};
