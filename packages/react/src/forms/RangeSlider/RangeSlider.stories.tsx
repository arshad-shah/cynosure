import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
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

export const StepAndBounds: Story = {
  name: 'Custom min / max / step',
  render: () => (
    <Stack gap="4" width="420px">
      <RangeSlider
        label="0 → 1 (step 0.01)"
        minValue={0}
        maxValue={1}
        step={0.01}
        defaultValue={[0.2, 0.8]}
        showValue
      />
      <RangeSlider
        label="Years"
        minValue={1900}
        maxValue={2026}
        step={1}
        defaultValue={[1970, 2000]}
        showValue
      />
    </Stack>
  ),
};

export const MinGap: Story = {
  name: 'Enforced minimum gap (controlled)',
  render: () => {
    function Demo(): React.ReactElement {
      const MIN_GAP = 10;
      const [value, setValue] = useState<[number, number]>([30, 70]);
      const handle = (next: [number, number]) => {
        const [lo, hi] = next;
        if (hi - lo < MIN_GAP) return;
        setValue(next);
      };
      return (
        <Stack gap="3" width="420px">
          <RangeSlider label="Min gap 10" value={value} onChange={handle} showValue />
          <Text size="sm" color="fg.muted">
            Gap: <strong>{value[1] - value[0]}</strong> (min {MIN_GAP})
          </Text>
        </Stack>
      );
    }
    return <Demo />;
  },
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

export const Controlled: Story = {
  render: () => {
    function Controlled(): React.ReactElement {
      const [value, setValue] = useState<[number, number]>([10, 40]);
      return (
        <Stack gap="3" width="420px">
          <RangeSlider label="Window" value={value} onChange={setValue} showValue />
          <Text size="sm">
            Current: <strong>{value.join(' → ')}</strong>
          </Text>
        </Stack>
      );
    }
    return <Controlled />;
  },
};

export const Uncontrolled: Story = {
  render: () => (
    <div style={{ width: '420px' }}>
      <RangeSlider label="Uncontrolled" defaultValue={[30, 60]} showValue />
    </div>
  ),
};

export const LongLabel: Story = {
  render: () => (
    <div style={{ width: '420px' }}>
      <RangeSlider
        label="Filter your results by an unusually descriptive numeric range"
        defaultValue={[20, 80]}
        showValue
      />
    </div>
  ),
};
