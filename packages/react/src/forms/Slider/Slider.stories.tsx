import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import { Slider, type SliderMark } from './Slider.js';

const meta: Meta<typeof Slider> = {
  title: 'Forms/Slider',
  component: Slider,
  parameters: { layout: 'padded' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    showValue: { control: 'select', options: [false, true, 'tooltip'] },
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    isDisabled: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof Slider>;

export const Playground: Story = {
  args: {
    label: 'Volume',
    defaultValue: 40,
    size: 'md',
    showValue: true,
  },
  render: (args) => (
    <div style={{ width: '360px' }}>
      <Slider {...args} />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack gap="4" width="360px">
      <Slider label="Small" size="sm" defaultValue={30} showValue />
      <Slider label="Medium" size="md" defaultValue={50} showValue />
      <Slider label="Large" size="lg" defaultValue={70} showValue />
    </Stack>
  ),
};

export const States: Story = {
  render: () => (
    <Stack gap="4" width="360px">
      <Slider label="Default" defaultValue={40} showValue />
      <Slider label="Disabled" defaultValue={40} isDisabled showValue />
      <Slider label="Min → max" minValue={-50} maxValue={50} defaultValue={0} showValue />
    </Stack>
  ),
};

export const StepAndRange: Story = {
  name: 'Custom min / max / step',
  render: () => (
    <Stack gap="4" width="360px">
      <Slider
        label="0 → 1 (step 0.01)"
        minValue={0}
        maxValue={1}
        step={0.01}
        defaultValue={0.4}
        showValue
      />
      <Slider
        label="0 → 10 (step 1)"
        minValue={0}
        maxValue={10}
        step={1}
        defaultValue={3}
        showValue
      />
      <Slider
        label="-100 → 100 (step 10)"
        minValue={-100}
        maxValue={100}
        step={10}
        defaultValue={0}
        showValue
      />
    </Stack>
  ),
};

export const WithMarks: Story = {
  render: () => {
    const marks: ReadonlyArray<SliderMark> = [
      { value: 0, label: '0%' },
      { value: 25, label: '25%' },
      { value: 50, label: '50%' },
      { value: 75, label: '75%' },
      { value: 100, label: '100%' },
    ];
    return (
      <div style={{ width: '420px' }}>
        <Slider label="Zoom" marks={marks} defaultValue={50} showValue />
      </div>
    );
  },
};

export const FormattedValue: Story = {
  name: 'formatOptions (currency / percent)',
  render: () => (
    <Stack gap="4" width="360px">
      <Slider
        label="Budget"
        minValue={0}
        maxValue={5000}
        step={50}
        defaultValue={1500}
        formatOptions={{ style: 'currency', currency: 'EUR' }}
        showValue
      />
      <Slider
        label="Confidence"
        minValue={0}
        maxValue={1}
        step={0.01}
        defaultValue={0.72}
        formatOptions={{ style: 'percent' }}
        showValue
      />
    </Stack>
  ),
};

export const Controlled: Story = {
  render: () => {
    function ControlledDemo(): React.ReactElement {
      const [value, setValue] = useState<number>(25);
      return (
        <Stack gap="3" width="360px">
          <Slider
            label="Opacity"
            minValue={0}
            maxValue={100}
            value={value}
            onChange={(next) => setValue(next as number)}
            showValue
          />
          <Text size="sm" color="fg.muted">
            Controlled value: <strong>{value}</strong>
          </Text>
        </Stack>
      );
    }
    return <ControlledDemo />;
  },
};

export const Uncontrolled: Story = {
  render: () => (
    <div style={{ width: '360px' }}>
      <Slider label="Uncontrolled" defaultValue={55} showValue />
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div style={{ height: '220px' }}>
      <Slider label="Vertical" orientation="vertical" defaultValue={40} showValue />
    </div>
  ),
};

export const TooltipOnly: Story = {
  render: () => (
    <div style={{ width: '360px' }}>
      <Slider label="Drag the thumb" defaultValue={60} showValue="tooltip" />
    </div>
  ),
};
