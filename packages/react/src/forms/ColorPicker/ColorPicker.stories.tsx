import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { type Color, parseColor } from 'react-aria-components';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import { ColorPicker } from './ColorPicker.js';

const meta: Meta<typeof ColorPicker> = {
  title: 'Forms/ColorPicker',
  component: ColorPicker,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof ColorPicker>;

export const Playground: Story = {
  args: {
    label: 'Brand colour',
    defaultValue: '#6366F1',
  },
};

export const Inline_Variant: Story = {
  name: 'Inline variant',
  render: () => (
    <div style={{ width: 320 }}>
      <ColorPicker variant="inline" defaultValue="#6366F1" alpha eyedropper />
    </div>
  ),
};

export const WithAlpha: Story = {
  name: 'With alpha',
  render: () => {
    function Demo(): React.ReactElement {
      const [c, setC] = useState<Color>(parseColor('hsba(220, 80%, 90%, 0.6)'));
      return (
        <Stack gap="3" width="320px">
          <ColorPicker label="Overlay" value={c} onChange={setC} alpha />
          <Text size="sm" color="fg.muted">
            <code>{c.toString('css')}</code>
          </Text>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const Swatches: Story = {
  name: 'Saved swatches (controlled)',
  render: () => {
    function Demo(): React.ReactElement {
      const [c, setC] = useState<Color>(parseColor('#ef4444'));
      const [swatches, setSwatches] = useState<string[]>([
        '#ef4444',
        '#f59e0b',
        '#10b981',
        '#0ea5e9',
        '#6366f1',
        '#ec4899',
      ]);
      return (
        <Stack gap="3" width="340px">
          <ColorPicker
            variant="inline"
            value={c}
            onChange={setC}
            swatches={swatches}
            onSwatchesChange={setSwatches}
          />
          <Text size="sm" color="fg.muted">
            Saved: {swatches.length}
          </Text>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const Controlled: Story = {
  render: () => {
    function Demo(): React.ReactElement {
      const [color, setColor] = useState<Color>(parseColor('#6366F1'));
      return (
        <Stack gap="3" width="260px">
          <ColorPicker label="Brand" value={color} onChange={setColor} />
          <Text size="sm" color="fg.muted">
            <code>{color.toString('hex')}</code>
          </Text>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const Uncontrolled: Story = {
  render: () => (
    <Inline gap="3">
      <ColorPicker label="Primary" defaultValue="#6366F1" />
      <ColorPicker label="Secondary" defaultValue="#EC4899" />
      <ColorPicker label="Tertiary" defaultValue="#10B981" />
    </Inline>
  ),
};

export const StartingFormat: Story = {
  name: 'Starts on RGB',
  render: () => (
    <div style={{ width: 320 }}>
      <ColorPicker variant="inline" defaultValue="#6366F1" defaultFormat="rgb" />
    </div>
  ),
};

export const Sizes: Story = {
  name: 'Sizes (sm / md / lg)',
  render: () => (
    <Inline gap="4" align="start">
      <ColorPicker variant="inline" size="sm" defaultValue="#6366F1" />
      <ColorPicker variant="inline" size="md" defaultValue="#10B981" />
      <ColorPicker variant="inline" size="lg" defaultValue="#EC4899" alpha />
    </Inline>
  ),
};
