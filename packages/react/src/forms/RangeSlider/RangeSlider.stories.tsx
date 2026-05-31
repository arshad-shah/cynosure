import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { RangeSlider } from './RangeSlider.js';

const meta: Meta<typeof RangeSlider> = {
  title: 'Forms/RangeSlider',
  component: RangeSlider,
  parameters: { layout: 'padded' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    showValue: { control: 'boolean' },
    isDisabled: { control: 'boolean' },
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
  },
};
export default meta;
type Story = StoryObj<typeof RangeSlider>;

export const Playground: Story = {
  args: {
    label: 'Price',
    defaultValue: [25, 75],
    showValue: true,
    size: 'md',
  },
  render: (args) => (
    <div style={{ width: '420px' }}>
      <RangeSlider {...args} />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack gap="4" width="420px">
      <RangeSlider label="Small" size="sm" defaultValue={[20, 60]} showValue />
      <RangeSlider label="Medium" size="md" defaultValue={[30, 70]} showValue />
      <RangeSlider label="Large" size="lg" defaultValue={[10, 90]} showValue />
    </Stack>
  ),
};

export const States: Story = {
  render: () => (
    <Stack gap="4" width="420px">
      <RangeSlider label="Default" defaultValue={[20, 80]} showValue />
      <RangeSlider label="Disabled" defaultValue={[20, 80]} isDisabled showValue />
      <RangeSlider
        label="Negative → positive"
        minValue={-100}
        maxValue={100}
        defaultValue={[-50, 25]}
        showValue
      />
    </Stack>
  ),
};

export const FormattedValue: Story = {
  name: 'formatOptions — currency + percent',
  render: () => (
    <Stack gap="4" width="420px">
      <RangeSlider
        label="Price range"
        minValue={0}
        maxValue={5000}
        step={50}
        defaultValue={[500, 2500]}
        formatOptions={{ style: 'currency', currency: 'EUR' }}
        showValue
      />
      <RangeSlider
        label="Probability"
        minValue={0}
        maxValue={1}
        step={0.01}
        defaultValue={[0.2, 0.8]}
        formatOptions={{ style: 'percent' }}
        showValue
      />
    </Stack>
  ),
};

export const Interaction: Story = {
  name: 'Interaction · arrow keys move the start thumb',
  render: () => (
    <div style={{ width: '420px' }}>
      <RangeSlider label="Price" defaultValue={[25, 75]} showValue />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const minThumb = canvas.getByRole('slider', { name: 'Price (min)' });
    const maxThumb = canvas.getByRole('slider', { name: 'Price (max)' });
    await expect(minThumb).toHaveAttribute('aria-valuenow', '25');
    await expect(maxThumb).toHaveAttribute('aria-valuenow', '75');
    minThumb.focus();
    await expect(minThumb).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(minThumb).toHaveAttribute('aria-valuenow', '26');
    // The max thumb is untouched.
    await expect(maxThumb).toHaveAttribute('aria-valuenow', '75');
  },
};
