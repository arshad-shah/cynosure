import type { Meta, StoryObj } from '@storybook/react';
import { Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import { Switch } from './Switch.js';

const meta: Meta<typeof Switch> = {
  title: 'Forms/Switch',
  component: Switch,
  parameters: { layout: 'padded' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    invalid: { control: 'boolean' },
    defaultChecked: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof Switch>;

export const Playground: Story = {
  args: {
    children: 'Notifications',
    size: 'md',
    defaultChecked: true,
  },
};

export const Sizes: Story = {
  render: () => (
    <Inline gap="4" align="center">
      <Switch defaultChecked size="sm">
        Small
      </Switch>
      <Switch defaultChecked size="md">
        Medium
      </Switch>
      <Switch defaultChecked size="lg">
        Large
      </Switch>
    </Inline>
  ),
};

export const States: Story = {
  render: () => (
    <Stack gap="3">
      <Switch>Off by default</Switch>
      <Switch defaultChecked>On by default</Switch>
      <Switch disabled>Disabled (off)</Switch>
      <Switch disabled defaultChecked>
        Disabled (on)
      </Switch>
      <Switch invalid>Invalid</Switch>
      <Switch required>Required</Switch>
    </Stack>
  ),
};

export const Controlled: Story = {
  render: () => {
    function Controlled(): React.ReactElement {
      const [on, setOn] = useState(false);
      return (
        <Stack gap="3">
          <Switch checked={on} onCheckedChange={setOn}>
            Do not disturb
          </Switch>
          <Text size="sm">
            State: <strong>{on ? 'ON' : 'OFF'}</strong>
          </Text>
        </Stack>
      );
    }
    return <Controlled />;
  },
};

export const Loading: Story = {
  name: 'loading — blocks interaction, shows spinner',
  render: () => {
    function Demo(): React.ReactElement {
      const [on, setOn] = useState(false);
      const [pending, setPending] = useState(false);
      const toggle = (next: boolean) => {
        setPending(true);
        setTimeout(() => {
          setOn(next);
          setPending(false);
        }, 1200);
      };
      return (
        <Stack gap="3" width="320px">
          <Switch checked={on} onCheckedChange={toggle} loading={pending}>
            Sync photos to cloud
          </Switch>
          <Text size="sm" color="fg.muted">
            {pending ? 'Saving…' : on ? 'Enabled' : 'Disabled'}
          </Text>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const CustomIcons: Story = {
  name: 'Custom thumb icons',
  render: () => {
    function Demo(): React.ReactElement {
      const [dark, setDark] = useState(true);
      return (
        <Stack gap="3" width="320px">
          <Switch
            size="lg"
            checked={dark}
            onCheckedChange={setDark}
            checkedIcon={<Moon size={14} />}
            uncheckedIcon={<Sun size={14} />}
          >
            Dark mode
          </Switch>
          <Text size="sm" color="fg.muted">
            Pass <code>checkedIcon</code> / <code>uncheckedIcon</code> to put a glyph in the thumb;
            an unchecked icon keeps the resting thumb full-size.
          </Text>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const Interaction: Story = {
  name: 'Interaction · click toggles aria-checked',
  render: () => <Switch>Notifications</Switch>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const sw = canvas.getByRole('switch');
    await expect(sw).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(sw);
    await expect(sw).toHaveAttribute('aria-checked', 'true');
    await expect(sw).toHaveAttribute('data-state', 'checked');
    await userEvent.click(sw);
    await expect(sw).toHaveAttribute('aria-checked', 'false');
  },
};
