import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import { PinInput } from './PinInput.js';

const meta: Meta<typeof PinInput> = {
  title: 'Forms/PinInput',
  component: PinInput,
  parameters: { layout: 'padded' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    type: { control: 'select', options: ['numeric', 'alphanumeric', 'alphabetic'] },
    length: { control: { type: 'number', min: 2, max: 10, step: 1 } },
    mask: { control: 'boolean' },
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
    autoFocus: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof PinInput>;

export const Playground: Story = {
  args: {
    length: 6,
    type: 'numeric',
    size: 'md',
    'aria-label': 'Verification code',
  },
};

export const Lengths: Story = {
  render: () => (
    <Stack gap="3">
      <Stack gap="1">
        <Text size="sm" color="fg.muted">
          4 digits
        </Text>
        <PinInput length={4} aria-label="4-digit code" />
      </Stack>
      <Stack gap="1">
        <Text size="sm" color="fg.muted">
          6 digits
        </Text>
        <PinInput length={6} aria-label="6-digit code" />
      </Stack>
      <Stack gap="1">
        <Text size="sm" color="fg.muted">
          8 digits
        </Text>
        <PinInput length={8} aria-label="8-digit code" />
      </Stack>
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack gap="3">
      <PinInput size="sm" length={6} aria-label="Small" />
      <PinInput size="md" length={6} aria-label="Medium" />
      <PinInput size="lg" length={6} aria-label="Large" />
    </Stack>
  ),
};

export const Types: Story = {
  name: 'numeric / alphanumeric / alphabetic',
  render: () => (
    <Stack gap="3">
      <Stack gap="1">
        <Text size="sm" color="fg.muted">
          Numeric (0-9)
        </Text>
        <PinInput length={6} type="numeric" aria-label="Numeric" />
      </Stack>
      <Stack gap="1">
        <Text size="sm" color="fg.muted">
          Alphanumeric (A-Z, 0-9)
        </Text>
        <PinInput length={6} type="alphanumeric" aria-label="Alphanumeric" />
      </Stack>
      <Stack gap="1">
        <Text size="sm" color="fg.muted">
          Alphabetic (A-Z only)
        </Text>
        <PinInput length={6} type="alphabetic" aria-label="Alphabetic" />
      </Stack>
    </Stack>
  ),
};

export const Masked: Story = {
  name: 'mask — displays bullets',
  render: () => (
    <Stack gap="3">
      <PinInput length={6} mask defaultValue="123456" aria-label="Masked" />
      <Text size="sm" color="fg.muted">
        Masks render as <code>•</code> but the underlying value remains numeric.
      </Text>
    </Stack>
  ),
};

export const States: Story = {
  render: () => (
    <Stack gap="3">
      <Stack gap="1">
        <Text size="sm" color="fg.muted">
          Default
        </Text>
        <PinInput length={6} aria-label="Default" />
      </Stack>
      <Stack gap="1">
        <Text size="sm" color="fg.muted">
          Disabled
        </Text>
        <PinInput length={6} disabled defaultValue="1234" aria-label="Disabled" />
      </Stack>
      <Stack gap="1">
        <Text size="sm" color="fg.muted">
          Invalid
        </Text>
        <PinInput length={6} invalid defaultValue="999" aria-label="Invalid" />
      </Stack>
    </Stack>
  ),
};

export const AutoFocus: Story = {
  render: () => <PinInput length={6} autoFocus aria-label="Auto-focused" />,
};

export const Controlled: Story = {
  render: () => {
    function ControlledDemo(): React.ReactElement {
      const [value, setValue] = useState('');
      return (
        <Stack gap="3">
          <PinInput length={6} value={value} onChange={setValue} aria-label="Code" />
          <Inline gap="3" align="center">
            <Text size="sm" color="fg.muted">
              Value: <code>{JSON.stringify(value)}</code>
            </Text>
            <button
              type="button"
              onClick={() => setValue('')}
              style={{
                border: '1px solid rgba(0,0,0,0.15)',
                background: 'transparent',
                padding: '2px 8px',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              Clear
            </button>
          </Inline>
        </Stack>
      );
    }
    return <ControlledDemo />;
  },
};

export const OnComplete: Story = {
  name: 'onComplete — fires when all cells are filled',
  render: () => {
    function CompleteDemo(): React.ReactElement {
      const [completed, setCompleted] = useState<string | null>(null);
      return (
        <Stack gap="3">
          <PinInput length={4} onComplete={setCompleted} aria-label="4-digit code" autoFocus />
          <Text size="sm" color="fg.muted">
            Last completed: <code>{completed ?? 'null'}</code>
          </Text>
        </Stack>
      );
    }
    return <CompleteDemo />;
  },
};

export const PasteDistribution: Story = {
  name: 'Paste distributes across cells',
  render: () => (
    <Stack gap="3">
      <PinInput length={6} aria-label="Paste code" />
      <Text size="sm" color="fg.muted">
        Copy <code>123456</code>, click the first cell and paste — characters fill every cell.
      </Text>
    </Stack>
  ),
};

export const Uncontrolled: Story = {
  render: () => <PinInput length={6} defaultValue="42" aria-label="Uncontrolled" />,
};
