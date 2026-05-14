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
  name: 'All sizes',
  render: () => (
    <Stack gap="6">
      <Stack gap="2">
        <Text size="sm" color="fg.muted">
          size="sm"
        </Text>
        <ColorPicker
          size="sm"
          variant="inline"
          defaultValue="#6366F1"
          swatches={['#ef4444', '#f59e0b', '#10b981', '#0ea5e9', '#6366f1', '#ec4899']}
          onSwatchesChange={() => {}}
        />
      </Stack>
      <Stack gap="2">
        <Text size="sm" color="fg.muted">
          size="md" (default)
        </Text>
        <ColorPicker
          size="md"
          variant="inline"
          defaultValue="#6366F1"
          swatches={['#ef4444', '#f59e0b', '#10b981', '#0ea5e9', '#6366f1', '#ec4899']}
          onSwatchesChange={() => {}}
        />
      </Stack>
      <Stack gap="2">
        <Text size="sm" color="fg.muted">
          size="lg" + alpha
        </Text>
        <ColorPicker
          size="lg"
          variant="inline"
          defaultValue="#6366F1"
          alpha
          swatches={['#ef4444', '#f59e0b', '#10b981', '#0ea5e9', '#6366f1', '#ec4899']}
          onSwatchesChange={() => {}}
        />
      </Stack>
    </Stack>
  ),
};

export const IconOnlyTrigger: Story = {
  name: 'Icon-only trigger',
  render: () => (
    <Inline gap="3" alignItems="center">
      <ColorPicker label={null} defaultValue="#6366F1" />
      <ColorPicker label={null} defaultValue="#10b981" />
      <ColorPicker label={null} defaultValue="#ef4444" alpha />
      <Text size="sm" color="fg.muted">
        label={'{null}'} = icon-only
      </Text>
    </Inline>
  ),
};

export const DarkTheme: Story = {
  name: 'Dark theme check',
  parameters: { backgrounds: { default: 'dark' }, theme: 'dark' },
  render: () => (
    <div data-theme="dark" style={{ padding: 24, background: '#0c0d11', borderRadius: 12 }}>
      <ColorPicker
        variant="inline"
        defaultValue="#8a9bff"
        alpha
        swatches={['#8a9bff', '#10b981', '#ff7b63', '#f59e0b', '#a855f7']}
        onSwatchesChange={() => {}}
      />
    </div>
  ),
};
