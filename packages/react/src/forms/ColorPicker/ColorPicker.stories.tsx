import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import {
  ColorArea as AriaColorArea,
  ColorField as AriaColorField,
  ColorSlider as AriaColorSlider,
  ColorSwatch as AriaColorSwatch,
  ColorThumb as AriaColorThumb,
  Input as AriaInput,
  SliderTrack as AriaSliderTrack,
  type Color,
  parseColor,
} from 'react-aria-components';
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

export const Basic: Story = {
  render: () => (
    <Stack gap="3" width="240px">
      <ColorPicker label="Background" defaultValue="#F59E0B" />
      <ColorPicker label="Accent" defaultValue="#10B981" />
      <ColorPicker label="Text" defaultValue="#111827" />
    </Stack>
  ),
};

export const Controlled: Story = {
  render: () => {
    function Controlled(): React.ReactElement {
      const [color, setColor] = useState<Color>(parseColor('#6366F1'));
      return (
        <Stack gap="3" width="260px">
          <ColorPicker label="Brand" value={color} onChange={setColor} />
          <Text size="sm" color="fg.muted">
            Value: <code>{color.toString('hex')}</code>
          </Text>
          <Inline gap="2">
            <div
              aria-hidden="true"
              style={{
                width: 40,
                height: 40,
                borderRadius: 6,
                background: color.toString('css'),
                border: '1px solid rgba(0,0,0,0.08)',
              }}
            />
            <Text size="sm">
              rgb: <code>{color.toString('rgb')}</code>
            </Text>
          </Inline>
        </Stack>
      );
    }
    return <Controlled />;
  },
};

export const Uncontrolled: Story = {
  render: () => (
    <div style={{ width: '240px' }}>
      <ColorPicker label="Accent" defaultValue="#0EA5E9" />
    </div>
  ),
};

export const Swatches: Story = {
  name: 'Swatch presets (controlled)',
  render: () => {
    function SwatchesDemo(): React.ReactElement {
      const presets = ['#EF4444', '#F59E0B', '#10B981', '#0EA5E9', '#6366F1', '#EC4899'];
      const [color, setColor] = useState<Color>(parseColor(presets[0] ?? '#000000'));
      return (
        <Stack gap="3" width="320px">
          <ColorPicker label="Swatch" value={color} onChange={setColor} />
          <Inline gap="2">
            {presets.map((p) => (
              <button
                key={p}
                type="button"
                aria-label={`Set colour to ${p}`}
                onClick={() => setColor(parseColor(p))}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: p,
                  border: '1px solid rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  padding: 0,
                }}
              />
            ))}
          </Inline>
          <Text size="sm" color="fg.muted">
            Current: <code>{color.toString('hex')}</code>
          </Text>
        </Stack>
      );
    }
    return <SwatchesDemo />;
  },
};

export const Formats: Story = {
  name: 'Hex / RGB / HSL readouts',
  render: () => {
    function FormatsDemo(): React.ReactElement {
      const [color, setColor] = useState<Color>(parseColor('#10B981'));
      return (
        <Stack gap="3" width="320px">
          <ColorPicker label="Colour" value={color} onChange={setColor} />
          <Stack gap="1">
            <Text size="sm">
              hex: <code>{color.toString('hex')}</code>
            </Text>
            <Text size="sm">
              rgb: <code>{color.toString('rgb')}</code>
            </Text>
            <Text size="sm">
              hsl: <code>{color.toString('hsl')}</code>
            </Text>
          </Stack>
        </Stack>
      );
    }
    return <FormatsDemo />;
  },
};

export const CustomContent: Story = {
  name: 'Custom popover content',
  render: () => (
    <div style={{ width: '240px' }}>
      <ColorPicker label="Custom" defaultValue="#6366F1">
        <AriaColorArea colorSpace="hsb" xChannel="saturation" yChannel="brightness">
          <AriaColorThumb style={{ width: 16, height: 16 }} />
        </AriaColorArea>
        <AriaColorSlider colorSpace="hsb" channel="hue">
          <AriaSliderTrack style={{ height: 24 }}>
            <AriaColorThumb style={{ width: 16, height: 16 }} />
          </AriaSliderTrack>
        </AriaColorSlider>
        <Inline gap="2" align="center">
          <AriaColorSwatch style={{ width: 28, height: 28, borderRadius: 6 }} />
          <AriaColorField>
            <AriaInput aria-label="Hex" />
          </AriaColorField>
        </Inline>
      </ColorPicker>
    </div>
  ),
};

export const MultipleTriggers: Story = {
  render: () => (
    <Inline gap="3">
      <ColorPicker label="Primary" defaultValue="#6366F1" />
      <ColorPicker label="Secondary" defaultValue="#EC4899" />
      <ColorPicker label="Tertiary" defaultValue="#10B981" />
    </Inline>
  ),
};
