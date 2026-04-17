import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormLabel,
  FormMessage,
} from '../Form/index.js';
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

export const WithoutLabel: Story = {
  name: 'Without children — bare control',
  render: () => (
    <Inline gap="3" align="center">
      <Switch aria-label="Wifi" />
      <Switch aria-label="Wifi" defaultChecked />
      <Switch aria-label="Wifi" disabled />
    </Inline>
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

export const Settings: Story = {
  name: 'Example — settings list',
  render: () => (
    <Stack gap="3" width="360px">
      <Switch defaultChecked>Enable two-factor auth</Switch>
      <Switch defaultChecked>Email notifications</Switch>
      <Switch>Push notifications</Switch>
      <Switch>Share anonymous usage data</Switch>
    </Stack>
  ),
};

export const InsideFormField: Story = {
  name: 'Composed with FormField',
  render: () => {
    function Demo(): React.ReactElement {
      const [on, setOn] = useState(false);
      return (
        <Form>
          <Stack gap="4" width="360px">
            <FormField name="marketing">
              <FormLabel>Marketing emails</FormLabel>
              <FormControl>
                <Switch checked={on} onCheckedChange={setOn}>
                  Receive product updates and offers
                </Switch>
              </FormControl>
              <FormDescription>You can unsubscribe at any time.</FormDescription>
              <FormMessage />
            </FormField>
          </Stack>
        </Form>
      );
    }
    return <Demo />;
  },
};

export const LongLabel: Story = {
  render: () => (
    <Stack gap="3" width="360px">
      <Switch defaultChecked>
        Automatically back up my data every night at 3 AM to the selected cloud provider, using
        end-to-end encryption.
      </Switch>
    </Stack>
  ),
};
